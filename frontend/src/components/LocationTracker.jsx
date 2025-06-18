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
            title: "Location Access Needed",
            description: "Enable location access to see yourself on the map and share with friends!",
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
      title: ghostMode ? "You're back on the map!" : "Ghost mode activated!", 
      description: ghostMode ? "Your friends can see you again!" : "You're invisible to your crew now"
    });
  };

  const visibleUsers = users.filter(user => user.isVisible);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 bounce-entrance">
        <h2 className="text-4xl font-bold festival-font neon-blue flex items-center justify-center gap-3">
          <MapPin className="h-10 w-10 icon-glow" />
          <span>Live Group Locator</span>
        </h2>
        <p className="text-lg readable-text font-medium">Find your crew on the beach!</p>
      </div>

      {/* Ghost Mode Toggle */}
      <Card className="electric-glass neon-border neon-hover">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-2 ${
                  ghostMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400'
                }`}>
                  {ghostMode ? <EyeOff className="h-7 w-7 text-white" /> : <Eye className="h-7 w-7 text-white" />}
                </div>
                <div className="absolute -top-1 -right-1 text-lg animate-bounce">👻</div>
              </div>
              <div>
                <p className="text-2xl font-bold festival-font neon-yellow">Ghost Mode</p>
                <p className="text-base readable-text">Hide your location from friends</p>
                <p className="text-sm readable-subtitle">Stay mysterious, cowboy!</p>
              </div>
            </div>
            <div className="relative">
              <Switch 
                checked={ghostMode} 
                onCheckedChange={toggleGhostMode}
                className="transform scale-125"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Permission Status */}
      {locationPermission === 'denied' && (
        <Card className="electric-glass bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-400 bounce-entrance neon-hover">
          <CardContent className="p-6 text-center">
            <div className="text-5xl mb-3">📍</div>
            <p className="text-2xl font-bold festival-font neon-yellow mb-2">Location Permission Needed</p>
            <p className="text-lg readable-text mb-4">
              Enable location access to see yourself on the map and share with friends!
            </p>
            <Button 
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-6 py-3 text-lg font-bold festival-font shadow-xl neon-border"
              onClick={() => window.location.reload()}
            >
              <Zap className="h-5 w-5 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Map Placeholder */}
      <Card className="electric-glass border-2 border-cyan-400 shadow-2xl neon-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl festival-font neon-blue">
            <Users className="h-7 w-7 icon-glow" />
            <span>Festival Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative electric-gradient rounded-2xl h-72 flex items-center justify-center overflow-hidden shadow-inner border-2 border-cyan-300">
            {/* Animated electric grid pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-6 h-6 neon-blue rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-4 h-4 neon-yellow rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-12 left-8 w-8 h-8 neon-green rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-4 right-6 w-3 h-3 neon-blue rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="text-6xl mb-3">🗺️</div>
              <p className="text-2xl font-bold festival-font neon-blue mb-2">Interactive Map Loading...</p>
              <p className="text-lg readable-text">Powered by Mapbox</p>
              <div className="mt-3 flex justify-center gap-2">
                <div className="w-3 h-3 neon-blue rounded-full animate-bounce"></div>
                <div className="w-3 h-3 neon-yellow rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 neon-green rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
            
            {/* Mock location pins */}
            <div className="absolute top-8 left-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-5 h-5 border-2 border-white shadow-xl animate-bounce floating"></div>
            <div className="absolute bottom-16 right-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full w-5 h-5 border-2 border-white shadow-xl animate-bounce floating" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-1/2 left-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-6 h-6 border-2 border-white shadow-xl animate-bounce floating transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '1s'}}></div>
          </div>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card className="electric-glass border-2 border-yellow-400 shadow-2xl neon-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl festival-font neon-yellow">
            <Users className="h-7 w-7 icon-glow" />
            <span>Your Crew ({visibleUsers.length} visible)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentUser && (
              <div className="electric-glass bg-gradient-to-r from-orange-900/40 to-yellow-900/40 rounded-xl p-4 border-2 border-orange-300 neon-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-xl flex items-center justify-center border-2 border-orange-300">
                        <NavIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 text-sm">🤠</div>
                    </div>
                    <div>
                      <p className="text-xl font-bold festival-font neon-yellow">{currentUser.name} (You)</p>
                      <p className="text-sm readable-text">
                        {ghostMode ? 'Hidden from friends' : 'Live location sharing'}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-sm px-3 py-1 font-bold festival-font border ${
                    ghostMode 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400' 
                      : 'bg-gradient-to-r from-green-500 to-teal-500 text-white border-green-400'
                  }`}>
                    {ghostMode ? 'Hidden' : 'Live'}
                  </Badge>
                </div>
              </div>
            )}
            
            {users.map((user, index) => (
              <div key={user.id} className="electric-glass rounded-xl p-3 border border-cyan-200 neon-hover slide-up-entrance" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center border ${
                        user.isVisible 
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 border-green-400' 
                          : 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500'
                      }`}>
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold festival-font readable-text">{user.name}</p>
                      <p className="text-xs readable-subtitle">
                        {user.isVisible ? 'Visible on map' : 'Ghost mode'} • 
                        {new Date(user.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs px-2 py-1 font-bold festival-font border ${
                    user.isVisible 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white border-green-400' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-500'
                  }`}>
                    {user.isVisible ? 'Visible' : 'Hidden'}
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