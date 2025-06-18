import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, Clock, MapPin, Bell } from 'lucide-react';
import { mockArtists } from '../data/mock';
import { useToast } from '../hooks/use-toast';

const SetlistScheduler = () => {
  const [artists, setArtists] = useState(mockArtists);
  const [selectedDay, setSelectedDay] = useState('Thursday');
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
              title: `${artist.name} starts soon!`,
              description: `Starting in ${minutesUntil} minutes at ${artist.stage}! Get ready to boogie!`,
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
          title: newStarred ? "Artist Starred!" : "Star Removed",
          description: newStarred 
            ? `You'll get notified 15 minutes before ${artist.name} performs!`
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
    artist.day === selectedDay
  );

  const starredCount = artists.filter(artist => artist.isStarred).length;

  const days = ['Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold festival-font neon-purple flex items-center justify-center gap-2">
          <Clock className="h-8 w-8" />
          Setlist Scheduler
        </h2>
        <p className="text-lg readable-text">Never miss your favorite acts!</p>
      </div>

      {/* Stats */}
      <Card className="electric-glass bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-400">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 neon-yellow" />
              <div>
                <p className="text-lg font-bold neon-yellow">Starred Performances</p>
                <p className="text-sm readable-subtitle">You'll get notified 15 mins before!</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg px-3 py-1">
              {starredCount}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Day Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map(day => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            className={`whitespace-nowrap ${
              selectedDay === day 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white' 
                : 'border-purple-300 text-purple-300 hover:bg-purple-500/20 hover:text-white'
            }`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
            <span className="ml-2">
              {day === 'Thursday' && '6/19'}
              {day === 'Friday' && '6/20'}
              {day === 'Saturday' && '6/21'}
              {day === 'Sunday' && '6/22'}
            </span>
          </Button>
        ))}
      </div>

      {/* Artists List */}
      <div className="space-y-4">
        {filteredArtists.map((artist, index) => {
          const timeUntil = getTimeUntil(artist.startTime);
          const isUpcoming = timeUntil !== "Started" && new Date(artist.startTime) > new Date();
          
          return (
            <Card 
              key={artist.id} 
              className={`electric-glass transition-all duration-300 hover:scale-105 border-2 neon-hover ${
                artist.isStarred ? 'border-yellow-400 bg-gradient-to-r from-yellow-900/30 to-orange-900/30' : 'border-cyan-300'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Stage indicator */}
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-center leading-tight ${
                    artist.stage === 'Coors Light Main Stage' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  }`}>
                    {artist.stage === 'Coors Light Main Stage' ? 'MAIN STAGE' : 'TEQUILA STAGE'}
                  </div>
                  
                  {/* Artist Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold readable-text truncate pr-2">
                        {artist.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStar(artist.id)}
                        className={`flex-shrink-0 ${
                          artist.isStarred 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-gray-400 hover:text-yellow-400'
                        }`}
                      >
                        <Star className={`h-6 w-6 ${artist.isStarred ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="readable-subtitle">{formatTime(artist.startTime)} - {formatTime(artist.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="readable-subtitle">{artist.stage}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isUpcoming && (
                          <Badge variant="outline" className="text-green-400 border-green-400 bg-green-900/20">
                            <Clock className="h-3 w-3 mr-1" />
                            {timeUntil}
                          </Badge>
                        )}
                        {timeUntil === "Started" && (
                          <Badge className="bg-red-600 text-white animate-pulse">
                            LIVE NOW
                          </Badge>
                        )}
                        {artist.isStarred && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border border-yellow-400">
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
        <Card className="electric-glass border-2 border-gray-500">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <p className="readable-text text-lg">No performances scheduled for this day yet!</p>
            <p className="readable-subtitle text-sm mt-2">Check back soon for updates!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SetlistScheduler;