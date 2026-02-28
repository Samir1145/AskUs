import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Disc3, Volume2, VolumeX } from 'lucide-react';
import Header from '../components/Header';

interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string;
    durationSec: number;
    coverGradient: [string, string];
    category: string;
    musicalKey: number;
    waveform: OscillatorType;
    tempo: number;
    notePattern: number[];
}

const MUSIC_CATEGORIES = ['Afro House', 'Tribal House', 'Moombahton', 'Global Bass', 'Ethno Techno'];

const SAMPLE_TRACKS: Track[] = [
    { id: '1', title: 'Midnight Mirage', artist: 'Neon Drift', duration: '1:00', durationSec: 60, coverGradient: ['#6366f1', '#a855f7'], category: 'Afro House', musicalKey: 261.63, waveform: 'sine', tempo: 120, notePattern: [0, 4, 7, 12, 7, 4, 0, -5] },
    { id: '2', title: 'Golden Hour', artist: 'Sun Collective', duration: '1:00', durationSec: 60, coverGradient: ['#f59e0b', '#ef4444'], category: 'Tribal House', musicalKey: 293.66, waveform: 'triangle', tempo: 90, notePattern: [0, 3, 7, 10, 12, 10, 7, 3] },
    { id: '3', title: 'Electric Dreams', artist: 'Synthwave City', duration: '1:00', durationSec: 60, coverGradient: ['#06b6d4', '#8b5cf6'], category: 'Moombahton', musicalKey: 329.63, waveform: 'sawtooth', tempo: 130, notePattern: [0, 5, 7, 12, 0, 5, 7, 12] },
    { id: '4', title: 'Velvet Sunset', artist: 'Chill Monks', duration: '1:00', durationSec: 60, coverGradient: ['#ec4899', '#f97316'], category: 'Global Bass', musicalKey: 246.94, waveform: 'sine', tempo: 80, notePattern: [0, 2, 4, 7, 9, 7, 4, 2] },
    { id: '5', title: 'Starlight Serenade', artist: 'Cosmos Band', duration: '1:00', durationSec: 60, coverGradient: ['#3b82f6', '#10b981'], category: 'Ethno Techno', musicalKey: 220.00, waveform: 'triangle', tempo: 100, notePattern: [0, 4, 7, 11, 12, 11, 7, 4] },
    { id: '6', title: 'Desert Rain', artist: 'Nomad Beats', duration: '1:00', durationSec: 60, coverGradient: ['#d97706', '#78350f'], category: 'Afro House', musicalKey: 196.00, waveform: 'sine', tempo: 110, notePattern: [0, 3, 5, 7, 10, 12, 10, 7] },
    { id: '7', title: 'Neon Pulse', artist: 'Circuit Breaker', duration: '1:00', durationSec: 60, coverGradient: ['#f43f5e', '#6366f1'], category: 'Tribal House', musicalKey: 349.23, waveform: 'square', tempo: 140, notePattern: [0, 7, 12, 7, 0, 5, 12, 5] },
    { id: '8', title: 'Ocean Whispers', artist: 'Blue Horizon', duration: '1:00', durationSec: 60, coverGradient: ['#0ea5e9', '#064e3b'], category: 'Moombahton', musicalKey: 277.18, waveform: 'triangle', tempo: 75, notePattern: [0, 2, 5, 7, 9, 12, 9, 5] },
    { id: '9', title: 'City Lights', artist: 'Metro Sound', duration: '1:00', durationSec: 60, coverGradient: ['#8b5cf6', '#ec4899'], category: 'Global Bass', musicalKey: 311.13, waveform: 'sawtooth', tempo: 128, notePattern: [0, 3, 7, 10, 14, 10, 7, 3] },
    { id: '10', title: 'Autumn Leaves', artist: 'Folk Revival', duration: '1:00', durationSec: 60, coverGradient: ['#ea580c', '#a16207'], category: 'Ethno Techno', musicalKey: 233.08, waveform: 'sine', tempo: 95, notePattern: [0, 4, 7, 12, 16, 12, 7, 4] },
];

// ─── Web Audio Synthesizer ─────────────────────────────
class MusicSynth {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private oscs: OscillatorNode[] = [];
    private timer: ReturnType<typeof setInterval> | null = null;
    private startCtxTime = 0;
    private lastBeat = -1;
    private track: Track | null = null;
    private _playing = false;
    private _pauseElapsed = 0;
    private _muted = false;

