import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chat, Agent, Message } from '../types';
import {
    ArrowLeft, Paperclip, Mic, Send, FileText, X,
    Image, Camera, MapPin, User, BarChart2, Calendar, Edit2, Check,
    UserPlus, Bot, ClipboardList, Play, Users, Plus, Sparkles, MoreVertical, Timer, Trash2,
    Phone, Video, MicOff, VideoOff, PhoneOff, Map
} from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { LiveSession } from '../services/liveService';
import {
    EXPERT_SKILLS_MAP, DEFAULT_SKILLS,
    CATEGORIES, DOCTORS_DATA, LAWYERS_DATA, TEACHERS_DATA, EXPERT_AGENTS_DATA,
    CategoryType, AgentTemplate,
    getAvatarColor, getInitials
} from '../constants';
import { dbService } from '../services/db';
import { getSoulForAgent } from '../services/assets';
import { generateMemoryWiki, retrieveContextForTask } from '../services/memoryService';

// Custom Incognito Icon (Hat & Glasses) - Shared style
const IncognitoIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M2 10h20" />
        <path d="M5 10L7 2H17L19 10" />
        <circle cx="7" cy="16" r="3.5" />
        <circle cx="17" cy="16" r="3.5" />
        <path d="M10.5 16h3" />
    </svg>
);

// Custom Team Icon (3 People with Ties in Box)
const CONTEXT_CATEGORIES = [
    { id: 'body', label: 'Body', color: 'bg-blue-700' },
    { id: 'mind', label: 'Mind', color: 'bg-cyan-500' },
    { id: 'spirit', label: 'Spirit', color: 'bg-lime-500' },
    { id: 'relationships', label: 'Relationships', color: 'bg-red-600' },
    { id: 'finances', label: 'Finances', color: 'bg-orange-500' },
];

const TeamGroupIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {/* Outer Box */}
        <rect x="2" y="2" width="20" height="20" rx="5" />

        {/* Center Person (Front) */}
        <circle cx="12" cy="10" r="2.5" />
        <path d="M12 13a3 3 0 0 0-3 3v2" />
        <path d="M12 13a3 3 0 0 1 3 3v2" />
        {/* Center Tie */}
        <path d="M12 12.5l1 2l-1 1l-1-1z" fill="currentColor" stroke="none" />

        {/* Left Person (Back) */}
        <circle cx="7" cy="12" r="2" />
        <path d="M7 14a2.5 2.5 0 0 0-2.5 2.5V18" />
        {/* Left Tie */}
        <path d="M7 14l0.8 1.2l-0.8 0.8l-0.8-0.8z" fill="currentColor" stroke="none" />

        {/* Right Person (Back) */}
        <circle cx="17" cy="12" r="2" />
        <path d="M17 14a2.5 2.5 0 0 1 2.5 2.5V18" />
        {/* Right Tie */}
        <path d="M17 14l0.8 1.2l-0.8 0.8l-0.8-0.8z" fill="currentColor" stroke="none" />
    </svg>
);

interface ChatDetailViewProps {
    chat: Chat;
    onBack: () => void;
    onSendMessage: (chatId: string, text: string, sender: 'user' | 'agent', isReport?: boolean, image?: string, subAgentProfile?: { name: string, avatar: string, role?: string }) => void;
    onAddReport: (title: string) => void;
    onUpdateChatTitle: (chatId: string, newTitle: string) => void;
    onUpdateChat: (chatId: string, updates: Partial<Chat>) => void;
    onCreateTask: (chatId: string, description: string) => void;
    onViewReport: (title: string) => void;
    onOpenGallery: () => void;
    onOpenMap: () => void;
    language: string;
    autoStartCall?: boolean;
    onClearAutoStartCall?: () => void;
    onAddMember: (id: string, member: Agent) => void;
}

