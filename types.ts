

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  isVoice?: boolean;
  voiceDuration?: string;
  isReport?: boolean;
  image?: string;
  subAgentProfile?: { name: string, avatar: string, role?: string }; // For separate agent replies
}

export interface Chat {
  id: string;
  agentId: string;
  title: string;
  contactName: string;
  avatar: string;
  messages: Message[];
  unreadCount: number;
  lastActive: Date;
  isAgent: boolean;
  secondaryAgents?: Agent[];
  isPinned?: boolean;
  isArchived?: boolean;
  pendingActions?: string[]; // Dynamic tasks identified by Supervisor
  isIncognito?: boolean; // Ephemeral chat flag
  disappearingDuration?: number; // In seconds. 0 or undefined means off.
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  isVerified?: boolean;
  sampleUseCase?: string;
}

export interface Bill {
  id: string;
  taskId?: string; // Optional for subscriptions
  description: string;
  amount: string;
  date: Date;
  status: 'paid' | 'pending';
}

export interface Task {
  id: string;
  chatId: string;
  chatTitle: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp: Date;
  reportUrl?: string;
}

export interface Report {
  id: string;
  title: string;
  date: Date;
  size: string;
}

export interface MemoryWiki {
  id: string;
  agentId: string;
  title: string;
  tags: string[];
  summary: string;
  htmlContent: string; // The full "file" content
  timestamp: Date;
}

export interface Call {
  id: string;
  contactName: string;
  avatar?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: Date;
}

export enum Tab {
  CHATS = 'Tribe Sanctum',
  EVENTS = 'Tribe Lounge',
  EATS = 'Tribe Kitchen',
  WALLET = 'Wallet',
  TRIBE_CIRCLES = 'Tribe Circles',
  SETTINGS = 'Settings'
}