    onTick: ((time: number, prog: number) => void) | null = null;
    onEnd: (() => void) | null = null;
    onState: ((playing: boolean) => void) | null = null;

    private initCtx() {
        if (!this.ctx || this.ctx.state === 'closed') {
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this._muted ? 0 : 0.15;
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    play(t: Track, from = 0) {
        this.stopInternal();
        this.initCtx();
        if (!this.ctx || !this.masterGain) return;
        this.track = t;
        this._playing = true;
        this.startCtxTime = this.ctx.currentTime - from;
        this.lastBeat = Math.floor(from / (60 / t.tempo)) - 1;
        this.onState?.(true);
        this.scheduleAhead();
        this.timer = setInterval(() => {
            this.scheduleAhead();
            this.tick();
        }, 80);
    }

    private scheduleAhead() {
        if (!this.ctx || !this.masterGain || !this.track || !this._playing) return;
        const t = this.track;
        const beatLen = 60 / t.tempo;
        const elapsed = this.ctx.currentTime - this.startCtxTime;
        const curBeat = Math.floor(elapsed / beatLen);
        const totalBeats = Math.floor(t.durationSec / beatLen);

        for (let b = curBeat; b <= curBeat + 4; b++) {
            if (b <= this.lastBeat || b >= totalBeats) continue;
            const noteIdx = b % t.notePattern.length;
            const semi = t.notePattern[noteIdx];
            const freq = t.musicalKey * Math.pow(2, semi / 12);
            const when = this.startCtxTime + b * beatLen;
            const dur = beatLen * 0.7;

            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = t.waveform;
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0, when);
            g.gain.linearRampToValueAtTime(0.3, when + 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, when + dur);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(when);
            osc.stop(when + dur + 0.02);
            this.oscs.push(osc);
            osc.onended = () => {
                const i = this.oscs.indexOf(osc);
                if (i >= 0) this.oscs.splice(i, 1);
            };
            this.lastBeat = b;
        }

        if (elapsed >= t.durationSec) {
            this.stopInternal();
            this.onEnd?.();
        }
    }

    private tick() {
        if (!this.ctx || !this.track || !this._playing) return;
        const el = Math.min(this.ctx.currentTime - this.startCtxTime, this.track.durationSec);
        this.onTick?.(el, el / this.track.durationSec);
    }

    pause() {
        if (!this.ctx || !this._playing) return;
        this._pauseElapsed = this.ctx.currentTime - this.startCtxTime;
        this.stopInternal();
    }
    resume() {
        if (!this.track || this._playing) return;
        this.play(this.track, this._pauseElapsed);
    }

    stop() { this.stopInternal(); this._pauseElapsed = 0; }

    private stopInternal() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        for (const o of this.oscs) { try { o.stop(); } catch { /* ok */ } }
        this.oscs = [];
        if (this._playing) { this._playing = false; this.onState?.(false); }
    }

    setMuted(m: boolean) {
        this._muted = m;
        if (this.masterGain) this.masterGain.gain.value = m ? 0 : 0.15;
    }

    seekTo(time: number) {
        if (!this.track) return;
        const was = this._playing;
        this.stopInternal();
        if (was) this.play(this.track, time);
        else this._pauseElapsed = time;
    }

    destroy() {
        this.stopInternal();
        if (this.ctx && this.ctx.state !== 'closed') this.ctx.close();
    }
}

