import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, Clock, MapPin, Bell } from 'lucide-react';
import { mockArtists } from '../data/mock';
import { useToast } from '../hooks/use-toast';

const SetlistScheduler = () => {
  const [artists, setArtists] = useState(mockArtists);
  const [selectedDay, setSelectedDay] = useState('2025-06-21');
  const { toast } = useToast();

  useEffect(() => {
    // Check for upcoming starred performances
    const checkUpcomingNotifications = () => {
      const now = new Date();
      artists.forEach(artist => {
        if (artist.isStarred) {
          const startTime = new Date(artist.startTime);
          const timeDiff = startTime.getTime() - now.getTime();
          const minutesUntil = Math.floor(timeDiff / (1000 * 60));
          
          // Simulate notification for demo (if within 15 minutes)
          if (minutesUntil <= 15 && minutesUntil > 0) {
            toast({
              title: `🎵 ${artist.name} starts soon!`,
              description: `Starting in ${minutesUntil} minutes at ${artist.stage}! Get ready to boogie! 🤠🎶`,
              duration: 10000
            });
          }
        }
      });
    };

    const interval = setInterval(checkUpcomingNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [artists, toast]);

  const toggleStar = (artistId) => {
    setArtists(artists.map(artist => {
      if (artist.id === artistId) {
        const newStarred = !artist.isStarred;
        toast({
          title: newStarred ? "⭐ Artist Starred!" : "Star Removed",
          description: newStarred 
            ? `You'll get notified 15 minutes before ${artist.name} performs! 🔔`
            : `No more notifications for ${artist.name}`,
        });
        return { ...artist, isStarred: newStarred };
      }
      return artist;
    }));
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const filteredArtists = artists.filter(artist => 
    artist.startTime.startsWith(selectedDay)
  );

  const starredCount = artists.filter(artist => artist.isStarred).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-2">
          <Clock className="h-8 w-8" />
          Setlist Scheduler 🎵
        </h2>
        <p className="text-gray-600">Never miss your favorite acts! ⭐</p>
      </div>

      {/* Stats */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-yellow-600 fill-current" />
              <div>
                <p className="font-semibold text-yellow-800">Starred Performances</p>
                <p className="text-sm text-yellow-600">You'll get notified 15 mins before!</p>
              </div>
            </div>
            <Badge className="bg-yellow-600 text-white text-lg px-3 py-1">
              {starredCount} ⭐
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Day Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['2025-06-21', '2025-06-22', '2025-06-23'].map(day => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            className={`whitespace-nowrap ${
              selectedDay === day 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'border-purple-200 text-purple-600 hover:bg-purple-50'
            }`}
            onClick={() => setSelectedDay(day)}
          >
            {new Date(day).toLocaleDateString([], { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })} 🗓️
          </Button>
        ))}
      </div>

      {/* Artists List */}
      <div className="space-y-4">
        {filteredArtists.map(artist => {
          const timeUntil = getTimeUntil(artist.startTime);
          const isUpcoming = timeUntil !== "Started" && new Date(artist.startTime) > new Date();
          
          return (
            <Card 
              key={artist.id} 
              className={`transition-all duration-300 hover:shadow-lg ${
                artist.isStarred ? 'ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Artist Image */}
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl">🎤</div>
                  </div>
                  
                  {/* Artist Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 truncate pr-2">
                        {artist.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStar(artist.id)}
                        className={`flex-shrink-0 ${
                          artist.isStarred 
                            ? 'text-yellow-600 hover:text-yellow-700' 
                            : 'text-gray-400 hover:text-yellow-600'
                        }`}
                      >
                        <Star className={`h-6 w-6 ${artist.isStarred ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(artist.startTime)} - {formatTime(artist.endTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {artist.stage}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isUpcoming && (
                          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                            <Clock className="h-3 w-3 mr-1" />
                            {timeUntil}
                          </Badge>
                        )}
                        {timeUntil === "Started" && (
                          <Badge className="bg-red-600 text-white animate-pulse">
                            🔴 LIVE NOW
                          </Badge>
                        )}
                        {artist.isStarred && (
                          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                            <Bell className="h-3 w-3 mr-1" />
                            Notifications On
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredArtists.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-500">No performances scheduled for this day yet!</p>
            <p className="text-sm text-gray-400 mt-2">Check back soon for updates! 🤠</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SetlistScheduler;