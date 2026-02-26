import React, { useState } from 'react';
import { Chat, Message } from '../types';
import { ArrowLeft, FileText, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface MediaGalleryViewProps {
  chat: Chat;
  onBack: () => void;
}

type GalleryTab = 'Images' | 'Links' | 'Docs';

const MediaGalleryView: React.FC<MediaGalleryViewProps> = ({ chat, onBack }) => {
  const [activeTab, setActiveTab] = useState<GalleryTab>('Images');

  // Helper to extract links from text
  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  // Filter content based on active tab
  const mediaMessages = chat.messages.filter(m => m.image);
  const docMessages = chat.messages.filter(m => m.isReport);
  const linkMessages = chat.messages.filter(m => extractLinks(m.text).length > 0);

  const renderMediaGrid = () => (
    <div className="grid grid-cols-3 gap-1 p-1">
      {mediaMessages.length === 0 ? (
        <div className="col-span-3 text-center py-10 text-gray-400 text-sm">No images shared</div>
      ) : (
        mediaMessages.map((msg) => (
          <div key={msg.id} className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer group">
            <img 
              src={msg.image} 
              alt="Shared media" 
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            />
          </div>
        ))
      )}
    </div>
  );

  const renderDocsList = () => (
    <div className="divide-y divide-gray-100">
      {docMessages.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No documents shared</div>
      ) : (
        docMessages.map((msg) => (
          <div key={msg.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{msg.text}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(msg.timestamp).toLocaleDateString()} • PDF
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderLinksList = () => (
    <div className="divide-y divide-gray-100">
      {linkMessages.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No links shared</div>
      ) : (
        linkMessages.map((msg) => {
          const links = extractLinks(msg.text);
          return links.map((link, idx) => (
            <div key={`${msg.id}-${idx}`} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
               <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                 <LinkIcon size={20} />
               </div>
               <div className="flex-1 min-w-0">
                 <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 truncate block hover:underline">
                    {link}
                 </a>
                 <p className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.text.replace(link, '').trim() || 'Shared link'}</p>
               </div>
               <ExternalLink size={16} className="text-gray-300 shrink-0" />
            </div>
          ));
        })
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={onBack} className="p-1 -ml-1 text-primary flex items-center gap-1 hover:bg-gray-50 rounded-lg transition-colors">
            <ArrowLeft size={24} />
            <span className="text-lg font-medium">Back</span>
          </button>
          <button className="text-primary text-lg font-medium">Select</button>
        </div>
        
        {/* Segmented Control */}
        <div className="flex px-4 pb-0">
          {['Images', 'Links', 'Docs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as GalleryTab)}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wide relative transition-colors ${
                activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-white">
        {activeTab === 'Images' && renderMediaGrid()}
        {activeTab === 'Links' && renderLinksList()}
        {activeTab === 'Docs' && renderDocsList()}
      </main>
      
      {activeTab === 'Images' && mediaMessages.length > 0 && (
          <div className="p-4 text-center text-xs text-gray-400 bg-gray-50">
             {mediaMessages.length} Photos
          </div>
      )}
    </div>
  );
};

export default MediaGalleryView;