import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface FranchiseViewProps {
    onBack: () => void;
}

const FranchiseView: React.FC<FranchiseViewProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-[100dvh] bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-4 flex items-center border-b border-gray-100 dark:border-gray-800 shadow-sm">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </button>
                <div className="h-6 flex-1 flex justify-center items-center">
                    <img src="/taco-tribe-logo.png" alt="Taco Tribe" className="h-[40px] w-auto object-contain" />
                </div>
                <div className="w-8"></div>
            </div>

            {/* Simple Hero Section */}
            <div className="px-6 py-10 text-center">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                    Own a <span className="text-primary">Taco Tribe</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Join our rapidly growing community. Fill out the form below to receive our Franchise Disclosure Document and start your journey with the Tribe!
                </p>
            </div>

            {/* Inquiry Form */}
            <div className="px-6 pb-16">
                <form className="max-w-md mx-auto space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-bold mb-2">Full Name</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Jane Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Email</label>
                        <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="jane@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Phone Number</label>
                        <input type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="(555) 123-4567" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Liquid Capital Available</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                            <option>Under $50,000</option>
                            <option>$50,000 - $100,000</option>
                            <option>$100,000 - $250,000</option>
                            <option>$250,000+</option>
                        </select>
                    </div>
                    <button type="button" className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 hover:opacity-90 transition-opacity">
                        Request Free Info
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FranchiseView;
