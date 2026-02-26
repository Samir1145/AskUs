import React, { useState } from 'react';
import { Report } from '../types';
import { Search, FileText, Download } from 'lucide-react';

interface ReportsViewProps {
  reports: Report[];
  onLogout: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ reports }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-gray-900 text-3xl font-bold tracking-tight">Reports</h1>
        </div>
        <div className="pb-2">
          <div className="flex w-full items-center rounded-xl bg-gray-100 px-4 h-11">
             <Search className="text-gray-400 mr-2" size={20} />
             <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 w-full text-sm text-gray-900 placeholder-gray-400"
              placeholder="Search reports..."
             />
          </div>
        </div>
      </header>

      {/* List */}
      <main className="flex-1 overflow-y-auto pb-24">
        {filteredReports.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                <FileText size={48} className="mb-4 text-gray-200" />
                <p>{searchQuery ? `No reports matching "${searchQuery}"` : "No reports generated yet."}</p>
                {!searchQuery && <p className="text-xs mt-2">Chat with agents to generate tasks.</p>}
             </div>
        ) : (
            <div className="space-y-1">
            {filteredReports.map(report => (
                <div key={report.id} className="flex items-center gap-4 bg-white py-3 px-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-center rounded-lg bg-red-50 text-red-500 shrink-0 w-12 h-12">
                    <FileText size={24} />
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                    <p className="text-gray-900 text-base font-semibold leading-tight group-hover:text-primary transition-colors truncate">{report.title}</p>
                    <p className="text-gray-500 text-sm font-normal mt-1">
                    {report.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • {report.size}
                    </p>
                </div>
                <div className="shrink-0 text-gray-400 hover:text-primary transition-colors p-2">
                    <Download size={20} />
                </div>
                </div>
            ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default ReportsView;