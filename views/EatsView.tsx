import React, { useState } from 'react';
import Header from '../components/Header';
import { Share2, Heart, X } from 'lucide-react';
import { TribeKitchenIcon } from '../components/TribeIcons';

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

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price?: number;
  image?: string;
}

const SANDWICHES: MenuItem[] = [
  {
    id: 's1',
    title: 'Creamy Mayo Egg Sandwich',
    description: 'Whole wheat bread, boiled egg mix with mustard mayo',
    price: 150,
  },
  {
    id: 's2',
    title: 'Pesto, Mozzarella Sandwich',
    description: 'Ciabatta, fresh mozzarella, inhouse basil pesto roasted bell pepper, rocket leaf',
    price: 220,
  },
  {
    id: 's3',
    title: 'Original Ham & Cheese Sandwich',
    description: 'Multigrain bread, cured chicken ham, cheese and lettuce',
    price: 250,
  },
  {
    id: 's4',
    title: 'Grilled Chicken Sandwich',
    description: 'Multigrain bread, marinated grilled chicken, cheese spread, barbeque sauce',
    price: 230,
  },
  {
    id: 's5',
    title: 'Chicken Sausage & Cheese Crossiant Sandwich',
    description: 'Chicken sausage, croissant, cheese, tomato, lettuce',
    price: 260,
  }
];

const WRAPS: MenuItem[] = [
  { id: 'w1', title: 'BBQ CHICKEN BURRITO', description: 'Tender chicken in rich BBQ sauce wrapped in a tortilla', price: 230 },
  { id: 'w2', title: 'BBQ PANEER BURRITO', description: 'Paneer cubes in rich BBQ sauce wrapped in a tortilla', price: 210 },
  { id: 'w3', title: 'CHILI CHIPOTLE CHICKEN BURRITO', description: 'Spicy chipotle chicken wrapped with fresh veggies', price: 240 },
  { id: 'w4', title: 'CRISPY PERI PERI CHICKEN BURRITO', description: 'Peri peri spiced crispy chicken wrap', price: 250 },
  { id: 'w5', title: 'FAJITA VEG BURRITO', description: 'Fajita seasoned mixed vegetables in a wrap', price: 200 },
  { id: 'w6', title: 'MEXICAN PANEER BURRITO', description: 'Mexican style paneer with beans wrapped nicely', price: 220 },
  { id: 'w7', title: 'CRISPY MUSHROOM BURRITO', description: 'Crispy fried mushrooms in a delicious wrap', price: 210 },
  { id: 'w8', title: 'PERI PERI POTATO BURRITO', description: 'Spicy peri peri potatoes wrapped in a tortilla', price: 180 },
];

const BOWLS: MenuItem[] = [
  { id: 'b1', title: 'BBQ CHICKEN BOWL', description: 'Tender chicken in rich BBQ sauce with rice', price: 280 },
  { id: 'b2', title: 'BBQ PANEER BOWL', description: 'Paneer cubes in rich BBQ sauce with rice', price: 250 },
  { id: 'b3', title: 'CHILI CHIPOTLE CHICKEN BOWL', description: 'Spicy chipotle chicken served with rice', price: 290 },
  { id: 'b4', title: 'CRISPY MUSHROOM BOWL', description: 'Crispy fried mushrooms over flavored rice', price: 260 },
  { id: 'b5', title: 'CRISPY PERI PERI CHICKEN BOWL', description: 'Peri peri spiced crispy chicken with rice', price: 300 },
  { id: 'b6', title: 'FAJITA VEG BOWL', description: 'Fajita seasoned mixed vegetables and rice', price: 240 },
  { id: 'b7', title: 'MEXICAN PANEER BOWL', description: 'Mexican style paneer with beans and rice', price: 270 },
  { id: 'b8', title: 'PERI PERI POTATO BOWL', description: 'Spicy peri peri potatoes over rice', price: 220 },
  { id: 'b9', title: 'GRILLED BARBEQUE CHICKEN PRO BOWL', description: 'Premium grilled BBQ chicken bowl', price: 340 },
  { id: 'b10', title: 'MEXICAN PANEER PRO BOWL', description: 'Premium Mexican paneer bowl', price: 310 },
];

const BEVERAGES: MenuItem[] = [
  { id: 'bev1', title: 'Classic Cold Coffee', description: 'Rich and creamy cold coffee', price: 150 },
  { id: 'bev2', title: 'Iced Americano', description: 'Chilled espresso with water and ice', price: 130 },
  { id: 'bev3', title: 'Mango Smoothie', description: 'Fresh mangoes blended with yogurt', price: 200 },
  { id: 'bev4', title: 'Lemon Iced Tea', description: 'Refreshing iced tea with a hint of lemon', price: 120 }
];

