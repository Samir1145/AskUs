import React, { useState } from 'react';
import { ChevronLeft, Share2, Star, Clock, Users, DollarSign, Flame, ChevronDown, Play } from 'lucide-react';

interface MenuItem {
    id: string;
    title: string;
    description: string;
    price?: number;
    image?: string;
}

interface MenuDetailViewProps {
    item: MenuItem;
    onBack: () => void;
}

const MenuDetailView: React.FC<MenuDetailViewProps> = ({ item, onBack }) => {
    const [servingSize, setServingSize] = useState(1);

    // Demo data for the detailed view
    const demoData = {
        rating: 4.9,
        steps: 4,
        time: "30 Mins",
        servings: "1-4 serving",
        calories: "160 Kcal",
        ingredients: [
            "200 Grams Of Purpose Wheat Flour",
            "50 Grams Of Sugar",
            "2 Teaspoons Instant Yeast",
            "1 Teaspoon Salt",
            "240 Ml Warm Milk",
            "100 gram Graph"
        ]
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-[17px] font-bold text-gray-900 dark:text-white truncate flex-1 min-w-0 pr-4">
                    {item.title}
                </h1>
                <button className="p-2 -mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0">
                    <Share2 size={22} className="text-gray-900 dark:text-white" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto pb-48 p-5 space-y-6">
                {/* Banner Section with video-like UI */}
                <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-lg">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-xl scale-125 transition-transform active:scale-110">
                            <Play size={32} className="text-white fill-current translate-x-0.5" />
                        </div>
                    </div>
                    {/* Progress Bar UI */}
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="relative h-1.5 w-full bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                            <div className="absolute top-0 left-0 h-full w-[70%] bg-amber-400 rounded-full" />
                        </div>
                        {/* Play Knob */}
                        <div className="absolute top-1/2 left-[70%] -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400 border-2 border-white rounded-full shadow-md" />
                    </div>
                </div>

                {/* Title and Rating */}
                <div className="space-y-2">
                    <h2 className="text-[32px] font-black tracking-tight text-gray-950 dark:text-white leading-[1.1]">
                        {item.title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Star size={18} fill="#FACC15" className="text-yellow-400" />
                            <span className="text-[15px] font-black text-gray-900 dark:text-gray-100">{demoData.rating}</span>
                        </div>
                        <span className="text-gray-300 dark:text-gray-700 font-black">|</span>
                        <span className="text-[15px] font-black text-amber-500 uppercase tracking-widest">{demoData.steps} Steps</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {item.description}. This dish usually consists of layers of croissants baked until brown and crispy on the outside.
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { Icon: Clock, value: demoData.time, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
                        { Icon: Users, value: demoData.servings, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                        { Icon: DollarSign, value: `$${(item.price ? item.price / 100 : 5.0).toFixed(2)}`, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
                        { Icon: Flame, value: demoData.calories, color: 'text-orange-600', bg: 'bg-orange-100/50 dark:bg-orange-950/50' }
                    ].map((info, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 p-3 pt-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className={`w-12 h-12 ${info.bg} rounded-2xl flex items-center justify-center ${info.color}`}>
                                <info.Icon size={24} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter leading-none">
                                {info.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Ingredients Section */}
                <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-[32px] p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[20px] font-black text-gray-950 dark:text-white uppercase tracking-tight">
                            Ingredient
                        </h3>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-400 text-[13px] font-black">
                            {servingSize} Serving <ChevronDown size={14} strokeWidth={3} />
                        </button>
                    </div>

                    <ul className="space-y-4">
                        {demoData.ingredients.map((ing, idx) => (
                            <li key={idx} className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-gray-950 dark:bg-white mt-2 shrink-0" />
                                <span className="text-[15px] font-bold text-gray-700 dark:text-gray-300">
                                    {ing}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action Bar (Part of the page) */}
                <div className="pt-8 pb-10 flex gap-4 border-t border-gray-100 dark:border-gray-800">
                    <button className="flex-1 h-14 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl font-black text-[16px] shadow-xl hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-widest">
                        Add To Cart • ₹{item.price}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuDetailView;
