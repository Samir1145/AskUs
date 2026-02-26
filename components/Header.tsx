import React from 'react';
import { Menu, Search, MessageSquarePlus, ArrowLeft } from 'lucide-react';

interface UserProfile {
  name: string;
  avatar: string;
  membership: string;
}

interface HeaderProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  title?: string;
  onMenuClick?: () => void;
  onNewChat?: () => void;
  newChatLabel?: string;
  className?: string;
  userProfile?: UserProfile;
  onProfileClick?: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  placeholder = "Search...", 
  title, 
  onMenuClick, 
  onNewChat, 
  newChatLabel,
  className,
  userProfile = {
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    membership: "Pro Member"
  },
  onProfileClick,
  showBack,
  onBack
}) => {
  return (
    <div className={`px-4 pt-4 pb-2 bg-white dark:bg-gray-900 sticky top-0 z-20 ${className || ''}`}>
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button 
              onClick={onBack}
              className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={28} strokeWidth={2.5} />
            </button>
          ) : (
            <button 
              onClick={onMenuClick}
              className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Menu size={28} strokeWidth={2.5} />
            </button>
          )}
          
          {!showBack && (
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={onProfileClick}
            >
              <div className="relative">
                  <img
                      src={userProfile.avatar}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{userProfile.name}</h3>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block">
                      {userProfile.membership}
                  </span>
              </div>
            </div>
          )}
        </div>

        {title && (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
                {title}
            </h1>
        )}

        <button 
            onClick={onNewChat}
            className={`flex items-center justify-center text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${newChatLabel ? 'px-3 py-2 gap-2 w-auto' : 'w-10 h-10'}`}
        >
            {newChatLabel && <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{newChatLabel}</span>}
            <MessageSquarePlus size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
        />
      </div>
    </div>
  );
};

export default Header;
