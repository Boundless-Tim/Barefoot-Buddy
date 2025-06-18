// Mock data for Barefoot Buddy app

export const mockUsers = [
  {
    id: '1',
    name: 'Sarah',
    lat: 38.9847,
    lng: -74.8155,
    isVisible: true,
    lastUpdate: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Jake',
    lat: 38.9850,
    lng: -74.8160,
    isVisible: true,
    lastUpdate: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Emma',
    lat: 38.9845,
    lng: -74.8150,
    isVisible: false, // Ghost mode
    lastUpdate: new Date().toISOString()
  }
];

export const mockArtists = [
  {
    id: '1',
    name: 'Luke Bryan',
    stage: 'Main Stage',
    startTime: '2025-06-21T20:00:00',
    endTime: '2025-06-21T22:00:00',
    isStarred: false,
    image: 'https://via.placeholder.com/300x200?text=Luke+Bryan'
  },
  {
    id: '2',
    name: 'Carrie Underwood',
    stage: 'Main Stage', 
    startTime: '2025-06-21T22:30:00',
    endTime: '2025-06-22T00:30:00',
    isStarred: true,
    image: 'https://via.placeholder.com/300x200?text=Carrie+Underwood'
  },
  {
    id: '3',
    name: 'Florida Georgia Line',
    stage: 'Beach Stage',
    startTime: '2025-06-21T18:00:00',
    endTime: '2025-06-21T19:30:00',
    isStarred: true,
    image: 'https://via.placeholder.com/300x200?text=Florida+Georgia+Line'
  },
  {
    id: '4',
    name: 'Kelsea Ballerini',
    stage: 'Beach Stage',
    startTime: '2025-06-21T16:00:00',
    endTime: '2025-06-21T17:30:00',
    isStarred: false,
    image: 'https://via.placeholder.com/300x200?text=Kelsea+Ballerini'
  },
  {
    id: '5',
    name: 'Chris Stapleton',
    stage: 'Main Stage',
    startTime: '2025-06-22T21:00:00',
    endTime: '2025-06-22T23:00:00',
    isStarred: true,
    image: 'https://via.placeholder.com/300x200?text=Chris+Stapleton'
  }
];

export const mockDrinkRound = {
  participants: ['Sarah', 'Jake', 'Emma', 'Mike', 'Ashley'],
  currentRound: 2,
  nextUp: 'Jake',
  barefootPoints: {
    'Sarah': 15,
    'Jake': 12,
    'Emma': 18,
    'Mike': 9,
    'Ashley': 6
  },
  roundHistory: [
    { round: 1, buyer: 'Sarah', timestamp: '2025-06-21T14:30:00' },
    { round: 2, buyer: 'Emma', timestamp: '2025-06-21T16:45:00' }
  ]
};

export const mockChatHistory = [
  {
    id: '1',
    message: "Hey sugar! 🤠 Welcome to Barefoot Country! What can this Southern belle help you with today? 🎶",
    isBot: true,
    timestamp: new Date(Date.now() - 10000).toISOString()
  },
  {
    id: '2', 
    message: "What's the weather like?",
    isBot: false,
    timestamp: new Date(Date.now() - 8000).toISOString()
  },
  {
    id: '3',
    message: "Well honey, it's lookin' mighty fine! 🌞 Perfect beach weather for dancin' in the sand! Around 78°F with a sweet ocean breeze. Don't forget that sunscreen, darlin'! 💋🏖️",
    isBot: true,
    timestamp: new Date(Date.now() - 5000).toISOString()
  }
];

export const festivalInfo = {
  bagPolicy: "Y'all can bring small bags (12\"x6\"x12\") but no large backpacks, sugar! Clear bags are always welcome! 👜✨",
  food: "We got amazing Southern cuisine, BBQ, seafood, and all the festival favorites! Food trucks galore, honey! 🍖🦐🌮",
  parking: "Free parking is available bout a quarter mile from the beach entrance. Shuttle service runs every 15 minutes! 🚌🅿️",
  weather: "Perfect beach weather expected! Sunny skies, gentle ocean breeze, temps in the mid-70s to low 80s! 🌞🏖️",
  schedule: "Music starts at 2 PM each day and goes till midnight! Check your Setlist tab for all the deets, darlin'! 🎵⏰"
};