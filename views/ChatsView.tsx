import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Chat, Agent } from '../types';
import { Mic, Plus, X, MessageCircle, Settings, ArrowLeft, Image as ImageIcon, Pin, Sparkles, Users, Phone, Trash2, LogOut, ChevronRight, Check, Edit2, Camera, MessageSquarePlus, Map, Wand2, Loader2, Moon, Sun, Globe, Wallet, MoreVertical } from 'lucide-react';
import Header from '../components/Header';
import {
    getAvatarColor, getInitials,
    INDIAN_LANGUAGES
} from '../constants';
import { TribeSanctumIcon } from '../components/TribeIcons';

// Custom Incognito Icon (Hat & Glasses)
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

const CONTEXT_CATEGORIES = [
    { id: 'body', label: 'Body', color: 'bg-secondary' },   // Brand Yellow
    { id: 'mind', label: 'Mind', color: 'bg-primary' },     // Brand Purple
    { id: 'spirit', label: 'Spirit', color: 'bg-accent' },   // Brand Orange
    { id: 'relations', label: 'Relations', color: 'bg-danger' }, // Brand Red
    { id: 'finances', label: 'Finances', color: 'bg-accent' },   // Brand Orange
    { id: 'work', label: 'Work', color: 'bg-primary' },     // Brand Purple
];

interface ChatsViewProps {
    chats: Chat[];
    isIncognito: boolean;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onToggleIncognito: () => void;
    onSelectChat: (id: string, options?: { startCall?: boolean }) => void;
    onCreateChat: (title: string, primaryAgent: Agent, secondaryAgents: Agent[], initialContext?: string) => void;
    onChatAction: (id: string, action: 'pin' | 'archive' | 'unread' | 'read' | 'delete') => void;
    onOpenGallery: (id: string) => void;
    onOpenMap: (id: string) => void;
    onAddMember: (id: string, member: Agent) => void;
    onLogout: () => void;
    language: string;
    onLanguageChange: (lang: string) => void;
    userProfile?: {
        name: string;
        avatar: string;
        membership: string;
    };
}

interface SwipeableChatRowProps {
    chat: Chat;
    onSelect: () => void;
    onAction: (action: 'pin' | 'archive' | 'unread' | 'read' | 'delete') => void;
    onOpenGallery: () => void;
    onOpenMap: () => void;
    onCall: () => void;
    isIncognito: boolean;
}

