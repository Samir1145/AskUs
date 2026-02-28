import React, { useState, useEffect, useRef } from 'react';
import { Tab, Chat, Agent, Task, Message, Bill } from './types';
import ChatsView from './views/ChatsView';
import ChatDetailView from './views/ChatDetailView';
import SettingsView from './views/SettingsView';
import MediaGalleryView from './views/MediaGalleryView';
import MapView from './views/MapView';
import EventsView from './views/EventsView';
import EatsView from './views/EatsView';
import WalletView from './views/WalletView';
import TribeCirclesView from './views/TribeCirclesView';
import { dbService } from './services/db';
import { EXPERT_AGENTS_DATA, INDIAN_LANGUAGES } from './constants';
import { TribeSanctumIcon, TribeLoungeIcon, TribeKitchenIcon, TribeCirclesIcon } from './components/TribeIcons';
import { Headset, Armchair, Coffee, Users, Globe, Sun, Moon, Wallet, Archive, Settings, LogOut, X, Camera, Edit2, Check, Key } from 'lucide-react';


// Auth Views
import SplashScreen from './views/SplashScreen';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import ForgotPasswordView from './views/ForgotPasswordView';

// Initial Mock Data for Chats
const INITIAL_CHATS: Chat[] = [
  {
    id: 'c1',
    agentId: 'expert_cs',
    title: 'Urgent Client Escalation',
    contactName: 'Customer Support Specialist',
    avatar: 'https://robohash.org/customer_support_specialist.png?set=set5&size=200x200',
    messages: [
      { id: 'm1', sender: 'agent', text: 'I have reviewed the ticket regarding Client X. How would you like to proceed?', timestamp: new Date(Date.now() - 86400000) }
    ],
    unreadCount: 0,
    lastActive: new Date(Date.now() - 3600000),
    isAgent: true,
    isPinned: true
  },
  {
    id: 'c2',
    agentId: 'expert_marketing',
    title: 'Q4 Campaign',
    contactName: 'Marketing Specialist',
    avatar: 'https://robohash.org/marketing_specialist.png?set=set5&size=200x200',
    messages: [
      { id: 'm2', sender: 'user', text: 'Draft the timeline for the Q4 launch.', timestamp: new Date(Date.now() - 172800000) },
    ],
    unreadCount: 3,
    lastActive: new Date(Date.now() - 86400000),
    isAgent: true
  },
];

const MOCK_TASKS: Task[] = [
  {
    id: 't_128',
    chatId: 'c1',
    chatTitle: 'Urgent Client Escalation',
    description: 'Draft response for Client X',
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000),
    reportUrl: '#'
  },
];

const INITIAL_BILLS: Bill[] = [
  { id: 'b_901', taskId: 't_128', description: 'Task: Draft response', amount: '₹80', date: new Date(Date.now() - 86400000), status: 'paid' },
];

