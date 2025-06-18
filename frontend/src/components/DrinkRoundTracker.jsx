import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Beer, Trophy, Plus, RotateCcw, Crown } from 'lucide-react';
import { mockDrinkRound } from '../data/mock';
import { useToast } from '../hooks/use-toast';

const DrinkRoundTracker = () => {
  const [drinkData, setDrinkData] = useState(mockDrinkRound);
  const [newParticipant, setNewParticipant] = useState('');
  const { toast } = useToast();

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

  const completeRound = () => {
    const currentBuyer = drinkData.nextUp;
    const currentIndex = drinkData.participants.indexOf(currentBuyer);
    const nextIndex = (currentIndex + 1) % drinkData.participants.length;
    const nextBuyer = drinkData.participants[nextIndex];
    
    setDrinkData(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      nextUp: nextBuyer,
      barefootPoints: {
        ...prev.barefootPoints,
        [currentBuyer]: prev.barefootPoints[currentBuyer] + 5
      },
      roundHistory: [
        ...prev.roundHistory,
        {
          round: prev.currentRound + 1,
          buyer: currentBuyer,
          timestamp: new Date().toISOString()
        }
      ]
    }));

    toast({
      title: `${nextBuyer}'s up! 🍻`,
      description: `Get movin', cowboy! ${currentBuyer} earned 5 Barefoot Points! 🤠⭐`,
      duration: 5000
    });
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
    return Object.entries(drinkData.barefootPoints)
      .sort(([,a], [,b]) => b - a)[0];
  };

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