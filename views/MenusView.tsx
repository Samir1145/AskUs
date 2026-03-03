import React, { useState, useMemo, useEffect } from 'react';
import { Share2, X, Plus, Minus, ShoppingCart, Receipt, Loader2 } from 'lucide-react';
import { TribeKitchenIcon } from '../components/TribeIcons';
import { getMenuItems, FirebaseMenuItem } from '../services/firebaseData';

interface Category {
  id: string;
  title: string;
  image: string;
}

const CATEGORIES: Category[] = [
  { id: '1', title: 'Breakfast Combo', image: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&q=80&w=300' },
  { id: '2', title: 'Beverages', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=300' },
  { id: '3', title: 'Meal Combos', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=300' },
  { id: '4', title: 'Food', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=300' },
  { id: '5', title: 'Quick Bites', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=300' },
  { id: '6', title: 'Coffee At Home', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=300' },
];

// Fallback mock data
const MOCK_SANDWICHES: FirebaseMenuItem[] = [
  { id: 's1', title: 'Creamy Mayo Egg Sandwich', description: 'Whole wheat bread, boiled egg mix with mustard mayo', price: 150, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300', section: 'Sandwiches' },
  { id: 's2', title: 'Pesto, Mozzarella Sandwich', description: 'Ciabatta, fresh mozzarella, inhouse basil pesto roasted bell pepper, rocket leaf', price: 220, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300', section: 'Sandwiches' },
  { id: 's3', title: 'Original Ham & Cheese Sandwich', description: 'Multigrain bread, cured chicken ham, cheese and lettuce', price: 250, image: 'https://images.unsplash.com/photo-1554522434-c088febe4dc4?auto=format&fit=crop&w=300', section: 'Sandwiches' },
  { id: 's4', title: 'Grilled Chicken Sandwich', description: 'Multigrain bread, marinated grilled chicken, cheese spread, barbeque sauce', price: 230, image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=300', section: 'Sandwiches' },
  { id: 's5', title: 'Chicken Sausage & Cheese Crossiant Sandwich', description: 'Chicken sausage, croissant, cheese, tomato, lettuce', price: 260, image: 'https://images.unsplash.com/photo-1626078722880-9286d5e0a6d5?auto=format&fit=crop&w=300', section: 'Sandwiches' },
];

const MOCK_WRAPS: FirebaseMenuItem[] = [
  { id: 'w1', title: 'BBQ CHICKEN BURRITO', description: 'Tender chicken in rich BBQ sauce wrapped in a tortilla', price: 230, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=300', section: 'Wraps' },
  { id: 'w2', title: 'BBQ PANEER BURRITO', description: 'Paneer cubes in rich BBQ sauce wrapped in a tortilla', price: 210, image: 'https://images.unsplash.com/photo-1574044199105-0aa3df7ca878?auto=format&fit=crop&w=300', section: 'Wraps' },
  { id: 'w3', title: 'CHILI CHIPOTLE CHICKEN BURRITO', description: 'Spicy chipotle chicken wrapped with fresh veggies', price: 240, image: 'https://images.unsplash.com/photo-1584345630040-692db54b321a?auto=format&fit=crop&w=300', section: 'Wraps' },
  { id: 'w4', title: 'CRISPY PERI PERI CHICKEN BURRITO', description: 'Peri peri spiced crispy chicken wrap', price: 250, image: 'https://images.unsplash.com/photo-1615800098774-4b53112bd22e?auto=format&fit=crop&w=300', section: 'Wraps' },
  { id: 'w5', title: 'FAJITA VEG BURRITO', description: 'Fajita seasoned mixed vegetables in a wrap', price: 200, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=300', section: 'Wraps' },
  { id: 'w6', title: 'MEXICAN PANEER BURRITO', description: 'Mexican style paneer with beans wrapped nicely', price: 220, image: 'https://images.unsplash.com/photo-1574044199105-0aa3df7ca878?auto=format&fit=crop&w=300', section: 'Wraps' },
  { id: 'w7', title: 'CRISPY MUSHROOM BURRITO', description: 'Crispy fried mushrooms in a delicious wrap', price: 210, image: 'https://images.unsplash.com/photo-1584345630040-692db54b321a?auto=format&fit=crop&w=300', section: 'Wraps' },
  { id: 'w8', title: 'PERI PERI POTATO BURRITO', description: 'Spicy peri peri potatoes wrapped in a tortilla', price: 180, image: 'https://images.unsplash.com/photo-1615800098774-4b53112bd22e?auto=format&fit=crop&w=300', section: 'Wraps' },
];

const MOCK_BOWLS: FirebaseMenuItem[] = [
  { id: 'b1', title: 'BBQ CHICKEN BOWL', description: 'Tender chicken in rich BBQ sauce with rice', price: 280, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
  { id: 'b2', title: 'BBQ PANEER BOWL', description: 'Paneer cubes in rich BBQ sauce with rice', price: 250, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
  { id: 'b3', title: 'CHILI CHIPOTLE CHICKEN BOWL', description: 'Spicy chipotle chicken served with rice', price: 290, image: 'https://images.unsplash.com/photo-1546069901-d5bfd20bfb62?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
  { id: 'b4', title: 'CRISPY MUSHROOM BOWL', description: 'Crispy fried mushrooms over flavored rice', price: 260, image: 'https://images.unsplash.com/photo-1505506874110-6a7a009d0bb6?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
  { id: 'b5', title: 'CRISPY PERI PERI CHICKEN BOWL', description: 'Peri peri spiced crispy chicken with rice', price: 300, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
  { id: 'b6', title: 'FAJITA VEG BOWL', description: 'Fajita seasoned mixed vegetables and rice', price: 240, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
  { id: 'b7', title: 'MEXICAN PANEER BOWL', description: 'Mexican style paneer with beans and rice', price: 270, image: 'https://images.unsplash.com/photo-1505506874110-6a7a009d0bb6?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
  { id: 'b8', title: 'PERI PERI POTATO BOWL', description: 'Spicy peri peri potatoes over rice', price: 220, image: 'https://images.unsplash.com/photo-1546069901-d5bfd20bfb62?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
  { id: 'b9', title: 'GRILLED BARBEQUE CHICKEN PRO BOWL', description: 'Premium grilled BBQ chicken bowl', price: 340, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
  { id: 'b10', title: 'MEXICAN PANEER PRO BOWL', description: 'Premium Mexican paneer bowl', price: 310, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=300', section: 'Rice Bowls' },
];

const MOCK_BEVERAGES: FirebaseMenuItem[] = [
  { id: 'bev1', title: 'Classic Cold Coffee', description: 'Rich and creamy cold coffee', price: 150, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=300', section: 'Beverages' },
  { id: 'bev2', title: 'Iced Americano', description: 'Chilled espresso with water and ice', price: 130, image: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=300', section: 'Beverages' },
  { id: 'bev3', title: 'Mango Smoothie', description: 'Fresh mangoes blended with yogurt', price: 200, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=300', section: 'Beverages' },
  { id: 'bev4', title: 'Lemon Iced Tea', description: 'Refreshing iced tea with a hint of lemon', price: 120, image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=300', section: 'Beverages' },
];

const ALL_MOCK_ITEMS = [...MOCK_SANDWICHES, ...MOCK_WRAPS, ...MOCK_BOWLS, ...MOCK_BEVERAGES];

const EatsEventCard: React.FC<{
  item: FirebaseMenuItem,
  index: number,
  quantity: number,
  onUpdateQuantity: (id: string, newQty: number) => void,
  onSelectItem: (id: string) => void
}> = ({ item, index, quantity, onUpdateQuantity, onSelectItem }) => {
  return (
    <div
      className="flex bg-white dark:bg-gray-950 p-4 border-b border-gray-50 dark:border-gray-900/50 gap-4 cursor-pointer"
      onClick={() => onSelectItem(item.id!)}
    >
      {/* Details Container */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 order-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight truncate mr-2">
              {item.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[17px] font-bold text-gray-950 dark:text-white">
                ₹{item.price || 0}
              </span>
            </div>
          </div>
          <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500 line-clamp-2 leading-tight">
            {item.description}
          </p>
        </div>

        <div className="flex justify-start mt-2">
          {quantity === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id!, 1); }}
              className="px-6 py-2 bg-white dark:bg-gray-950 border-[2px] border-[#6B21A8] text-[#6B21A8] rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#6B21A8]/5 transition-all shadow-sm"
            >
              <span>ADD</span> <Plus size={16} strokeWidth={3} />
            </button>
          ) : (
            <div
              className="flex items-center justify-between bg-[#6B21A8] border-2 border-[#6B21A8] text-white rounded-xl overflow-hidden w-[110px] h-[36px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id!, Math.max(0, quantity - 1)); }}
                className="w-1/3 h-full flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <Minus size={18} strokeWidth={3} />
              </button>
              <span className="w-1/3 text-center font-black text-[15px] pb-0.5">{quantity}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id!, quantity + 1); }}
                className="w-1/3 h-full flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Container */}
      <div className="shrink-0 w-28 h-28 rounded-2xl overflow-hidden shadow-sm bg-gray-50 order-2">
        <img
          src={item.image || `https://picsum.photos/seed/${item.id}/200/200`}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

interface MenusViewProps {
  onSelectItem: (id: string) => void;
  userProfile?: {
    name: string;
    avatar: string;
    membership: string;
  };
}

const MenusView: React.FC<MenusViewProps> = ({ onSelectItem, userProfile }) => {
  const [activeTag, setActiveTag] = useState<string>('All Menus');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  // Firebase state
  const [allItems, setAllItems] = useState<FirebaseMenuItem[]>(ALL_MOCK_ITEMS);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Load menu items from Firebase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fbItems = await getMenuItems();
        if (!cancelled) {
          if (fbItems.length > 0) {
            setAllItems(fbItems);
            setFirebaseConnected(true);
          }
        }
      } catch (err) {
        console.warn('Firebase not configured, using mock data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Derive sections from allItems
  const sectionedItems: Record<string, FirebaseMenuItem[]> = useMemo(() => {
    const sections: Record<string, FirebaseMenuItem[]> = {
      'Sandwiches': [],
      'Wraps': [],
      'Rice Bowls': [],
      'Beverages': [],
    };
    allItems.forEach(item => {
      const sec = item.section || 'Sandwiches';
      if (sections[sec]) {
        sections[sec].push(item);
      } else {
        sections[sec] = [item];
      }
    });
    return sections;
  }, [allItems]);

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCart(prev => {
      const next = { ...prev };
      if (newQty <= 0) {
        delete next[id];
      } else {
        next[id] = newQty;
      }
      return next;
    });
  };

  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum: number, [id, qty]) => {
      const item = allItems.find(i => i.id === id);
      const price = Number(item?.price || 0);
      const quantity = Number(qty);
      return sum + (price * quantity);
    }, 0);
  }, [cart, allItems]);

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum: number, qty: number) => sum + qty, 0);
  }, [cart]);

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const item = allItems.find(i => i.id === id);
      return { ...item, quantity: Number(qty) };
    }).filter(item => item.id !== undefined);
  }, [cart, allItems]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Header Section */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-950 px-4 pt-6 pb-0">
          <div className="w-full flex items-center justify-between pb-4">
            <h1 className="text-4xl font-black tracking-tight text-[#0F172A] dark:text-white">
              MENUS
            </h1>

            <div className="flex items-center gap-3 ml-auto">
              {userProfile && (
                <div className="flex items-center gap-2.5 pl-3">
                  <div className="flex flex-col items-end min-w-0">
                    <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate leading-tight">
                      {userProfile.name}
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded-full mt-0.5 whitespace-nowrap">
                      {userProfile.membership}
                    </span>
                  </div>
                  <div className="relative shrink-0">
                    <img
                      src={userProfile.avatar}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tribal Art Separator Line */}
          <div className="w-full h-[5px] -mx-4 opacity-90 relative" style={{ width: 'calc(100% + 2rem)' }}>
            <svg width="100%" height="5" preserveAspectRatio="none" className="absolute bottom-0">
              <defs>
                <pattern id="tribal-line-menus" x="0" y="0" width="32" height="5" patternUnits="userSpaceOnUse">
                  <rect width="32" height="5" fill="#EAB308" />
                  <path d="M0 5 L8 0 L16 5 L24 0 L32 5" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinejoin="miter" />
                  <path d="M0 5 L4 2.5 L8 5 L12 2.5 L16 5 L20 2.5 L24 5 L28 2.5 L32 5" fill="none" stroke="#EA580C" strokeWidth="1" strokeLinejoin="miter" />
                  <circle cx="8" cy="3.5" r="0.75" fill="#6B21A8" />
                  <circle cx="24" cy="3.5" r="0.75" fill="#6B21A8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#tribal-line-menus)" />
            </svg>
          </div>
        </div>

        {/* Featured Showcase Carousel */}
        <div className="px-4 py-8">
          <div className="relative w-full aspect-[64/27] rounded-[32px] overflow-hidden shadow-2xl bg-black group">
            <img
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200"
              className="w-full h-full object-cover opacity-80"
              alt="Featured Ad"
            />
            {/* Visual Overlays for Scorpions-like theme */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 items-center text-center">
              <h2 className="text-white text-3xl font-black tracking-tighter leading-none mb-1">GENERAL SALE NOW LIVE</h2>
              <div className="w-12 h-0.5 bg-gray-500 mb-2" />
              <p className="text-white text-xl font-black tracking-widest uppercase mb-1">24 APRIL DELHI</p>
            </div>

            {/* Navigation Arrows */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/40 shadow-sm" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#6B21A8]" size={32} />
          </div>
        )}

        {/* Firebase badge */}
        {!loading && firebaseConnected && (
          <div className="mx-4 mb-3 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1.5 rounded-full w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live from Firebase
          </div>
        )}

        {/* Menu Listings */}
        {!loading && (
          <div className="space-y-0">
            {Object.entries(sectionedItems).map(([section, items]) => {
              if (items.length === 0) return null;
              if (activeTag === 'All Menus' || activeTag === section) {
                return (
                  <div key={section} className="flex flex-col">
                    {activeTag !== 'All Menus' && (
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                        <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{section}</span>
                      </div>
                    )}
                    {items.map((item, index) => (
                      <EatsEventCard
                        key={item.id}
                        item={item}
                        index={index}
                        quantity={cart[item.id!] || 0}
                        onUpdateQuantity={handleUpdateQuantity}
                        onSelectItem={onSelectItem}
                      />
                    ))}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="absolute bottom-24 right-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setShowCartModal(true)}
            className="w-16 h-16 bg-[#6B21A8] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-gray-900 group"
          >
            <div className="relative">
              <ShoppingCart size={28} />
              <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white text-[12px] font-black min-w-[22px] h-[22px] flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-in zoom-in duration-200">
                {cartCount}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Cart/Bill Modal */}
      {showCartModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCartModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            <div className="p-6 shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#6B21A8]/10 rounded-xl flex items-center justify-center">
                  <Receipt size={22} className="text-[#6B21A8]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Bill</h2>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400">
                          ₹{item.price} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[15px] font-black text-gray-900 dark:text-white">
                        ₹{(item.price || 0) * (item.quantity || 0)}
                      </span>
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id!, (item.quantity || 0) - 1)}
                          className="p-1 hover:text-[#6B21A8]"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id!, (item.quantity || 0) + 1)}
                          className="p-1 hover:text-[#6B21A8]"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-dashed bg-gray-200 dark:bg-gray-800" />

              <div className="space-y-3">
                <div className="flex justify-between text-[14px] font-bold text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-gray-500">
                  <span>Taxes (approx)</span>
                  <span>₹{Math.round(cartTotal * 0.05)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Grand Total</span>
                  <span className="text-2xl font-black text-[#6B21A8]">₹{cartTotal + Math.round(cartTotal * 0.05)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
              <button
                onClick={() => {
                  const finalAmount = cartTotal + Math.round(cartTotal * 0.05);
                  const options = {
                    key: 'rzp_test_1DP5mmOlF5G5ag',
                    amount: finalAmount * 100,
                    currency: 'INR',
                    name: 'Taco Tribe Menus',
                    description: 'Food Order Checkout',
                    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=128&h=128',
                    handler: function (response: any) {
                      setCart({});
                      setShowCartModal(false);
                      alert(`🎉 Order Placed Successfully!\nPayment ID: ${response.razorpay_payment_id}`);
                    },
                    prefill: {
                      name: 'Taco Tribe Member',
                      email: 'member@tacotribe.com',
                      contact: '9999999999',
                    },
                    theme: {
                      color: '#6B21A8',
                    },
                  };
                  const rzp = new (window as any).Razorpay(options);
                  rzp.open();
                }}
                className="w-full bg-[#6B21A8] hover:opacity-90 text-white font-black py-4 px-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-between shadow-xl shadow-[#6B21A8]/20"
              >
                <div className="flex flex-col items-start translate-y-0.5">
                  <span className="text-[10px] uppercase tracking-widest opacity-80 leading-none mb-1">PROCEED TO</span>
                  <span className="text-[17px] leading-none uppercase tracking-tighter">CHECKOUT</span>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt size={24} />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenusView;
