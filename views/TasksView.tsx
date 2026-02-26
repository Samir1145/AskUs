import React, { useEffect, useState } from 'react';
import { Task, Bill, MemoryWiki } from '../types';
import { Search, CheckCircle2, FileDown, Calendar, Hash, Globe, FileText, ChevronRight, X } from 'lucide-react';
import { dbService } from '../services/db';

interface TasksViewProps {
  tasks: Task[];
  bills: Bill[];
  onLogout: () => void;
  initialSelectedTitle?: string | null;
  onClearInitialSelection?: () => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, bills, initialSelectedTitle, onClearInitialSelection }) => {
  const [wikiMemories, setWikiMemories] = useState<MemoryWiki[]>([]);
  const [selectedWiki, setSelectedWiki] = useState<MemoryWiki | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Poll for new memories (in a real app, use a subscription)
    const loadMemories = () => {
        const mems = dbService.getWikiMemories();
        setWikiMemories(mems);

        if (initialSelectedTitle) {
          const found = mems.find(m => m.title === initialSelectedTitle);
          if (found) {
            setSelectedWiki(found);
            if (onClearInitialSelection) onClearInitialSelection();
          }
        }
    };
    loadMemories();
    const interval = setInterval(loadMemories, 5000);
    return () => clearInterval(interval);
  }, [initialSelectedTitle, onClearInitialSelection]);

  const getBill = (taskId: string) => bills.find(b => b.taskId === taskId);

  const filteredMemories = wikiMemories.filter(wiki => 
    wiki.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wiki.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wiki.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 pt-6 pb-4 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reports</h1>
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900 placeholder-gray-400" 
            placeholder="Search reports..." 
          />
        </div>
      </header>

      {/* Wiki List */}
      <main className="flex-1 overflow-y-auto pb-4 bg-gray-50/50">
        {filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
             <Globe size={48} className="mb-4 text-gray-200" />
             <p>{searchQuery ? `No reports matching "${searchQuery}"` : "No reports generated yet."}</p>
             {!searchQuery && <p className="text-xs mt-2">Chat with agents to generate reports and build memory.</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMemories.map((wiki) => (
              <div 
                key={wiki.id} 
                onClick={() => setSelectedWiki(wiki)}
                className="bg-white px-5 py-5 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                   <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 shrink-0">
                       <FileText size={20} />
                   </div>
                   <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{wiki.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{wiki.summary}</p>
                        
                        <div className="flex items-center flex-wrap gap-1.5">
                            {wiki.tags.map((tag, i) => (
                                <span key={i} className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                    {tag}
                                </span>
                            ))}
                            <span className="text-[10px] text-gray-400 ml-auto">
                                {wiki.timestamp.toLocaleDateString()}
                            </span>
                        </div>
                   </div>
                   <ChevronRight size={18} className="text-gray-300 self-center" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Wiki Viewer Modal */}
      {selectedWiki && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
             <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                 <button onClick={() => setSelectedWiki(null)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                     <X size={24} className="text-gray-600" />
                 </button>
                 <span className="font-bold text-sm text-gray-900 truncate max-w-[200px]">{selectedWiki.title}</span>
                 <div className="w-8"></div>
             </div>
             <div className="flex-1 overflow-y-auto bg-white">
                 {/* 
                   Security Note: In a real app, sanitize this content. 
                   Here we rely on our internal generator being safe.
                 */}
                 <iframe 
                    title="wiki-viewer"
                    srcDoc={selectedWiki.htmlContent}
                    className="w-full h-full border-none"
                 />
             </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;