const EatsEventCard: React.FC<{ item: MenuItem, index: number }> = ({ item, index }) => {
  return (
    <div className="group flex gap-4 cursor-pointer p-2 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0">
      {/* Image Card */}
      <div className="shrink-0 w-24 h-24 overflow-hidden rounded-md shadow-sm">
        <img
          src={item.image || `https://picsum.photos/seed/${item.id}/200/200`}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex outline-none items-center gap-1.5 text-xs font-bold text-[#E55A3B] mb-1">
            <span>₹{item.price || 0}</span>
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-1">
            {item.title}
          </h3>
          <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-end gap-4 mt-1">
          <button className="text-[#4A5568] hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            <Share2 size={18} strokeWidth={2} />
          </button>
          <button className="text-[#E55A3B] hover:opacity-80 transition-opacity">
            <Heart size={18} strokeWidth={2} className={item.id.includes('1') ? "fill-[#E55A3B]" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
};

const EatsView: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<'Cafe' | 'Event'>('Cafe');
  const [activeTag, setActiveTag] = useState<string>('Sandwiches');

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderCategory, setOrderCategory] = useState('Sandwiches');
  const [orderType, setOrderType] = useState('Dine-in');
  const [orderQuantity, setOrderQuantity] = useState('1');
  const [orderNotes, setOrderNotes] = useState('');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Common Header */}
      <Header
        newChatLabel="Order Here"
        newChatIcon={<TribeKitchenIcon size={20} active={false} />}
        onNewChat={() => setShowOrderModal(true)}
        onMenuClick={() => console.log("Menu clicked")}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 pt-4 pb-2">
          <p className="text-gray-500 dark:text-gray-400">
            Explore the Tribe Kitchen for our latest culinary offerings. From hearty bowls to refreshing beverages, savor the taste of the tribe!
          </p>
        </div>

        {/* Sticky Bubble Tags */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {['Sandwiches', 'Wraps', 'Rice Bowls', 'Beverages'].map((cat, i) => (
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

        {/* Sandwiches Section */}
        {
          activeTag === 'Sandwiches' && (
            <div className="px-4 py-8">
              <div className="flex flex-col gap-4">
                {SANDWICHES.map((item, index) => (
                  <EatsEventCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          )
        }

        {/* Wraps Section */}
        {
          activeTag === 'Wraps' && (
            <div className="px-4 py-8">
              <div className="flex flex-col gap-4">
                {WRAPS.map((item, index) => (
                  <EatsEventCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          )
        }

        {/* Rice Bowls Section */}
        {
          activeTag === 'Rice Bowls' && (
            <div className="px-4 py-8">
              <div className="flex flex-col gap-4">
                {BOWLS.map((item, index) => (
                  <EatsEventCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          )
        }

        {/* Beverages Section */}
        {
          activeTag === 'Beverages' && (
            <div className="px-4 py-8">
              <div className="flex flex-col gap-4">
                {BEVERAGES.map((item, index) => (
                  <EatsEventCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          )
        }
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOrderModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Place an Order</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Category</label>
                <div className="relative">
                  <select
                    value={orderCategory}
                    onChange={(e) => setOrderCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium cursor-pointer"
                  >
                    {['Sandwiches', 'Wraps', 'Rice Bowls', 'Beverages'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Order Type</label>
                  <div className="relative">
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium cursor-pointer"
                    >
                      <option value="Dine-in">Dine-in</option>
                      <option value="Takeaway">Takeaway</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>
                <div className="flex-[0.5]">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Special Instructions</label>
                <textarea
                  placeholder="e.g. Extra spicy, no onions..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[100px] text-[15px] font-medium"
                />
              </div>
            </div>

            <div className="p-4 shrink-0 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  console.log("Submit Order Form:", {
                    category: orderCategory,
                    type: orderType,
                    quantity: orderQuantity,
                    notes: orderNotes
                  });
                  setShowOrderModal(false);
                  setOrderCategory('Sandwiches');
                  setOrderType('Dine-in');
                  setOrderQuantity('1');
                  setOrderNotes('');
                }}
                disabled={!orderQuantity || parseInt(orderQuantity) < 1}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center shadow-lg shadow-primary/25 disabled:shadow-none"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EatsView;
