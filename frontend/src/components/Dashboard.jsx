import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sun, 
  Cloud, 
  Wind, 
  Eye, 
  MapPin, 
  Clock, 
  MessageCircle, 
  ExternalLink,
  Users,
  Beer,
  Star,
  Timer,
  Navigation,
  Thermometer
} from 'lucide-react';
import { mockWeather, mockArtists, mockDrinkRound, mockUsers } from '../data/mock';

const Dashboard = ({ setActiveTab }) => {
  const [weather, setWeather] = useState(mockWeather);
  const [nextFavorite, setNextFavorite] = useState(null);
  const [currentArtist, setCurrentArtist] = useState(null);

  useEffect(() => {
    // Find next favorite or current artist
    const now = new Date();
    const starredArtists = mockArtists.filter(artist => artist.isStarred);
    
    // Find currently playing starred artist
    const playing = starredArtists.find(artist => {
      const start = new Date(artist.startTime);
      const end = new Date(artist.endTime);
      return now >= start && now <= end;
    });

    if (playing) {
      setCurrentArtist(playing);
    } else {
      // Find next upcoming starred artist
      const upcoming = starredArtists
        .filter(artist => new Date(artist.startTime) > now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
      
      setNextFavorite(upcoming);
    }
  }, []);

  const getTimeUntil = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return "Started";
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getWeatherIcon = (icon) => {
    switch(icon) {
      case 'sun': return <Sun className="h-8 w-8 neon-yellow" />;
      case 'cloud': return <Cloud className="h-8 w-8 text-gray-400" />;
      default: return <Sun className="h-8 w-8 neon-yellow" />;
    }
  };

  const visibleUsers = mockUsers.filter(user => user.isVisible);
  const ghostUsers = mockUsers.filter(user => !user.isVisible);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 bounce-entrance">
        <h2 className="text-3xl font-bold festival-font neon-blue">Festival Dashboard</h2>
        <p className="text-base readable-text">Your command center for Barefoot Country</p>
      </div>

      {/* Weather Card */}
      <Card className="electric-glass border-2 border-cyan-400 neon-hover">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg festival-font neon-blue">
            {getWeatherIcon(weather.icon)}
            <span>Wildwood Weather</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 neon-yellow" />
                <span className="text-2xl font-bold readable-text">{weather.temperature}°F</span>
              </div>
              <p className="text-lg readable-text">{weather.description}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-gray-400" />
                <span className="readable-subtitle">Wind: {weather.windSpeed} mph</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-orange-400" />
                <span className="readable-subtitle">UV Index: {weather.uvIndex}</span>
              </div>
            </div>
          </div>
          {weather.daisyComment && (
            <p className="text-sm readable-subtitle italic mt-3 border-t border-gray-600 pt-3">
              "{weather.daisyComment}"
            </p>
          )}
        </CardContent>
      </Card>

      {/* Now Playing / Next Favorite */}
      <Card className="electric-glass border-2 border-purple-400 neon-hover">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg festival-font neon-yellow">
            <Star className="h-6 w-6 icon-glow" />
            <span>{currentArtist ? 'Now Playing' : 'Next Favorite'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentArtist ? (
            <div className="space-y-2">
              <h3 className="text-xl font-bold readable-text">{currentArtist.name}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="readable-subtitle">{currentArtist.stage}</span>
                </div>
                <Badge className="bg-red-600 text-white animate-pulse">LIVE NOW</Badge>
              </div>
            </div>
          ) : nextFavorite ? (
            <div className="space-y-2">
              <h3 className="text-xl font-bold readable-text">{nextFavorite.name}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="readable-subtitle">{nextFavorite.stage}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-4 w-4 text-green-400" />
                  <span className="readable-subtitle">in {getTimeUntil(nextFavorite.startTime)}</span>
                </div>
              </div>
              <p className="text-sm readable-subtitle">
                Starts at {new Date(nextFavorite.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="readable-subtitle">No starred performances coming up</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setActiveTab('setlist')}
              >
                Star Some Acts
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drink Round Tracker */}
      <Card className="electric-glass border-2 border-yellow-400 neon-hover">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg festival-font neon-green">
            <Beer className="h-6 w-6 icon-glow" />
            <span>Drink Rounds</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold readable-text">Up Next:</p>
                <p className="text-xl neon-yellow font-bold">{mockDrinkRound.nextUp}</p>
              </div>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1">
                Round #{mockDrinkRound.currentRound + 1}
              </Badge>
            </div>
            <div className="text-sm readable-subtitle border-t border-gray-600 pt-2">
              Last completed by: <span className="text-green-400">{mockDrinkRound.lastCompleted}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Locator Summary */}
      <Card className="electric-glass border-2 border-green-400 neon-hover">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg festival-font neon-blue">
            <Navigation className="h-6 w-6 icon-glow" />
            <span>Group Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" />
                <span className="readable-text">{visibleUsers.length} visible</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-400" />
                <span className="readable-text">{ghostUsers.length} in ghost mode</span>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              {mockUsers.length} total
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Navigation */}
      <Card className="electric-glass border-2 border-pink-400 neon-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg festival-font neon-yellow">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setActiveTab('location')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Open Map
            </Button>
            <Button 
              onClick={() => setActiveTab('daisy')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with Daisy
            </Button>
            <Button 
              onClick={() => setActiveTab('setlist')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Full Setlist
            </Button>
            <Button 
              onClick={() => window.open('https://barefootcountrymusicfest.com', '_blank')}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Official Site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;