// ─── Component ─────────────────────────────────────────
const MusicView: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Afro House');
    const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const synthRef = useRef<MusicSynth | null>(null);
    const trackIdRef = useRef<string | null>(null);

    useEffect(() => { trackIdRef.current = currentTrackId; }, [currentTrackId]);

    const currentTrack = SAMPLE_TRACKS.find(t => t.id === currentTrackId) || null;

    const filteredTracks = SAMPLE_TRACKS.filter(track => {
        const matchesSearch = searchQuery === '' ||
            track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = track.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Init synth once
    useEffect(() => {
        const synth = new MusicSynth();
        synthRef.current = synth;

        synth.onTick = (t, p) => { setCurrentTime(t); setProgress(p); };
        synth.onState = (p) => setIsPlaying(p);
        synth.onEnd = () => {
            const id = trackIdRef.current;
            const idx = SAMPLE_TRACKS.findIndex(t => t.id === id);
            const ni = (idx + 1) % SAMPLE_TRACKS.length;
            const next = SAMPLE_TRACKS[ni];
            setCurrentTrackId(next.id);
            trackIdRef.current = next.id;
            setProgress(0);
            setCurrentTime(0);
            setDuration(next.durationSec);
            synth.play(next);
        };

        return () => synth.destroy();
    }, []);

    useEffect(() => { synthRef.current?.setMuted(isMuted); }, [isMuted]);

    const handlePlay = (trackId: string) => {
        const synth = synthRef.current;
        if (!synth) return;
        if (currentTrackId === trackId && isPlaying) {
            synth.pause();
        } else if (currentTrackId === trackId && !isPlaying) {
            synth.resume();
        } else {
            const track = SAMPLE_TRACKS.find(t => t.id === trackId);
            if (!track) return;
            setCurrentTrackId(trackId);
            trackIdRef.current = trackId;
            setProgress(0);
            setCurrentTime(0);
            setDuration(track.durationSec);
            synth.play(track);
        }
    };

    const handleStop = (trackId: string) => {
        if (currentTrackId === trackId && synthRef.current) {
            synthRef.current.stop();
            setProgress(0);
            setCurrentTime(0);
            setIsPlaying(false);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!synthRef.current || !currentTrack) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        synthRef.current.seekTo(ratio * currentTrack.durationSec);
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 relative">
            <Header
                newChatLabel="Tribal Beats"
                onNewChat={() => { }}
                onMenuClick={() => { }}
            />

            <div className="flex-1 overflow-y-auto">
                {/* Category Tags */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                        {MUSIC_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Track List */}
                <div className="px-4 py-4 pb-24 space-y-2">
                    {filteredTracks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                            <Disc3 size={48} className="mb-4 opacity-40" />
                            <p className="font-semibold">No tracks found</p>
                            <p className="text-xs mt-1">Try a different search or category</p>
                        </div>
                    ) : (
                        filteredTracks.map((track) => {
                            const isActive = currentTrackId === track.id;
                            const isTrackPlaying = isActive && isPlaying;

                            return (
                                <div
                                    key={track.id}
                                    className={`group relative rounded-2xl p-3 transition-all duration-300 ${isActive
                                        ? 'bg-primary/5 dark:bg-white/10 ring-1 ring-primary/20 dark:ring-white/10 shadow-sm'
                                        : 'bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.07]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Album Art */}
                                        <div
                                            className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden"
                                            style={{ background: `linear-gradient(135deg, ${track.coverGradient[0]}, ${track.coverGradient[1]})` }}
                                        >
                                            {isTrackPlaying ? (
                                                <Disc3 size={22} className="text-white animate-spin" style={{ animationDuration: '3s' }} />
                                            ) : (
                                                <span className="text-white/80 font-bold text-sm">{String(SAMPLE_TRACKS.indexOf(track) + 1).padStart(2, '0')}</span>
                                            )}
                                        </div>

                                        {/* Track Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-sm truncate ${isActive ? 'text-primary dark:text-white' : 'text-gray-900 dark:text-gray-200'}`}>
                                                {track.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">{track.artist}</p>
                                        </div>

                                        {/* Duration */}
                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mr-1 shrink-0">{track.duration}</span>

                                        {/* Controls */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                id={`music-play-${track.id}`}
                                                onClick={() => handlePlay(track.id)}
                                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isTrackPlaying
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                                                    : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 hover:scale-105'
                                                    }`}
                                            >
                                                {isTrackPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                                            </button>
                                            <button
                                                id={`music-stop-${track.id}`}
                                                onClick={() => handleStop(track.id)}
                                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${isActive
                                                    ? 'bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30'
                                                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                <Square size={14} />
                                            </button>
                                            {isActive && (
                                                <button
                                                    onClick={() => setIsMuted(!isMuted)}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                                >
                                                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    {isActive && (
                                        <div className="mt-2.5 mx-1">
                                            <div
                                                className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer"
                                                onClick={handleSeek}
                                            >
                                                <div
                                                    className="h-full rounded-full transition-all duration-100"
                                                    style={{
                                                        width: `${progress * 100}%`,
                                                        background: `linear-gradient(90deg, ${track.coverGradient[0]}, ${track.coverGradient[1]})`,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{formatTime(currentTime)}</span>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{formatTime(duration || track.durationSec)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MusicView;
