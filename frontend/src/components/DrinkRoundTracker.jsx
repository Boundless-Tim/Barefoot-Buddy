import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Beer, Trophy, Plus, RotateCcw, Crown, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const DrinkRoundTracker = () => {
  const [drinkData, setDrinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newParticipant, setNewParticipant] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDrinkRoundData();
  }, []);

  const fetchDrinkRoundData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/drinks/round`);
      setDrinkData(response.data);
    } catch (error) {
      console.error('Error fetching drink round data:', error);
      // Fallback to mock data structure
      setDrinkData({
        participants: ['Sarah', 'Jake', 'Emma', 'Mike', 'Ashley'],
        currentRound: 2,
        nextUp: 'Jake',
        lastCompleted: 'Emma',
        barefootPoints: {
          'Sarah': 15,
          'Jake': 12,
          'Emma': 18,
          'Mike': 9,
          'Ashley': 6
        },
        roundHistory: []
      });
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = () => {
    if (newParticipant.trim() && !drinkData.participants.includes(newParticipant.trim())) {
      setDrinkData(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant.trim()],
        barefootPoints: {
          ...prev.barefootPoints,
          [newParticipant.trim()]: 0
        }
      }));
      setNewParticipant('');
      toast({
        title: "Welcome to the crew! 🤠",
        description: `${newParticipant.trim()} joined the drink rounds! Let's get this party started! 🍻`,
      });
    }
  };

  const completeRound = async () => {
    if (!drinkData) return;
    
    const currentBuyer = drinkData.nextUp;
    const currentIndex = drinkData.participants.indexOf(currentBuyer);
    const nextIndex = (currentIndex + 1) % drinkData.participants.length;
    const nextBuyer = drinkData.participants[nextIndex];
    
    try {
      // Update backend
      await axios.post(`${API_BASE_URL}/api/drinks/complete`, null, {
        params: { user_id: currentBuyer }
      });
      
      // Update local state
      setDrinkData(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        nextUp: nextBuyer,
        lastCompleted: currentBuyer,
        barefootPoints: {
          ...prev.barefootPoints,
          [currentBuyer]: (prev.barefootPoints[currentBuyer] || 0) + 5
        },
        roundHistory: [
          ...(prev.roundHistory || []),
          {
            round: prev.currentRound + 1,
            buyer: currentBuyer,
            timestamp: new Date().toISOString()
          }
        ]
      }));
      
      toast({
        title: "Round completed! 🍻",
        description: `${currentBuyer} bought the round and earned 5 Barefoot Points! Next up: ${nextBuyer}`,
      });
    } catch (error) {
      console.error('Error completing round:', error);
      toast({
        title: "Oops! 😅",
        description: "Couldn't update the round. Try again, y'all!",
        variant: "destructive"
      });
    }
  };

  const resetRounds = () => {
    setDrinkData(prev => ({
      ...prev,
      currentRound: 1,
      nextUp: prev.participants[0],
      roundHistory: []
    }));
    toast({
      title: "Rounds Reset! 🔄",
      description: "Starting fresh! Let the good times roll again! 🎉",
    });
  };

  const getTopPlayer = () => {
    if (!drinkData || !drinkData.barefootPoints) return ['Unknown', 0];
    const entries = Object.entries(drinkData.barefootPoints);
    if (entries.length === 0) return ['Unknown', 0];
    return entries.sort(([,a], [,b]) => b - a)[0];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 bounce-entrance">
          <h2 className="text-3xl font-bold festival-font neon-blue">Drink Round Tracker</h2>
          <p className="text-base readable-text">Loading the drink crew...</p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin neon-blue" />
        </div>
      </div>
    );
  }

  if (!drinkData) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold festival-font neon-blue">Drink Round Tracker</h2>
          <p className="text-base readable-text">No drink round data available</p>
        </div>
      </div>
    );
  }

  const [topPlayerName, topPlayerPoints] = getTopPlayer();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-2">
          <Beer className="h-8 w-8" />
          Drink Round Tracker 🍻
        </h2>
        <p className="text-gray-600">Keep the party fair and fun! 🎉</p>
      </div>

      {/* Current Round Status */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-amber-800">Round #{drinkData.currentRound} 🏆</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-4xl font-bold text-amber-700">
            🤠 {drinkData.nextUp}'s Turn! 🍻
          </div>
          <p className="text-amber-600">Time to buy the drinks, partner!</p>
          <Button 
            onClick={completeRound}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg font-semibold"
          >
            Complete Round 🎯
          </Button>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Trophy className="h-5 w-5" />
            Barefoot Points Leaderboard 🏆
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border border-yellow-300">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-bold text-yellow-800">{topPlayerName} 👑</p>
                  <p className="text-sm text-yellow-600">Festival Champion!</p>
                </div>
              </div>
              <Badge className="bg-yellow-600 text-white text-lg px-3 py-1">
                {topPlayerPoints} pts ⭐
              </Badge>
            </div>
            
            {Object.entries(drinkData.barefootPoints)
              .sort(([,a], [,b]) => b - a)
              .slice(1)
              .map(([name, points], index) => (
                <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold">
                      #{index + 2}
                    </div>
                    <p className="font-semibold">{name}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {points} pts
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Participant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add to the Crew 👥
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter friend's name..."
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
              className="flex-1"
            />
            <Button onClick={addParticipant} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-1" />
              Add 🤝
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>The Crew ({drinkData.participants.length}) 🤠</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetRounds}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset Rounds
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {drinkData.participants.map((participant, index) => (
              <div 
                key={participant} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  participant === drinkData.nextUp 
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    participant === drinkData.nextUp 
                      ? 'bg-blue-600 text-white animate-pulse' 
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      participant === drinkData.nextUp ? 'text-blue-800' : 'text-gray-900'
                    }`}>
                      {participant}
                      {participant === drinkData.nextUp && ' 🎯'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {drinkData.barefootPoints[participant]} Barefoot Points
                    </p>
                  </div>
                </div>
                {participant === drinkData.nextUp && (
                  <Badge className="bg-blue-600 text-white">
                    Up Next! 🍻
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Round History */}
      {drinkData.roundHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Round History 📝</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {drinkData.roundHistory.slice(-3).reverse().map((round, index) => (
                <div key={round.round} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">
                    Round #{round.round} - {round.buyer} bought drinks 🍻
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(round.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DrinkRoundTracker;