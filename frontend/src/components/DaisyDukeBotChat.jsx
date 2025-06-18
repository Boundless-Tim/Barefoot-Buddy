import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const DaisyDukeBotChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef(null);
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize chat session when component mounts
    initializeChatSession();
  }, []);

  const initializeChatSession = async () => {
    try {
      setInitializing(true);
      
      // Create a new chat session
      const response = await axios.post(`${API_BASE_URL}/chat/session`, {
        user_id: userId
      });
      
      const newSessionId = response.data.session_id;
      setSessionId(newSessionId);

      // Try to load existing chat history
      try {
        const historyResponse = await axios.get(`${API_BASE_URL}/chat/history/${newSessionId}`);
        const history = historyResponse.data.messages || [];
        setMessages(history);
      } catch (historyError) {
        console.error('Error loading chat history:', historyError);
        // Start with empty messages - let backend handle initial message
        setMessages([]);
      }
      
    } catch (error) {
      console.error('Error initializing chat session:', error);
      // Set fallback to local session without backend
      setSessionId('local_session');
      setMessages([]);
    } finally {
      setInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      message: newMessage,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setLoading(true);

    try {
      if (sessionId && sessionId !== 'local_session') {
        // Send message to real API
        const response = await axios.post(
          `${API_BASE_URL}/chat/${sessionId}?user_id=${userId}`,
          { message: currentMessage }
        );

        const botResponse = response.data;
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Fallback response for local session
        setTimeout(() => {
          const fallbackResponse = {
            id: Date.now().toString(),
            message: "Well bless your heart! I'd love to help you with that, sugar, but I'm havin' some technical difficulties right now. Y'all come back and try again in a bit, would ya?",
            isBot: true,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, fallbackResponse]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      const errorResponse = {
        id: Date.now().toString(),
        message: "Oh honey, somethin' went wrong on my end! Give me just a moment and try again, would ya?",
        isBot: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (initializing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 neon-blue" />
          <p className="readable-text">Connecting to Daisy DukeBot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="text-center space-y-2 bounce-entrance">
        <h2 className="text-3xl font-bold festival-font neon-blue flex items-center justify-center gap-3">
          <MessageCircle className="h-8 w-8 neon-blue icon-glow" />
          Daisy DukeBot
        </h2>
        <p className="text-base readable-text">Your Southern belle festival guide</p>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 electric-glass border-2 border-pink-400 neon-border flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg festival-font neon-yellow flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span>Chat Active</span>
            {sessionId && sessionId !== 'local_session' && (
              <span className="text-xs text-green-400 ml-2">✓ Connected</span>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.isBot
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-bl-none'
                      : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-br-none'
                  }`}
                >
                  <p className="readable-text whitespace-pre-wrap">{message.message}</p>
                  <p className="text-xs readable-subtitle mt-2 opacity-70">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin neon-pink" />
                    <span className="readable-text">Daisy is typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div className="border-t border-gray-600/30 p-4 bg-black/20">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Daisy about the festival, weather, artists, or anything else, sugar!"
                  className="bg-black/30 border-gray-600 text-white placeholder-gray-400 focus:border-pink-400 transition-colors"
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={loading || !newMessage.trim()}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Suggestions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNewMessage("What's the weather like?")}
          className="text-xs border-cyan-400/50 hover:border-cyan-400 hover:bg-cyan-400/10 transition-colors"
          disabled={loading}
        >
          Weather Update
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNewMessage("Who are the headliners?")}
          className="text-xs border-purple-400/50 hover:border-purple-400 hover:bg-purple-400/10 transition-colors"
          disabled={loading}
        >
          Festival Lineup
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNewMessage("Where's the best food?")}
          className="text-xs border-yellow-400/50 hover:border-yellow-400 hover:bg-yellow-400/10 transition-colors"
          disabled={loading}
        >
          Food Recommendations
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNewMessage("What should I bring?")}
          className="text-xs border-green-400/50 hover:border-green-400 hover:bg-green-400/10 transition-colors"
          disabled={loading}
        >
          Festival Tips
        </Button>
      </div>
    </div>
  );
};

export default DaisyDukeBotChat;