import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Chat, Agent } from '../types';
import { Mic, Plus, X, MessageCircle, Settings, ArrowLeft, Image as ImageIcon, Archive, Pin, Sparkles, Users, Phone, Trash2, LogOut, ChevronRight, Check, Edit2, Camera, MessageSquarePlus, Menu, Map, Wand2, Loader2, Moon, Sun, Globe } from 'lucide-react';
import Header from '../components/Header';
import { 
    getAvatarColor, getInitials,
    INDIAN_LANGUAGES
} from '../constants';

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
    { id: 'work', label: 'Work', color: 'bg-blue-700' },
    { id: 'hobbies', label: 'Hobbies', color: 'bg-cyan-500' },
    { id: 'social', label: 'Socializing', color: 'bg-lime-500' },
    { id: 'side_project', label: 'Side project', color: 'bg-red-600' },
    { id: 'reading', label: 'Reading', color: 'bg-orange-500' },
    { id: 'exercise', label: 'Exercise', color: 'bg-green-600' },
    { id: 'studying', label: 'Studying', color: 'bg-amber-500' },
    { id: 'commuting', label: 'Commuting', color: 'bg-purple-600' },
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
  onOpenSettings: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
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
    const agentNames = [
        chat.contactName.split('(')[0].trim(), 
        ...(chat.secondaryAgents?.map(a => a.name.split('(')[0].trim()) || [])
    ].join(', ');

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
            finalOffset = 150; // Snap open left (Pin + Archive)
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
            {/* Actions Layer - Left (Visible when swiping RIGHT -> Shows Pin & Archive OR Delete & Unarchive) */}
            <div className="absolute inset-y-0 left-0 flex h-full" style={{ width: '150px' }}>
                {chat.isArchived ? (
                    <button 
                        onClick={() => handleActionClick('delete')}
                        className="flex-1 bg-red-600 text-white flex flex-col items-center justify-center gap-1 active:bg-red-700 transition-colors"
                    >
                        <Trash2 size={24} />
                        <span className="text-[10px] font-bold">Delete</span>
                    </button>
                ) : (
                    <button 
                        onClick={() => handleActionClick('pin')}
                        className="flex-1 bg-gray-500 text-white flex flex-col items-center justify-center gap-1 active:bg-gray-600 transition-colors"
                    >
                        {chat.isPinned ? <div className="relative"><Pin size={24} /><div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-0.5 bg-white rotate-45 transform origin-center"></div></div></div> : <Pin size={24} fill="currentColor" />}
                        <span className="text-[10px] font-bold">
                            {chat.isPinned ? 'Unpin' : 'Pin'}
                        </span>
                    </button>
                )}
                
                <button 
                    onClick={() => handleActionClick('archive')}
                    className="flex-1 bg-[#1d8f76] text-white flex flex-col items-center justify-center gap-1 active:bg-teal-700 transition-colors"
                >
                    <Archive size={24} />
                    <span className="text-[10px] font-bold">{chat.isArchived ? 'Unarchive' : 'Archive'}</span>
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
                    <div className="flex justify-between items-baseline">
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

                    <div className="flex items-start gap-1 justify-between">
                        <span className={`text-sm leading-tight line-clamp-1 flex-1 ${hasMultipleAgents ? 'text-indigo-400' : 'text-gray-500'} ${isIncognito ? 'text-gray-400' : 'dark:text-gray-400'}`}>
                            {hasMultipleAgents ? agentNames : chat.contactName}
                        </span>
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

const ChatsView: React.FC<ChatsViewProps> = ({ chats, isIncognito, isDarkMode, onToggleDarkMode, onToggleIncognito, onSelectChat, onCreateChat, onChatAction, onOpenGallery, onOpenMap, onAddMember, onLogout, onOpenSettings, language, onLanguageChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Profile State
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-hWMD7_tY-hR-BNbyoZ00e0W2Hq6RP0mvZGwlihlhrq9WsDZ3R3P9Sz2olgYZc9ULr-YRUuOGbiqgju2_dgK5Xet8tJKsTITGhifE6dAWFb9TANSc1945T9RDq6lGLtBgT5XuGLEogulwCtIxnd281afH7TgINMw4C4_Y-BTK4ym-dnOCwSgEaVaPhOcDIX0VseTaC1KOU6dF3ToVszHJ71YhNHP7LkavuyaA0Sax_um1RkejDDcAby8X-YDPPsCciSF49Mq8sBoI",
    membership: "Pro Member"
  });
  
  // Profile Editing Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // New Chat Form State
  const [newChatTitle, setNewChatTitle] = useState('');
  const [newChatDescription, setNewChatDescription] = useState('');
  const [selectedContextCategory, setSelectedContextCategory] = useState<string>(CONTEXT_CATEGORIES[0].label);
  
  const [isArchivedView, setIsArchivedView] = useState(false);

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
          } catch(e) {
            console.error("Mic start error", e);
          }
      }
  };
  
  const handleOpenProfileModal = () => {
    setTempProfile(userProfile);
    setShowProfileModal(true);
  };

  const handleSaveProfile = () => {
    if (tempProfile.name.trim()) {
        setUserProfile(tempProfile);
        setShowProfileModal(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = async (ev) => {
              if (ev.target?.result) {
                  const base64 = ev.target!.result as string;
                  setTempProfile(prev => ({ ...prev, avatar: base64 }));
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const filteredChats = chats
    .filter(chat => {
        const query = searchQuery.toLowerCase();
        const title = (chat.title || chat.contactName).toLowerCase();
        const lastMsg = chat.messages[chat.messages.length - 1]?.text?.toLowerCase() || '';
        
        const matchesSearch = title.includes(query) || lastMsg.includes(query);
        const matchesView = isArchivedView ? chat.isArchived : !chat.isArchived;

        return matchesView && matchesSearch;
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
      {/* Common Header */}
      <div className="relative z-20">
        <Header 
            title={isArchivedView ? "Archived" : undefined}
            placeholder="Search chats or messages"
            onSearch={setSearchQuery}
            onMenuClick={() => setShowMenu(!showMenu)}
            onNewChat={openCreateModal}
            newChatLabel="Chat"
            userProfile={userProfile}
            onProfileClick={handleOpenProfileModal}
            showBack={isArchivedView}
            onBack={() => setIsArchivedView(false)}
            className={isIncognito ? '!bg-gray-900 border-b border-gray-800' : ''}
        />

        {/* Dropdown Menu */}
        {showMenu && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                <div className="absolute top-[70px] left-4 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-30 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-left flex flex-col">
                    
                    {/* Language Toggle */}
                    <button 
                        onClick={() => { setShowMenu(false); setShowLanguageModal(true); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        <Globe size={18} />
                        Language: {INDIAN_LANGUAGES.find(l => l.code === language)?.native || 'English'}
                    </button>

                    {/* Dark Mode Toggle */}
                    <button 
                        onClick={() => { setShowMenu(false); onToggleDarkMode(); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-4" />

                    <button 
                        onClick={() => { setShowMenu(false); setIsArchivedView(true); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        <Archive size={18} />
                        Archive
                    </button>
                    <button 
                        onClick={() => { setShowMenu(false); onOpenSettings(); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        <Settings size={18} />
                        Settings
                    </button>
                    
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-4" />

                    <button 
                        onClick={onLogout} 
                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </>
        )}
      </div>

      {/* Incognito Banner */}
      {isIncognito && (
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-center gap-2 border-b border-gray-700">
              <IncognitoIcon size={14} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incognito Active • No History Saved</span>
          </div>
      )}

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
                <p>{isArchivedView ? 'No archived chats' : 'No active chats found'}</p>
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
                              className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                                  language === lang.code 
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

      {/* Profile Edit Modal */}
      {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-0 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Edit Profile</h3>
                      <button 
                          onClick={() => setShowProfileModal(false)} 
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                      <X size={20} className="text-gray-500 dark:text-gray-400" />
                      </button>
                  </div>

                  <div className="p-6">
                      {/* Avatar Edit */}
                      <div className="flex flex-col items-center mb-6">
                          <div className="relative group cursor-pointer" onClick={() => profileImageInputRef.current?.click()}>
                              <img 
                                  src={tempProfile.avatar} 
                                  alt="Profile" 
                                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-800 group-hover:opacity-75 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Camera size={24} className="text-white drop-shadow-md" />
                              </div>
                              <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm">
                                  <Edit2 size={12} />
                              </div>
                          </div>
                          <input 
                              type="file" 
                              ref={profileImageInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleAvatarChange} 
                          />
                          <span className="text-xs text-primary font-bold mt-2 cursor-pointer hover:underline" onClick={() => profileImageInputRef.current?.click()}>
                              Change Photo
                          </span>
                      </div>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
                              <input 
                                  type="text" 
                                  value={tempProfile.name}
                                  onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none"
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Membership Type</label>
                              <input 
                                  type="text" 
                                  value={tempProfile.membership}
                                  onChange={(e) => setTempProfile({...tempProfile, membership: e.target.value})}
                                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none"
                              />
                          </div>
                      </div>
                  </div>

                  <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex gap-3">
                      <button 
                          onClick={() => setShowProfileModal(false)}
                          className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveProfile}
                          disabled={!tempProfile.name.trim()}
                          className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* New Chat Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-0 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            New Chat
                        </h3>
                    </div>
                    <button 
                        onClick={() => { 
                            setShowCreateModal(false); 
                        }} 
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex flex-col min-h-0 flex-1">
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="space-y-5">
                            {/* Context Category Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Category</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CONTEXT_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedContextCategory(cat.label)}
                                            className={`relative flex items-center p-2 rounded-lg border transition-all ${
                                                selectedContextCategory === cat.label 
                                                ? `bg-white dark:bg-gray-800 ring-2 ring-offset-1 ${cat.color.replace('bg-', 'ring-')}` 
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className={`w-1.5 h-8 rounded-full mr-3 ${cat.color}`}></div>
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{cat.label}</span>
                                            {selectedContextCategory === cat.label && (
                                                <div className="absolute right-2 text-primary">
                                                    <Check size={16} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Title *</label>
                                <div className="relative">
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={newChatTitle}
                                        onChange={(e) => setNewChatTitle(e.target.value)}
                                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 focus:border-primary transition-all outline-none text-sm"
                                        placeholder="e.g. Legal advice for lease"
                                        required
                                    />
                                    <button 
                                        onClick={() => toggleMic('title')}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${listeningField === 'title' ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                        title="Speak Title"
                                    >
                                        <Mic size={18} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Context *</label>
                                <div className="relative">
                                    <textarea 
                                        value={newChatDescription}
                                        onChange={(e) => setNewChatDescription(e.target.value)}
                                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 focus:border-primary transition-all outline-none text-sm resize-none h-28"
                                        placeholder={`Describe the situation for ${SUPERVISOR_AGENT.name.split(' ')[0]}...`}
                                        required
                                    />
                                    <button 
                                        onClick={() => toggleMic('context')}
                                        className={`absolute right-2 top-4 p-2 rounded-full transition-colors ${listeningField === 'context' ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                        title="Speak Context"
                                    >
                                        <Mic size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl mt-auto">
                        <button 
                            onClick={handleCreateSubmit}
                            disabled={!isFormValid}
                            className="w-full bg-primary disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:opacity-90"
                        >
                            Start Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ChatsView;