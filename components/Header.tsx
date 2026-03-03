import React from 'react';
import { Search, MoreVertical, ArrowLeft, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  onNewChat?: () => void;
  newChatLabel?: string;
  newChatIcon?: React.ReactNode;
  className?: string;
  showBack?: boolean;
  onBack?: () => void;
}



const Header: React.FC<HeaderProps> = ({
  title,
  onMenuClick,
  onNewChat,
  newChatLabel,
  newChatIcon,
  className,
  showBack,
  onBack
}) => {
  return (
    <div className={`px-4 pt-6 bg-white dark:bg-gray-900 sticky top-0 z-20 shadow-sm overflow-hidden ${className || ''}`}>
      {/* Top Row */}
      <div className="flex items-center justify-between relative pb-3">
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
              onClick={() => window.dispatchEvent(new Event('navigate-franchise'))}
              className="flex items-center h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg group"
            >
              <img
                src="/taco-tribe-logo.png"
                alt="Taco Tribe Logo - Tap for Franchise Info"
                className="h-full w-auto object-contain cursor-pointer transition-transform group-hover:scale-105"
              />
            </button>
          )}
        </div>

        {title && (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-0">
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-main-menu'))}
            className="flex items-center justify-center transition-colors w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#6B21A8] dark:text-[#6B21A8]"
            aria-label="Open Settings"
          >
            <Settings size={24} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => window.dispatchEvent(new Event('open-notifications'))}
            className="flex items-center justify-center transition-colors w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#6B21A8] dark:text-[#6B21A8]"
            aria-label="Notifications"
          >
            <Bell size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Tribal Art Separator Line */}
      <div className="w-full h-[5px] -mx-4 opacity-90 relative" style={{ width: 'calc(100% + 2rem)' }}>
        <svg width="100%" height="5" preserveAspectRatio="none" className="absolute bottom-0">
          <defs>
            <pattern id="tribal-line" x="0" y="0" width="32" height="5" patternUnits="userSpaceOnUse">
              {/* Brand Yellow Background */}
              <rect width="32" height="5" fill="#EAB308" />
              {/* Brand Red Zigzag */}
              <path d="M0 5 L8 0 L16 5 L24 0 L32 5" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinejoin="miter" />
              {/* Brand Orange Zigzag */}
              <path d="M0 5 L4 2.5 L8 5 L12 2.5 L16 5 L20 2.5 L24 5 L28 2.5 L32 5" fill="none" stroke="#EA580C" strokeWidth="1" strokeLinejoin="miter" />
              {/* Brand Purple Dots */}
              <circle cx="8" cy="3.5" r="0.75" fill="#6B21A8" />
              <circle cx="24" cy="3.5" r="0.75" fill="#6B21A8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tribal-line)" />
        </svg>
      </div>
    </div>
  );
};

export default Header;