type AppView = 'SPLASH' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'APP';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('SPLASH');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHATS);

  // Chat Data Stores
  const [chats, setChats] = useState<Chat[]>([]);
  const [incognitoChats, setIncognitoChats] = useState<Chat[]>([]);

  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // App Modes
  const [isIncognito, setIsIncognito] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rbz_theme') === 'dark';
    }
    return false;
  });

  // Language State
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('askus_lang') || 'en';
    }
    return 'en';
  });

  // Call State
  const [autoStartCall, setAutoStartCall] = useState(false);

  // State for Gallery & Map
  const [viewingGalleryChatId, setViewingGalleryChatId] = useState<string | null>(null);
  const [viewingMap, setViewingMap] = useState<boolean>(false);

  // Global Menu States
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });

  const [userProfile, setUserProfile] = useState({
    name: 'Alex Costa',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    membership: 'Tribe Founder'
  });
  const [tempProfile, setTempProfile] = useState(userProfile);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleToggleMenu = () => setShowMenu(prev => !prev);
    window.addEventListener('toggle-main-menu', handleToggleMenu);
    return () => window.removeEventListener('toggle-main-menu', handleToggleMenu);
  }, []);

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

  // Initialize DB and load chats on App Start
  useEffect(() => {
    const initDatabase = async () => {
      await dbService.init();

      // Load chats from SQLite
      const loadedChats = dbService.getChats();

      if (loadedChats.length > 0) {
        setChats(loadedChats);
      } else {
        // If no chats in DB, seed with initial mock data
        setChats(INITIAL_CHATS);
        INITIAL_CHATS.forEach(chat => {
          dbService.saveChat(chat);
          chat.messages.forEach(msg => dbService.saveMessage(chat.id, msg));
        });
      }
    };
    initDatabase();
  }, []);

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rbz_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rbz_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    localStorage.setItem('askus_lang', langCode);
  };

  const handleCreateChat = (title: string, primaryAgent: Agent, secondaryAgents: Agent[] = [], initialContext?: string) => {
    const messages: Message[] = [];

    // Create initial user message if context is provided
    if (initialContext) {
      messages.push({
        id: `msg_${Date.now()}`,
        sender: 'user',
        text: initialContext,
        timestamp: new Date(),
      });
    }

    const newChat: Chat = {
      id: `c_${Date.now()}`,
      agentId: primaryAgent.id,
      title: title,
      contactName: primaryAgent.name,
      avatar: primaryAgent.avatar,
      messages: messages,
      unreadCount: 0,
      lastActive: new Date(),
      isAgent: true,
      secondaryAgents: secondaryAgents,
      pendingActions: [],
      isIncognito: isIncognito // Mark chat as incognito if created in that mode
    };

    if (isIncognito) {
      setIncognitoChats([newChat, ...incognitoChats]);
      // DO NOT SAVE TO DB for Incognito
    } else {
      setChats([newChat, ...chats]);
      // Persist Chat and Initial Message
      dbService.saveChat(newChat);
      if (messages.length > 0) {
        dbService.saveMessage(newChat.id, messages[0]);
      }
    }

    setSelectedChatId(newChat.id);
  };

  const handleSelectChat = (chatId: string, options?: { startCall?: boolean }) => {
    if (isIncognito) {
      setIncognitoChats(prevChats => prevChats.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, unreadCount: 0 };
        }
        return chat;
      }));
    } else {
      setChats(prevChats => prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedChat = { ...chat, unreadCount: 0 };
          dbService.saveChat(updatedChat); // Persist unread count update
          return updatedChat;
        }
        return chat;
      }));
    }

    if (options?.startCall) {
      setAutoStartCall(true);
    }
    setSelectedChatId(chatId);
  };

  const handleChatAction = (chatId: string, action: 'pin' | 'archive' | 'unread' | 'read' | 'delete') => {
    // Helper to process actions
    const processAction = (list: Chat[], isPersistent: boolean): Chat[] => {
      if (action === 'delete') {
        if (isPersistent) dbService.deleteChat(chatId);
        if (selectedChatId === chatId) setSelectedChatId(null);
        return list.filter(chat => chat.id !== chatId);
      }
      return list.map(chat => {
        if (chat.id === chatId) {
          const updates: Partial<Chat> = {};
          if (action === 'pin') updates.isPinned = !chat.isPinned;
          if (action === 'archive') updates.isArchived = !chat.isArchived;
          if (action === 'unread') updates.unreadCount = chat.unreadCount > 0 ? 0 : 1;
          if (action === 'read') updates.unreadCount = 0;

          const updatedChat = { ...chat, ...updates };
          if (isPersistent) dbService.saveChat(updatedChat);
          return updatedChat;
        }
        return chat;
      });
    };

    if (isIncognito) {
      setIncognitoChats(prev => processAction(prev, false));
    } else {
      setChats(prev => processAction(prev, true));
    }
  };

  const handleUpdateChatTitle = (chatId: string, newTitle: string) => {
    const updateFn = (list: Chat[], isPersistent: boolean) => list.map(chat => {
      if (chat.id === chatId) {
        const updatedChat = { ...chat, title: newTitle };
        if (isPersistent) dbService.saveChat(updatedChat);
        return updatedChat;
      }
      return chat;
    });

    if (isIncognito) {
      setIncognitoChats(prev => updateFn(prev, false));
    } else {
      setChats(prev => updateFn(prev, true));
    }

    setTasks(prevTasks => prevTasks.map(task => {
      if (task.chatId === chatId) {
        return { ...task, chatTitle: newTitle };
      }
      return task;
    }));
  };

  const handleUpdateChat = (chatId: string, updates: Partial<Chat>) => {
    const updateFn = (list: Chat[], isPersistent: boolean) => list.map(chat => {
      if (chat.id === chatId) {
        const updatedChat = { ...chat, ...updates };
        if (isPersistent) dbService.saveChat(updatedChat);
        return updatedChat;
      }
      return chat;
    });

    if (isIncognito) {
      setIncognitoChats(prev => updateFn(prev, false));
    } else {
      setChats(prev => updateFn(prev, true));
    }
  };

  const handleAddMember = (chatId: string, newMember: Agent) => {
    const updateFn = (list: Chat[], isPersistent: boolean) => list.map(chat => {
      if (chat.id === chatId) {
        const currentSecondary = chat.secondaryAgents || [];
        if (currentSecondary.some(a => a.id === newMember.id)) return chat;

        const updatedChat = {
          ...chat,
          secondaryAgents: [...currentSecondary, newMember]
        };
        if (isPersistent) dbService.saveChat(updatedChat);

        const sysMsg: Message = {
          id: `msg_${Date.now()}`,
          sender: 'user',
          text: `Added ${newMember.name} (Contact) to the team.`,
          timestamp: new Date()
        };

        updatedChat.messages = [...updatedChat.messages, sysMsg];
        if (isPersistent) dbService.saveMessage(chatId, sysMsg);

        return updatedChat;
      }
      return chat;
    });

    if (isIncognito) {
      setIncognitoChats(prev => updateFn(prev, false));
    } else {
      setChats(prev => updateFn(prev, true));
    }
  };

  const handleCreateTask = (chatId: string, description: string) => {
    const targetList = isIncognito ? incognitoChats : chats;
    const chat = targetList.find(c => c.id === chatId);
    if (!chat) return;

    const taskId = `t_${Date.now().toString().slice(-4)}`;
    const billId = `b_${Date.now().toString().slice(-4)}`;

    const newTask: Task = {
      id: taskId,
      chatId: chatId,
      chatTitle: chat.title || chat.contactName,
      description: description,
      status: 'in_progress',
      timestamp: new Date()
    };
    setTasks([newTask, ...tasks]);

    const newBill: Bill = {
      id: billId,
      taskId: taskId,
      description: `Task: ${description}`,
      amount: '₹40',
      date: new Date(),
      status: 'pending'
    };
    setBills([newBill, ...bills]);
  };

  const handleSendMessage = (chatId: string, text: string, sender: 'user' | 'agent', isReport = false, image?: string, subAgentProfile?: any) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      sender,
      text,
      timestamp: new Date(),
      isReport,
      image,
      subAgentProfile
    };

    const updateFn = (list: Chat[]) => list.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastActive: new Date(),
          unreadCount: sender === 'agent' && chatId !== selectedChatId ? chat.unreadCount + 1 : 0
        };
      }
      return chat;
    }).sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());

    if (isIncognito) {
      setIncognitoChats(prev => updateFn(prev));
      // NO DB SAVE
    } else {
      setChats(prev => updateFn(prev));
      // Persist message to SQLite
      dbService.saveMessage(chatId, newMessage);
    }
  };

  const handleAddReport = (title: string) => {
    setTasks(prevTasks => {
      const latestInProgressIndex = prevTasks.findIndex(t => t.status === 'in_progress');
      if (latestInProgressIndex >= 0) {
        const newTasks = [...prevTasks];
        const completedTask = newTasks[latestInProgressIndex];
        newTasks[latestInProgressIndex] = {
          ...completedTask,
          status: 'completed',
          reportUrl: '#'
        };

        setBills(prevBills => prevBills.map(bill => {
          if (bill.taskId === completedTask.id) {
            return { ...bill, status: 'paid' };
          }
          return bill;
        }));

        return newTasks;
      }
      return prevTasks;
    });
  };

  const handleViewReport = (title: string) => {
    // Deprecated view report via tasks
  };

  const handleLogout = () => {
    setCurrentView('LOGIN');
    setIsIncognito(false);
    setIncognitoChats([]);
  };

  const renderContent = () => {
    const currentChatList = isIncognito ? incognitoChats : chats;

    // 1. Show Map if active
    if (viewingMap) {
      return <MapView onBack={() => setViewingMap(false)} />;
    }

    // 2. Show Gallery if active
    if (viewingGalleryChatId) {
      const chat = currentChatList.find(c => c.id === viewingGalleryChatId);
      if (chat) {
        return (
          <MediaGalleryView
            chat={chat}
            onBack={() => setViewingGalleryChatId(null)}
          />
        );
      }
    }

    // 3. Show Chat Details
    if (activeTab === Tab.CHATS && selectedChatId) {
      const chat = currentChatList.find(c => c.id === selectedChatId);
      if (!chat) {
        setSelectedChatId(null);
        return null;
      }
      return (
        <ChatDetailView
          chat={chat}
          onBack={() => setSelectedChatId(null)}
          onSendMessage={handleSendMessage}
          onAddReport={handleAddReport}
          onUpdateChatTitle={handleUpdateChatTitle}
          onUpdateChat={handleUpdateChat}
          onCreateTask={handleCreateTask}
          onViewReport={handleViewReport}
          onOpenGallery={() => setViewingGalleryChatId(chat.id)}
          onOpenMap={() => setViewingMap(true)}
          language={language}
          onAddMember={handleAddMember}
          autoStartCall={autoStartCall}
          onClearAutoStartCall={() => setAutoStartCall(false)}
        />
      );
    }

    // 4. Main Tabs
    switch (activeTab) {
      case Tab.CHATS:
        return (
          <ChatsView
            chats={currentChatList}
            isIncognito={isIncognito}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onToggleIncognito={() => setIsIncognito(!isIncognito)}
            onSelectChat={handleSelectChat}
            onCreateChat={handleCreateChat}
            onChatAction={handleChatAction}
            onOpenGallery={(id) => setViewingGalleryChatId(id)}
            onOpenMap={() => setViewingMap(true)}
            onAddMember={handleAddMember}
            onLogout={handleLogout}
            onOpenSettings={() => setActiveTab(Tab.SETTINGS)}
            onOpenWallet={() => setActiveTab(Tab.WALLET)}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        );
      case Tab.EVENTS:
        return <EventsView />;
      case Tab.EATS:
        return <EatsView />;
      case Tab.WALLET:
        return <WalletView />;
      case Tab.TRIBE_CIRCLES:
        return <TribeCirclesView onOpenMap={() => setViewingMap(true)} />;
      case Tab.SETTINGS:
        return <SettingsView onLogout={handleLogout} onBack={() => setActiveTab(Tab.CHATS)} />;
      default:
        return null;
    }
  };

  const renderApp = () => {
    const showBottomNav = !selectedChatId && !viewingGalleryChatId && !viewingMap && currentView === 'APP' && activeTab !== Tab.SETTINGS;

    switch (currentView) {
      case 'SPLASH':
        return <SplashScreen onFinish={() => setCurrentView('LOGIN')} />;
      case 'LOGIN':
        return (
          <LoginView
            onLogin={() => setCurrentView('APP')}
            onNavigateToRegister={() => setCurrentView('REGISTER')}
            onNavigateToForgot={() => setCurrentView('FORGOT_PASSWORD')}
          />
        );
      case 'REGISTER':
        return (
          <RegisterView
            onRegister={() => setCurrentView('APP')}
            onNavigateToLogin={() => setCurrentView('LOGIN')}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        );
      case 'FORGOT_PASSWORD':
        return (
          <ForgotPasswordView
            onNavigateToLogin={() => setCurrentView('LOGIN')}
          />
        );
      case 'APP':
        return (
          <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative shadow-xl overflow-hidden animate-in fade-in duration-500">
            {/* Main Content Area */}
            <div className={`flex-1 overflow-hidden relative flex flex-col ${isIncognito ? 'bg-gray-900' : 'bg-white dark:bg-gray-900'}`}>
              {renderContent()}

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute top-[70px] left-4 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-left flex flex-col">
                    <button onClick={() => { setShowMenu(false); handleOpenProfileModal(); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors">
                      <div className="relative flex-shrink-0">
                        <img src={userProfile.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-700" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{userProfile.name}</h4>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block">{userProfile.membership}</span>
                      </div>
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-4" />
                    <button onClick={() => { setShowMenu(false); setShowLanguageModal(true); }} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800">
                      <Globe size={18} />Language: {INDIAN_LANGUAGES.find(l => l.code === language)?.native || 'English'}
                    </button>
                    <button onClick={() => { setShowMenu(false); toggleDarkMode(); }} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800">
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button onClick={() => { setShowMenu(false); setShowApiKeyModal(true); }} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800">
                      <Key size={18} />API Key
                    </button>
                    <button onClick={() => { setShowMenu(false); setActiveTab(Tab.WALLET); }} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800">
                      <Wallet size={18} />Wallet
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-4" />
                    <button onClick={() => { setShowMenu(false); setActiveTab(Tab.CHATS); window.dispatchEvent(new Event('toggle-archive')); }} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800">
                      <Archive size={18} />Archive
                    </button>
                    <button onClick={() => { setShowMenu(false); setActiveTab(Tab.SETTINGS); }} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors dark:text-gray-200 dark:hover:bg-gray-800">
                      <Settings size={18} />Settings
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-4" />
                    <button onClick={() => { setShowMenu(false); handleLogout(); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors">
                      <LogOut size={18} />Logout
                    </button>
                  </div>
                </>
              )}

              {showLanguageModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <div className="flex items-center gap-2"><Globe size={20} className="text-gray-900 dark:text-white" /><h3 className="font-bold text-gray-900 dark:text-white">Select Language</h3></div>
                      <button onClick={() => setShowLanguageModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} className="text-gray-500 dark:text-gray-400" /></button>
                    </div>
                    <div className="overflow-y-auto p-2">
                      {INDIAN_LANGUAGES.map((lang) => (
                        <button key={lang.code} onClick={() => { handleLanguageChange(lang.code); setShowLanguageModal(false); }} className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${language === lang.code ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                          <div className="flex flex-col items-start"><span className="font-bold text-sm">{lang.native}</span><span className="text-xs opacity-70">{lang.name}</span></div>
                          {language === lang.code && <Check size={18} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* API Key Modal */}
              {showApiKeyModal && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-0 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2"><Key size={20} className="text-gray-900 dark:text-white" /><h3 className="font-bold text-gray-900 dark:text-white">API Key Configuration</h3></div>
                      <button onClick={() => setShowApiKeyModal(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} className="text-gray-500 dark:text-gray-400" /></button>
                    </div>
                    <div className="p-6">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Google Gemini API Key</label>
                      <input
                        type="password"
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm mb-4"
                        placeholder="AIzaSy..."
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Your key is stored locally in your browser and used to power the Chat Supervisor directly.</p>
                      <button
                        onClick={() => {
                          localStorage.setItem('gemini_api_key', tempApiKey.trim());
                          setShowApiKeyModal(false);
                        }}
                        className="w-full bg-primary hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-95"
                      >
                        Save API Key
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showProfileModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-0 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Edit Profile</h3>
                      <button onClick={() => setShowProfileModal(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} className="text-gray-500 dark:text-gray-400" /></button>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => profileImageInputRef.current?.click()}>
                          <img src={tempProfile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-800 group-hover:opacity-75 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={24} className="text-white drop-shadow-md" /></div>
                          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"><Edit2 size={12} /></div>
                        </div>
                        <input type="file" ref={profileImageInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        <span className="text-xs text-primary font-bold mt-2 cursor-pointer hover:underline" onClick={() => profileImageInputRef.current?.click()}>Change Photo</span>
                      </div>
                      <div className="space-y-4">
                        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name</label><input type="text" value={tempProfile.name} onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none" /></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Membership Type</label><input type="text" value={tempProfile.membership} onChange={(e) => setTempProfile({ ...tempProfile, membership: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-gray-800 transition-all outline-none" /></div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex gap-3">
                      <button onClick={() => setShowProfileModal(false)} className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                      <button onClick={handleSaveProfile} disabled={!tempProfile.name.trim()} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}

              {showBottomNav && (
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30 flex flex-col">
                  {/* Tribal Art Separator Line */}
                  <div className="w-full h-[5px] opacity-90 relative">
                    <svg width="100%" height="5" preserveAspectRatio="none" className="absolute top-0">
                      <defs>
                        <pattern id="tribal-line-bottom" x="0" y="0" width="32" height="5" patternUnits="userSpaceOnUse">
                          {/* Golden Yellow Background */}
                          <rect width="32" height="5" fill="#fcd34d" />
                          {/* Deep Red Zigzag */}
                          <path d="M0 5 L8 0 L16 5 L24 0 L32 5" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="miter" />
                          {/* Vibrant Orange Zigzag */}
                          <path d="M0 5 L4 2.5 L8 5 L12 2.5 L16 5 L20 2.5 L24 5 L28 2.5 L32 5" fill="none" stroke="#ea580c" strokeWidth="1" strokeLinejoin="miter" />
                          {/* Dark Brown Dots */}
                          <circle cx="8" cy="3.5" r="0.75" fill="#451a03" />
                          <circle cx="24" cy="3.5" r="0.75" fill="#451a03" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#tribal-line-bottom)" />
                    </svg>
                  </div>
                  <div className="flex justify-around items-center py-3 pb-6 w-full">
                    <button
                      onClick={() => setActiveTab(Tab.CHATS)}
                      className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.CHATS ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                    >
                      <TribeSanctumIcon size={28} active={activeTab === Tab.CHATS} className={activeTab === Tab.CHATS ? 'text-primary' : ''} />
                      <span className="text-[11px] font-black uppercase">SANCTUM</span>
                    </button>
                    <button
                      onClick={() => setActiveTab(Tab.EVENTS)}
                      className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.EVENTS ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                    >
                      <TribeLoungeIcon size={28} active={activeTab === Tab.EVENTS} className={activeTab === Tab.EVENTS ? 'text-primary' : ''} />
                      <span className="text-[11px] font-black uppercase">LOUNGE</span>
                    </button>
                    <button
                      onClick={() => setActiveTab(Tab.EATS)}
                      className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.EATS ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                    >
                      <TribeKitchenIcon size={28} active={activeTab === Tab.EATS} className={activeTab === Tab.EATS ? 'text-primary' : ''} />
                      <span className="text-[11px] font-black uppercase">KITCHEN</span>
                    </button>
                    <button
                      onClick={() => setActiveTab(Tab.TRIBE_CIRCLES)}
                      className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.TRIBE_CIRCLES ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                    >
                      <TribeCirclesIcon size={28} active={activeTab === Tab.TRIBE_CIRCLES} className={activeTab === Tab.TRIBE_CIRCLES ? 'text-primary' : ''} />
                      <span className="text-[11px] font-black uppercase">TRIBES</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <SplashScreen onFinish={() => setCurrentView('LOGIN')} />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="w-full max-w-[480px] bg-white dark:bg-gray-900 h-[100dvh] flex flex-col relative shadow-xl overflow-hidden">
        {renderApp()}
      </div>
    </div>
  );
};

export default App;