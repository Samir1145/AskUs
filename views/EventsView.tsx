import React, { useState } from 'react';
import { 
  Map, 
  Share2, 
  Bookmark, 
  Video, 
  Star, 
  MapPin,
  Calendar
} from 'lucide-react';
import Header from '../components/Header';

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

const DATE_FILTERS = ['Upcoming', 'Today', 'Tomorrow', 'Weekend'];

const CATEGORIES = [
  'All Events',
  'New Groups',
  'Your groups',
  'Social Activities',
  'Hobbies'
];

const EventsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDateFilter, setActiveDateFilter] = useState('Upcoming');
  const [activeCategory, setActiveCategory] = useState('All Events');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
      <Header 
        onSearch={setSearchQuery} 
        placeholder="Search events or groups..." 
        newChatLabel="Event"
        onNewChat={() => console.log("New Event clicked")}
        onMenuClick={() => console.log("Menu clicked")}
      />

      {/* Date Filters */}
      <div className="px-4 py-2 bg-white dark:bg-gray-900 sticky top-[120px] z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {DATE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveDateFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeDateFilter === filter
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 bg-gray-50 dark:bg-gray-900">
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="group cursor-pointer bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Image Card */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 shadow-sm">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                  <Share2 size={18} strokeWidth={2.5} />
                </button>
                <button className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                  <Bookmark size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2 px-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                {event.title}
              </h3>
              
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <span>{event.date}</span>
                <span>•</span>
                <span>{event.time}</span>
              </div>

              <div className="flex items-center gap-2">
                {event.type === 'Online' ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                    <Video size={14} />
                    Online event
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">
                    <MapPin size={14} />
                    In-person
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                by {event.organizer}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1">
                    <Star size={16} className="text-red-500 fill-red-500" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{event.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i + 10 + parseInt(event.id)}`} alt="Attendee" />
                            </div>
                        ))}
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {event.attendees.toLocaleString()} going
                    </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Map Button */}
      <div className="absolute bottom-24 right-4 z-20">
        <button className="w-14 h-14 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-gray-100 dark:border-gray-700">
          <Map size={24} />
        </button>
      </div>
    </div>
  );
};

export default EventsView;
