import React, { useState } from 'react';
import { Agent } from '../types';
import { Search, ArrowRight, X, ChevronRight } from 'lucide-react';
import { 
    CATEGORIES, DOCTORS_DATA, LAWYERS_DATA, TEACHERS_DATA, EXPERT_AGENTS_DATA,
    CategoryType, AgentTemplate
} from '../constants';

interface AgentsViewProps {
  onSelectAgent: (agent: Agent, title: string) => void;
}

const AgentsView: React.FC<AgentsViewProps> = ({ onSelectAgent }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<Agent | null>(null);
  const [projectTitle, setProjectTitle] = useState('');

  const handleCategorySelect = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setSearchQuery('');
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Helper to generate dynamic agent object from a specialization
  const createAgentFromTemplate = (template: AgentTemplate, category: CategoryType): Agent => {
    const cleanName = template.name.split('(')[0].trim();
    // Generate a consistent, unique avatar using the name and category as seed
    const avatarUrl = `https://robohash.org/${category}_${cleanName.replace(/\s+/g, '')}.png?set=set1&size=200x200`;
    
    return {
        id: `${category.toLowerCase()}_${cleanName.toLowerCase().replace(/\s+/g, '_')}`,
        name: template.name,
        avatar: avatarUrl,
        description: template.description,
        isVerified: true,
    };
  };

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgentForModal(agent);
    setProjectTitle('');
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAgentForModal && projectTitle.trim()) {
      onSelectAgent(selectedAgentForModal, projectTitle.trim());
      setSelectedAgentForModal(null);
    }
  };

  const renderCategoryList = () => {
    return (
        <div className="p-4 grid grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${cat.color}`}>
                        {cat.icon}
                    </div>
                    <span className="text-lg font-bold text-gray-900">{cat.label}</span>
                    <span className="text-xs text-gray-400 mt-1 font-medium">Click to browse</span>
                </button>
            ))}
        </div>
    );
  };

  const renderSpecialtyList = () => {
    if (!selectedCategory) return null;

    let agentsToList: Agent[] = [];

    if (selectedCategory === 'Doctors') {
        agentsToList = DOCTORS_DATA.map(t => createAgentFromTemplate(t, 'Doctors'));
    } else if (selectedCategory === 'Lawyers') {
        agentsToList = LAWYERS_DATA.map(t => createAgentFromTemplate(t, 'Lawyers'));
    } else if (selectedCategory === 'Teachers') {
        agentsToList = TEACHERS_DATA.map(t => createAgentFromTemplate(t, 'Teachers'));
    } else if (selectedCategory === 'Experts') {
        agentsToList = EXPERT_AGENTS_DATA;
    }

    const filteredAgents = agentsToList.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="divide-y divide-gray-50">
            {filteredAgents.map((agent) => (
                <div 
                    key={agent.id} 
                    onClick={() => handleAgentClick(agent)}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                    <div className="relative flex-shrink-0 mt-1">
                        <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-sm">{agent.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{agent.description}</p>
                    </div>
                    <ChevronRight className="text-gray-300 self-center group-hover:text-primary transition-colors" size={18} />
                </div>
            ))}
            {filteredAgents.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">No specialists found matching "{searchQuery}"</div>
            )}
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          {selectedCategory ? (
            <button onClick={handleBack} className="p-1 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRight className="rotate-180 text-gray-600" size={24} />
            </button>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
             {selectedCategory ? selectedCategory : 'Agents'}
          </h1>
        </div>
        
        {/* Search Bar (Only show in category view or if category is selected) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-gray-100 rounded-xl pl-10 pr-4 border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-gray-900 placeholder-gray-400"
            placeholder={selectedCategory ? `Search ${selectedCategory.toLowerCase()}...` : "Search categories..."} 
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        {!selectedCategory ? renderCategoryList() : renderSpecialtyList()}
      </main>

      {/* Start Chat Modal */}
      {selectedAgentForModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-end items-center mb-2">
              <button 
                onClick={() => setSelectedAgentForModal(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <img 
                src={selectedAgentForModal.avatar} 
                alt={selectedAgentForModal.name} 
                className="w-12 h-12 rounded-full bg-white object-cover" 
              />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Start Chat With</p>
                <p className="font-bold text-gray-900 text-sm leading-tight mt-0.5">{selectedAgentForModal.name}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-100 leading-relaxed">
                {selectedAgentForModal.description}
            </p>

            <form onSubmit={handleStartChat}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic / Issue</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none"
                  placeholder="e.g. Annual Checkup, Legal Advice..."
                />
              </div>

              <button 
                type="submit"
                disabled={!projectTitle.trim()}
                className="w-full bg-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:opacity-90"
              >
                Start Conversation
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsView;