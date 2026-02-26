import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Message } from "../types";

// Helper for Base64 encoding/decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Audio Processing Helpers
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export class LiveSession {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private active = false;
  private videoInterval: number | null = null;
  
  // Callbacks
  public onVolumeUpdate: ((vol: number) => void) | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async start(
    chatHistory: Message[], 
    agentName: string, 
    agentIdentity: string,
    onClose: () => void,
    videoElement?: HTMLVideoElement
  ) {
    this.active = true;
    
    // Setup Audio Contexts
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const outputNode = this.outputAudioContext.createGain();
    outputNode.connect(this.outputAudioContext.destination);

    // Prepare Context from History
    const recentMsgs = chatHistory.slice(-5).map(m => `${m.sender === 'user' ? 'User' : 'Agent'}: ${m.text}`).join('\n');
    const systemInstruction = `
      You are ${agentName}. 
      ${agentIdentity}
      
      CONTEXT OF THIS CALL:
      The user is calling you directly to resolve an ongoing issue. 
      Here is the recent chat history for context:
      ${recentMsgs}
      
      INSTRUCTIONS:
      - You are now in a LIVE VOICE call. 
      - Be concise, helpful, and conversational. 
      - Do not read the history out loud, just use it to understand the problem.
      - If the user shows you video, analyze it in real-time.
    `;

    // Get Media Stream (Audio + Optional Video)
    try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: !!videoElement 
        });
    } catch (e) {
        console.error("Permission denied", e);
        onClose();
        return;
    }

    // Connect to Gemini Live
    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: systemInstruction,
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      },
      callbacks: {
        onopen: () => {
          console.log("Live Session Connected");
          
          // Audio Input Streaming
          if (!this.inputAudioContext || !this.mediaStream) return;
          
          const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
          const processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            if (!this.active) return;
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Simple volume meter for UI
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            const rms = Math.sqrt(sum / inputData.length);
            if (this.onVolumeUpdate) this.onVolumeUpdate(rms);

            const pcmBlob = createBlob(inputData);
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          
          source.connect(processor);
          processor.connect(this.inputAudioContext.destination);

          // Video Input Streaming (if enabled)
          if (videoElement) {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Helper to convert blob to base64
              const blobToBase64 = (blob: Blob): Promise<string> => {
                return new Promise((resolve, _) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
              };

              this.videoInterval = window.setInterval(() => {
                  if (!this.active || !ctx) return;
                  
                  // Draw video frame to canvas
                  canvas.width = videoElement.videoWidth;
                  canvas.height = videoElement.videoHeight;
                  ctx.drawImage(videoElement, 0, 0);
                  
                  canvas.toBlob(async (blob) => {
                      if (blob) {
                          const base64DataWithHeader = await blobToBase64(blob);
                          const base64Data = base64DataWithHeader.split(',')[1];
                          
                          sessionPromise.then(session => {
                              session.sendRealtimeInput({
                                  media: { data: base64Data, mimeType: 'image/jpeg' }
                              });
                          });
                      }
                  }, 'image/jpeg', 0.6); // 60% quality JPEG
              }, 1000); // 1 FPS for video frames is usually enough for context without killing bandwidth
          }
        },
        onmessage: async (msg: LiveServerMessage) => {
            if (!this.active || !this.outputAudioContext) return;

            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
                // Ensure output context is running (mobile browsers suspend it sometimes)
                if (this.outputAudioContext.state === 'suspended') {
                    await this.outputAudioContext.resume();
                }

                this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
                
                const audioBuffer = await decodeAudioData(
                    decode(audioData),
                    this.outputAudioContext,
                    24000,
                    1
                );
                
                const source = this.outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.addEventListener('ended', () => this.sources.delete(source));
                
                source.start(this.nextStartTime);
                this.nextStartTime += audioBuffer.duration;
                this.sources.add(source);
            }
            
            if (msg.serverContent?.interrupted) {
                this.sources.forEach(s => s.stop());
                this.sources.clear();
                this.nextStartTime = 0;
            }
        },
        onclose: () => {
            console.log("Session Closed");
            this.stop();
            onClose();
        },
        onerror: (e) => {
            console.error("Session Error", e);
            this.stop();
            onClose();
        }
      }
    });
  }

  stop() {
    this.active = false;
    
    if (this.videoInterval) clearInterval(this.videoInterval);
    
    this.sources.forEach(s => s.stop());
    this.sources.clear();
    
    if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(t => t.stop());
    }
    
    if (this.inputAudioContext) this.inputAudioContext.close();
    if (this.outputAudioContext) this.outputAudioContext.close();
  }
}