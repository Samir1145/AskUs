import React from 'react';
import { ChevronLeft, Share2, Users, MessageCircle, Globe, MapPin, ShieldCheck, MoreVertical, TrendingUp } from 'lucide-react';

interface Group {
    id: string;
    name: string;
    category: string;
    image: string;
    likes: number;
}

interface GroupDetailViewProps {
    group: Group;
    onBack: () => void;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({ group, onBack }) => {
    const [joined, setJoined] = React.useState(false);

    const handleShare = async () => {
        const shareData = {
            title: group.name,
            text: `Check out this group: ${group.name} — a ${group.category} community on Taco Tribe!`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.log('Share cancelled or failed');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <h1 className="text-[17px] font-bold text-gray-900 dark:text-white truncate">
                        {group.name}
                    </h1>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={handleShare} className="p-2 hover:bg-[#6B21A8]/10 rounded-full transition-colors">
                        <Share2 size={20} className="text-[#6B21A8]" />
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-32">
                {/* Banner Image */}
                <div className="w-full aspect-video relative">
                    <img
                        src={group.image}
                        alt={group.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                        <span className="bg-[#6B21A8]/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                            {group.category}
                        </span>
                    </div>
                </div>

                <div className="px-5 py-6 space-y-8">
                    {/* Stats Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[24px] font-black text-gray-900 dark:text-white leading-none">
                                    {group.likes}
                                </span>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                    Likes
                                </span>
                            </div>
                            <div className="w-px h-10 bg-gray-100 dark:bg-gray-800" />
                            <div className="flex flex-col">
                                <span className="text-[24px] font-black text-gray-900 dark:text-white leading-none">
                                    {parseInt(group.id) * 3 + 2}
                                </span>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                    Members
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-[#EA580C]">
                                <TrendingUp size={14} strokeWidth={3} />
                                <span className="text-[13px] font-black uppercase">Trending</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 mt-0.5">Top 5% this week</span>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-4">
                        <h3 className="text-[20px] font-black text-gray-900 dark:text-white">
                            About the Circle
                        </h3>
                        <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                            Join the {group.name} tribe! We are a community of passionate individuals dedicated to exploring the best of {group.category}. Whether you are a beginner or an expert, there's a place for you here. Our activities range from weekly meetups to large-scale events that bring everyone together.
                        </p>
                    </div>

                    {/* Key Information */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#6B21A8]/5 dark:bg-[#6B21A8]/10 border border-[#6B21A8]/20 dark:border-[#6B21A8]/30">
                            <div className="w-10 h-10 bg-[#6B21A8]/10 dark:bg-[#6B21A8]/20 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                <ShieldCheck size={20} className="text-[#6B21A8]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-gray-900 dark:text-white">Verified Circle</span>
                                <span className="text-[12px] text-gray-500">Trusted community by Taco Tribe</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#EAB308]/5 dark:bg-[#EAB308]/10 border border-[#EAB308]/20 dark:border-[#EAB308]/30">
                            <div className="w-10 h-10 bg-[#EAB308]/10 dark:bg-[#EAB308]/20 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                <Globe size={20} className="text-[#EAB308]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-gray-900 dark:text-white">Global Reach</span>
                                <span className="text-[12px] text-gray-500">Connect with members worldwide</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#DC2626]/5 dark:bg-[#DC2626]/10 border border-[#DC2626]/20 dark:border-[#DC2626]/30">
                            <div className="w-10 h-10 bg-[#DC2626]/10 dark:bg-[#DC2626]/20 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                <MapPin size={20} className="text-[#DC2626]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-gray-900 dark:text-white">Location Based</span>
                                <span className="text-[12px] text-gray-500">Regular meetups in the Tricity area</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-8 pb-10 flex gap-3 border-t border-[#6B21A8]/15 dark:border-[#6B21A8]/20">
                        <button
                            onClick={() => {
                                setJoined(!joined);
                                window.open('https://chat.whatsapp.com/DPfO9hBaph11tDaP5TxUZa?mode=gi_t', '_blank');
                            }}
                            className={`flex-1 py-3.5 rounded-xl font-black text-[16px] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${joined
                                ? 'bg-[#6B21A8] border-2 border-[#6B21A8] text-white shadow-[#6B21A8]/20'
                                : 'bg-white dark:bg-gray-950 border-[2px] border-[#6B21A8] text-[#6B21A8] hover:bg-[#6B21A8]/5 shadow-[#6B21A8]/10'
                                }`}
                        >
                            {joined ? '✓ JOINED' : 'JOIN GROUP'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailView;
