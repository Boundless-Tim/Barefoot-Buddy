import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { MapPin, Users, Eye, EyeOff, Zap, Navigation as NavIcon, Loader2, RefreshCcw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const LocationTracker = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [ghostMode, setGhostMode] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const userId = localStorage.getItem('userName') || 'User_' + Math.random().toString(36).substr(2, 5);

  useEffect(() => {
    initializeLocation();
    fetchGroupLocations();
    
    // Set up interval to update location every 15 seconds
    const locationInterval = setInterval(() => {
      if (currentUser && !ghostMode && locationPermission === 'granted') {
        updateLocation();
      }
    }, 15000);

    // Fetch group locations every 10 seconds
    const groupInterval = setInterval(() => {
      fetchGroupLocations();
    }, 10000);

    return () => {
      clearInterval(locationInterval);
      clearInterval(groupInterval);
    };
  }, [ghostMode]);

  const initializeLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLocationPermission('granted');
          const userLocation = {
            id: userId,
            name: userId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            isVisible: !ghostMode,
            lastUpdate: new Date().toISOString()
          };
          
          setCurrentUser(userLocation);
          
          // Send initial location to backend if not in ghost mode
          if (!ghostMode) {
            await sendLocationToBackend(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermission('denied');
          setLoading(false);
          toast({
            title: "Location Access Needed",
            description: "Enable location access to see yourself on the map and share with friends!",
            variant: "destructive"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationPermission('unsupported');
      setLoading(false);
      toast({
        title: "Geolocation Not Supported",
        description: "Your device doesn't support location tracking.",
        variant: "destructive"
      });
    }
  };

  const sendLocationToBackend = async (latitude, longitude, accuracy = 0) => {
    try {
      setUpdating(true);
      await axios.post(`${API_BASE_URL}/location/update/${userId}`, {
        latitude,
        longitude,
        accuracy,
        ghost_mode: ghostMode
      });
      
      // Update presence
      await axios.post(`${API_BASE_URL}/presence/${userId}`, {
        online: true
      });
      
      console.log('Location updated successfully');
    } catch (error) {
      console.error('Error sending location to backend:', error);
    } finally {
      setUpdating(false);
    }
  };

  const fetchGroupLocations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/location/group/default`, {
        params: { exclude_user: userId }
      });
      
      const locations = response.data.locations || {};
      const usersArray = Object.entries(locations).map(([id, location]) => ({
        id,
        name: id,
        lat: location.latitude,
        lng: location.longitude,
        isVisible: !location.ghost_mode,
        lastUpdate: new Date(location.timestamp).toISOString(),
        accuracy: location.accuracy || 0
      }));
      
      setUsers(usersArray);
    } catch (error) {
      console.error('Error fetching group locations:', error);
      // Keep existing users array if fetch fails
    }
  };

  const updateLocation = () => {
    if ("geolocation" in navigator && locationPermission === 'granted') {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const updatedUser = {
            ...currentUser,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            lastUpdate: new Date().toISOString()
          };
          setCurrentUser(updatedUser);
          
          if (!ghostMode) {
            await sendLocationToBackend(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
          }
        },
        (error) => {
          console.error('Error updating location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    }
  };

  const toggleGhostMode = async () => {
    try {
      const newGhostMode = !ghostMode;
      setGhostMode(newGhostMode);
      
      // Update backend
      await axios.post(`${API_BASE_URL}/location/ghost-mode/${userId}`, {
        ghost_mode: newGhostMode
      });
      
      if (currentUser) {
        setCurrentUser({...currentUser, isVisible: !newGhostMode});
        
        // If turning off ghost mode, send current location
        if (!newGhostMode && locationPermission === 'granted') {
          updateLocation();
        }
      }
      
      toast({
        title: newGhostMode ? "Ghost mode activated! 👻" : "You're back on the map! 📍",
        description: newGhostMode 
          ? "You're now invisible to other users" 
          : "Your friends can see you again!",
        duration: 3000
      });
    } catch (error) {
      console.error('Error toggling ghost mode:', error);
      toast({
        title: "Oops! 😅",
        description: "Couldn't update ghost mode. Try again!",
        variant: "destructive"
      });
    }
  };

  const formatCoordinates = (lat, lng) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getTimeSince = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 bounce-entrance">
          <h2 className="text-3xl font-bold festival-font neon-blue">Group Locator</h2>
          <p className="text-base readable-text">Getting your location...</p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin neon-blue" />
        </div>
      </div>
    );
  }

  const visibleUsers = users.filter(user => user.isVisible);
  const ghostUsers = users.filter(user => !user.isVisible);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 bounce-entrance">
        <h2 className="text-3xl font-bold festival-font neon-blue flex items-center justify-center gap-3">
          <NavIcon className="h-8 w-8 neon-blue icon-glow" />
          Group Locator
        </h2>
        <p className="text-base readable-text">Find your festival crew in real-time</p>
      </div>

      {/* Location Permission Status */}
      {locationPermission === 'denied' && (
        <Card className="electric-glass border-2 border-red-400 neon-border">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold readable-text mb-2">Location Access Needed</h3>
            <p className="readable-subtitle mb-4">
              Please enable location access in your browser settings to use this feature.
            </p>
            <Button onClick={initializeLocation} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400">
              <MapPin className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current User Status */}
      {currentUser && (
        <Card className="electric-glass border-2 border-green-400 neon-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg festival-font neon-green">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${ghostMode ? 'bg-purple-400' : 'bg-green-400'} animate-pulse`}></div>
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-2">
                {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={updateLocation}
                  disabled={updating || ghostMode}
                  className="text-gray-400 hover:text-white"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold readable-text">{currentUser.name}</p>
                  <p className="text-sm readable-subtitle">
                    {formatCoordinates(currentUser.lat, currentUser.lng)}
                  </p>
                  <p className="text-xs readable-subtitle">
                    Accuracy: ±{Math.round(currentUser.accuracy || 0)}m • {getTimeSince(currentUser.lastUpdate)}
                  </p>
                </div>
                <Badge className={`${ghostMode ? 'bg-purple-600' : 'bg-green-600'} text-white`}>
                  {ghostMode ? 'Ghost Mode' : 'Visible'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                <div className="flex items-center gap-3">
                  {ghostMode ? <EyeOff className="h-5 w-5 text-purple-400" /> : <Eye className="h-5 w-5 text-green-400" />}
                  <span className="readable-text">
                    {ghostMode ? 'You are invisible to friends' : 'Friends can see your location'}
                  </span>
                </div>
                <Switch
                  checked={ghostMode}
                  onCheckedChange={toggleGhostMode}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Festival Map */}
      <Card className="electric-glass border-2 border-cyan-400 neon-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg festival-font neon-cyan">Festival Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative rounded-xl h-64 overflow-hidden border border-cyan-300">
            {MAPBOX_TOKEN ? (
              <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{
                  longitude: currentUser ? currentUser.lng : -74.8157, // Wildwood, NJ
                  latitude: currentUser ? currentUser.lat : 39.0056,
                  zoom: currentUser ? 16 : 14
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
              >
                {/* Current User Marker */}
                {currentUser && !ghostMode && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -100%)',
                      zIndex: 10
                    }}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 bg-red-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
                      <div className="absolute -top-2 -left-2 w-10 h-10 bg-red-500/30 rounded-full animate-ping"></div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        You
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Other Users Markers */}
                {visibleUsers.map((user, index) => (
                  <div
                    key={user.id}
                    style={{
                      position: 'absolute',
                      left: `${50 + (index * 10)}%`,
                      top: `${40 + (index * 15)}%`,
                      transform: 'translate(-50%, -100%)',
                      zIndex: 5
                    }}
                  >
                    <div className="relative">
                      <div className={`w-5 h-5 border-2 border-white rounded-full shadow-lg ${
                        index % 3 === 0 ? 'bg-green-500' : index % 3 === 1 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {user.name}
                      </div>
                    </div>
                  </div>
                ))}
              </Map>
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-bold neon-cyan">Map Unavailable</p>
                  <p className="text-sm readable-subtitle">Mapbox token not configured</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Group Members */}
      <Card className="electric-glass border-2 border-yellow-400 neon-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg festival-font neon-yellow flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 icon-glow" />
              <span>Group Members</span>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              {users.length + (currentUser ? 1 : 0)} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold neon-green">{visibleUsers.length + (currentUser && !ghostMode ? 1 : 0)}</div>
                <div className="text-xs readable-subtitle">Visible</div>
              </div>
              <div>
                <div className="text-2xl font-bold neon-purple">{ghostUsers.length + (currentUser && ghostMode ? 1 : 0)}</div>
                <div className="text-xs readable-subtitle">Ghost Mode</div>
              </div>
              <div>
                <div className="text-2xl font-bold neon-blue">{users.length + (currentUser ? 1 : 0)}</div>
                <div className="text-xs readable-subtitle">Total</div>
              </div>
            </div>

            {/* Visible Users */}
            {visibleUsers.length > 0 && (
              <div>
                <h4 className="text-sm font-bold readable-text mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-400" />
                  Visible Members ({visibleUsers.length})
                </h4>
                <div className="space-y-2">
                  {visibleUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                      <div>
                        <p className="font-bold readable-text">{user.name}</p>
                        <p className="text-xs readable-subtitle">
                          {formatCoordinates(user.lat, user.lng)}
                        </p>
                        <p className="text-xs readable-subtitle">
                          {getTimeSince(user.lastUpdate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <Badge className="bg-green-600 text-white text-xs">Online</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ghost Users */}
            {ghostUsers.length > 0 && (
              <div>
                <h4 className="text-sm font-bold readable-text mb-2 flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-purple-400" />
                  Ghost Mode ({ghostUsers.length})
                </h4>
                <div className="space-y-2">
                  {ghostUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 opacity-60">
                      <div>
                        <p className="font-bold readable-text">{user.name}</p>
                        <p className="text-xs readable-subtitle">Location hidden</p>
                        <p className="text-xs readable-subtitle">
                          {getTimeSince(user.lastUpdate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                        <Badge className="bg-purple-600 text-white text-xs">Ghost</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Members */}
            {users.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="readable-subtitle">No other group members online</p>
                <p className="text-xs readable-subtitle mt-1">
                  Share your location to connect with friends!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationTracker;