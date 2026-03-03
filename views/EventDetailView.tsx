import React from 'react';
import { ChevronLeft, Share2, Calendar, Clock, Hourglass, Users, Globe, MapPin, Navigation, ThumbsUp, Info } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    type: 'Online' | 'In-person';
    organizer: string;
    rating: number;
    attendees: number;
    imageUrl: string;
    category: string;
}

interface EventDetailViewProps {
    event: Event;
    onBack: () => void;
}

const EventDetailView: React.FC<EventDetailViewProps> = ({ event, onBack }) => {
    const [booked, setBooked] = React.useState(false);

    const handleBuyTicket = () => {
        const options = {
            key: 'rzp_test_1DP5mmOlF5G5ag',
            amount: 100000,
            currency: 'INR',
            name: 'Taco Tribe',
            description: event.title,
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=128&h=128',
            handler: function (response: any) {
                setBooked(true);
                alert(`🎉 Ticket booked!\nPayment ID: ${response.razorpay_payment_id}`);
            },
            prefill: {
                name: 'Taco Tribe Member',
                email: 'member@tacotribe.com',
                contact: '9999999999',
            },
            theme: {
                color: '#6B21A8',
            },
            modal: {
                ondismiss: function () {
                    console.log('Payment modal dismissed');
                },
            },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    };

    const handleShare = async () => {
        const shareData = {
            title: event.title,
            text: `Check out this event: ${event.title} on ${event.date} at ${event.time}`,
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
                        {event.title}
                    </h1>
                </div>
                <button
                    onClick={handleShare}
                    className="p-2 hover:bg-[#6B21A8]/10 rounded-full transition-colors shrink-0"
                >
                    <Share2 size={20} className="text-[#6B21A8]" />
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-32">
                {/* Banner Image */}
                <div className="w-full aspect-video relative">
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="px-5 py-6 space-y-6">
                    {/* Category Tag */}
                    <div className="flex">
                        <span className="bg-[#6B21A8] text-white text-[11px] font-bold px-3 py-1 rounded">
                            {event.category}
                        </span>
                    </div>

                    {/* Interested Section */}
                    <div className="bg-[#6B21A8]/5 dark:bg-[#6B21A8]/10 rounded-xl p-4 flex items-center justify-between border border-[#6B21A8]/20 dark:border-[#6B21A8]/30">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#EA580C] rounded-full flex items-center justify-center">
                                    <ThumbsUp size={12} className="text-white fill-white" />
                                </div>
                                <span className="text-[15px] font-bold text-gray-900 dark:text-white">
                                    {event.attendees} are interested
                                </span>
                            </div>
                            <p className="text-[12px] text-gray-500 font-medium">
                                Mark interested to know more about this event.
                            </p>
                        </div>
                        <button className="px-4 py-1.5 border border-[#EA580C] text-[#EA580C] text-[13px] font-bold rounded-lg hover:bg-[#EA580C]/5 transition-colors">
                            Interested?
                        </button>
                    </div>

                    {/* Event Metadata */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#6B21A8]/10 dark:bg-[#6B21A8]/20 rounded-full flex items-center justify-center shrink-0">
                                <Calendar size={20} className="text-[#6B21A8]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-gray-900 dark:text-white">
                                    {event.date}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#6B21A8]/10 dark:bg-[#6B21A8]/20 rounded-full flex items-center justify-center shrink-0">
                                <Clock size={20} className="text-[#6B21A8]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-gray-900 dark:text-white">
                                    {event.time}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#EAB308]/10 dark:bg-[#EAB308]/20 rounded-full flex items-center justify-center shrink-0">
                                <Hourglass size={20} className="text-[#EAB308]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-gray-900 dark:text-white">
                                    4 Hours
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#EA580C]/10 dark:bg-[#EA580C]/20 rounded-full flex items-center justify-center shrink-0">
                                <Users size={20} className="text-[#EA580C]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-gray-900 dark:text-white">
                                    All age groups
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#6B21A8]/10 dark:bg-[#6B21A8]/20 rounded-full flex items-center justify-center shrink-0">
                                <Globe size={20} className="text-[#6B21A8]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-gray-900 dark:text-white">
                                    English, Hindi, Punjabi
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-[#DC2626]/10 dark:bg-[#DC2626]/20 rounded-full flex items-center justify-center shrink-0">
                                <MapPin size={20} className="text-[#DC2626]" />
                            </div>
                            <div className="flex flex-1 justify-between items-start">
                                <span className="text-[15px] font-bold text-gray-900 dark:text-white leading-snug">
                                    Forest Hill Golf and Country Club Resort: Mohali
                                </span>
                                <Navigation size={20} className="text-primary ml-2 shrink-0" />
                            </div>
                        </div>
                    </div>

                    {/* Yellow Banner */}
                    <div className="bg-[#EAB308]/10 dark:bg-[#EAB308]/15 p-4 rounded-xl flex items-center gap-3 border border-[#EAB308]/30">
                        <Info size={20} className="text-[#EAB308]" />
                        <span className="text-[14px] font-bold text-gray-900 dark:text-[#EAB308]">
                            Bookings are filling fast for Chandigarh
                        </span>
                    </div>

                    {/* About Section */}
                    <div className="pt-4">
                        <h3 className="text-[20px] font-black text-gray-900 dark:text-white mb-4">
                            About The Event
                        </h3>
                        <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                            Join us for the most premium Holi celebration in the Tricity area! Experience a vibrant day filled with colors, music, and unforgettable memories at Forest Hill. From live DJ sets to organic colors, we've got everything to make your Holi special.
                        </p>
                    </div>

                    {/* Pricing and Action Bar (Part of the page) */}
                    <div className="pt-8 pb-10 flex items-center justify-between border-t border-[#6B21A8]/15 dark:border-[#6B21A8]/20">
                        <div className="flex flex-col">
                            <span className="text-[18px] font-black text-gray-900 dark:text-white leading-none">
                                ₹1000 onwards
                            </span>
                            <span className="text-[13px] font-bold text-[#EA580C] mt-1">
                                Filling Fast
                            </span>
                        </div>
                        <button
                            onClick={handleBuyTicket}
                            className={`px-10 py-3.5 rounded-xl font-black text-[16px] shadow-lg transition-all active:scale-95 ${booked
                                ? 'bg-[#6B21A8] border-2 border-[#6B21A8] text-white shadow-[#6B21A8]/20'
                                : 'bg-white dark:bg-gray-950 border-[2px] border-[#6B21A8] text-[#6B21A8] hover:bg-[#6B21A8]/5 shadow-[#6B21A8]/10'
                                }`}
                        >
                            {booked ? '✓ BOOKED' : 'BUY TICKET'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailView;
