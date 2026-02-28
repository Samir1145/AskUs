import React, { useState } from 'react';
import {
  Map,
  Share2,
  Bookmark,
  Video,
  Star,
  MapPin,
  Calendar,
  Heart,
  X
} from 'lucide-react';
import Header from '../components/Header';
import { TribeLoungeIcon } from '../components/TribeIcons';

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

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Mastering Mindset & Self-Love Workshop: Overcoming negative emotions',
    date: 'SUN, 1 MAR',
    time: '4:00 PM IST',
    type: 'Online',
    organizer: 'Happiness & Pure Love Community',
    rating: 4.4,
    attendees: 1742,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    category: 'All Events'
  },
  {
    id: '2',
    title: 'Build Autonomous AI Workers with Python & LangChain (Cohort)',
    date: 'SAT, 28 FEB',
    time: '7:00 PM IST',
    type: 'Online',
    organizer: 'NonceLabs',
    rating: 4.8,
    attendees: 850,
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    category: 'All Events'
  },
  {
    id: '3',
    title: 'Weekend Photography Walk: Capturing Urban Life',
    date: 'SAT, 28 FEB',
    time: '10:00 AM IST',
    type: 'In-person',
    organizer: 'City Snappers Group',
    rating: 4.6,
    attendees: 42,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    category: 'Hobbies'
  },
  {
    id: '4',
    title: 'Startup Networking Mixer',
    date: 'FRI, 27 FEB',
    time: '6:00 PM IST',
    type: 'In-person',
    organizer: 'Tech Founders Club',
    rating: 4.5,
    attendees: 120,
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
    category: 'Social Activities'
  }
];

const DATE_FILTERS = ['Birthdays', 'Book Launch', 'Conferences', 'Art Gallery'];

const CATEGORIES = [
  'All Events',
  'New Groups',
  'Your groups',
  'Social Activities',
  'Hobbies'
];

const EventsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDateFilter, setActiveDateFilter] = useState('Birthdays');
  const [showHostModal, setShowHostModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState(CATEGORIES[0]);
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 relative">
      <Header
        newChatLabel="Host Events"
        newChatIcon={<TribeLoungeIcon size={20} active={false} />}
        onNewChat={() => setShowHostModal(true)}
        onMenuClick={() => console.log("Menu clicked")}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-2">
          <p className="text-gray-500 dark:text-gray-400">
            Discover exclusive events, workshops, and meetups in the Tribe Lounge. Engage with your community and make new connections!
          </p>
        </div>

        {/* Sticky Bubble Tags */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {DATE_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveDateFilter(filter)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeDateFilter === filter
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Event List */}
        <div className="p-4 pb-24 flex flex-col gap-4">
          {MOCK_EVENTS.map((event) => (
            <div key={event.id} className="group flex gap-4 cursor-pointer p-2 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0">
              {/* Image Card */}
              <div className="shrink-0 w-24 h-24 overflow-hidden rounded-md shadow-sm">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex outline-none items-center gap-1.5 text-xs font-bold text-[#E55A3B] mb-1">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time.replace('IST', '').trim()}</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                    {event.organizer}
                    <br />
                    Taco Tribe Hub
                  </p>
                </div>

                <div className="flex items-center justify-end gap-4 mt-1">
                  <button className="text-[#4A5568] hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                    <Share2 size={18} strokeWidth={2} />
                  </button>
                  <button className="text-[#E55A3B] hover:opacity-80 transition-opacity">
                    <Heart size={18} strokeWidth={2} className={event.id === '1' || event.id === '4' ? "fill-[#E55A3B]" : ""} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Host Event Modal */}
      {showHostModal && (
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
                    {CATEGORIES.map(cat => (
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
                onClick={() => {
                  console.log("Submit Event Form:", {
                    title: newEventTitle,
                    category: newEventCategory,
                    date: newEventDate,
                    time: newEventTime,
                    description: newEventDescription
                  });
                  setShowHostModal(false);
                  setNewEventTitle('');
                  setNewEventDescription('');
                  setNewEventDate('');
                  setNewEventTime('');
                }}
                disabled={!newEventTitle.trim() || !newEventDate || !newEventTime}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:dark:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center shadow-lg shadow-primary/25 disabled:shadow-none"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsView;
