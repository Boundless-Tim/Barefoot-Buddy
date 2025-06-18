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
  Thermometer,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const Dashboard = ({ setActiveTab }) => {
  const [weather, setWeather] = useState(null);
  const [artists, setArtists] = useState([]);
  const [drinkRound, setDrinkRound] = useState(null);
  const [nextFavorite, setNextFavorite] = useState(null);
  const [currentArtist, setCurrentArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real data from backend
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching dashboard data from:', API_BASE_URL);
      
      // Fetch weather data
      console.log('Fetching weather...');
      const weatherResponse = await axios.get(`${API_BASE_URL}/weather`);
      console.log('Weather response:', weatherResponse.data);
      setWeather(weatherResponse.data);

      // Fetch artists data
      console.log('Fetching artists...');
      const artistsResponse = await axios.get(`${API_BASE_URL}/artists`);
      console.log('Artists response:', artistsResponse.data);
      setArtists(artistsResponse.data.artists || []);

      // Fetch drink round data
      console.log('Fetching drink round...');
      const drinkResponse = await axios.get(`${API_BASE_URL}/drinks/round`);
      console.log('Drink round response:', drinkResponse.data);
      setDrinkRound(drinkResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data, error.message);
      
      // Fall back to mock data if API fails
      console.log('Using fallback mock data');
      setWeather({
        temperature: 78,
        description: 'Sunny',
        windSpeed: 8,
        uvIndex: 6,
        icon: 'sun',
        daisyComment: "Perfect beach weather, sugar! Time to get your boots sandy!"
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (artists.length > 0) {
      // Find next favorite or current artist
      const now = new Date();
      const starredArtists = artists.filter(artist => artist.isStarred);
      
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
    }
  }, [artists]);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 bounce-entrance">
          <h2 className="text-3xl font-bold festival-font neon-blue">Festival Dashboard</h2>
          <p className="text-base readable-text">Loading your festival data...</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 bounce-entrance">
        <h2 className="text-3xl font-bold festival-font neon-blue">Festival Dashboard</h2>
        <p className="text-base readable-text">Your command center for Barefoot Country</p>
      </div>

      {/* Weather Card - Real Data */}
      {weather && (
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
      )}

      {/* Now Playing / Next Favorite - Real Data */}
      <Card 
        className="electric-glass border-2 border-purple-400 neon-hover cursor-pointer transform transition-all duration-200 hover:scale-105"
        onClick={() => setActiveTab('setlist')}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg festival-font neon-yellow">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 icon-glow" />
              <span>{currentArtist ? 'Now Playing' : 'Next Favorite'}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
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
              <p className="text-xs readable-subtitle mt-1">Click to star some acts</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drink Round Tracker - Real Data */}
      {drinkRound && (
        <Card 
          className="electric-glass border-2 border-yellow-400 neon-hover cursor-pointer transform transition-all duration-200 hover:scale-105"
          onClick={() => setActiveTab('drinks')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg festival-font neon-green">
              <div className="flex items-center gap-3">
                <Beer className="h-6 w-6 icon-glow" />
                <span>Drink Rounds</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold readable-text">Up Next:</p>
                  <p className="text-xl neon-yellow font-bold">{drinkRound.nextUp}</p>
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1">
                  Round #{drinkRound.currentRound + 1}
                </Badge>
              </div>
              <div className="text-sm readable-subtitle border-t border-gray-600 pt-2">
                Last completed by: <span className="text-green-400">{drinkRound.lastCompleted}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Group Locator with Mini Map */}
      <Card 
        className="electric-glass border-2 border-green-400 neon-hover cursor-pointer transform transition-all duration-200 hover:scale-105"
        onClick={() => setActiveTab('location')}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg festival-font neon-blue">
            <div className="flex items-center gap-3">
              <Navigation className="h-6 w-6 icon-glow" />
              <span>Group Locator</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mini Map */}
          <div className="relative rounded-xl h-32 overflow-hidden shadow-inner border border-cyan-300 mb-4">
            {MAPBOX_TOKEN ? (
              <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{
                  longitude: -74.8157, // Wildwood, NJ
                  latitude: 39.0056,
                  zoom: 13
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                interactive={false}
              >
                {/* Festival grounds marker */}
                <Marker longitude={-74.8157} latitude={39.0056} anchor="center">
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                </Marker>
                
                {/* Mock user locations around festival */}
                <Marker longitude={-74.8150} latitude={39.0060} anchor="center">
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-white shadow-md animate-bounce" style={{animationDelay: '0.5s'}}></div>
                </Marker>
                <Marker longitude={-74.8165} latitude={39.0052} anchor="center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-md animate-bounce" style={{animationDelay: '1s'}}></div>
                </Marker>
                <Marker longitude={-74.8155} latitude={39.0065} anchor="center">
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-md animate-bounce" style={{animationDelay: '1.5s'}}></div>
                </Marker>
              </Map>
            ) : (
              <div className="electric-gradient h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm font-bold neon-blue">Live Festival Map</p>
                  <p className="text-xs readable-subtitle">Tap to view full map</p>
                </div>
              </div>
            )}
          </div>

          {/* Group Status - Will be real data from location API */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" />
                <span className="readable-text">3 visible</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-400" />
                <span className="readable-text">1 in ghost mode</span>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              4 total
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
              onClick={() => setActiveTab('daisy')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with Daisy
            </Button>
            <Button 
              onClick={() => window.open('https://barefootcountrymusicfest.com', '_blank')}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Official Site
            </Button>
            <Button 
              onClick={() => setActiveTab('setlist')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Full Schedule
            </Button>
            <Button 
              onClick={() => setActiveTab('links')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              More Links
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;