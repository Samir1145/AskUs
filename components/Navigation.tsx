import React from 'react';
import { Tab } from '../types';
import { MessageCircle, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const getIcon = (tab: Tab) => {
    switch (tab) {
      case Tab.CHATS: return <MessageCircle size={24} />;
      case Tab.SETTINGS: return <Settings size={24} />;
    }
  };

  const tabs = [Tab.CHATS, Tab.SETTINGS];

  return (
    <nav className="border-t border-gray-100 bg-white pb-safe pt-2">
      <div className="flex justify-around items-end h-16 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex flex-col items-center gap-1 w-full transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`relative ${isActive ? 'translate-y-[-2px]' : ''} transition-transform`}>
                {getIcon(tab)}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                {tab}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;