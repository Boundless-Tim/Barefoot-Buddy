import React, { useState, useEffect } from "react";
import "./App.css";
import { Toaster } from "./components/ui/toaster";
import WelcomeModal from "./components/WelcomeModal";
import Navigation from "./components/Navigation";
import LocationTracker from "./components/LocationTracker";
import SetlistScheduler from "./components/SetlistScheduler";
import DrinkRoundTracker from "./components/DrinkRoundTracker";
import DaisyDukeBotChat from "./components/DaisyDukeBotChat";
import QuickLinks from "./components/QuickLinks";

function App() {
  const [userName, setUserName] = useState(null);
  const [activeTab, setActiveTab] = useState('location');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Check if user has already entered their name
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
      setShowWelcome(false);
    }
  }, []);

  const handleNameSubmit = (name) => {
    setUserName(name);
    setShowWelcome(false);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'location':
        return <LocationTracker />;
      case 'setlist':
        return <SetlistScheduler />;
      case 'drinks':
        return <DrinkRoundTracker />;
      case 'daisy':
        return <DaisyDukeBotChat />;
      case 'links':
        return <QuickLinks />;
      default:
        return <LocationTracker />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Electric animated background particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-4 h-4 neon-blue rounded-full floating opacity-80" style={{filter: 'drop-shadow(0 0 10px #00ffff)'}}></div>
        <div className="absolute top-40 right-16 w-6 h-6 neon-yellow rounded-full floating opacity-60" style={{animationDelay: '1s', filter: 'drop-shadow(0 0 10px #ffff00)'}}></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 neon-green rounded-full floating opacity-70" style={{animationDelay: '2s', filter: 'drop-shadow(0 0 10px #00ff00)'}}></div>
        <div className="absolute top-60 left-1/2 w-5 h-5 neon-blue rounded-full floating opacity-50" style={{animationDelay: '0.5s', filter: 'drop-shadow(0 0 10px #00ffff)'}}></div>
        <div className="absolute bottom-48 right-8 w-4 h-4 neon-yellow rounded-full floating opacity-60" style={{animationDelay: '1.5s', filter: 'drop-shadow(0 0 10px #ffff00)'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 electric-gradient text-white p-6 shadow-2xl border-b-4 neon-border">
        <div className="max-w-md mx-auto text-center relative">
          {/* Electric glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 opacity-50 blur-2xl rounded-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold festival-font electric-text flex items-center justify-center gap-3 mb-2 bounce-entrance">
              <span className="text-5xl floating neon-glow" style={{filter: 'drop-shadow(0 0 15px #00ffff)'}}>🤠</span>
              <span className="neon-blue">Barefoot Buddy</span>
              <span className="text-5xl floating neon-glow" style={{animationDelay: '0.5s', filter: 'drop-shadow(0 0 15px #ffff00)'}}>🏖️</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-white text-lg font-medium">
              <span className="floating neon-yellow" style={{animationDelay: '1s', filter: 'drop-shadow(0 0 10px #ffff00)'}}>🎵</span>
              <p className="festival-font readable-text">
                {userName ? `Hey there, ${userName}!` : 'Your Festival Companion'} 
              </p>
              <span className="floating neon-green" style={{animationDelay: '1.5s', filter: 'drop-shadow(0 0 10px #00ff00)'}}>✨</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto p-4 pb-24">
        <div className="slide-up-entrance">
          {renderActiveTab()}
        </div>
      </main>

      {/* Navigation */}
      {!showWelcome && (
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcome} 
        onNameSubmit={handleNameSubmit}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default App;
