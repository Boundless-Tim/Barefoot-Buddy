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
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      primary: true
    },
    {
      title: 'Full Artist Schedule',
      description: 'Complete lineup and set times',
      url: '#',
      icon: Calendar,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      title: 'Festival Map',
      description: 'Interactive venue map',
      url: '#',
      icon: MapPin,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      title: 'Music Lineup',
      description: 'Featured artists and performers',
      url: '#',
      icon: Music,
      color: 'bg-gradient-to-r from-green-500 to-teal-500'
    },
    {
      title: 'Festival Info',
      description: 'Rules, policies, and FAQs',
      url: '#',
      icon: Info,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500'
    }
  ];

  const handleLinkClick = (url, title) => {
    if (url === '#') {
      // Mock functionality for demo
      alert(`${title} would open here in the full app! 🤠`);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2">
          <ExternalLink className="h-8 w-8" />
          Quick Links 🔗
        </h2>
        <p className="text-gray-600">Essential festival resources at your fingertips! 📱</p>
      </div>

      {/* Primary Link */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-orange-800">Official Festival Site</h3>
                <p className="text-orange-600">Your complete guide to Barefoot Country! 🤠</p>
                <p className="text-sm text-orange-500 mt-1">News, tickets, updates & more!</p>
              </div>
            </div>
            <Button 
              onClick={() => handleLinkClick('https://barefootcountrymusicfest.com', 'Official Festival Site')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 text-lg font-semibold shadow-lg"
            >
              Visit Site 🌐
              <ExternalLink className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Other Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.slice(1).map((link) => {
          const IconComponent = link.icon;
          return (
            <Card key={link.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1">{link.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{link.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLinkClick(link.url, link.title)}
                      className="w-full"
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
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Festival Essentials 🎒</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🎫</div>
              <p className="text-sm font-semibold text-gray-700">Tickets</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🧴</div>
              <p className="text-sm font-semibold text-gray-700">Sunscreen</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">💦</div>
              <p className="text-sm font-semibold text-gray-700">Water</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl mb-2">🤠</div>
              <p className="text-sm font-semibold text-gray-700">Cowboy Hat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h3 className="font-bold text-gray-800">Need Help? 🤝</h3>
            <p className="text-sm text-gray-600">
              Visit any info tent or ask our friendly staff! 
              <br />
              Emergency: Text "HELP" to festival security 📱
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-500 mt-3">
              <span>🕐 Info tents: 10AM - 12AM</span>
              <span>🚨 Security: 24/7</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickLinks;