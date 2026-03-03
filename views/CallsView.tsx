import React, { useState } from 'react';
import { Call } from '../types';
import { Search, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Info } from 'lucide-react';

interface CallsViewProps {
  calls: Call[];
  onLogout: () => void;
}

const CallsView: React.FC<CallsViewProps> = ({ calls }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalls = calls.filter(call => 
    call.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 pt-6 pb-4 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Calls</h1>
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900 placeholder-gray-400" 
            placeholder="Search calls..." 
          />
        </div>
      </header>

      {/* List */}
      <main className="flex-1 overflow-y-auto pb-4">
        {filteredCalls.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>{searchQuery ? `No calls found matching "${searchQuery}"` : "No call history"}</p>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div key={call.id} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors">
              <div className="relative">
                {call.avatar ? (
                  <img src={call.avatar} alt={call.contactName} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border-2 border-red-100">
                    <span className="text-gray-400 font-bold text-lg">?</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-1 flex-col justify-center">
                <p className={`text-base font-bold leading-none mb-1 ${call.type === 'missed' ? 'text-danger' : 'text-gray-900'}`}>{call.contactName}</p>
                <div className="flex items-center gap-1.5">
                  {call.type === 'incoming' && <PhoneIncoming size={14} className="text-primary" />}
                  {call.type === 'outgoing' && <PhoneOutgoing size={14} className="text-green-500" />}
                  {call.type === 'missed' && <PhoneMissed size={14} className="text-danger" />}
                  <p className="text-sm font-medium text-gray-500">
                    {call.type.charAt(0).toUpperCase() + call.type.slice(1)} • {
                        // Simple relative time mock
                        Math.floor((Date.now() - call.timestamp.getTime()) / 60000) < 60 
                        ? `${Math.floor((Date.now() - call.timestamp.getTime()) / 60000)} min ago`
                        : 'Yesterday'
                    }
                  </p>
                </div>
              </div>
              
              <div className="shrink-0 flex gap-3">
                {call.type === 'missed' ? (
                  <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                    <Info size={24} />
                  </button>
                ) : (
                  <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                    <Phone size={24} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default CallsView;