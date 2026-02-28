import React from 'react';
import { Search, MessageSquarePlus, ArrowLeft } from 'lucide-react';

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
            <button onClick={() => window.dispatchEvent(new Event('toggle-main-menu'))} className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg">
              <img
                src="/taco-tribe-logo.png"
                alt="Taco Tribe Logo - Tap for Menu"
                className="h-[60px] w-auto object-contain cursor-pointer transition-transform hover:scale-105"
              />
            </button>
          )}
        </div>

        {title && (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className={`flex items-center justify-center text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${newChatLabel ? 'px-3 py-2 gap-2 w-auto' : 'w-10 h-10'}`}
          >
            {newChatLabel && <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{newChatLabel}</span>}
            {newChatIcon || <MessageSquarePlus size={20} />}
          </button>
        </div>
      </div>

      {/* Tribal Art Separator Line */}
      <div className="w-full h-[5px] -mx-4 opacity-90 relative" style={{ width: 'calc(100% + 2rem)' }}>
        <svg width="100%" height="5" preserveAspectRatio="none" className="absolute bottom-0">
          <defs>
            <pattern id="tribal-line" x="0" y="0" width="32" height="5" patternUnits="userSpaceOnUse">
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
          <rect width="100%" height="100%" fill="url(#tribal-line)" />
        </svg>
      </div>
    </div>
  );
};

export default Header;
