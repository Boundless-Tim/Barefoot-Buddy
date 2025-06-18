import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { MapPin, Users, Eye, EyeOff, Zap, Navigation as NavIcon } from 'lucide-react';
import { mockUsers } from '../data/mock';
import { useToast } from '../hooks/use-toast';

const LocationTracker = () => {
  const [users, setUsers] = useState(mockUsers);
  const [currentUser, setCurrentUser] = useState(null);
  const [ghostMode, setGhostMode] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if geolocation is supported
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission('granted');
          setCurrentUser({
            id: 'current',
            name: localStorage.getItem('userName') || 'You',
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            isVisible: !ghostMode,
            lastUpdate: new Date().toISOString()
          });
        },
        (error) => {
          setLocationPermission('denied');
          toast({
            title: "Location Access Needed 📍",
            description: "Darlin', I can't see ya on the map unless you let me use your location! 🤠",
            variant: "destructive"
          });
        }
      );
    }
  }, [ghostMode, toast]);

  const toggleGhostMode = () => {
    setGhostMode(!ghostMode);
    if (currentUser) {
      setCurrentUser({...currentUser, isVisible: !ghostMode});
    }
    toast({
      title: ghostMode ? "You're back on the map! 👻➡️👋" : "Ghost mode activated! 👋➡️👻", 
      description: ghostMode ? "Your friends can see you again, sugar! 🗺️" : "You're invisible to your crew now, sneaky! 😉"
    });
  };

  const visibleUsers = users.filter(user => user.isVisible);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 bounce-entrance">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 opacity-50 blur-3xl rounded-full"></div>
          <h2 className="relative text-5xl font-bold festival-font neon-blue flex items-center justify-center gap-4">
            <MapPin className="h-12 w-12 neon-blue floating" style={{filter: 'drop-shadow(0 0 15px #00ffff)'}} />
            <span className="electric-text">Live Group Locator</span>
            <span className="text-6xl floating neon-yellow" style={{animationDelay: '0.5s', filter: 'drop-shadow(0 0 15px #ffff00)'}}>🗺️</span>
          </h2>
        </div>
        <p className="text-2xl readable-text font-medium festival-font">Find your crew on the beach! 🏖️✨</p>
      </div>

      {/* Ghost Mode Toggle */}
      <Card className="electric-glass neon-border neon-hover transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 ${
                  ghostMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400'
                }`}>
                  {ghostMode ? <EyeOff className="h-8 w-8 text-white animate-pulse" /> : <Eye className="h-8 w-8 text-white animate-pulse" />}
                </div>
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce neon-glow">👻</div>
              </div>
              <div>
                <p className="text-3xl font-bold festival-font neon-yellow">Ghost Mode</p>
                <p className="text-lg readable-text font-medium">Hide your location from friends</p>
                <p className="text-sm readable-subtitle">Stay mysterious, cowboy! 🕵️</p>
              </div>
            </div>
            <div className="relative">
              <Switch 
                checked={ghostMode} 
                onCheckedChange={toggleGhostMode}
                className={`transform scale-150 ${
                  ghostMode 
                    ? 'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500' 
                    : 'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500'
                }`}
              />
              {ghostMode && (
                <div className="absolute -top-1 -right-1 text-xs animate-spin neon-green">✨</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Permission Status */}
      {locationPermission === 'denied' && (
        <Card className="electric-glass bg-gradient-to-r from-red-900/30 to-orange-900/30 border-4 border-red-400 shadow-2xl bounce-entrance neon-hover">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4 animate-bounce neon-glow" style={{filter: 'drop-shadow(0 0 15px #ff0000)'}}>📍</div>
            <p className="text-3xl font-bold festival-font neon-yellow mb-2">Location Permission Needed</p>
            <p className="text-xl readable-text mb-4 font-medium">
              Enable location access to see yourself on the map and share with friends! 🤠
            </p>
            <Button 
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-8 py-4 text-xl font-bold festival-font shadow-xl transform hover:scale-105 transition-all duration-300 neon-border"
              onClick={() => window.location.reload()}
            >
              <Zap className="h-6 w-6 mr-2" />
              Try Again 🔄
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Map Placeholder */}
      <Card className="electric-glass border-4 border-cyan-400 shadow-2xl neon-hover transform hover:scale-105 transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-4 text-3xl festival-font neon-blue">
            <Users className="h-8 w-8 neon-blue floating" style={{filter: 'drop-shadow(0 0 15px #00ffff)'}} />
            <span>Festival Map</span>
            <span className="text-4xl floating neon-green" style={{animationDelay: '0.3s', filter: 'drop-shadow(0 0 15px #00ff00)'}}>🗺️</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative electric-gradient rounded-2xl h-80 flex items-center justify-center overflow-hidden shadow-inner border-2 border-cyan-300">
            {/* Animated electric grid pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-4 w-8 h-8 neon-blue rounded-full animate-pulse" style={{filter: 'drop-shadow(0 0 10px #00ffff)'}}></div>
              <div className="absolute top-8 right-12 w-6 h-6 neon-yellow rounded-full animate-pulse" style={{animationDelay: '0.5s', filter: 'drop-shadow(0 0 10px #ffff00)'}}></div>
              <div className="absolute bottom-12 left-8 w-10 h-10 neon-green rounded-full animate-pulse" style={{animationDelay: '1s', filter: 'drop-shadow(0 0 10px #00ff00)'}}></div>
              <div className="absolute bottom-4 right-6 w-4 h-4 neon-blue rounded-full animate-pulse" style={{animationDelay: '1.5s', filter: 'drop-shadow(0 0 10px #00ffff)'}}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="text-8xl mb-4 floating neon-glow" style={{filter: 'drop-shadow(0 0 20px #00ffff)'}}>🗺️</div>
              <p className="text-3xl font-bold festival-font neon-blue mb-2">Interactive Map Loading...</p>
              <p className="text-xl readable-text font-medium">Powered by Mapbox ✨</p>
              <div className="mt-4 flex justify-center gap-2">
                <div className="w-4 h-4 neon-blue rounded-full animate-bounce" style={{filter: 'drop-shadow(0 0 5px #00ffff)'}}></div>
                <div className="w-4 h-4 neon-yellow rounded-full animate-bounce" style={{animationDelay: '0.2s', filter: 'drop-shadow(0 0 5px #ffff00)'}}></div>
                <div className="w-4 h-4 neon-green rounded-full animate-bounce" style={{animationDelay: '0.4s', filter: 'drop-shadow(0 0 5px #00ff00)'}}></div>
              </div>
            </div>
            
            {/* Mock location pins with enhanced electric animation */}
            <div className="absolute top-8 left-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-6 h-6 border-4 border-white shadow-xl animate-bounce floating neon-glow"></div>
            <div className="absolute bottom-16 right-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full w-6 h-6 border-4 border-white shadow-xl animate-bounce floating neon-glow" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-1/2 left-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-8 h-8 border-4 border-white shadow-xl animate-bounce floating neon-glow transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '1s'}}></div>
          </div>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card className="electric-glass border-4 border-yellow-400 shadow-2xl neon-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-4 text-3xl festival-font neon-yellow">
            <Users className="h-8 w-8 neon-yellow floating" style={{filter: 'drop-shadow(0 0 15px #ffff00)'}} />
            <span>Your Crew ({visibleUsers.length} visible)</span>
            <span className="text-4xl floating neon-green" style={{animationDelay: '0.7s', filter: 'drop-shadow(0 0 15px #00ff00)'}}>👥</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentUser && (
              <div className="electric-glass bg-gradient-to-r from-orange-900/40 to-yellow-900/40 rounded-2xl p-4 border-4 border-orange-300 transform hover:scale-105 transition-all duration-300 neon-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse shadow-xl flex items-center justify-center border-2 border-orange-300">
                        <NavIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 text-lg animate-bounce neon-glow">🤠</div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold festival-font neon-yellow">{currentUser.name} (You)</p>
                      <p className="text-lg readable-text font-medium">
                        {ghostMode ? 'Hidden from friends 👻' : 'Live location sharing 📍'}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-lg px-4 py-2 font-bold festival-font shadow-lg border-2 ${
                    ghostMode 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400' 
                      : 'bg-gradient-to-r from-green-500 to-teal-500 text-white border-green-400'
                  }`}>
                    {ghostMode ? 'Hidden 👻' : 'Live ⚡'}
                  </Badge>
                </div>
              </div>
            )}
            
            {users.map((user, index) => (
              <div key={user.id} className="electric-glass rounded-2xl p-4 border-2 border-cyan-200 transform hover:scale-105 transition-all duration-300 slide-up-entrance neon-hover" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 ${
                        user.isVisible 
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 animate-pulse border-green-400' 
                          : 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500'
                      }`}>
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      {user.isVisible && (
                        <div className="absolute -top-1 -right-1 text-sm animate-bounce neon-glow">✨</div>
                      )}
                    </div>
                    <div>
                      <p className="text-xl font-bold festival-font readable-text">{user.name}</p>
                      <p className="text-sm readable-subtitle font-medium">
                        {user.isVisible ? 'Visible on map 🗺️' : 'Ghost mode 👻'} • 
                        {new Date(user.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-sm px-3 py-1 font-bold festival-font shadow-lg border-2 ${
                    user.isVisible 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white border-green-400' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500'
                  }`}>
                    {user.isVisible ? 'Visible ✅' : 'Hidden 👻'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationTracker;