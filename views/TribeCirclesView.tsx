import React, { useState } from 'react';
import Header from '../components/Header';
import { Users, Map, Heart, Share2, X } from 'lucide-react';
import { TribeCirclesIcon } from '../components/TribeIcons';

interface TribeCirclesViewProps {
    onOpenMap: () => void;
}

const CIRCLES = [
    { id: '1', name: 'Mufidul Tapadar', subtitle: 'by The Rhythm Experts', image: 'https://images.unsplash.com/photo-1516280440502-8698bf0dcb50?auto=format&fit=crop&q=80&w=150', likes: 43 },
    { id: '2', name: 'Washi Mazumdar', subtitle: 'by The Rhythm Experts', image: 'https://images.unsplash.com/photo-1520627918451-2e6730cccdbb?auto=format&fit=crop&q=80&w=150', likes: 8 },
    { id: '3', name: 'Arafat Nayeem', subtitle: 'by The Rhythm Experts', image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150', likes: 239 }
];

const CircleCard: React.FC<{ circle: any, index: number }> = ({ circle, index }) => {
    return (
        <div className="group flex gap-4 cursor-pointer p-2 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0">
            {/* Image Card */}
            <div className="shrink-0 w-24 h-24 overflow-hidden rounded-md shadow-sm">
                <img
                    src={circle.image || `https://picsum.photos/seed/${circle.id}/200/200`}
                    alt={circle.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                    <div className="flex outline-none items-center gap-1.5 text-xs font-bold text-[#E55A3B] mb-1">
                        <span>Circle #{circle.id}</span>
                        <span>•</span>
                        <span>{circle.likes} Likes</span>
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-1">
                        {circle.name}
                    </h3>
                    <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                        {circle.subtitle}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                        <div className="flex -space-x-1.5">
                            <img className="inline-block w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="Member" />
                            <img className="inline-block w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="Member" />
                            <img className="inline-block w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64" alt="Member" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#10B981] text-white text-[13px] font-bold shadow-sm">
                            {parseInt(circle.id) * 3 + 2}
                        </div>
                        <button className="text-[#4A5568] hover:text-gray-900 dark:hover:text-gray-200 transition-colors ml-1">
                            <Share2 size={18} strokeWidth={2} />
                        </button>
                        <button className="text-[#E55A3B] hover:opacity-80 transition-opacity">
                            <Heart size={18} strokeWidth={2} className={circle.id.includes('1') ? "fill-[#E55A3B]" : ""} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TribeCirclesView: React.FC<TribeCirclesViewProps> = ({ onOpenMap }) => {
    const [activeTag, setActiveTag] = useState<string>('All');
    const categories = ['All', 'Food', 'Tech', 'Arts', 'Fitness'];

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTribeName, setNewTribeName] = useState('');
    const [newTribeCategory, setNewTribeCategory] = useState(categories[1]);
    const [newTribeDescription, setNewTribeDescription] = useState('');

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
            {/* Common Header */}
            <Header
                newChatLabel="Create a Tribe"
                newChatIcon={<TribeCirclesIcon size={20} active={false} />}
                onNewChat={() => setShowCreateModal(true)}
                onMenuClick={() => console.log("Menu clicked")}
            />

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24">

                <div className="px-4 pt-4 pb-2">
                    <p className="text-gray-500 dark:text-gray-400">
                        Find and join circles centered around your passions and interests. Connect with like-minded members of the Taco Tribe!
                    </p>
                </div>

                {/* Sticky Bubble Tags */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTag(cat)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeTag === cat
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4">
                    <div className="space-y-4">
                        {CIRCLES.map((circle, idx) => (
                            <CircleCard key={circle.id} circle={circle} index={idx} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Map Button */}
            <div className="absolute bottom-24 right-4 z-20">
                <button
                    onClick={onOpenMap}
                    className="w-14 h-14 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-gray-100 dark:border-gray-700"
                >
                    <Map size={24} />
                </button>
            </div>

            {/* Create Tribe Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create a Tribe</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20} className="hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Tribe Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Weekend Hikers"
                                    value={newTribeName}
                                    onChange={(e) => setNewTribeName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Category</label>
                                <div className="relative">
                                    <select
                                        value={newTribeCategory}
                                        onChange={(e) => setNewTribeCategory(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium cursor-pointer"
                                    >
                                        {categories.filter(c => c !== 'All').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description</label>
                                <textarea
                                    placeholder="What is this tribe all about?"
                                    value={newTribeDescription}
                                    onChange={(e) => setNewTribeDescription(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[100px] text-[15px] font-medium"
                                />
                            </div>
                        </div>

                        <div className="p-4 shrink-0 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => {
                                    console.log("Create Tribe Form:", {
                                        name: newTribeName,
                                        category: newTribeCategory,
                                        description: newTribeDescription
                                    });
                                    setShowCreateModal(false);
                                    setNewTribeName('');
                                    setNewTribeDescription('');
                                }}
                                disabled={!newTribeName.trim()}
                                className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center shadow-lg shadow-primary/25 disabled:shadow-none"
                            >
                                Create Tribe
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default TribeCirclesView;
