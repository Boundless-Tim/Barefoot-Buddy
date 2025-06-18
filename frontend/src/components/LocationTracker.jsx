import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { MapPin, Users, Eye, EyeOff } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-orange-600 flex items-center justify-center gap-2">
          <MapPin className="h-8 w-8" />
          Live Group Locator 🗺️
        </h2>
        <p className="text-gray-600">Find your crew on the beach! 🏖️</p>
      </div>

      {/* Ghost Mode Toggle */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {ghostMode ? <EyeOff className="h-5 w-5 text-purple-600" /> : <Eye className="h-5 w-5 text-purple-600" />}
              <div>
                <p className="font-semibold text-purple-800">Ghost Mode 👻</p>
                <p className="text-sm text-purple-600">Hide your location from friends</p>
              </div>
            </div>
            <Switch 
              checked={ghostMode} 
              onCheckedChange={toggleGhostMode}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Permission Status */}
      {locationPermission === 'denied' && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-red-700 font-semibold">📍 Location Permission Needed</p>
            <p className="text-red-600 text-sm mt-1">
              Enable location access to see yourself on the map and share with friends! 🤠
            </p>
            <Button 
              className="mt-3 bg-red-600 hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Try Again 🔄
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Map Placeholder */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Users className="h-5 w-5" />
            Festival Map 🗺️
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
            {/* Mock map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-cyan-200 opacity-50"></div>
            <div className="relative z-10 text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <p className="text-blue-800 font-semibold">Interactive Map Loading... 🗺️</p>
              <p className="text-blue-600 text-sm">Powered by Mapbox</p>
            </div>
            
            {/* Mock location pins */}
            <div className="absolute top-4 left-8 bg-red-500 rounded-full w-4 h-4 border-2 border-white shadow-lg animate-pulse"></div>
            <div className="absolute bottom-8 right-12 bg-green-500 rounded-full w-4 h-4 border-2 border-white shadow-lg animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 bg-yellow-500 rounded-full w-4 h-4 border-2 border-white shadow-lg animate-pulse transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Crew ({visibleUsers.length} visible) 👥
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentUser && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-orange-800">{currentUser.name} (You) 🤠</p>
                    <p className="text-sm text-orange-600">
                      {ghostMode ? 'Hidden from friends 👻' : 'Live location sharing 📍'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {ghostMode ? 'Hidden' : 'Live'}
                </Badge>
              </div>
            )}
            
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.isVisible ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      {user.isVisible ? 'Visible on map' : 'Ghost mode'} • 
                      {new Date(user.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                <Badge variant={user.isVisible ? "default" : "secondary"}>
                  {user.isVisible ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationTracker;