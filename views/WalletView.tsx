import React from 'react';
import { ChevronRight, Gift, CreditCard } from 'lucide-react';
import Header from '../components/Header';

const WalletView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto pb-24">
      {/* Common Header */}
      <Header 
        placeholder="Search events or groups..." 
        newChatLabel="Wallet"
        onNewChat={() => console.log("New Wallet clicked")}
        onMenuClick={() => console.log("Menu clicked")}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Main Balance Card */}
        <div className="bg-[#9ACDFF] dark:bg-blue-900 rounded-[32px] p-6 relative overflow-hidden min-h-[200px]">
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-700 dark:text-blue-100 mb-1">Main Balance</p>
            <h2 className="text-5xl font-bold text-black dark:text-white mb-4">₹0</h2>
            <p className="text-xs text-gray-600 dark:text-blue-200 max-w-[60%] leading-relaxed">
              Third wave main balance can be used for all your orders across categories
            </p>
          </div>
          
          {/* Wallet Illustration */}
          <div className="absolute top-8 right-4 w-32 h-32">
             {/* Purple Card */}
             <div className="absolute top-0 right-2 w-20 h-14 bg-[#E0B0FF] rounded-lg transform -rotate-12 border-2 border-white/30 flex flex-col justify-end p-2 shadow-sm z-0">
                <div className="w-full h-2 bg-white/40 rounded-full mb-1"></div>
             </div>
             {/* Blue Wallet */}
             <div className="absolute top-6 right-6 w-24 h-20 bg-[#2563EB] rounded-xl shadow-lg z-10 flex items-center relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-sm"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl"></div>
             </div>
          </div>
        </div>

        {/* Promo Balance Card */}
        <div className="bg-[#A7F3D0] dark:bg-teal-900 rounded-[32px] p-6 relative overflow-hidden min-h-[200px]">
          <div className="relative z-10">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-teal-100 mb-1">
              Promo Balance <ChevronRight size={16} />
            </button>
            <h2 className="text-5xl font-bold text-black dark:text-white mb-4">₹0</h2>
            <p className="text-xs text-gray-600 dark:text-teal-200 max-w-[60%] leading-relaxed">
              Redeem & save 20% across all categories – before it expires!
            </p>
          </div>
          
          {/* Gift Illustration */}
          <div className="absolute top-10 right-6">
             <div className="relative">
                <Gift size={80} className="text-[#60A5FA] fill-[#93C5FD] drop-shadow-md" strokeWidth={1} />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FDE047] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-yellow-700 font-bold text-lg">₹</span>
                </div>
             </div>
          </div>
        </div>

        {/* Transactions Header */}
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transactions</h3>
        </div>
      </div>

      {/* Add Balance Button */}
      <div className="px-4 mt-auto mb-6">
        <button className="w-full bg-[#1F2937] dark:bg-gray-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all">
            Add Balance
        </button>
      </div>
    </div>
  );
};

export default WalletView;
