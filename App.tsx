import React, { useState, useEffect, useRef } from 'react';
import { Tab, Chat, Agent, Task, Message, Bill } from './types';
import ChatsView from './views/ChatsView';
import ChatDetailView from './views/ChatDetailView';
import MediaGalleryView from './views/MediaGalleryView';
import MapView from './views/MapView';
import EventsView from './views/EventsView';
import EventDetailView from './views/EventDetailView';
import MenusView from './views/MenusView';
import MenuDetailView from './views/MenuDetailView';
import GroupsView from './views/GroupsView';
import GroupDetailView from './views/GroupDetailView';
import DashboardView from './views/DashboardView';
import { RSVPProvider } from './contexts/RSVPContext';
import { JoinedGroupsProvider } from './contexts/JoinedGroupsContext';
import { dbService } from './services/db';
import { seedIfEmpty } from './services/firebaseData';
import { EXPERT_AGENTS_DATA, INDIAN_LANGUAGES } from './constants';
import { TribeSanctumIcon, TribeLoungeIcon, TribeKitchenIcon, TribeCirclesIcon } from './components/TribeIcons';
import { Headset, Armchair, Coffee, Users, Globe, Sun, Moon, Archive, LogOut, X, Camera, Edit2, Check, Key, Home, Mic, ChevronLeft } from 'lucide-react';


// Auth Views
import SplashScreen from './views/SplashScreen';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import ForgotPasswordView from './views/ForgotPasswordView';
import FranchiseView from './views/FranchiseView';

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

