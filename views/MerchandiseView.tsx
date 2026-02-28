import React, { useState } from 'react';
import { ShoppingBag, Star, Tag } from 'lucide-react';
import Header from '../components/Header';

const APPAREL = [
    { id: 'ap1', name: 'TacoTribe Premium T-Shirt', price: '₹599', rating: 4.5, image: '👕', tag: 'Bestseller' },
    { id: 'ap2', name: 'TacoTribe Logo Hoodie', price: '₹1,299', rating: 4.8, image: '🧥', tag: 'New' },
    { id: 'ap3', name: 'Vintage Wash Tee', price: '₹699', rating: 4.3, image: '👕', tag: null },
    { id: 'ap4', name: 'Original Crewneck', price: '₹1,099', rating: 4.6, image: '🧥', tag: 'Popular' },
];

const ACCESSORIES = [
    { id: 'ac1', name: 'TacoTribe Canvas Tote', price: '₹399', rating: 4.6, image: '👜', tag: 'Popular' },
    { id: 'ac2', name: 'Minimalist Cap', price: '₹499', rating: 4.2, image: '🧢', tag: null },
    { id: 'ac3', name: 'Phone Case', price: '₹349', rating: 4.4, image: '📱', tag: 'New' },
    { id: 'ac4', name: 'TacoTribe Sticker Pack', price: '₹149', rating: 4.2, image: '🏷️', tag: null },
];

const ART_PRINTS = [
    { id: 'ar1', name: 'Abstract Taco Poster', price: '₹299', rating: 4.9, image: '🖼️', tag: 'Bestseller' },
    { id: 'ar2', name: 'Framed Typography Map', price: '₹899', rating: 4.7, image: '🖼️', tag: 'New' },
];

const BOOKS = [
    { id: 'bk1', name: 'The Taco Cookbook', price: '₹799', rating: 4.8, image: '📚', tag: 'Bestseller' },
    { id: 'bk2', name: 'History of the Tribe', price: '₹499', rating: 4.5, image: '📖', tag: null },
];

const MerchandiseView: React.FC = () => {
    const [activeTag, setActiveTag] = useState<string>('Taco Accessories');

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950">
            <Header
                newChatLabel="Marketplace"
                onNewChat={() => console.log("Cart clicked")}
                onMenuClick={() => console.log("Menu clicked")}
            />

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24">
                {/* Sticky Categories */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {['Taco Accessories', 'Taco Art', 'Taco Books'].map((cat) => (
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

                {/* Products Sections */}
                {activeTag === 'Taco Accessories' && (
                    <div className="px-4 py-6">
                        <div className="grid grid-cols-2 gap-3">
                            {ACCESSORIES.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow group cursor-pointer"
                                >
                                    <div className="relative bg-gray-100 dark:bg-gray-800 h-32 flex items-center justify-center">
                                        <span className="text-5xl group-hover:scale-110 transition-transform">{product.image}</span>
                                        {product.tag && (
                                            <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${product.tag === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                                product.tag === 'Bestseller' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                }`}>
                                                {product.tag}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-sm font-bold text-primary">{product.price}</span>
                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTag === 'Taco Art' && (
                    <div className="px-4 py-6">
                        <div className="grid grid-cols-2 gap-3">
                            {ART_PRINTS.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow group cursor-pointer"
                                >
                                    <div className="relative bg-gray-100 dark:bg-gray-800 h-32 flex items-center justify-center">
                                        <span className="text-5xl group-hover:scale-110 transition-transform">{product.image}</span>
                                        {product.tag && (
                                            <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${product.tag === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                                product.tag === 'Bestseller' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                }`}>
                                                {product.tag}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-sm font-bold text-primary">{product.price}</span>
                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTag === 'Taco Books' && (
                    <div className="px-4 py-6">
                        <div className="grid grid-cols-2 gap-3">
                            {BOOKS.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow group cursor-pointer"
                                >
                                    <div className="relative bg-gray-100 dark:bg-gray-800 h-32 flex items-center justify-center">
                                        <span className="text-5xl group-hover:scale-110 transition-transform">{product.image}</span>
                                        {product.tag && (
                                            <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${product.tag === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                                product.tag === 'Bestseller' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                                }`}>
                                                {product.tag}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-sm font-bold text-primary">{product.price}</span>
                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MerchandiseView;
