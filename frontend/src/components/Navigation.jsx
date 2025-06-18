import React from 'react';
import { MapPin, Clock, Beer, MessageCircle, ExternalLink } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'location', label: 'Location', icon: MapPin, emoji: '🗺️', color: 'from-cyan-500 to-blue-500' },
    { id: 'setlist', label: 'Setlist', icon: Clock, emoji: '🎵', color: 'from-purple-500 to-pink-500' },
    { id: 'drinks', label: 'Drinks', icon: Beer, emoji: '🍻', color: 'from-yellow-500 to-orange-500' },
    { id: 'daisy', label: 'Daisy', icon: MessageCircle, emoji: '🤖', color: 'from-pink-500 to-rose-500' },
    { id: 'links', label: 'Links', icon: ExternalLink, emoji: '🔗', color: 'from-green-500 to-teal-500' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Electric dark background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900 to-transparent opacity-95"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-yellow-500/10 to-green-500/10 blur-xl"></div>
      
      <div className="relative electric-glass border-t-4 electric-border backdrop-blur-2xl">
        <div className="flex justify-around items-center py-3 max-w-md mx-auto px-4">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 transform ${
                  isActive 
                    ? `bg-gradient-to-r ${tab.color} text-white scale-110 shadow-2xl neon-border` 
                    : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105 neon-hover'
                }`}
              >
                {/* Electric pulsing background for active tab */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-40 rounded-2xl blur animate-pulse`}></div>
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative mb-1">
                    <IconComponent className={`h-6 w-6 ${isActive ? 'animate-bounce neon-glow' : ''} transition-all duration-300`} 
                      style={isActive ? {filter: 'drop-shadow(0 0 10px currentColor)'} : {}} />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 text-xl animate-spin neon-glow" 
                        style={{filter: 'drop-shadow(0 0 8px currentColor)'}}>
                        {tab.emoji}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-bold festival-font transition-all duration-300 ${
                    isActive ? 'text-white electric-text' : 'text-gray-300'
                  }`}>
                    {tab.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 neon-blue rounded-full animate-pulse shadow-lg" 
                      style={{filter: 'drop-shadow(0 0 6px #00ffff)'}}></div>
                  )}
                </div>
                
                {/* Electric ripple effect on tap */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-0 hover:opacity-30 transition-opacity duration-300`}></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navigation;