const ChatDetailView: React.FC<ChatDetailViewProps> = ({ chat, onBack, onSendMessage, onAddReport, onUpdateChatTitle, onUpdateChat, onCreateTask, onViewReport, onOpenGallery, onOpenMap, language, autoStartCall, onClearAutoStartCall, onAddMember }) => {
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);

    // Title Editing State
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(chat.title);

    // Category Extraction
    const firstMsg = chat.messages[0];
    let chatCategory = '';
    if (firstMsg?.text && firstMsg.text.startsWith('[Category: ')) {
        const match = firstMsg.text.match(/\[Category:\s*([^\]]+)\]/);
        if (match) chatCategory = match[1];
    }
    const [tempCategory, setTempCategory] = useState(chatCategory);

    useEffect(() => {
        setTempCategory(chatCategory);
    }, [chatCategory]);

    // Agent Suggestion State (The Supervisor Logic)
    const [suggestedAgent, setSuggestedAgent] = useState<{ name: string, category: string, agent: Agent } | null>(null);

    // Suggested Follow-Up Question State
    const [suggestedFollowUp, setSuggestedFollowUp] = useState<string | null>(null);

    // Modals
    const [showTaskList, setShowTaskList] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [teamSearchQuery, setTeamSearchQuery] = useState('');
    const [showContactPicker, setShowContactPicker] = useState(false);

    // Menu State
    const [showMenu, setShowMenu] = useState(false);

    // STT State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Live Call State
    const [isCallActive, setIsCallActive] = useState(false);
    const [callType, setCallType] = useState<'audio' | 'video'>('audio');
    const [micMuted, setMicMuted] = useState(false); // Only UI state, real logic handled in service if possible or via context suspension
    const [localVideoRef, setLocalVideoRef] = useState<HTMLVideoElement | null>(null);
    const [agentVolume, setAgentVolume] = useState(0); // For pulsing effect
    const liveSessionRef = useRef<LiveSession | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initializedChatId = useRef<string | null>(null);

    // Attachment Refs
    const documentInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Avatar Props based on Title
    const displayTitle = chat.title || chat.contactName;
    const avatarInitials = getInitials(displayTitle);
    const avatarColor = getAvatarColor(displayTitle);

    const isIncognito = !!chat.isIncognito;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat.messages, showAttachments, suggestedFollowUp]);

    useEffect(() => {
        setTempTitle(chat.title);
    }, [chat.title]);

    // Handle Auto Call Start
    useEffect(() => {
        if (autoStartCall && onClearAutoStartCall) {
            startLiveCall('audio');
            onClearAutoStartCall();
        }
    }, [autoStartCall]);

    // Session Initialization Logic (Welcome only, removed recap)
    useEffect(() => {
        if (initializedChatId.current === chat.id) return;
        initializedChatId.current = chat.id;

        const initSession = async () => {
            // 1. New Chat (No context): Send Supervisor Greeting
            if (chat.messages.length === 0) {
                const welcomeMsg = `Hello! I am the Chat Supervisor.\n\nI see you want to discuss "${chat.title}". I'll help you with that and can bring in specialist experts if needed.\n\nPlease describe your situation in more detail.`;

                // Artificial delay for realism
                setIsTyping(true);
                setTimeout(() => {
                    onSendMessage(chat.id, welcomeMsg, 'agent', false, undefined, { name: 'Chat Supervisor', avatar: 'https://robohash.org/supervisor_agent.png?set=set1&size=200x200', role: 'Coordinator' });
                    setIsTyping(false);
                }, 1000);
            }
            // 2. New Chat WITH Context (User sent initial description): Respond immediately
            else if (chat.messages.length === 1 && chat.messages[0].sender === 'user') {
                // Trigger Agent Response Logic immediately based on the context
                // We reuse the core logic but without adding a new user message
                generateAgentResponse(chat.messages[0].text);
            }
            // NOTE: Auto-Recap removed to save tokens.
        };

        if (chat.isAgent) {
            initSession();
        }

        // NOTE: Auto-Avatar generation removed to save tokens.

    }, [chat.id]);

    // Setup Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setInputText(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
                }
            };
        }

        // Ensure agent data is in SQLite (Seeding soul if not present)
        const soulContent = getSoulForAgent(chat.agentId);
        dbService.upsertAgentSoul(chat.agentId, chat.contactName, soulContent);

        // Ensure secondary agents are also seeded
        if (chat.secondaryAgents) {
            chat.secondaryAgents.forEach(sa => {
                dbService.upsertAgentSoul(sa.id, sa.name, getSoulForAgent(sa.id));
            });
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (liveSessionRef.current) {
                liveSessionRef.current.stop();
            }
        };
    }, []);

    // --- Live Call Logic ---

    const startLiveCall = (type: 'audio' | 'video') => {
        setCallType(type);
        setIsCallActive(true);
        setMicMuted(false);

        // Delay initialization slightly to let UI render the video element if needed
        setTimeout(async () => {
            const session = new LiveSession();
            liveSessionRef.current = session;

            const soul = getSoulForAgent(chat.agentId);

            // Attach volume listener
            session.onVolumeUpdate = (vol) => {
                // Normalize volume a bit for visual effect
                setAgentVolume(Math.min(1.5, vol * 5));
            };

            await session.start(
                chat.messages,
                chat.contactName,
                soul,
                () => setIsCallActive(false), // On Close
                type === 'video' && localVideoRef ? localVideoRef : undefined
            );

            // Connect local video stream to the video element for preview
            if (type === 'video' && localVideoRef) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    localVideoRef.srcObject = stream;
                } catch (e) {
                    console.error("Local video preview error", e);
                }
            }
        }, 500);
    };

    const endLiveCall = () => {
        if (liveSessionRef.current) {
            liveSessionRef.current.stop();
            liveSessionRef.current = null;
        }

        // Stop local preview tracks
        if (localVideoRef && localVideoRef.srcObject) {
            (localVideoRef.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            localVideoRef.srcObject = null;
        }

        setIsCallActive(false);

        // Add a system note about the call
        onSendMessage(chat.id, `_${callType === 'video' ? 'Video' : 'Voice'} call ended._`, 'agent');
    };

    // --- Helpers for Agent Data ---

    const createAgentFromTemplate = (template: AgentTemplate, category: CategoryType): Agent => {
        const cleanName = template.name.split('(')[0].trim();
        const avatarUrl = `https://robohash.org/${category}_${cleanName.replace(/\s+/g, '')}.png?set=set5&size=200x200`;

        return {
            id: `${category.toLowerCase()}_${cleanName.toLowerCase().replace(/\s+/g, '_')}`,
            name: template.name,
            avatar: avatarUrl,
            description: template.description,
            isVerified: true,
        };
    };

    // Helper to find agent object based on Category and Name
    const findAgentObject = (category: string, name: string): Agent | null => {
        if (category.includes('Doctor')) {
            const t = DOCTORS_DATA.find(d => d.name.includes(name));
            if (t) return createAgentFromTemplate(t, 'Doctors');
        }
        if (category.includes('Lawyer')) {
            const t = LAWYERS_DATA.find(d => d.name.includes(name));
            if (t) return createAgentFromTemplate(t, 'Lawyers');
        }
        if (category.includes('Teacher')) {
            const t = TEACHERS_DATA.find(d => d.name.includes(name));
            if (t) return createAgentFromTemplate(t, 'Teachers');
        }
        if (category.includes('Expert')) {
            const a = EXPERT_AGENTS_DATA.find(d => d.name.includes(name));
            if (a) return a;
        }
        return null;
    };

    // Memoize all available agents for the "Add" search
    const allPotentialAgents = useMemo(() => {
        const all: Agent[] = [...EXPERT_AGENTS_DATA];
        DOCTORS_DATA.forEach(d => all.push(createAgentFromTemplate(d, 'Doctors')));
        LAWYERS_DATA.forEach(l => all.push(createAgentFromTemplate(l, 'Lawyers')));
        TEACHERS_DATA.forEach(t => all.push(createAgentFromTemplate(t, 'Teachers')));
        return all;
    }, []);

    // Filter available agents (exclude those already in chat)
    const filteredPotentialAgents = useMemo(() => {
        const currentIds = new Set([
            chat.agentId,
            ...(chat.secondaryAgents?.map(a => a.id) || [])
        ]);

        return allPotentialAgents.filter(a =>
            !currentIds.has(a.id) &&
            (a.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                a.description.toLowerCase().includes(teamSearchQuery.toLowerCase()))
        );
    }, [allPotentialAgents, chat.agentId, chat.secondaryAgents, teamSearchQuery]);


    // CORE LOGIC: Generate Agent Response based on current state + last user text
    const generateAgentResponse = async (lastUserText: string) => {
        if (!chat.isAgent) return;

        setIsTyping(true);
        setSuggestedFollowUp(null); // Clear previous suggestions

        // 1. Retrieve Static Agent Context from SQLite
        const agentContext = dbService.getAgentContext(chat.agentId);

        // 1.5 Retrieve Secondary Agents Context (The Team)
        let teamContext = "";
        const secondaryAgents = chat.secondaryAgents || [];

        if (secondaryAgents.length > 0) {
            teamContext = "\n[ACTIVE TEAM MEMBERS]\n";
            secondaryAgents.forEach(agent => {
                const soul = getSoulForAgent(agent.id);
                teamContext += `\n- AGENT: ${agent.name} (ID: ${agent.id})\n  DESCRIPTION: ${agent.description}\n`;
            });
            teamContext += `
        \nSUPERVISOR INSTRUCTION:
        You are the orchestrator.
        If the user's request is relevant to specific agents on the team, draft a response for them.
        Format the output clearly separating each agent's turn.
        
        REQUIRED OUTPUT FORMAT:
        [TURN: Agent Name]
        ... agent's response ...
        [TURN: Supervisor]
        ... your summary ...

        For the Supervisor's summary:
        1. Keep it under 200 words.
        2. Use bullet points for clarity.
        `;
        } else {
            teamContext = "\nSUPERVISOR INSTRUCTION: You are currently working alone. If the task requires a specialist, suggest one. Keep your response under 200 words and use bullet points where possible.";
        }

        // 1.6 Pending Tasks Context
        const pendingTasksContext = chat.pendingActions && chat.pendingActions.length > 0
            ? `\n[PENDING TASKS/ACTION ITEMS]\n${chat.pendingActions.map(t => `- ${t}`).join('\n')}\n`
            : "";

        // 2. Retrieve Dynamic Context from Memory Wiki (RAG)
        const wikiContext = retrieveContextForTask(lastUserText);

        // 3. Augment prompt with Soul, Skills, Recent Memories, and Long-Term Wiki Context
        const augmentedPrompt = `
    [SYSTEM CONTEXT]
    CURRENT ROLE/IDENTITY: ${agentContext.soul}
    
    ${teamContext}
    ${pendingTasksContext}

    INSTALLED SKILLS:
    ${agentContext.skills.join('\n\n')}
    
    SHORT-TERM MEMORIES (Recent Chat):
    ${agentContext.memories.join('\n')}

    ${wikiContext ? wikiContext : '[NO LONG-TERM MEMORY FOUND FOR THIS TOPIC]'}
    
    [USER REQUEST]
    ${lastUserText}
    `;

        // Note: We pass chat.messages. If this is a new chat, it might already contain the user's first message.
        const response = await sendMessageToGemini(chat.messages, augmentedPrompt, language); // Pass language param

        // -- TAG PARSING --
        const reportTagRegex = /\[REPORT_CREATED: (.*?)\]/g;
        const suggestAgentRegex = /\[SUGGEST_AGENT: (.*?)\|(.*?)\]/;
        const addTaskRegex = /\[ADD_TASK: (.*?)\]/g;
        const suggestQuestionRegex = /\[SUGGEST_QUESTION: (.*?)\]/;

        let finalResponse = response;

        // Handle Suggested Question
        const qMatch = finalResponse.match(suggestQuestionRegex);
        if (qMatch) {
            setSuggestedFollowUp(qMatch[1]);
            finalResponse = finalResponse.replace(qMatch[0], '').trim();
        } else {
            setSuggestedFollowUp(null);
        }

        // Handle Reports (Global extract)
        let match;
        const createdReports = [];
        while ((match = reportTagRegex.exec(response)) !== null) {
            const title = match[1];
            createdReports.push(title);
            // Remove tag from text
            finalResponse = finalResponse.replace(match[0], '');
        }

        if (createdReports.length > 0) {
            // Generate Wiki Memories for reports
            createdReports.forEach(title => {
                generateMemoryWiki(
                    chat.agentId,
                    title,
                    finalResponse, // Use the full context as report content for now
                    ['auto-generated', 'report']
                );
                onAddReport(title);

                // Add review task to list instead of sending message
                const taskTitle = `Review Report: ${title}`;
                const currentActions = chat.pendingActions || [];
                if (!currentActions.includes(taskTitle)) {
                    onUpdateChat(chat.id, { pendingActions: [...currentActions, taskTitle] });
                }
            });
        }

        // Handle New Tasks
        while ((match = addTaskRegex.exec(response)) !== null) {
            const newTask = match[1];
            finalResponse = finalResponse.replace(match[0], '');
            const currentActions = chat.pendingActions || [];
            if (!currentActions.includes(newTask)) {
                onUpdateChat(chat.id, { pendingActions: [...currentActions, newTask] });
            }
        }

        // Handle Suggestions
        const suggestMatch = response.match(suggestAgentRegex);
        if (suggestMatch) {
            const category = suggestMatch[1];
            const agentName = suggestMatch[2];
            finalResponse = finalResponse.replace(suggestMatch[0], '').trim();

            const agentObj = findAgentObject(category, agentName);
            if (agentObj) {
                setSuggestedAgent({ category, name: agentName, agent: agentObj });
            }
        }

        // -- MULTI-AGENT RESPONSE PARSING --
        if (secondaryAgents.length > 0 && finalResponse.includes('[TURN:')) {
            const segments = finalResponse.split('[TURN:');

            // Sequential message sending
            const sendSegments = async () => {
                for (const segment of segments) {
                    if (!segment.trim()) continue;

                    const endOfName = segment.indexOf(']');
                    if (endOfName === -1) continue;

                    const agentName = segment.substring(0, endOfName).trim();
                    const content = segment.substring(endOfName + 1).trim();

                    if (!content) continue;

                    // Identify if this is a secondary agent
                    const agentProfile = secondaryAgents.find(a => a.name === agentName);

                    // Artificial typing delay per agent
                    setIsTyping(true);
                    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

                    if (agentProfile) {
                        // Determine role from name or ID if available, else derive from name
                        let role = 'Specialist';
                        if (agentProfile.id.startsWith('doctor')) role = 'Medical';
                        else if (agentProfile.id.startsWith('lawyer')) role = 'Legal';
                        else if (agentProfile.id.startsWith('teacher')) role = 'Education';
                        else if (agentProfile.name.includes('(')) {
                            const parts = agentProfile.name.split('(');
                            if (parts.length > 1) role = parts[0].trim();
                        }

                        onSendMessage(chat.id, content, 'agent', false, undefined, { name: agentProfile.name, avatar: agentProfile.avatar, role });
                    } else {
                        // Default to Supervisor (Agent)
                        onSendMessage(chat.id, content, 'agent', false, undefined, { name: 'Chat Supervisor', avatar: chat.avatar, role: 'Coordinator' });
                    }

                    // Add memory for context
                    if (!isIncognito) dbService.addMemory(chat.agentId, `${agentName} said: ${content}`);
                }
                setIsTyping(false);
            };
            sendSegments();
        } else {
            // Standard Single Response
            setIsTyping(false);
            onSendMessage(chat.id, finalResponse.trim(), 'agent', false, undefined, { name: chat.contactName, avatar: chat.avatar, role: 'Primary Agent' });
            if (!isIncognito) dbService.addMemory(chat.agentId, `Agent responded: ${finalResponse}`);
        }
    };

    const handleSend = async (textToSend: string = inputText) => {
        if (!textToSend.trim()) return;

        setInputText('');
        setSuggestedFollowUp(null); // Clear suggestion
        setShowAttachments(false); // Close attachments if open

        // Optimistic User Message
        onSendMessage(chat.id, textToSend, 'user');

        // Save to Memories DB (skip if incognito)
        if (!isIncognito) dbService.addMemory(chat.agentId, `User said: ${textToSend}`);

        if (chat.isAgent) {
            // Trigger Agent Processing
            generateAgentResponse(textToSend);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                // Send image message
                onSendMessage(chat.id, '', 'user', false, base64);
                setShowAttachments(false);
            };
            reader.readAsDataURL(file);
        } else {
            // Assume document
            onSendMessage(chat.id, `Sent a file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'user', true);
            setShowAttachments(false);
        }
        // Reset value so same file can be selected again
        e.target.value = '';
    };

    const saveTitle = () => {
        if (tempTitle.trim() && tempTitle !== chat.title) {
            onUpdateChatTitle(chat.id, tempTitle.trim());
        }
        if (tempCategory !== chatCategory && firstMsg) {
            firstMsg.text = firstMsg.text.replace(/\[Category:\s*([^\]]+)\]/, `[Category: ${tempCategory}]`);
            // The saveMessage in DB service is updated to UPSERT text
            dbService.saveMessage(chat.id, firstMsg);
            onUpdateChat(chat.id, { messages: [...chat.messages] });
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveTitle();
        }
    };

    const attachmentOptions = [
        { label: 'Gallery', icon: <Image size={24} />, color: 'text-purple-500' },
        { label: 'Camera', icon: <Camera size={24} />, color: 'text-rose-500' },
        { label: 'Document', icon: <FileText size={24} />, color: 'text-blue-500' },
        { label: 'Location', icon: <MapPin size={24} />, color: 'text-green-500' },
    ];

    const handleAttachmentOption = (label: string) => {
        if (label === 'Gallery') galleryInputRef.current?.click();
        else if (label === 'Camera') cameraInputRef.current?.click();
        else if (label === 'Document') documentInputRef.current?.click();
        else if (label === 'Location') {
            onSendMessage(chat.id, "Shared location: 123 Innovation Dr, Tech City", 'user');
            setShowAttachments(false);
        }
    };

    const handleMicClick = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    const handleExecuteTask = (task: string) => {
        handleSend(`Execute task: ${task}`);
        setShowTaskList(false);
    };

    const handleAddAgent = (agent: Agent) => {
        const current = chat.secondaryAgents || [];
        if (!current.some(a => a.id === agent.id)) {
            onUpdateChat(chat.id, { secondaryAgents: [...current, agent] });
            onSendMessage(chat.id, `_Added ${agent.name} to the team_`, 'user');
        }
    };

    const toggleIncognitoChat = () => {
        onUpdateChat(chat.id, { isIncognito: !chat.isIncognito });
    };

    const MOCK_CONTACTS = [
        { name: "Alice Mom", phone: "+1 (555) 010-9988", initials: "AM" },
        { name: "Bob Work", phone: "+1 (555) 123-4567", initials: "BW" },
        { name: "Charlie Gym", phone: "+1 (555) 987-6543", initials: "CG" },
        { name: "David Lawyer", phone: "+1 (555) 111-2222", initials: "DL" },
        { name: "Eve Landlord", phone: "+1 (555) 333-4444", initials: "EL" },
    ];

    const handleContactInvite = (contact: typeof MOCK_CONTACTS[0]) => {
        const newMember: Agent = {
            id: `contact_${contact.phone.replace(/\D/g, '')}`,
            name: contact.name,
            avatar: `https://ui-avatars.com/api/?name=${contact.name.replace(' ', '+')}&background=random`,
            description: `Contact: ${contact.phone}`,
            isVerified: false
        };
        onAddMember(chat.id, newMember);
        setShowContactPicker(false);
    };

    return (
        <>
            <div className={`flex flex-col h-full relative ${isIncognito ? 'bg-gray-900' : 'bg-[#f0f2f5] dark:bg-gray-950'}`}>
                {/* Hidden File Inputs */}
                <input type="file" ref={documentInputRef} className="hidden" onChange={handleFileSelect} />
                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                <input type="file" ref={cameraInputRef} className="hidden" accept="image/*,video/*" capture="environment" onChange={handleFileSelect} />

                {/* Header */}
                <header className={`flex items-center px-4 py-3 border-b sticky top-0 z-20 shadow-sm min-h-[64px] ${isIncognito ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800'}`}>
                    <button onClick={onBack} className={`mr-3 p-1 rounded-full hover:bg-opacity-10 ${isIncognito ? 'text-gray-300 hover:bg-gray-500' : 'text-primary hover:bg-red-50 dark:hover:bg-gray-800'}`}>
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm shrink-0 overflow-hidden ${isIncognito ? 'bg-gray-600' : avatarColor}`}>
                            {chat.avatar && !chat.avatar.includes('robohash') ? (
                                <img src={chat.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                isIncognito ? <IncognitoIcon size={20} /> : avatarInitials
                            )}
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                {isEditingTitle ? (
                                    <div className="flex items-center gap-2 w-full max-w-[200px]">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            onKeyDown={handleTitleKeyDown}
                                            className={`w-full text-sm font-bold border-b outline-none py-0.5 ${isIncognito ? 'bg-transparent text-white border-gray-500' : 'text-gray-900 border-primary dark:bg-gray-800 dark:text-white'}`}
                                        />
                                        <button onClick={saveTitle} className="text-green-600 hover:bg-green-50 rounded-full p-0.5"><Check size={16} /></button>
                                        <button onClick={() => { setTempTitle(chat.title); setTempCategory(chatCategory); setIsEditingTitle(false); }} className="text-red-500 hover:bg-red-50 rounded-full p-0.5"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <h1 className={`text-sm font-bold leading-tight truncate max-w-[180px] ${isIncognito ? 'text-gray-100' : 'text-gray-900 dark:text-white'}`}>
                                            {chat.title || chat.contactName}
                                        </h1>
                                        <button onClick={() => setIsEditingTitle(true)} className={`${isIncognito ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-gray-300'} p-0.5 rounded-full`}><Edit2 size={12} /></button>
                                    </>
                                )}
                            </div>
                            {isEditingTitle ? (
                                <div className="mt-1">
                                    <select
                                        value={tempCategory}
                                        onChange={(e) => setTempCategory(e.target.value)}
                                        className={`text-xs border outline-none py-0.5 rounded ${isIncognito ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white'}`}
                                    >
                                        {CONTEXT_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.label}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                    {chatCategory && (
                                        <span className={`text-xs truncate ${isIncognito ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {chatCategory}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center ml-2 gap-1">
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className={`p-2 rounded-full transition-colors relative ${isIncognito ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                            >
                                <MoreVertical size={24} />
                                {chat.pendingActions && chat.pendingActions.length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-1 ring-white" />
                                )}
                            </button>

                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-40 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <button
                                            onClick={() => { setShowMenu(false); onOpenGallery(); }}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                                        >
                                            <Image size={18} />
                                            Media
                                        </button>
                                        <button
                                            onClick={() => { setShowMenu(false); setShowTeamModal(true); }}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                                        >
                                            <Bot size={18} />
                                            Agents
                                        </button>
                                        <button
                                            onClick={() => { setShowMenu(false); setShowContactPicker(true); }}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                                        >
                                            <Users size={18} />
                                            Humans
                                        </button>
                                        <button
                                            onClick={() => { setShowMenu(false); setShowTaskList(true); }}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ClipboardList size={18} />
                                                Tasks
                                            </div>
                                            {chat.pendingActions && chat.pendingActions.length > 0 && (
                                                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                    {chat.pendingActions.length}
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => { setShowMenu(false); toggleIncognitoChat(); }}
                                            className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                                        >
                                            <IncognitoIcon size={18} />
                                            Incognito
                                            {isIncognito && (
                                                <span className="text-xs text-primary font-normal ml-auto">On</span>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Live Call Overlay */}
                {isCallActive && (
                    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center animate-in slide-in-from-bottom duration-500">
                        {/* Main Content Area */}
                        <div className="flex-1 w-full relative flex items-center justify-center">

                            {/* Background/Avatar */}
                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                {/* Pulsing rings for agent voice */}
                                {agentVolume > 0.1 && (
                                    <div className="absolute w-64 h-64 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                                )}

                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <div
                                        className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800 shadow-2xl transition-transform duration-100"
                                        style={{ transform: `scale(${1 + (agentVolume * 0.1)})` }}
                                    >
                                        <img src={chat.avatar} alt="Agent" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-white text-2xl font-bold">{chat.contactName}</h2>
                                        <p className="text-gray-400 text-sm animate-pulse">Live Audio Connected</p>
                                    </div>
                                </div>
                            </div>

                            {/* Local Video Preview (PiP) */}
                            {callType === 'video' && (
                                <div className="absolute top-6 right-6 w-32 h-48 bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700">
                                    <video
                                        ref={setLocalVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover mirror-mode"
                                        style={{ transform: 'scaleX(-1)' }} // Mirror effect
                                    />
                                </div>
                            )}
                        </div>

                        {/* Call Controls */}
                        <div className="w-full bg-gray-900/90 backdrop-blur p-8 pb-12 rounded-t-3xl">
                            <div className="flex items-center justify-center gap-8">
                                <button
                                    onClick={() => setMicMuted(!micMuted)}
                                    className={`p-4 rounded-full transition-all ${micMuted ? 'bg-white text-gray-900' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                                >
                                    {micMuted ? <MicOff size={28} /> : <Mic size={28} />}
                                </button>

                                <button
                                    onClick={endLiveCall}
                                    className="p-5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform active:scale-95"
                                >
                                    <PhoneOff size={32} />
                                </button>

                                {callType === 'video' ? (
                                    <button
                                        className="p-4 bg-gray-800 text-white rounded-full hover:bg-gray-700"
                                        onClick={() => {
                                            // Toggle video not implemented in session class yet, just UI mock
                                        }}
                                    >
                                        <Video size={28} />
                                    </button>
                                ) : (
                                    <button
                                        className="p-4 bg-gray-800 text-gray-500 rounded-full cursor-not-allowed"
                                    >
                                        <VideoOff size={28} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chat.messages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        const showDate = index === 0 || new Date(msg.timestamp).toDateString() !== new Date(chat.messages[index - 1].timestamp).toDateString();

                        // Determine avatar to show for agent messages
                        const agentAvatar = msg.subAgentProfile?.avatar || chat.avatar;
                        const agentName = msg.subAgentProfile?.name || chat.contactName;
                        const agentRole = msg.subAgentProfile?.role;

                        // System message check (simple italic check based on implementation above)
                        const isSystem = !isUser && msg.text.startsWith('_') && msg.text.endsWith('_');

                        if (isSystem) {
                            return (
                                <div key={msg.id} className="flex justify-center my-4 px-8">
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-medium text-center shadow-sm border border-yellow-100 dark:border-yellow-900/30 flex items-center gap-2">
                                        <Timer size={12} />
                                        {msg.text.replace(/_/g, '')}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <React.Fragment key={msg.id}>
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${isIncognito ? 'bg-gray-800 text-gray-400' : 'bg-red-50 text-red-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                )}

                                <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    {!isUser && (
                                        <div className="flex flex-col items-center mr-2 self-end mb-1">
                                            <img src={agentAvatar} alt="Sender" className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm object-cover" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isUser
                                                ? (isIncognito ? 'bg-gray-700 text-white rounded-br-none' : 'bg-primary text-white rounded-br-none')
                                                : (isIncognito ? 'bg-gray-800 text-gray-200 border-gray-700 rounded-bl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700')
                                            }`}
                                    >
                                        {/* Sub-agent Name Label */}
                                        {!isUser && (
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`text-xs font-bold ${isIncognito ? 'text-gray-300' : 'text-gray-900 dark:text-white'}`}>{agentName}</span>
                                                {agentRole && (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${isIncognito
                                                            ? 'bg-gray-900 text-gray-400'
                                                            : (agentRole === 'Medical' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                                                                agentRole === 'Legal' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                                                                    agentRole === 'Education' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                        'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400')
                                                        }`}>
                                                        {agentRole}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {msg.image && (
                                            <div className="mb-2">
                                                <img src={msg.image} alt="Shared" className="rounded-lg max-w-full h-auto object-cover border border-gray-100 dark:border-gray-700" />
                                            </div>
                                        )}

                                        {msg.isReport ? (
                                            <button
                                                onClick={() => onViewReport(msg.text)}
                                                className={`flex items-center space-x-3 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow group text-left w-full border ${isIncognito ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-700'}`}
                                            >
                                                <div className={`p-2.5 rounded-lg transition-colors ${isIncognito ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-500 group-hover:bg-red-100 dark:bg-red-900/20'}`}>
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-sm font-bold truncate pr-2 ${isIncognito ? 'text-gray-200' : 'text-gray-900 dark:text-gray-100'}`}>{msg.text}</span>
                                                    <span className="text-xs text-gray-400 font-medium">Document</span>
                                                </div>
                                            </button>
                                        ) : (
                                            msg.text && <p className={`text-[13px] leading-relaxed whitespace-pre-wrap`}>
                                                {msg.text}
                                            </p>
                                        )}

                                        <div className={`flex justify-end items-center mt-1 space-x-1 ${isUser ? 'text-red-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                            <span className="text-[10px]">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className={`rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1 border ${isIncognito ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Follow-Up Action */}
                {suggestedFollowUp && !isTyping && (
                    <div className={`px-4 pb-2 animate-in slide-in-from-bottom-2 duration-300 ${isIncognito ? 'bg-gray-900' : 'bg-[#f0f2f5] dark:bg-gray-950'}`}>
                        <button
                            onClick={() => handleSend(suggestedFollowUp)}
                            className={`w-full flex items-center justify-between gap-3 backdrop-blur-sm border p-3 rounded-xl shadow-sm text-left hover:shadow-md transition-all group ${isIncognito ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-800' : 'bg-white/80 border-primary/20 hover:bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'}`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isIncognito ? 'bg-gray-700 text-gray-300' : 'bg-primary/10 text-primary dark:bg-blue-900/30'}`}>
                                    <Sparkles size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${isIncognito ? 'text-gray-400' : 'text-primary'}`}>Suggested Question</p>
                                    <p className={`text-sm font-medium truncate ${isIncognito ? 'text-gray-200' : 'text-gray-900 dark:text-gray-100'}`}>{suggestedFollowUp}</p>
                                </div>
                            </div>
                            <Send size={16} className={`transition-colors ${isIncognito ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-primary dark:text-gray-500'}`} />
                        </button>
                    </div>
                )}

                {/* Attachment Menu Overlay */}
                {showAttachments && (
                    <div className={`p-4 border-t animate-in slide-in-from-bottom-5 duration-200 ${isIncognito ? 'bg-gray-900 border-gray-800' : 'bg-[#f0f2f5] border-gray-200 dark:bg-gray-900 dark:border-gray-800'}`}>
                        <div className="grid grid-cols-4 gap-y-6 gap-x-4 mb-2">
                            {attachmentOptions.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => handleAttachmentOption(opt.label)}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm group-active:scale-95 transition-transform ${isIncognito ? 'bg-gray-800' : 'bg-white dark:bg-gray-800'} ${opt.color}`}>
                                        {opt.icon}
                                    </div>
                                    <span className={`text-xs font-medium ${isIncognito ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <footer className={`p-3 border-t flex items-end space-x-2 ${isIncognito ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800'}`}>
                    <button
                        onClick={() => setShowAttachments(!showAttachments)}
                        className={`p-2 rounded-full mb-1 ${isIncognito ? 'text-gray-400 hover:bg-gray-700' : 'text-primary hover:bg-red-50 dark:hover:bg-gray-800'} ${showAttachments ? (isIncognito ? 'bg-gray-700' : 'bg-gray-100 dark:bg-gray-800') : ''}`}
                    >
                        {showAttachments ? <X className="w-6 h-6" /> : <Paperclip className="w-6 h-6" />}
                    </button>
                    <div className={`flex-1 rounded-2xl flex items-center px-4 py-2 min-h-[44px] ${isIncognito ? 'bg-gray-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <textarea
                            className={`bg-transparent border-none focus:ring-0 text-sm w-full placeholder-gray-500 max-h-24 resize-none py-1 ${isIncognito ? 'text-gray-200' : 'text-gray-800 dark:text-gray-200'}`}
                            placeholder="Type a message..."
                            rows={1}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ minHeight: '24px' }}
                        />
                    </div>
                    {inputText.trim() && !isListening ? (
                        <button onClick={() => handleSend()} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors mb-1 flex-shrink-0 ${isIncognito ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-primary text-white hover:bg-red-600'}`}>
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleMicClick}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all mb-1 flex-shrink-0 ${isListening
                                    ? 'bg-primary text-white animate-pulse scale-110'
                                    : (isIncognito ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-primary text-white hover:bg-red-600')
                                }`}
                        >
                            {isListening ? <Mic className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
                        </button>
                    )}
                </footer>
            </div>

            {/* Task List Overlay Modal */}
            {showTaskList && (
                <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-0 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-10 duration-200 flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <ClipboardList size={20} className="text-gray-900 dark:text-white" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Project Tasks</h3>
                            </div>
                            <button onClick={() => setShowTaskList(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900">
                            {(!chat.pendingActions || chat.pendingActions.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                    <ClipboardList size={48} className="text-gray-200 dark:text-gray-700 mb-2" />
                                    <p className="text-sm">No actionable tasks identified yet.</p>
                                    <p className="text-xs mt-1">Chat with the Supervisor to define tasks.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chat.pendingActions.map((task, i) => (
                                        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${task.startsWith('Review Report:') ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-blue-50 text-primary dark:bg-blue-900/20'}`}>
                                                    {task.startsWith('Review Report:') ? <FileText size={18} /> : <Bot size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{task}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
                                                        {task.startsWith('Review Report:') ? 'Report Generated' : 'Ready to execute'}
                                                    </p>
                                                </div>
                                            </div>

                                            {task.startsWith('Review Report:') ? (
                                                <button
                                                    onClick={() => {
                                                        const title = task.replace('Review Report:', '').trim();
                                                        onViewReport(title);
                                                        setShowTaskList(false);
                                                    }}
                                                    className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <FileText size={14} fill="currentColor" />
                                                    View Report
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleExecuteTask(task)}
                                                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <Play size={14} fill="currentColor" />
                                                    Run Task
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Team Member Management Modal */}
            {showTeamModal && (
                <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-0 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-10 duration-200 flex flex-col h-[80vh]">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Users size={20} className="text-gray-900 dark:text-white" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Team Members</h3>
                            </div>
                            <button onClick={() => setShowTeamModal(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                            {/* Current Members Section */}
                            <div className="p-4">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">In this chat</h4>
                                <div className="space-y-3">
                                    {/* Primary Agent */}
                                    <div className="flex items-center gap-3">
                                        <img src={chat.avatar} alt="Primary" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-primary object-cover" />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{chat.contactName}</p>
                                            <p className="text-xs text-primary font-medium">Primary Agent</p>
                                        </div>
                                    </div>

                                    {/* Secondary Agents */}
                                    {chat.secondaryAgents && chat.secondaryAgents.map(agent => (
                                        <div key={agent.id} className="flex items-center gap-3">
                                            <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 object-cover" />
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{agent.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Team Member</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* User */}
                                    <div className="flex items-center gap-3 opacity-75">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <User size={20} className="text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">You</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">User</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-2 bg-gray-50 dark:bg-gray-800 border-y border-gray-100 dark:border-gray-800"></div>

                            {/* Add Members Section */}
                            <div className="p-4">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Add Experts</h4>
                                <div className="relative mb-4">
                                    <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        value={teamSearchQuery}
                                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                                        placeholder="Search agents..."
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-primary dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1">
                                    {filteredPotentialAgents.length === 0 ? (
                                        <p className="text-center text-xs text-gray-400 py-4">No matching agents found.</p>
                                    ) : (
                                        filteredPotentialAgents.map(agent => (
                                            <button
                                                key={agent.id}
                                                onClick={() => {
                                                    handleAddAgent(agent);
                                                    setShowTeamModal(false);
                                                    setTeamSearchQuery('');
                                                }}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left group"
                                            >
                                                <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{agent.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.description}</p>
                                                </div>
                                                <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <Plus size={16} />
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Picker Modal */}
            {showContactPicker && (
                <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-bold text-gray-900 dark:text-white">Add Contact to Team</h3>
                            <button onClick={() => setShowContactPicker(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {MOCK_CONTACTS.map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{c.initials}</div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{c.phone}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleContactInvite(c)}
                                        className="bg-indigo-50 text-indigo-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800">
                            Showing contacts from device
                        </div>
                    </div>
                </div>
            )}

            {/* Agent Suggestion Modal (Supervisor Recommendation) */}
            {suggestedAgent && (
                <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center mb-4">
                            <div className="w-16 h-16 bg-red-100 text-primary rounded-full flex items-center justify-center mb-4 border border-red-200 dark:bg-red-900 dark:border-red-800 relative">
                                <Bot size={32} />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-900">
                                    <Check size={12} className="text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Supervisor Suggestion</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                                I've analyzed your request and identified that we need a specialist to handle this effectively.
                            </p>

                            {/* Agent Card */}
                            <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-2">
                                <div className="flex items-center gap-3 text-left">
                                    <img src={suggestedAgent.agent.avatar} alt="Agent" className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 shadow-sm object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{suggestedAgent.agent.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{suggestedAgent.category}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-left italic">"{suggestedAgent.agent.description}"</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSuggestedAgent(null)}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors text-sm"
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => handleAddAgent(suggestedAgent.agent)}
                                className="flex-1 py-3 px-4 bg-primary hover:bg-opacity-90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <UserPlus size={16} />
                                Confirm Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatDetailView;