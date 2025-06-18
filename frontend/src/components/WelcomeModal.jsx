import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { MapPin, Music, Beer, MessageCircle } from 'lucide-react';

const WelcomeModal = ({ isOpen, onNameSubmit }) => {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if user has already entered their name
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      onNameSubmit(savedName);
    }
  }, [onNameSubmit]);

  const handleSubmit = () => {
    if (name.trim()) {
      localStorage.setItem('userName', name.trim());
      onNameSubmit(name.trim());
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Live Group Locator',
      description: 'Find your crew on the beach in real-time! 🗺️',
      color: 'text-blue-600'
    },
    {
      icon: Music,
      title: 'Setlist Scheduler', 
      description: 'Never miss your favorite acts with smart notifications! 🎵',
      color: 'text-purple-600'
    },
    {
      icon: Beer,
      title: 'Drink Round Tracker',
      description: 'Keep the party fair with our rotation system! 🍻',
      color: 'text-orange-600'
    },
    {
      icon: MessageCircle,
      title: 'Daisy DukeBot',
      description: 'Your sassy Southern festival guide! 🤖💋',
      color: 'text-pink-600'
    }
  ];

  if (step === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <DialogHeader className="text-center space-y-4">
            <div className="text-6xl animate-bounce">🤠</div>
            <DialogTitle className="text-3xl font-bold text-orange-700">
              Welcome to Barefoot Buddy!
            </DialogTitle>
            <p className="text-orange-600 text-lg">
              Your ultimate Wildwood festival companion! 🏖️🎶
            </p>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Ready to have the time of your life at Barefoot Country? 
                Let's get you set up, partner! 🎸
              </p>
            </div>
            
            <Button 
              onClick={() => setStep(1)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-lg font-bold shadow-lg"
            >
              Let's Get Started! 🚀
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 1) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-orange-700">
              Amazing Features Await! ✨
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 mt-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm border border-orange-100"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 flex items-center justify-center ${feature.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Button 
            onClick={() => setStep(2)}
            className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 text-lg font-bold"
          >
            That's Awesome! What's Next? 🎉
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
        <DialogHeader className="text-center space-y-4">
          <div className="text-4xl">👋</div>
          <DialogTitle className="text-2xl font-bold text-orange-700">
            What should we call you?
          </DialogTitle>
          <p className="text-orange-600">
            This helps your friends find you on the map! 🗺️
          </p>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <Input
            placeholder="Enter your name (e.g., Sarah, Jake, etc.)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="text-center text-lg py-6 border-orange-200 focus:border-orange-400"
            autoFocus
          />
          
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-6 text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Let's Go, {name || 'Partner'}! 🤠
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Don't worry - no account creation required! 
            Your name is only stored locally on your device. 🔒
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;