import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Globe, Calendar, Music, MapPin, Info } from 'lucide-react';

const QuickLinks = () => {
  const quickLinks = [
    {
      title: 'Official Festival Site',
      description: 'Everything you need to know about Barefoot Country!',
      url: 'https://barefootcountrymusicfest.com',
      icon: Globe,
      color: 'from-orange-500 to-red-500',
      primary: true
    },
    {
      title: 'Full Artist Schedule',
      description: 'Complete lineup and set times',
      url: '#',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Festival Map',
      description: 'Interactive venue map',
      url: '#',
      icon: MapPin,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Music Lineup',
      description: 'Featured artists and performers',
      url: '#',
      icon: Music,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Festival Info',
      description: 'Rules, policies, and FAQs',
      url: '#',
      icon: Info,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const handleLinkClick = (url, title) => {
    if (url === '#') {
      // Mock functionality for demo
      alert(`${title} would open here in the full app!`);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold festival-font neon-green flex items-center justify-center gap-2">
          <ExternalLink className="h-8 w-8" />
          Quick Links
        </h2>
        <p className="text-lg readable-text">Essential festival resources at your fingertips!</p>
      </div>

      {/* Primary Link */}
      <Card className="electric-glass bg-gradient-to-r from-orange-900/40 to-red-900/40 border-2 border-orange-400 shadow-2xl neon-hover">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold festival-font neon-yellow">Official Festival Site</h3>
                <p className="text-lg readable-text">Your complete guide to Barefoot Country!</p>
                <p className="text-sm readable-subtitle mt-1">News, tickets, updates & more!</p>
              </div>
            </div>
            <Button 
              onClick={() => handleLinkClick('https://barefootcountrymusicfest.com', 'Official Festival Site')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-6 py-3 text-lg font-bold festival-font shadow-xl neon-hover"
            >
              Visit Site
              <ExternalLink className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Links Grid */}
      <div className="grid grid-cols-1 gap-4">
        {quickLinks.slice(1).map((link) => {
          const IconComponent = link.icon;
          return (
            <Card key={link.title} className="electric-glass border-2 border-cyan-300 neon-hover transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${link.color} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold readable-text mb-1">{link.title}</h3>
                    <p className="text-sm readable-subtitle mb-3">{link.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLinkClick(link.url, link.title)}
                      className="border-cyan-300 text-cyan-300 hover:bg-cyan-500/20 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Festival Essentials */}
      <Card className="electric-glass border-2 border-blue-400 neon-hover">
        <CardHeader>
          <CardTitle className="text-xl festival-font neon-blue">Festival Essentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="electric-glass p-3 rounded-lg border border-gray-600">
              <div className="text-2xl mb-2 neon-yellow">🎫</div>
              <p className="text-sm font-semibold readable-text">Tickets</p>
            </div>
            <div className="electric-glass p-3 rounded-lg border border-gray-600">
              <div className="text-2xl mb-2 neon-yellow">🧴</div>
              <p className="text-sm font-semibold readable-text">Sunscreen</p>
            </div>
            <div className="electric-glass p-3 rounded-lg border border-gray-600">
              <div className="text-2xl mb-2 neon-blue">💦</div>
              <p className="text-sm font-semibold readable-text">Water</p>
            </div>
            <div className="electric-glass p-3 rounded-lg border border-gray-600">
              <div className="text-2xl mb-2 neon-green">🤠</div>
              <p className="text-sm font-semibold readable-text">Cowboy Hat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="electric-glass border-2 border-gray-500">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold readable-text">Need Help?</h3>
            <p className="text-sm readable-subtitle">
              Visit any info tent or ask our friendly staff! 
              <br />
              Emergency: Text "HELP" to festival security
            </p>
            <div className="flex justify-center gap-4 text-xs readable-subtitle mt-3">
              <span>Info tents: 10AM - 12AM</span>
              <span>Security: 24/7</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickLinks;