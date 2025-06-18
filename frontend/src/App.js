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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 shadow-lg">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            🤠 Barefoot Buddy 🏖️
          </h1>
          <p className="text-orange-100 text-sm">
            {userName ? `Hey there, ${userName}!` : 'Your Festival Companion'} 🎶
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 pb-20">
        {renderActiveTab()}
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
