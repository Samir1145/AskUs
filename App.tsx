import React, { useState, useEffect } from 'react';
import { Tab, Chat, Agent, Task, Message, Bill } from './types';
import ChatsView from './views/ChatsView';
import ChatDetailView from './views/ChatDetailView';
import SettingsView from './views/SettingsView';
import MediaGalleryView from './views/MediaGalleryView'; 
import MapView from './views/MapView'; 
import EventsView from './views/EventsView';
import EatsView from './views/EatsView';
import WalletView from './views/WalletView';
import { dbService } from './services/db'; 
import { EXPERT_AGENTS_DATA, INDIAN_LANGUAGES } from './constants';
import { MessageCircle, Calendar, Utensils, Wallet } from 'lucide-react';

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
               
               {showBottomNav && (
                   <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-3 pb-6 z-30">
                       <button 
                           onClick={() => setActiveTab(Tab.CHATS)} 
                           className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.CHATS ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                       >
                           <MessageCircle size={24} strokeWidth={activeTab === Tab.CHATS ? 2.5 : 2} />
                           <span className="text-[10px] font-bold">Chats</span>
                       </button>
                       <button 
                           onClick={() => setActiveTab(Tab.EVENTS)} 
                           className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.EVENTS ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                       >
                           <Calendar size={24} strokeWidth={activeTab === Tab.EVENTS ? 2.5 : 2} />
                           <span className="text-[10px] font-bold">Events</span>
                       </button>
                       <button 
                           onClick={() => setActiveTab(Tab.EATS)} 
                           className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.EATS ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                       >
                           <Utensils size={24} strokeWidth={activeTab === Tab.EATS ? 2.5 : 2} />
                           <span className="text-[10px] font-bold">Eats</span>
                       </button>
                       <button 
                           onClick={() => setActiveTab(Tab.WALLET)} 
                           className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.WALLET ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                       >
                           <Wallet size={24} strokeWidth={activeTab === Tab.WALLET ? 2.5 : 2} />
                           <span className="text-[10px] font-bold">Wallet</span>
                       </button>
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