// Swipeable Row Component
const SwipeableChatRow: React.FC<SwipeableChatRowProps> = ({
    chat,
    onSelect,
    onAction,
    onOpenGallery,
    onOpenMap,
    onCall,
    isIncognito
}) => {
    const [offset, setOffset] = useState(0);
    const offsetRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef<number | null>(null);

    // Helpers to display
    const lastMsg = chat.messages[chat.messages.length - 1];
    const timeString = lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const displayTitle = chat.title || chat.contactName;
    const initials = getInitials(displayTitle);
    const avatarColor = getAvatarColor(displayTitle);
    const hasMultipleAgents = chat.secondaryAgents && chat.secondaryAgents.length > 0;
    const agentList = [
        chat.contactName.split('(')[0].trim(),
        ...(chat.secondaryAgents?.map(a => a.name.split('(')[0].trim()) || [])
    ];

    const getAgentBadgeColor = (name: string) => {
        const colors = [
            'text-primary bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40',
            'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40',
            'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/40',
            'text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/40',
            'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40',
            'text-teal-700 bg-teal-100 dark:text-teal-300 dark:bg-teal-900/40',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // Extract Category from initial context if it exists
    const firstMsg = chat.messages[0];
    let chatCategory = '';
    let chatDescription = '';
    if (firstMsg?.text) {
        if (firstMsg.text.startsWith('[Category: ')) {
            const match = firstMsg.text.match(/\[Category:\s*([^\]]+)\]\n?(.*)/s);
            if (match) {
                chatCategory = match[1];
                chatDescription = match[2] || '';
            }
        } else {
            chatDescription = firstMsg.text;
        }
    }

    // Drag Logic
    const onStart = (clientX: number) => {
        startX.current = clientX;
        setIsDragging(true);
    };

    const onMove = (clientX: number) => {
        if (startX.current === null) return;
        const diff = clientX - startX.current;

        // Resistance limits
        const limit = 220;
        let newOffset = diff;
        if (newOffset > limit) newOffset = limit + (newOffset - limit) * 0.2;
        if (newOffset < -limit) newOffset = -limit + (newOffset + limit) * 0.2;

        setOffset(newOffset);
        offsetRef.current = newOffset;
    };

    const onEnd = () => {
        setIsDragging(false);
        const currentOffset = offsetRef.current;
        const threshold = 60;

        let finalOffset = 0;
        if (currentOffset > threshold) {
            finalOffset = 150; // Snap open left (Pin + Delete)
        } else if (currentOffset < -threshold) {
            finalOffset = -150; // Snap open right (Maps + Call)
        } else {
            finalOffset = 0; // Snap close
        }

        setOffset(finalOffset);
        offsetRef.current = finalOffset;
        startX.current = null;
    };

    // Events
    const handleTouchStart = (e: React.TouchEvent) => onStart(e.touches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => onMove(e.touches[0].clientX);
    const handleMouseDown = (e: React.MouseEvent) => onStart(e.clientX);

    // Global mouse listeners for drag
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
        const handleMouseUp = () => onEnd();

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);


    const handleContentClick = () => {
        if (Math.abs(offset) > 10) {
            setOffset(0);
            offsetRef.current = 0;
        } else {
            onSelect();
        }
    };

    const handleActionClick = (action: 'pin' | 'archive' | 'unread' | 'read' | 'delete') => {
        onAction(action);
        setOffset(0);
        offsetRef.current = 0;
    };

    return (
        <div className={`relative overflow-hidden w-full select-none border-b ${isIncognito ? 'border-gray-800 bg-gray-900' : 'border-gray-50 bg-gray-100 dark:border-gray-800 dark:bg-gray-800'}`}>
            {/* Actions Layer - Left (Visible when swiping RIGHT -> Shows Pin & Delete) */}
            <div className="absolute inset-y-0 left-0 flex h-full" style={{ width: '150px' }}>
                <button
                    onClick={() => handleActionClick('pin')}
                    className="flex-1 bg-gray-500 text-white flex flex-col items-center justify-center gap-1 active:bg-gray-600 transition-colors"
                >
                    {chat.isPinned ? <div className="relative"><Pin size={24} /><div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-0.5 bg-white rotate-45 transform origin-center"></div></div></div> : <Pin size={24} fill="currentColor" />}
                    <span className="text-[10px] font-bold">
                        {chat.isPinned ? 'Unpin' : 'Pin'}
                    </span>
                </button>

                <button
                    onClick={() => handleActionClick('delete')}
                    className="flex-1 bg-red-600 text-white flex flex-col items-center justify-center gap-1 active:bg-red-700 transition-colors"
                >
                    <Trash2 size={24} />
                    <span className="text-[10px] font-bold">Delete</span>
                </button>
            </div>

            {/* Actions Layer - Right (Visible when swiping LEFT -> Shows Maps & Call) */}
            <div className="absolute inset-y-0 right-0 flex h-full" style={{ width: '150px' }}>
                <button
                    onClick={() => {
                        onOpenMap();
                        setOffset(0);
                    }}
                    className="flex-1 bg-green-500 text-white flex flex-col items-center justify-center gap-1 active:bg-green-600 transition-colors"
                >
                    <Map size={24} />
                    <span className="text-[10px] font-bold">Maps</span>
                </button>
                <button
                    onClick={() => { onCall(); setOffset(0); }}
                    className="flex-1 bg-primary text-white flex flex-col items-center justify-center gap-1 active:bg-red-700 transition-colors"
                >
                    <Phone size={24} />
                    <span className="text-[10px] font-bold">Call</span>
                </button>
            </div>

            {/* Foreground Content */}
            <div
                className={`relative flex items-center px-4 py-3 transition-transform duration-300 ease-out z-10 ${isIncognito ? 'bg-gray-900' : 'bg-white dark:bg-gray-900'}`}
                style={{ transform: `translateX(${offset}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={onEnd}
                onMouseDown={handleMouseDown}
                onClick={handleContentClick}
            >
                <div className="relative flex-shrink-0 mr-3">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${isIncognito ? 'bg-gray-700 text-gray-300 border border-gray-600' : avatarColor}`}>
                        {isIncognito ? <IncognitoIcon size={20} /> : initials}
                    </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex justify-between items-baseline mb-0.5">
                        <div className="flex items-center gap-1 min-w-0 pr-2">
                            <h2 className={`text-base font-bold truncate ${isIncognito ? 'text-gray-100' : 'text-gray-900 dark:text-gray-100'}`}>{displayTitle}</h2>
                            {chat.isIncognito && <IncognitoIcon size={14} className="text-gray-400 flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            {chat.isPinned && (
                                <Pin size={12} className="text-gray-400 rotate-45 transform" fill="currentColor" />
                            )}
                            <span className="text-[10px] font-medium text-gray-400 uppercase">{timeString}</span>
                        </div>
                    </div>

                    {chatDescription && (
                        <p className={`text-[13px] font-medium line-clamp-1 leading-snug mb-1 ${isIncognito ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {chatDescription}
                        </p>
                    )}

                    <div className="flex items-center justify-between gap-1">
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 items-center">
                            {agentList.map((agent, index) => (
                                <span key={index} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap ${getAgentBadgeColor(agent)}`}>
                                    {agent}
                                </span>
                            ))}
                        </div>
                        {chatCategory && (
                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm whitespace-nowrap">{chatCategory}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SUPERVISOR_AGENT: Agent = {
    id: 'expert_prod', // Using Productivity Consultant as the generic supervisor
    name: 'Chat Supervisor',
    avatar: 'https://robohash.org/supervisor_agent.png?set=set1&size=200x200',
    description: 'I manage your tasks and bring in experts when needed.',
    isVerified: true
};

const ChatsView: React.FC<ChatsViewProps> = ({ chats, isIncognito, isDarkMode, onToggleDarkMode, onToggleIncognito, onSelectChat, onCreateChat, onChatAction, onOpenGallery, onOpenMap, onAddMember, onLogout, language, onLanguageChange, userProfile }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState<string>('All Chats');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const [newChatTitle, setNewChatTitle] = useState('');
    const [newChatDescription, setNewChatDescription] = useState('');
    const [selectedContextCategory, setSelectedContextCategory] = useState<string>(CONTEXT_CATEGORIES[0].label);



    // STT State for New Chat
    const recognitionRef = useRef<any>(null);
    const [listeningField, setListeningField] = useState<'title' | 'context' | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
        }
    }, []);

    const toggleMic = (field: 'title' | 'context') => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        if (listeningField === field) {
            recognitionRef.current.stop();
            setListeningField(null);
        } else {
            // If listening to other field, stop first
            if (listeningField) {
                recognitionRef.current.stop();
            }

            // Define handlers for the specific field
            recognitionRef.current.onstart = () => setListeningField(field);
            recognitionRef.current.onend = () => setListeningField(null);
            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    const text = finalTranscript.trim();
                    if (!text) return;

                    if (field === 'title') {
                        setNewChatTitle(prev => {
                            const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                            return prev + spacer + text;
                        });
                    } else {
                        setNewChatDescription(prev => {
                            const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                            return prev + spacer + text;
                        });
                    }
                }
            };

            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Mic start error", e);
            }
        }
    };

    const filteredChats = chats
        .filter(chat => {
            const query = searchQuery.toLowerCase();
            const title = (chat.title || chat.contactName).toLowerCase();
            const lastMsg = chat.messages[chat.messages.length - 1]?.text?.toLowerCase() || '';

            const matchesSearch = title.includes(query) || lastMsg.includes(query);
            const matchesView = !chat.isArchived;

            let chatCategory = '';
            const firstMsg = chat.messages[0];
            if (firstMsg?.text && firstMsg.text.startsWith('[Category: ')) {
                const match = firstMsg.text.match(/\[Category:\s*([^\]]+)\]/);
                if (match) chatCategory = match[1];
            }

            const matchesTag = activeTag === 'All Chats' || chatCategory === activeTag;

            return matchesView && matchesSearch && matchesTag;
        })
        .sort((a, b) => {
            // Sort by Pinned then Date
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newChatTitle.trim() && newChatDescription.trim()) {
            const context = `[Category: ${selectedContextCategory}]\n${newChatDescription.trim()}`;
            onCreateChat(newChatTitle.trim(), SUPERVISOR_AGENT, [], context);

            // Reset
            setNewChatTitle('');
            setNewChatDescription('');
            setSelectedContextCategory(CONTEXT_CATEGORIES[0].label);
            setShowCreateModal(false);
        }
    };

    const openCreateModal = () => {
        setNewChatTitle('');
        setNewChatDescription('');
        setSelectedContextCategory(CONTEXT_CATEGORIES[0].label);
        setShowCreateModal(true);
    };

    const isFormValid = newChatTitle.trim().length > 0 && newChatDescription.trim().length > 0;

    return (
        <div className={`flex flex-col h-full relative transition-colors duration-300 ${isIncognito ? 'bg-gray-900' : 'bg-white dark:bg-gray-950'}`}>
            {/* Incognito Banner */}
            {isIncognito && (
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-center gap-2 border-b border-gray-700">
                    <IncognitoIcon size={14} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incognito Active • No History Saved</span>
                </div>
            )}


            {/* Sticky Bubble Tags */}
            <div className={`sticky top-0 z-30 ${isIncognito ? 'bg-gray-900' : 'bg-white dark:bg-gray-950'} px-4 pt-4 pb-0 relative`}>
                <div className="w-full flex items-center gap-3 pb-2">

                    <span className={`text-3xl font-black tracking-wide ${isIncognito ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        CHATS
                    </span>
                    <div className="flex items-center gap-3 ml-auto">
                        {userProfile && (
                            <div className="flex items-center gap-2.5 pl-3">
                                <div className="flex flex-col items-end min-w-0">
                                    <span className={`text-[13px] font-bold truncate leading-tight ${isIncognito ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                        {userProfile.name}
                                    </span>
                                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-full mt-0.5 whitespace-nowrap">
                                        {userProfile.membership}
                                    </span>
                                </div>
                                <div className="relative shrink-0">
                                    <img
                                        src={userProfile.avatar}
                                        alt="Profile"
                                        className={`w-10 h-10 rounded-full object-cover border-2 shadow-md ${isIncognito ? 'border-gray-700' : 'border-white dark:border-gray-800'}`}
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
                {/* Tribal Art Separator Line */}
                <div className="w-full h-[5px] -mx-4 opacity-90 relative" style={{ width: 'calc(100% + 2rem)' }}>
                    <svg width="100%" height="5" preserveAspectRatio="none" className="absolute bottom-0">
                        <defs>
                            <pattern id="tribal-line-chats" x="0" y="0" width="32" height="5" patternUnits="userSpaceOnUse">
                                <rect width="32" height="5" fill="#fcd34d" />
                                <path d="M0 5 L8 0 L16 5 L24 0 L32 5" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="miter" />
                                <path d="M0 5 L4 2.5 L8 5 L12 2.5 L16 5 L20 2.5 L24 5 L28 2.5 L32 5" fill="none" stroke="#ea580c" strokeWidth="1" strokeLinejoin="miter" />
                                <circle cx="8" cy="3.5" r="0.75" fill="#451a03" />
                                <circle cx="24" cy="3.5" r="0.75" fill="#451a03" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#tribal-line-chats)" />
                    </svg>
                </div>
            </div>

            {/* Featured Showcase Carousel */}
            <div className="px-4 py-8">
                <div className="relative w-full aspect-[64/27] rounded-[32px] overflow-hidden shadow-2xl bg-black group">
                    <img
                        src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200"
                        className="w-full h-full object-cover opacity-80"
                        alt="Featured Ad"
                    />
                    {/* Visual Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 items-center text-center">
                        <h2 className="text-white text-3xl font-black tracking-tighter leading-none mb-1">CONNECT WITH EXPERTS</h2>
                        <div className="w-12 h-0.5 bg-gray-500 mb-2" />
                        <p className="text-white text-xl font-black tracking-widest uppercase mb-1">PRO ADVICE ON DEMAND</p>
                    </div>

                    {/* Navigation Arrows */}
                    <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>

                    {/* Carousel Dots */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/40 shadow-sm" />
                    </div>
                </div>
            </div>

            {/* Chat List */}
            <main className="flex-1 overflow-y-auto pb-24">
                {filteredChats.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center h-full ${isIncognito ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>
                        {isIncognito ? (
                            <>
                                <IncognitoIcon size={48} className="mb-4 text-gray-700" />
                                <p>You are Incognito.</p>
                                <p className="text-xs mt-2 text-gray-600">Chats here are temporary.</p>
                            </>
                        ) : (
                            <p>No active chats found</p>
                        )}
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <SwipeableChatRow
                            key={chat.id}
                            chat={chat}
                            isIncognito={isIncognito}
                            onSelect={() => onSelectChat(chat.id)}
                            onAction={(action) => onChatAction(chat.id, action)}
                            onOpenGallery={() => onOpenGallery(chat.id)}
                            onOpenMap={() => onOpenMap(chat.id)}
                            onCall={() => onSelectChat(chat.id, { startCall: true })}
                        />
                    ))
                )}
            </main>

            {/* Language Switcher Modal */}
            {showLanguageModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Globe size={20} className="text-gray-900 dark:text-white" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Select Language</h3>
                            </div>
                            <button onClick={() => setShowLanguageModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-2">
                            {INDIAN_LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        onLanguageChange(lang.code);
                                        setShowLanguageModal(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${language === lang.code
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold text-sm">{lang.native}</span>
                                        <span className="text-xs opacity-70">{lang.name}</span>
                                    </div>
                                    {language === lang.code && <Check size={18} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* New Chat Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">How can we help</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={20} className="hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        <div className="flex flex-col min-h-0 flex-1">
                            <div className="p-6 overflow-y-auto space-y-5">
                                {/* Category Dropdown */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Category</label>
                                    <div className="relative">
                                        <select
                                            value={selectedContextCategory}
                                            onChange={(e) => setSelectedContextCategory(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium cursor-pointer"
                                        >
                                            {CONTEXT_CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.label}>{cat.label}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Title Input */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Title *</label>
                                    <div className="relative">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newChatTitle}
                                            onChange={(e) => setNewChatTitle(e.target.value.toUpperCase())}
                                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 pr-12 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium uppercase"
                                            placeholder="e.g. LEGAL ADVICE FOR LEASE"
                                            required
                                        />
                                        <button
                                            onClick={() => toggleMic('title')}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${listeningField === 'title' ? 'text-danger bg-red-50 animate-pulse' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                            title="Speak Title"
                                        >
                                            <Mic size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Context TextArea */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Context *</label>
                                    <div className="relative">
                                        <textarea
                                            value={newChatDescription}
                                            onChange={(e) => setNewChatDescription(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 pr-12 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[120px] text-[15px] font-medium"
                                            placeholder={`Describe the situation...`}
                                            required
                                        />
                                        <button
                                            onClick={() => toggleMic('context')}
                                            className={`absolute right-2 top-4 p-2 rounded-full transition-colors ${listeningField === 'context' ? 'text-danger bg-red-50 animate-pulse' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                            title="Speak Context"
                                        >
                                            <Mic size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 shrink-0 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleCreateSubmit}
                                    disabled={!isFormValid}
                                    className="w-full bg-primary disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Start Chat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ChatsView;