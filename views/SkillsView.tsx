import React, { useState } from 'react';
import { Agent } from '../types';
import { Search, X, ArrowRight } from 'lucide-react';
import { EXPERT_SKILLS_MAP, DEFAULT_SKILLS } from '../constants';

interface SkillsViewProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent, title: string) => void;
  onLogout: () => void;
}

const SkillsView: React.FC<SkillsViewProps> = ({ agents, onSelectAgent }) => {
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<Agent | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgentForModal(agent);
    setProjectTitle(''); // Reset title
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAgentForModal && projectTitle.trim()) {
      onSelectAgent(selectedAgentForModal, projectTitle.trim());
      setSelectedAgentForModal(null);
    }
  };

  const getAgentSkills = (agentId: string) => {
    return EXPERT_SKILLS_MAP[agentId] || DEFAULT_SKILLS;
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Experts</h1>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-gray-100 rounded-xl pl-10 pr-4 border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-gray-900 placeholder-gray-400"
            placeholder="Search experts..." 
          />
        </div>
      </header>

      {/* List */}
      <main className="flex-1 overflow-y-auto pb-4">
        <div className="divide-y divide-gray-50">
          {filteredAgents.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
               <p>No experts found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredAgents.map(agent => (
                <div 
                key={agent.id} 
                onClick={() => handleAgentClick(agent)}
                className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                <div className="relative flex-shrink-0 mt-1">
                    <img src={agent.avatar} alt={agent.name} className="w-14 h-14 rounded-full object-cover bg-gray-100" />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 truncate text-base">{agent.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{agent.description}</p>
                </div>
                
                <div className="flex items-center self-center gap-3">
                    <ArrowRight className="text-gray-300" size={20} />
                </div>
                </div>
            ))
          )}
        </div>
      </main>

      {/* New Project Modal */}
      {selectedAgentForModal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">
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
                className="w-12 h-12 rounded-full bg-white" 
              />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Chat With</p>
                <p className="font-bold text-gray-900">{selectedAgentForModal.name}</p>
              </div>
            </div>

            <div className="mb-6 space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide mb-3">Specialized skills</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {getAgentSkills(selectedAgentForModal.id).map((skill, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-red-900">
                             <span className="text-danger shrink-0">{skill.icon}</span>
                             <span>{skill.label}</span>
                          </div>
                        ))}
                    </div>
                </div>
            </div>

            <form onSubmit={handleStartChat}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chat Title</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none"
                  placeholder="e.g. Q3 Marketing Plan"
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

export default SkillsView;