import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { mockChatHistory, festivalInfo } from '../data/mock';
import { useToast } from '../hooks/use-toast';

const DaisyDukeBotChat = () => {
  const [messages, setMessages] = useState(mockChatHistory);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Festival info responses
    if (message.includes('bag') || message.includes('policy')) {
      return `Well sugar, ${festivalInfo.bagPolicy} Hope that helps, darlin'!`;
    }
    if (message.includes('food') || message.includes('eat')) {
      return `Honey child, ${festivalInfo.food} My stomach's already grumblin' just thinkin' about it!`;
    }
    if (message.includes('parking') || message.includes('car')) {
      return `Don't you worry bout that, sweetie! ${festivalInfo.parking} Easy as pie!`;
    }
    if (message.includes('weather') || message.includes('hot') || message.includes('rain')) {
      return `${festivalInfo.weather} Perfect for dancin' barefoot in the sand, sugar!`;
    }
    if (message.includes('schedule') || message.includes('time') || message.includes('when')) {
      return `${festivalInfo.schedule} Y'all gonna have the time of your lives!`;
    }
    
    // General responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Well hey there, sugar! Daisy here, ready to help you have the best dang festival experience! What can this Southern belle do for ya?";
    }
    if (message.includes('thanks') || message.includes('thank you')) {
      return "Aw shucks, you're sweeter than sweet tea! Anything for my festival family! Y'all have fun now, ya hear?";
    }
    if (message.includes('drink') || message.includes('beer') || message.includes('cocktail')) {
      return "Honey, we got ice-cold beers, fruity cocktails, and everything in between! Stay hydrated in this beach heat, and don't forget to pace yourself, darlin'!";
    }
    if (message.includes('bathroom') || message.includes('restroom')) {
      return "Sugar, there are clean restrooms scattered all around the festival grounds! Look for the big blue signs - can't miss 'em! They're air-conditioned too!";
    }
    if (message.includes('lost') || message.includes('find')) {
      return "Don't you fret none, honey! Head to any of the bright yellow info tents, or just holler for security in those neon vests! We'll get you sorted quicker than a hiccup!";
    }
    
    // Default responses
    const defaultResponses = [
      "Well butter my biscuit, that's a good question! Let me think on that for ya, sugar!",
      "Honey child, you got me there! Why don't you check with the folks at the info tent? They know everything!",
      "Sweet pea, I wish I knew more about that! But don't you worry - ask around, everyone here's friendly as can be!",
      "Darlin', that's outside my wheelhouse! But I bet someone at the main stage can help ya out!"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        message: generateBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay 1.5-2.5 seconds
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold festival-font neon-pink flex items-center justify-center gap-2">
          <MessageCircle className="h-8 w-8" />
          <span>Daisy DukeBot</span>
        </h2>
        <p className="text-lg readable-text">Your sassy Southern festival guide!</p>
      </div>

      {/* Chat Interface */}
      <Card className="electric-glass border-2 border-pink-400 h-96 flex flex-col">
        <CardHeader className="electric-gradient border-b border-pink-300 pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold neon-pink">Daisy DukeBot</p>
              <p className="text-sm readable-subtitle font-normal">
                {isTyping ? 'Typing...' : 'Online and ready to help!'}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] flex gap-2 ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isBot 
                        ? 'bg-gradient-to-br from-pink-400 to-rose-400' 
                        : 'bg-gradient-to-br from-cyan-400 to-blue-400'
                    }`}>
                      {message.isBot ? (
                        <Bot className="h-4 w-4 text-white" />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`px-4 py-3 rounded-lg shadow-md ${
                      message.isBot 
                        ? 'electric-glass bg-pink-900/20 border border-pink-300 text-white' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    }`}>
                      <p className="text-sm leading-relaxed font-medium">{message.message}</p>
                      <p className={`text-xs mt-2 opacity-70`}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="electric-glass bg-pink-900/20 border border-pink-300 px-4 py-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t border-pink-300 p-4 electric-gradient">
            <div className="flex gap-2">
              <Input
                placeholder="Ask Daisy anything about the festival..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-white/10 border-pink-300 text-white placeholder-gray-300"
                disabled={isTyping}
              />
              <Button 
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Questions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['Bag policy?', 'Food options?', 'Weather?', 'Parking?'].map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(question)}
                  disabled={isTyping}
                  className="text-xs border-pink-300 text-pink-300 hover:bg-pink-500/20 hover:text-white"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DaisyDukeBotChat;