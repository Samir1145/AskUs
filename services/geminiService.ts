import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";
import { INDIAN_LANGUAGES } from "../constants";

const SYSTEM_INSTRUCTION = `
You are the "Chat Supervisor" and primary orchestrator within "AskUs".
GOAL: Solve user problems by orchestrating a team of experts or answering directly.

STYLE GUIDELINES (ANTI-BOT PROTOCOL):
1. **EXTREMELY CONCISE**: No fluff. Avoid "I can help with that" or "Here is the information". Start directly with the answer.
2. **BULLET POINTS**: Use bullet points for almost everything.
3. **LIMIT**: Maximum 5 bullet points per response.
4. **DIRECT TONE**: Professional, efficient, human-like.

SPECIAL TAGS (Append strictly to the end of your response):

1. **NEXT MOVE**: Suggest the single most likely question the user would want to ask next.
   Format: [SUGGEST_QUESTION: Your suggested question here?]

2. **ADD EXPERT**: If a new specialist is needed.
   Format: [SUGGEST_AGENT: Category|Agent Name]
   Categories: Doctors, Lawyers, Teachers, Experts.

3. **NEW TASK**: If a concrete task is ready.
   Format: [ADD_TASK: Task Name]

4. **REPORT**: If a summary/report is generated.
   Format: [REPORT_CREATED: Title_Of_Summary.html]

5. **MULTI-AGENT**: If speaking for others, split turns.
   Format: [TURN: Agent Name] ... content ... [TURN: Supervisor] ... content ...
`;

const getApiKey = () => {
    try { return process.env.API_KEY; } catch { return undefined; }
};

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  languageCode: string = 'en'
): Promise<string> => {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      console.error("API Key is missing or process.env is undefined");
      return "Configuration Error: API Key is missing. Please check your environment variables.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Resolve language name
    const targetLang = INDIAN_LANGUAGES.find(l => l.code === languageCode)?.name || 'English';

    // Construct prompt from history
    // We increase history to last 100 messages to allow for comprehensive summarization
    const recentHistory = history.slice(-100);
    let promptContext = "";
    recentHistory.forEach(msg => {
      promptContext += `${msg.sender === 'user' ? 'User' : 'Agent'}: ${msg.text}\n`;
    });
    
    // Add language instruction
    const languageInstruction = languageCode !== 'en' 
        ? `\n[IMPORTANT: REPLY IN ${targetLang} LANGUAGE]\n` 
        : "";

    promptContext += `User: ${newMessage}\nAgent:${languageInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptContext,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "I'm having trouble processing that right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        return `Connection Error: ${error.message}`;
    }
    return "Sorry, I am unable to connect to the server right now.";
  }
};