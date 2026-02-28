import React from 'react';
import { Tab } from '../types';
import { Headset, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const getIcon = (tab: Tab) => {
    switch (tab) {
      case Tab.CHATS: return <Headset size={24} />;
      case Tab.SETTINGS: return <Settings size={24} />;
    }
  };

  const tabs = [Tab.CHATS, Tab.SETTINGS];

  return (
    <nav className="bg-white dark:bg-gray-900 pb-safe pt-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-20">
      {/* Tribal Art Separator Line */}
      <div className="w-full h-[5px] opacity-90 relative">
        <svg width="100%" height="5" preserveAspectRatio="none" className="absolute top-0">
          <defs>
            <pattern id="tribal-line-nav" x="0" y="0" width="32" height="5" patternUnits="userSpaceOnUse">
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
          <rect width="100%" height="100%" fill="url(#tribal-line-nav)" />
        </svg>
      </div>

      <div className="flex justify-around items-end h-16 pb-2 pt-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex flex-col items-center gap-1 w-full transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
                }`}
            >
              <div className={`relative ${isActive ? 'translate-y-[-2px]' : ''} transition-transform`}>
                {getIcon(tab)}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
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