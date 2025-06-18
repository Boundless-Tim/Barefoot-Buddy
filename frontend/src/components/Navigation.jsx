import React from 'react';
import { MapPin, Clock, Beer, MessageCircle, ExternalLink } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'location', label: 'Location', icon: MapPin, emoji: '🗺️' },
    { id: 'setlist', label: 'Setlist', icon: Clock, emoji: '🎵' },
    { id: 'drinks', label: 'Drinks', icon: Beer, emoji: '🍻' },
    { id: 'daisy', label: 'Daisy', icon: MessageCircle, emoji: '🤖' },
    { id: 'links', label: 'Links', icon: ExternalLink, emoji: '🔗' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 scale-105' 
                  : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
              }`}
            >
              <div className="relative">
                <IconComponent className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                {isActive && (
                  <div className="absolute -top-1 -right-1 text-xs animate-bounce">
                    {tab.emoji}
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium mt-1 ${
                isActive ? 'font-bold' : ''
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;