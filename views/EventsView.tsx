import React, { useState, useEffect } from 'react';
import {
  X, Loader2
} from 'lucide-react';
import { useRSVP } from '../contexts/RSVPContext';
import { getEvents, addEvent, FirebaseEvent } from '../services/firebaseData';

// Fallback mock data used when Firebase is not configured
const MOCK_EVENTS: FirebaseEvent[] = [
  { id: '1', title: 'Holi Fest Tricity Most Premium Holi Celebration', date: 'Wed 4 Mar 2026', time: '11:00 AM', type: 'In-person', organizer: 'Taco Tribe', rating: 4.8, attendees: 79, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200', category: 'Holi Parties' },
  { id: '2', title: 'Build Autonomous AI Workers with Python & LangChain (Cohort)', date: 'SAT, 28 FEB', time: '7:00 PM IST', type: 'Online', organizer: 'NonceLabs', rating: 4.8, attendees: 850, imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800', category: 'Tech' },
  { id: '3', title: 'Weekend Photography Walk: Capturing Urban Life', date: 'SAT, 28 FEB', time: '10:00 AM IST', type: 'In-person', organizer: 'City Snappers Group', rating: 4.6, attendees: 42, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', category: 'Hobbies' },
  { id: '4', title: 'Startup Networking Mixer', date: 'FRI, 27 FEB', time: '6:00 PM IST', type: 'In-person', organizer: 'Tech Founders Club', rating: 4.5, attendees: 120, imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800', category: 'Social Events' },
];

const CATEGORIES = [
  'All Events',
  'Workshops',
  'Tech',
  'Hobbies',
  'Social Events'
];

const EventCard: React.FC<{ event: FirebaseEvent, onClick: () => void }> = ({ event, onClick }) => {
  const { isRSVPed, toggleRSVP } = useRSVP();
  const rsvped = isRSVPed(event.id!);

  const handleBuyTicket = (e: React.MouseEvent) => {
    e.stopPropagation();
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: 49900,
      currency: 'INR',
      name: 'Taco Tribe',
      description: event.title,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=128&h=128',
      handler: function (response: any) {
        toggleRSVP(event.id!);
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

  return (
    <div
      onClick={onClick}
      className="flex bg-white dark:bg-gray-900 rounded-[24px] p-3 shadow-sm border border-gray-100 dark:border-gray-800 gap-4 mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      {/* Details Container */}
      <div className="flex-1 flex flex-col justify-between py-0.5 order-1">
        <div>
          <div className="text-[11px] font-black text-[#FF4D00] uppercase tracking-wider mb-1">
            {event.date} • {event.time.replace('IST', '').trim()}
          </div>
          <h3 className="text-[16px] font-bold text-gray-950 dark:text-white leading-tight line-clamp-2 mb-1">
            {event.title}
          </h3>
          <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {event.category}
          </p>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBuyTicket}
              className={`px-6 py-2 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${rsvped
                ? 'bg-[#6B21A8] border-2 border-[#6B21A8] text-white'
                : 'bg-white dark:bg-gray-950 border-[2px] border-[#6B21A8] text-[#6B21A8] hover:bg-[#6B21A8]/5'
                }`}
            >
              {rsvped ? '✓ BOOKED' : 'BUY TICKETS'}
            </button>
          </div>

        </div>
      </div>

      {/* Image Container */}
      <div className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-sm order-2">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

interface EventsViewProps {
  onSelectEvent: (eventId: string) => void;
  userProfile?: {
    name: string;
    avatar: string;
    membership: string;
  };
}

const EventsView: React.FC<EventsViewProps> = ({ onSelectEvent, userProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [showHostModal, setShowHostModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState(CATEGORIES[1]);
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Firebase state
  const [events, setEvents] = useState<FirebaseEvent[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Load events from Firebase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fbEvents = await getEvents();
        if (!cancelled) {
          if (fbEvents.length > 0) {
            setEvents(fbEvents);
            setFirebaseConnected(true);
          }
          // If empty, keep mock data as fallback
        }
      } catch (err) {
        console.warn('Firebase not configured, using mock data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCreateEvent = async () => {
    const newEvent: Omit<FirebaseEvent, 'id'> = {
      title: newEventTitle.trim(),
      category: newEventCategory,
      date: newEventDate,
      time: newEventTime,
      description: newEventDescription.trim(),
      type: 'In-person',
      organizer: userProfile?.name || 'Taco Tribe',
      rating: 0,
      attendees: 0,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    };

    if (firebaseConnected) {
      setSubmitting(true);
      try {
        const id = await addEvent(newEvent);
        setEvents(prev => [{ ...newEvent, id }, ...prev]);
      } catch (err) {
        console.error('Failed to create event:', err);
        alert('Failed to create event. Please try again.');
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    } else {
      // Offline fallback: add to local state
      const offlineId = 'local_' + Date.now();
      setEvents(prev => [{ ...newEvent, id: offlineId }, ...prev]);
    }

    setShowHostModal(false);
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventDate('');
    setNewEventTime('');
  };

  const filteredEvents = events
    .filter(e => activeCategory === 'All Events' || e.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">

        <div className="sticky top-0 z-30 bg-white dark:bg-gray-950 px-4 pt-6 pb-0">
          <div className="w-full flex items-center justify-between pb-4">
            <h1 className="text-4xl font-black tracking-tight text-[#0F172A] dark:text-white">
              EVENTS
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
                <pattern id="tribal-line-events" x="0" y="0" width="32" height="5" patternUnits="userSpaceOnUse">
                  <rect width="32" height="5" fill="#EAB308" />
                  <path d="M0 5 L8 0 L16 5 L24 0 L32 5" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinejoin="miter" />
                  <path d="M0 5 L4 2.5 L8 5 L12 2.5 L16 5 L20 2.5 L24 5 L28 2.5 L32 5" fill="none" stroke="#EA580C" strokeWidth="1" strokeLinejoin="miter" />
                  <circle cx="8" cy="3.5" r="0.75" fill="#6B21A8" />
                  <circle cx="24" cy="3.5" r="0.75" fill="#6B21A8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#tribal-line-events)" />
            </svg>
          </div>
        </div>

        {/* Featured Carousel */}
        <div className="px-4 py-6">
          <div className="relative w-full aspect-[8/3] rounded-[32px] overflow-hidden shadow-xl bg-gray-900 group">
            <img
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200"
              className="w-full h-full object-cover opacity-60"
              alt="Featured Event"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-transparent to-black/40">
              <p className="text-white text-[12px] font-black tracking-widest uppercase mb-2 opacity-80">General Sale Now Live</p>
              <h2 className="text-white text-3xl font-black tracking-tighter leading-none mb-1">SCORPIONS</h2>
              <p className="text-amber-400 text-[14px] font-black uppercase tracking-widest">24 APRIL • DELHI</p>
            </div>

            {/* Carousel Navigation */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
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

        {/* Event List */}
        {!loading && (
          <div className="px-4 pb-24 flex flex-col gap-1">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onSelectEvent(event.id!)}
              />
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg font-bold">No events found</p>
                <p className="text-sm mt-1">Try a different category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Host Event Modal */}
      {
        showHostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHostModal(false)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 shrink-0 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Host an Event</h2>
                <button
                  onClick={() => setShowHostModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} className="hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Secret Rooftop Taco Party"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Category</label>
                  <div className="relative">
                    <select
                      value={newEventCategory}
                      onChange={(e) => setNewEventCategory(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium cursor-pointer"
                    >
                      {CATEGORIES.filter(cat => cat !== 'All Events').map(cat => (
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
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Date</label>
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Time</label>
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description</label>
                  <textarea
                    placeholder="Tell people what to expect..."
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[100px] text-[15px] font-medium"
                  />
                </div>
              </div>

              <div className="p-4 shrink-0 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleCreateEvent}
                  disabled={!newEventTitle.trim() || !newEventDate || !newEventTime || submitting}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center shadow-lg shadow-primary/25 disabled:shadow-none"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default EventsView;
