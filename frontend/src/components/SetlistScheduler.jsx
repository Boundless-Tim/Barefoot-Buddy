import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar,
  Music,
  Loader2
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const SetlistScheduler = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Thursday');
  const [starredArtists, setStarredArtists] = useState(new Set());

  const days = ['Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/artists`);
      const artistsData = response.data.artists || [];
      
      setArtists(artistsData);
      
      // Track locally starred artists
      const starred = new Set(artistsData.filter(artist => artist.isStarred).map(artist => artist.id));
      setStarredArtists(starred);
      
    } catch (error) {
      console.error('Error fetching artists:', error);
      // Fallback to empty state if API fails
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = async (artistId) => {
    try {
      // Optimistic update
      const newStarredArtists = new Set(starredArtists);
      if (starredArtists.has(artistId)) {
        newStarredArtists.delete(artistId);
      } else {
        newStarredArtists.add(artistId);
      }
      setStarredArtists(newStarredArtists);

      // Update local artists array
      setArtists(prev => prev.map(artist => 
        artist.id === artistId 
          ? { ...artist, isStarred: !artist.isStarred }
          : artist
      ));

      // Send to API
      await axios.post(`${API_BASE_URL}/api/artists/${artistId}/star`);
      
    } catch (error) {
      console.error('Error toggling star:', error);
      // Revert optimistic update on error
      fetchArtists();
    }
  };

  const getArtistsByDay = (day) => {
    return artists
      .filter(artist => artist.day === day)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (day) => {
    const dateMap = {
      'Thursday': 'June 19',
      'Friday': 'June 20', 
      'Saturday': 'June 21',
      'Sunday': 'June 22'
    };
    return dateMap[day] || day;
  };

  const isCurrentlyPlaying = (artist) => {
    const now = new Date();
    const start = new Date(artist.startTime);
    const end = new Date(artist.endTime);
    return now >= start && now <= end;
  };

  const getStageColor = (stage) => {
    return stage === 'Coors Light Main Stage' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 bounce-entrance">
          <h2 className="text-3xl font-bold festival-font neon-blue">Festival Lineup</h2>
          <p className="text-base readable-text">Loading the amazing lineup...</p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin neon-blue" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 bounce-entrance">
        <h2 className="text-3xl font-bold festival-font neon-blue flex items-center justify-center gap-3">
          <Music className="h-8 w-8 neon-blue icon-glow" />
          Festival Lineup
        </h2>
        <p className="text-base readable-text">June 19-22, 2025 • Wildwood, NJ</p>
      </div>

      {/* Starred Artists Quick View */}
      {starredArtists.size > 0 && (
        <Card className="electric-glass border-2 border-yellow-400 neon-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg festival-font neon-yellow flex items-center gap-2">
              <Star className="h-5 w-5 icon-glow" />
              Your Starred Artists ({starredArtists.size})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {artists
                .filter(artist => starredArtists.has(artist.id))
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                .slice(0, 3)
                .map(artist => (
                  <div key={artist.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                    <div>
                      <p className="font-bold readable-text">{artist.name}</p>
                      <p className="text-sm readable-subtitle">{artist.day} • {formatTime(artist.startTime)}</p>
                    </div>
                    {isCurrentlyPlaying(artist) && (
                      <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>
                    )}
                  </div>
                ))}
              {starredArtists.size > 3 && (
                <p className="text-sm readable-subtitle text-center">
                  +{starredArtists.size - 3} more starred artists
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Schedule Tabs */}
      <Card className="electric-glass border-2 border-purple-400 neon-border">
        <CardContent className="p-0">
          <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-black/30 rounded-none border-b border-gray-600">
              {days.map(day => (
                <TabsTrigger
                  key={day}
                  value={day}
                  className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-purple-300 transition-all"
                >
                  <div className="text-center">
                    <div className="font-bold">{day}</div>
                    <div className="text-xs opacity-70">{formatDate(day)}</div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {days.map(day => (
              <TabsContent key={day} value={day} className="mt-0">
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {getArtistsByDay(day).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="readable-subtitle">No artists scheduled for {day}</p>
                    </div>
                  ) : (
                    getArtistsByDay(day).map(artist => (
                      <Card 
                        key={artist.id} 
                        className={`electric-glass border transition-all duration-200 hover:scale-[1.02] ${
                          starredArtists.has(artist.id) 
                            ? 'border-yellow-400 neon-border-yellow' 
                            : 'border-gray-600/50'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold readable-text">{artist.name}</h3>
                                {isCurrentlyPlaying(artist) && (
                                  <Badge className="bg-red-600 text-white animate-pulse text-xs">
                                    LIVE NOW
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="readable-subtitle">
                                    {formatTime(artist.startTime)} - {formatTime(artist.endTime)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <Badge className={`bg-gradient-to-r ${getStageColor(artist.stage)} text-white text-xs`}>
                                    {artist.stage}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStar(artist.id)}
                              className={`transition-all duration-200 ${
                                starredArtists.has(artist.id)
                                  ? 'text-yellow-400 hover:text-yellow-300'
                                  : 'text-gray-500 hover:text-yellow-400'
                              }`}
                            >
                              <Star 
                                className={`h-6 w-6 ${
                                  starredArtists.has(artist.id) ? 'fill-yellow-400' : ''
                                }`} 
                              />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Schedule Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="electric-glass border border-gray-600/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold neon-blue">{artists.length}</div>
            <div className="text-sm readable-subtitle">Total Artists</div>
          </CardContent>
        </Card>
        <Card className="electric-glass border border-gray-600/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold neon-yellow">{starredArtists.size}</div>
            <div className="text-sm readable-subtitle">Starred Acts</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetlistScheduler;