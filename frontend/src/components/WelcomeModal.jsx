import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { MapPin, Music, Beer, MessageCircle, Sparkles, Star } from 'lucide-react';

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
      color: 'from-blue-500 to-cyan-500',
      emoji: '🗺️'
    },
    {
      icon: Music,
      title: 'Setlist Scheduler', 
      description: 'Never miss your favorite acts with smart notifications! 🎵',
      color: 'from-purple-500 to-pink-500',
      emoji: '🎵'
    },
    {
      icon: Beer,
      title: 'Drink Round Tracker',
      description: 'Keep the party fair with our rotation system! 🍻',
      color: 'from-amber-500 to-orange-500',
      emoji: '🍻'
    },
    {
      icon: MessageCircle,
      title: 'Daisy DukeBot',
      description: 'Your sassy Southern festival guide! 🤖💋',
      color: 'from-pink-500 to-rose-500',
      emoji: '🤖'
    }
  ];

  if (step === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm mx-auto glass-effect bg-gradient-to-br from-orange-500/90 to-red-500/90 border-4 neon-border text-white overflow-hidden p-4">
          {/* Animated background particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-300 rounded-full floating opacity-60"></div>
            <div className="absolute top-8 right-8 w-3 h-3 bg-pink-300 rounded-full floating opacity-40" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-8 left-12 w-2 h-2 bg-cyan-300 rounded-full floating opacity-50" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 bg-white rounded-full floating opacity-30" style={{animationDelay: '0.5s'}}></div>
          </div>

          <DialogHeader className="text-center space-y-4 relative z-10">
            <div className="relative">
              <div className="text-5xl sm:text-6xl animate-bounce mb-3">🤠</div>
              <div className="absolute -top-1 -right-1 text-2xl sm:text-3xl animate-spin">✨</div>
              <div className="absolute -bottom-1 -left-1 text-xl sm:text-2xl animate-pulse">🎵</div>
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-bold festival-font glow-text leading-tight">
              Welcome to Barefoot Buddy!
            </DialogTitle>
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-medium festival-font text-yellow-100 leading-tight">
                Your ultimate Wildwood festival companion! 
              </p>
              <div className="flex items-center justify-center gap-2 text-2xl">
                <span className="floating">🏖️</span>
                <span className="floating" style={{animationDelay: '0.3s'}}>🎶</span>
                <span className="floating" style={{animationDelay: '0.6s'}}>🍻</span>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 mt-6 relative z-10">
            <div className="text-center">
              <p className="text-base sm:text-lg text-yellow-100 font-medium mb-3 festival-font leading-tight">
                Ready to have the time of your life at Barefoot Country? 
                Let's get you set up, partner! 
              </p>
              <div className="flex items-center justify-center gap-1 text-xl">
                <span className="animate-bounce">🎸</span>
                <span className="animate-bounce" style={{animationDelay: '0.2s'}}>🎤</span>
                <span className="animate-bounce" style={{animationDelay: '0.4s'}}>🥁</span>
              </div>
            </div>
            
            <Button 
              onClick={() => setStep(1)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black py-4 sm:py-6 text-lg sm:text-xl font-bold festival-font shadow-2xl transform hover:scale-105 transition-all duration-300 neon-border"
            >
              <Sparkles className="h-6 w-6 mr-2" />
              Let's Get Started! 
              <span className="text-xl ml-2">🚀</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 1) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm mx-auto glass-effect bg-gradient-to-br from-purple-500/90 to-pink-500/90 border-4 neon-border text-white p-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <div className="text-4xl sm:text-5xl mb-3">✨</div>
            <DialogTitle className="text-2xl sm:text-3xl font-bold festival-font glow-text">
              Amazing Features Await!
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 mt-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="glass-effect bg-white/20 backdrop-blur-lg rounded-xl p-3 border-2 border-white/30 transform hover:scale-105 transition-all duration-300 bounce-entrance"
                  style={{animationDelay: `${index * 0.2}s`}}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-2xl relative`}>
                      <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      <div className="absolute -top-1 -right-1 text-lg animate-bounce">
                        {feature.emoji}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold festival-font text-white mb-1 leading-tight">{feature.title}</h3>
                      <p className="text-sm text-white/80 font-medium leading-tight">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <Button 
            onClick={() => setStep(2)}
            className="w-full mt-6 bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-500 hover:to-cyan-500 text-black py-4 sm:py-5 text-lg sm:text-xl font-bold festival-font shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Star className="h-5 w-5 mr-2" />
            That's Awesome! What's Next? 
            <span className="text-xl ml-2">🎉</span>
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm mx-auto glass-effect bg-gradient-to-br from-green-500/90 to-cyan-500/90 border-4 neon-border text-white p-4">
        <DialogHeader className="text-center space-y-4">
          <div className="relative">
            <div className="text-5xl sm:text-6xl animate-bounce">👋</div>
            <div className="absolute -top-1 -right-1 text-2xl animate-spin">🌟</div>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-bold festival-font glow-text leading-tight">
            What should we call you?
          </DialogTitle>
          <div className="space-y-2">
            <p className="text-lg sm:text-xl text-white/90 font-medium festival-font leading-tight">
              This helps your friends find you on the map! 
            </p>
            <div className="text-2xl">🗺️</div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <Input
            placeholder="Enter your name (e.g., Sarah, Jake, etc.)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            className="text-center text-lg sm:text-xl py-4 sm:py-6 border-4 border-white/50 focus:border-white bg-white/20 text-white placeholder-white/70 font-bold festival-font rounded-xl shadow-2xl"
            autoFocus
          />
          
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black py-4 sm:py-6 text-lg sm:text-xl font-bold festival-font shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
          >
            <span className="text-2xl mr-2">🤠</span>
            Let's Go, {name || 'Partner'}! 
            <span className="text-2xl ml-2">🚀</span>
          </Button>
          
          <p className="text-xs sm:text-sm text-center text-white/70 mt-4 font-medium leading-tight">
            Don't worry - no account creation required! 
            <br />
            Your name is only stored locally on your device. 🔒
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;