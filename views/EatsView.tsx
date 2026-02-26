import React, { useState } from 'react';
import Header from '../components/Header';

interface Category {
  id: string;
  title: string;
  image: string;
}

const CATEGORIES: Category[] = [
  {
    id: '1',
    title: 'Breakfast Combo',
    image: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '2',
    title: 'Beverages',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '3',
    title: 'Meal Combos',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '4',
    title: 'Food',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '5',
    title: 'Quick Bites',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: '6',
    title: 'Coffee At Home',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=300'
  }
];



const EatsView: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<'Cafe' | 'Event'>('Cafe');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto pb-24">
      {/* Common Header with Title */}
      <Header 
        placeholder="Search events or groups..." 
        newChatLabel="Eats"
        onNewChat={() => console.log("New Eats clicked")}
        onMenuClick={() => console.log("Menu clicked")}
      />

      {/* Sub Categories */}
      <div className="px-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center overflow-x-auto pb-2 scrollbar-hide gap-4">
          {['Nachos', 'Tacos', 'Burritos', 'Churos', 'Beverages'].map((cat) => (
            <button
              key={cat}
              className={`text-base font-medium whitespace-nowrap transition-all relative pb-1 text-gray-900 dark:text-gray-400 hover:text-black dark:hover:text-white`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>



      {/* Categories Grid */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-3 gap-x-6 gap-y-10">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm bg-gray-50">
                <img 
                  src={cat.image} 
                  alt={cat.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white text-center leading-tight">
                {cat.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EatsView;