type AppView = 'SPLASH' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'APP' | 'FRANCHISE';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('SPLASH');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);

  // When navigating tabs normally
  const navigateToTab = (tab: Tab) => {
    setActiveTab(tab);
  };

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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  const handleGlobalBack = () => {
    if (selectedEventId) { setSelectedEventId(null); return; }
    if (selectedGroupId) { setSelectedGroupId(null); return; }
    if (selectedMenuId) { setSelectedMenuId(null); return; }
    if (selectedChatId) { setSelectedChatId(null); return; }
  };

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
    const handleNavigateFranchise = () => setCurrentView('FRANCHISE');

    window.addEventListener('toggle-main-menu', handleToggleMenu);
    window.addEventListener('navigate-franchise', handleNavigateFranchise);

    return () => {
      window.removeEventListener('toggle-main-menu', handleToggleMenu);
      window.removeEventListener('navigate-franchise', handleNavigateFranchise);
    };
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

      // Seed Firebase collections if they are empty
      seedIfEmpty().catch(err => console.warn('Firebase seed skipped:', err));
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
      case Tab.DASHBOARD:
        return (
          <DashboardView
            onNavigate={(section) => {
              switch (section) {
                case 'chats': navigateToTab(Tab.CHATS); break;
                case 'menus': navigateToTab(Tab.EATS); break;
                case 'groups': navigateToTab(Tab.TRIBE_CIRCLES); break;
                case 'events': navigateToTab(Tab.EVENTS); break;
              }
            }}
          />
        );
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
            language={language}
            onLanguageChange={handleLanguageChange}
            userProfile={userProfile}
          />
        );
      case Tab.EVENTS:
        if (selectedEventId) {
          // Import this from EventsView or move to constants
          const MOCK_EVENTS = [
            {
              id: '1',
              title: 'Holi Fest Tricity Most Premium Holi Celebration',
              date: 'Wed 4 Mar 2026',
              time: '11:00 AM',
              type: 'In-person' as const,
              organizer: 'Taco Tribe',
              rating: 4.8,
              attendees: 79,
              imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200',
              category: 'Holi Parties'
            },
            {
              id: '2',
              title: 'Build Autonomous AI Workers with Python & LangChain (Cohort)',
              date: 'SAT, 28 FEB',
              time: '7:00 PM IST',
              type: 'Online' as const,
              organizer: 'NonceLabs',
              rating: 4.8,
              attendees: 850,
              imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
              category: 'Tech'
            },
            {
              id: '3',
              title: 'Weekend Photography Walk: Capturing Urban Life',
              date: 'SAT, 28 FEB',
              time: '10:00 AM IST',
              type: 'In-person' as const,
              organizer: 'City Snappers Group',
              rating: 4.6,
              attendees: 42,
              imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
              category: 'Hobbies'
            },
            {
              id: '4',
              title: 'Startup Networking Mixer',
              date: 'FRI, 27 FEB',
              time: '6:00 PM IST',
              type: 'In-person' as const,
              organizer: 'Tech Founders Club',
              rating: 4.5,
              attendees: 120,
              imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
              category: 'Social Events'
            }
          ];
          const event = MOCK_EVENTS.find(e => e.id === selectedEventId);
          if (event) {
            return <EventDetailView event={event} onBack={() => setSelectedEventId(null)} />;
          }
        }
        return (
          <EventsView
            onSelectEvent={(id) => setSelectedEventId(id)}
            userProfile={userProfile}
          />
        );
      case Tab.EATS:
        if (selectedMenuId) {
          const ALL_ITEMS = [
            { id: 's1', title: 'Creamy Mayo Egg Sandwich', description: 'Whole wheat bread, boiled egg mix with mustard mayo', price: 150, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800' },
            { id: 's2', title: 'Pesto, Mozzarella Sandwich', description: 'Ciabatta, fresh mozzarella, inhouse basil pesto roasted bell pepper, rocket leaf', price: 220, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800' },
            { id: 's3', title: 'Original Ham & Cheese Sandwich', description: 'Multigrain bread, cured chicken ham, cheese and lettuce', price: 250, image: 'https://images.unsplash.com/photo-1554522434-c088febe4dc4?auto=format&fit=crop&w=800' },
            { id: 's4', title: 'Grilled Chicken Sandwich', description: 'Multigrain bread, marinated grilled chicken, cheese spread, barbeque sauce', price: 230, image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800' },
            { id: 's5', title: 'Chicken Sausage & Cheese Crossiant Sandwich', description: 'Chicken sausage, croissant, cheese, tomato, lettuce', price: 260, image: 'https://images.unsplash.com/photo-1626078722880-9286d5e0a6d5?auto=format&fit=crop&w=800' },
            { id: 'w1', title: 'BBQ CHICKEN BURRITO', description: 'Tender chicken in rich BBQ sauce wrapped in a tortilla', price: 230, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800' },
            { id: 'w2', title: 'BBQ PANEER BURRITO', description: 'Paneer cubes in rich BBQ sauce wrapped in a tortilla', price: 210, image: 'https://images.unsplash.com/photo-1574044199105-0aa3df7ca878?auto=format&fit=crop&w=800' },
            { id: 'b1', title: 'BBQ CHICKEN BOWL', description: 'Tender chicken in rich BBQ sauce with rice', price: 280, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800' },
            { id: 'bev1', title: 'Classic Cold Coffee', description: 'Rich and creamy cold coffee', price: 150, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800' }
          ];
          const item = ALL_ITEMS.find(i => i.id === selectedMenuId);
          if (item) {
            return <MenuDetailView item={item} onBack={() => setSelectedMenuId(null)} />;
          }
        }
        return (
          <MenusView
            onSelectItem={(id) => setSelectedMenuId(id)}
            userProfile={userProfile}
          />
        );

      case Tab.TRIBE_CIRCLES:
        if (selectedGroupId) {
          const CIRCLES = [
            { id: '1', name: 'Weekend Hikers', category: 'Fitness', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1200', likes: 142 },
            { id: '2', name: 'Startup Founders', category: 'Tech', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200', likes: 385 },
            { id: '3', name: 'Local Bookworms', category: 'Arts', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200', likes: 89 },
            { id: '4', name: 'Yoga & Mindfulness', category: 'Fitness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200', likes: 215 },
            { id: '5', name: 'Foodie Adventurers', category: 'Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200', likes: 120 }
          ];
          const group = CIRCLES.find(c => c.id === selectedGroupId);
          if (group) {
            return <GroupDetailView group={group} onBack={() => setSelectedGroupId(null)} />;
          }
        }
        return (
          <GroupsView
            onOpenMap={() => setViewingMap(true)}
            onSelectGroup={(id) => setSelectedGroupId(id)}
            userProfile={userProfile}
          />
        );
      case Tab.EATS:
        if (selectedMenuId) {
          const ALL_ITEMS = [
            { id: 's1', title: 'Creamy Mayo Egg Sandwich', description: 'Whole wheat bread, boiled egg mix with mustard mayo', price: 150, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800' },
            { id: 's2', title: 'Pesto, Mozzarella Sandwich', description: 'Ciabatta, fresh mozzarella, inhouse basil pesto roasted bell pepper, rocket leaf', price: 220, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800' },
            { id: 's3', title: 'Original Ham & Cheese Sandwich', description: 'Multigrain bread, cured chicken ham, cheese and lettuce', price: 250, image: 'https://images.unsplash.com/photo-1554522434-c088febe4dc4?auto=format&fit=crop&w=800' },
            { id: 's4', title: 'Grilled Chicken Sandwich', description: 'Multigrain bread, marinated grilled chicken, cheese spread, barbeque sauce', price: 230, image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=800' },
            { id: 's5', title: 'Chicken Sausage & Cheese Crossiant Sandwich', description: 'Chicken sausage, croissant, cheese, tomato, lettuce', price: 260, image: 'https://images.unsplash.com/photo-1626078722880-9286d5e0a6d5?auto=format&fit=crop&w=800' },
            { id: 'w1', title: 'BBQ CHICKEN BURRITO', description: 'Tender chicken in rich BBQ sauce wrapped in a tortilla', price: 230, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800' },
            { id: 'w2', title: 'BBQ PANEER BURRITO', description: 'Paneer cubes in rich BBQ sauce wrapped in a tortilla', price: 210, image: 'https://images.unsplash.com/photo-1574044199105-0aa3df7ca878?auto=format&fit=crop&w=800' },
            { id: 'b1', title: 'BBQ CHICKEN BOWL', description: 'Tender chicken in rich BBQ sauce with rice', price: 280, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800' },
            { id: 'bev1', title: 'Classic Cold Coffee', description: 'Rich and creamy cold coffee', price: 150, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800' }
          ];
          const item = ALL_ITEMS.find(i => i.id === selectedMenuId);
          if (item) {
            return <MenuDetailView item={item} onBack={() => setSelectedMenuId(null)} />;
          }
        }
        return (
          <MenusView
            onSelectItem={(id) => setSelectedMenuId(id)}
            userProfile={userProfile}
          />
        );

      case Tab.TRIBE_CIRCLES:
        if (selectedGroupId) {
          const CIRCLES = [
            { id: '1', name: 'Weekend Hikers', category: 'Fitness', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1200', likes: 142 },
            { id: '2', name: 'Startup Founders', category: 'Tech', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200', likes: 385 },
            { id: '3', name: 'Local Bookworms', category: 'Arts', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200', likes: 89 },
            { id: '4', name: 'Yoga & Mindfulness', category: 'Fitness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200', likes: 215 },
            { id: '5', name: 'Foodie Adventurers', category: 'Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200', likes: 120 }
          ];
          const group = CIRCLES.find(c => c.id === selectedGroupId);
          if (group) {
            return <GroupDetailView group={group} onBack={() => setSelectedGroupId(null)} />;
          }
        }
        return (
          <GroupsView
            onOpenMap={() => setViewingMap(true)}
            onSelectGroup={(id) => setSelectedGroupId(id)}
            userProfile={userProfile}
          />
        );

      default:
        return null;
    }
  };

  const renderApp = () => {
    const showBottomNav = !viewingGalleryChatId && !viewingMap && currentView === 'APP';

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
      case 'FRANCHISE':
        return (
          <FranchiseView onBack={() => setCurrentView('APP')} />
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
                  <div className="absolute top-[70px] right-4 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col">
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


                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-4" />
                    <button onClick={() => { setShowMenu(false); handleLogout(); }} className="w-full text-left px-4 py-3 text-sm font-bold text-danger hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors">
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

                  {/* Default 4-icon nav (Dashboard tab) */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      paddingTop: '12px',
                      paddingBottom: '24px',
                      opacity: activeTab === Tab.DASHBOARD ? 1 : 0,
                      transform: activeTab === Tab.DASHBOARD ? 'translateY(0)' : 'translateY(16px)',
                      pointerEvents: activeTab === Tab.DASHBOARD ? 'auto' : 'none',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                    }}
                  >
                    <button
                      onClick={() => navigateToTab(Tab.CHATS)}
                      className="flex flex-col items-center gap-1 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <TribeSanctumIcon size={28} active={false} />
                      <span className="text-[11px] font-black uppercase">CHATS</span>
                    </button>
                    <button
                      onClick={() => navigateToTab(Tab.EATS)}
                      className="flex flex-col items-center gap-1 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <TribeKitchenIcon size={28} active={false} />
                      <span className="text-[11px] font-black uppercase">MENUS</span>
                    </button>
                    <button
                      onClick={() => navigateToTab(Tab.TRIBE_CIRCLES)}
                      className="flex flex-col items-center gap-1 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <TribeCirclesIcon size={28} active={false} />
                      <span className="text-[11px] font-black uppercase">GROUPS</span>
                    </button>
                    <button
                      onClick={() => navigateToTab(Tab.EVENTS)}
                      className="flex flex-col items-center gap-1 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <TribeLoungeIcon size={28} active={false} />
                      <span className="text-[11px] font-black uppercase">EVENTS</span>
                    </button>
                  </div>

                  {/* Compact nav: Home + "I want to..." + Sparkle (non-Dashboard tabs) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      paddingTop: '12px',
                      paddingBottom: '24px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      opacity: activeTab !== Tab.DASHBOARD ? 1 : 0,
                      transform: activeTab !== Tab.DASHBOARD ? 'translateY(0)' : 'translateY(16px)',
                      pointerEvents: activeTab !== Tab.DASHBOARD ? 'auto' : 'none',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                    }}
                  >
                    {/* Global Back Button (before the home icon) */}
                    {(selectedEventId || selectedGroupId || selectedMenuId || selectedChatId) && (
                      <button
                        onClick={handleGlobalBack}
                        className="flex-shrink-0 p-1 mr-1 transition-transform active:scale-90"
                        aria-label="Go Back"
                      >
                        <ChevronLeft size={28} className="text-[#6B21A8]" strokeWidth={2} />
                      </button>
                    )}

                    {/* Home Icon (hidden on detail pages) */}
                    {!(selectedEventId || selectedGroupId || selectedMenuId || selectedChatId) && (
                      <button
                        onClick={() => navigateToTab(Tab.DASHBOARD)}
                        className="flex-shrink-0 p-1 transition-transform active:scale-90"
                        aria-label="Go Home"
                      >
                        <Home size={26} className="text-[#6B21A8]" strokeWidth={2} />
                      </button>
                    )}

                    {/* "I want to..." pill */}
                    <div
                      className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-5 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      style={{ minHeight: '46px' }}
                    >
                      <span className="text-gray-400 dark:text-gray-500 text-[13px] font-medium select-none">I would like to suggest that...</span>
                    </div>

                    {/* Mic Icon */}
                    <button
                      className="flex-shrink-0 p-1 transition-transform active:scale-90"
                      aria-label="Voice Input"
                    >
                      <Mic size={24} className="text-[#6B21A8]" strokeWidth={2} />
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
    <RSVPProvider>
      <JoinedGroupsProvider>
        <div className="flex justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
          <div className="w-full max-w-[480px] bg-white dark:bg-gray-900 h-[100dvh] flex flex-col relative shadow-xl overflow-hidden">
            {renderApp()}
          </div>
        </div>
      </JoinedGroupsProvider>
    </RSVPProvider>
  );
};

export default App;