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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 blur-3xl rounded-full"></div>
          <h2 className="relative text-5xl font-bold festival-font gradient-text flex items-center justify-center gap-4">
            <MapPin className="h-12 w-12 text-blue-500 floating" />
            <span className="glow-text">Live Group Locator</span>
            <span className="text-6xl floating" style={{animationDelay: '0.5s'}}>🗺️</span>
          </h2>
        </div>
        <p className="text-xl text-gray-700 font-medium festival-font">Find your crew on the beach! 🏖️✨</p>
      </div>

      {/* Ghost Mode Toggle */}
      <Card className="glass-effect neon-border bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-2xl transform hover:scale-105 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${
                  ghostMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                  {ghostMode ? <EyeOff className="h-8 w-8 text-white animate-pulse" /> : <Eye className="h-8 w-8 text-white animate-pulse" />}
                </div>
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">👻</div>
              </div>
              <div>
                <p className="text-2xl font-bold festival-font gradient-text">Ghost Mode</p>
                <p className="text-lg text-gray-600 font-medium">Hide your location from friends</p>
                <p className="text-sm text-gray-500">Stay mysterious, cowboy! 🕵️</p>
              </div>
            </div>
            <div className="relative">
              <Switch 
                checked={ghostMode} 
                onCheckedChange={toggleGhostMode}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 transform scale-150"
              />
              {ghostMode && (
                <div className="absolute -top-1 -right-1 text-xs animate-spin">✨</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Permission Status */}
      {locationPermission === 'denied' && (
        <Card className="glass-effect bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400 shadow-2xl bounce-entrance">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4 animate-bounce">📍</div>
            <p className="text-2xl font-bold festival-font text-red-700 mb-2">Location Permission Needed</p>
            <p className="text-lg text-red-600 mb-4 font-medium">
              Enable location access to see yourself on the map and share with friends! 🤠
            </p>
            <Button 
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 text-lg font-bold festival-font shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() => window.location.reload()}
            >
              <Zap className="h-6 w-6 mr-2" />
              Try Again 🔄
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Map Placeholder */}
      <Card className="glass-effect bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-400 shadow-2xl transform hover:scale-105 transition-all duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-4 text-3xl festival-font gradient-text">
            <Users className="h-8 w-8 text-blue-600 floating" />
            <span>Festival Map</span>
            <span className="text-4xl floating" style={{animationDelay: '0.3s'}}>🗺️</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-blue-200 to-cyan-200 rounded-2xl h-80 flex items-center justify-center overflow-hidden shadow-inner">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-4 w-8 h-8 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-6 h-6 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-12 left-8 w-10 h-10 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-4 right-6 w-4 h-4 bg-cyan-300 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="text-8xl mb-4 floating">🗺️</div>
              <p className="text-2xl font-bold festival-font text-blue-800 mb-2">Interactive Map Loading...</p>
              <p className="text-lg text-blue-600 font-medium">Powered by Mapbox ✨</p>
              <div className="mt-4 flex justify-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
            
            {/* Mock location pins with enhanced animation */}
            <div className="absolute top-8 left-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-6 h-6 border-4 border-white shadow-xl animate-bounce floating"></div>
            <div className="absolute bottom-16 right-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full w-6 h-6 border-4 border-white shadow-xl animate-bounce floating" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-1/2 left-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-8 h-8 border-4 border-white shadow-xl animate-bounce floating transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '1s'}}></div>
          </div>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card className="glass-effect bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-2 border-orange-400 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-4 text-3xl festival-font gradient-text">
            <Users className="h-8 w-8 text-orange-600 floating" />
            <span>Your Crew ({visibleUsers.length} visible)</span>
            <span className="text-4xl floating" style={{animationDelay: '0.7s'}}>👥</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentUser && (
              <div className="glass-effect bg-gradient-to-r from-orange-400/30 to-yellow-400/30 rounded-2xl p-4 border-2 border-orange-300 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-pulse shadow-xl flex items-center justify-center">
                        <NavIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 text-lg animate-bounce">🤠</div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold festival-font text-orange-800">{currentUser.name} (You)</p>
                      <p className="text-lg text-orange-600 font-medium">
                        {ghostMode ? 'Hidden from friends 👻' : 'Live location sharing 📍'}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-lg px-4 py-2 font-bold festival-font ${
                    ghostMode ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                  } shadow-lg`}>
                    {ghostMode ? 'Hidden 👻' : 'Live ⚡'}
                  </Badge>
                </div>
              </div>
            )}
            
            {users.map((user, index) => (
              <div key={user.id} className="glass-effect bg-white/20 rounded-2xl p-4 border border-gray-200 transform hover:scale-105 transition-all duration-300 slide-up-entrance" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center ${
                        user.isVisible 
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 animate-pulse' 
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                      }`}>
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      {user.isVisible && (
                        <div className="absolute -top-1 -right-1 text-sm animate-bounce">✨</div>
                      )}
                    </div>
                    <div>
                      <p className="text-xl font-bold festival-font text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600 font-medium">
                        {user.isVisible ? 'Visible on map 🗺️' : 'Ghost mode 👻'} • 
                        {new Date(user.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-sm px-3 py-1 font-bold festival-font shadow-lg ${
                    user.isVisible 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
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