import React, { useState } from 'react';
import { Search, Upload, Download, Check, Box, Code, Scale, Zap, ShieldCheck } from 'lucide-react';
import { dbService } from '../services/db'; // Import DB Service

interface MarketplaceViewProps {
  onLogout: () => void;
}

interface SkillPackage {
  id: string;
  name: string;
  author: string;
  description: string;
  icon: React.ReactNode;
  installed: boolean;
  version: string;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [installedMessage, setInstalledMessage] = useState<string | null>(null);

  const [availablePackages, setAvailablePackages] = useState<SkillPackage[]>([
    {
      id: 'pkg_1',
      name: 'Data Viz Pack',
      author: 'DataWiz',
      description: 'Advanced chart generation and D3.js integration for data specialists.',
      icon: <Box size={24} className="text-purple-500" />,
      installed: false,
      version: '1.2.0'
    },
    {
      id: 'pkg_2',
      name: 'Python Coder',
      author: 'DevTeam',
      description: 'Enhanced Python snippet generation and debugging capabilities.',
      icon: <Code size={24} className="text-primary" />,
      installed: true, // Initially installed in DB seed
      version: '2.1.5'
    },
    {
      id: 'pkg_3',
      name: 'Legal Eagle v2',
      author: 'LegalTech',
      description: 'Updated contract templates and case law references for 2024.',
      icon: <Scale size={24} className="text-danger" />,
      installed: false,
      version: '2.0.0'
    },
    {
      id: 'pkg_4',
      name: 'Marketing Boost',
      author: 'CreativeAI',
      description: 'SEO analyzer and social media campaign planner.',
      icon: <Zap size={24} className="text-yellow-500" />,
      installed: false,
      version: '1.0.4'
    },
    {
        id: 'pkg_5',
        name: 'Compliance Guard',
        author: 'SecurIT',
        description: 'GDPR and CCPA checklist automation for agents.',
        icon: <ShieldCheck size={24} className="text-green-500" />,
        installed: false,
        version: '0.9.1'
    }
  ]);

  const handleInstall = (pkg: SkillPackage) => {
    setAvailablePackages(prev => prev.map(p => {
        if (p.id === pkg.id) {
            return { ...p, installed: true };
        }
        return p;
    }));
    
    // Save to SQLite
    dbService.installSkill(pkg);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate reading and processing the file
    setTimeout(() => {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // remove extension
        
        const newPkg: SkillPackage = {
            id: `upload_${Date.now()}`,
            name: fileName,
            author: 'Local User',
            description: `Custom skill package uploaded from ${file.name}.`,
            icon: <Box size={24} className="text-gray-700" />,
            installed: true,
            version: '1.0.0'
        };

        setAvailablePackages([newPkg, ...availablePackages]);
        
        // Save imported skill to SQLite
        dbService.installSkill(newPkg);
        
        setIsUploading(false);
        setInstalledMessage(file.name);
        
        // Clear success message after a few seconds
        setTimeout(() => setInstalledMessage(null), 4000);
        
        // Reset input
        e.target.value = '';
    }, 1500);
  };

  const filteredPackages = availablePackages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 pt-6 pb-4 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketplace</h1>
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900 placeholder-gray-400" 
            placeholder="Search skills, agents, packs..." 
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-6">
        
        {/* File Upload Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
                <Upload size={20} className="text-gray-900" />
                <h3 className="font-bold text-gray-900 text-sm">Upload Skill Package</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
                Install custom skills by uploading a configuration file (.json, .md).
            </p>
            
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                        <Upload size={24} className="text-primary" />
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">Click to upload or drag and drop</p>
                    <p className="text-[10px] text-gray-400 mt-1">JSON, MD (MAX. 5MB)</p>
                </div>
                <input 
                    type="file" 
                    className="hidden" 
                    accept=".json,.md,.txt" 
                    onChange={handleFileUpload} 
                    disabled={isUploading} 
                />
            </label>

            {isUploading && (
                 <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-500 font-medium">
                     <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                     Installing package...
                 </div>
            )}

            {installedMessage && !isUploading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600 text-xs font-bold animate-in fade-in slide-in-from-top-2 bg-green-50 py-2 rounded-lg border border-green-100">
                    <Check size={14} />
                    Successfully installed {installedMessage}
                </div>
            )}
        </section>

        {/* Featured/Filtered List */}
        <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 px-1">Available Skill Packs</h3>
            <div className="space-y-3">
                {filteredPackages.map(pkg => (
                    <div key={pkg.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                            {pkg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between">
                                <h4 className="font-bold text-gray-900 text-sm truncate">{pkg.name}</h4>
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded">v{pkg.version}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 mb-1 line-clamp-1">{pkg.description}</p>
                            <p className="text-[10px] font-semibold text-gray-400">by {pkg.author}</p>
                        </div>
                        <button 
                            onClick={() => handleInstall(pkg)}
                            disabled={pkg.installed}
                            className={`shrink-0 w-24 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                pkg.installed 
                                ? 'bg-gray-100 text-gray-500 cursor-default' 
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                            }`}
                        >
                            {pkg.installed ? (
                                <>
                                    <Check size={14} />
                                    Installed
                                </>
                            ) : (
                                <>
                                    <Download size={14} />
                                    Get
                                </>
                            )}
                        </button>
                    </div>
                ))}
                
                {filteredPackages.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No packages found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </section>

      </main>
    </div>
  );
};

export default MarketplaceView;