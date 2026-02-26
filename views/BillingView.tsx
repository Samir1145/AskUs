import React, { useState } from 'react';
import { Bill } from '../types';
import { Search, Receipt, CreditCard } from 'lucide-react';

interface BillingViewProps {
  bills: Bill[];
  onLogout: () => void;
}

const BillingView: React.FC<BillingViewProps> = ({ bills }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBills = bills.filter(bill => 
    bill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.amount.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Billing</h1>
        </div>
        <div className="pb-2">
          <div className="flex w-full items-center rounded-xl bg-gray-100 px-4 h-11">
             <Search className="text-gray-400 mr-2" size={20} />
             <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 w-full text-sm text-gray-900 placeholder-gray-400"
              placeholder="Search invoices..."
             />
          </div>
        </div>
      </header>

      {/* List */}
      <main className="flex-1 overflow-y-auto pb-24">
        {filteredBills.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                <Receipt size={48} className="mb-4 text-gray-200" />
                <p>{searchQuery ? `No invoices found matching "${searchQuery}"` : "No billing history yet."}</p>
             </div>
        ) : (
            <div className="space-y-1">
            {filteredBills.map(bill => (
                <div key={bill.id} className="flex items-start gap-4 bg-white py-4 px-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className={`flex items-center justify-center rounded-xl shrink-0 w-12 h-12 ${bill.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      <CreditCard size={20} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-900 text-base font-bold leading-tight truncate pr-2">{bill.description}</p>
                        <p className="text-gray-900 text-base font-bold">{bill.amount}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {bill.status}
                        </span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-gray-500 text-xs">
                          {bill.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                        <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                           ID: {bill.id}
                        </span>
                        {bill.taskId && (
                           <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                             Task: {bill.taskId}
                           </span>
                        )}
                      </div>
                  </div>
                </div>
            ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default BillingView;