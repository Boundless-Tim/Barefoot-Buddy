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
  // Thursday, June 19 - Coors Light Main Stage
  {
    id: '1',
    name: 'Mara Justine',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-19T15:30:00',
    endTime: '2025-06-19T16:30:00',
    isStarred: false,
    day: 'Thursday'
  },
  {
    id: '2',
    name: 'Not Leaving Sober',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-19T16:30:00',
    endTime: '2025-06-19T17:30:00',
    isStarred: false,
    day: 'Thursday'
  },
  {
    id: '3',
    name: 'Tigirlily Gold',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-19T17:30:00',
    endTime: '2025-06-19T19:00:00',
    isStarred: true,
    day: 'Thursday'
  },
  {
    id: '4',
    name: 'Colt Ford',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-19T19:00:00',
    endTime: '2025-06-19T20:30:00',
    isStarred: false,
    day: 'Thursday'
  },
  {
    id: '5',
    name: 'Megan Moroney',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-19T20:30:00',
    endTime: '2025-06-19T22:00:00',
    isStarred: true,
    day: 'Thursday'
  },
  {
    id: '6',
    name: 'Rascal Flatts',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-19T22:00:00',
    endTime: '2025-06-19T23:30:00',
    isStarred: true,
    day: 'Thursday'
  },
  
  // Thursday, June 19 - Patrón Tequila Stage
  {
    id: '7',
    name: '12/OC',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-19T20:00:00',
    endTime: '2025-06-19T21:30:00',
    isStarred: false,
    day: 'Thursday'
  },
  {
    id: '8',
    name: 'Kevin Mac',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-19T21:30:00',
    endTime: '2025-06-19T23:00:00',
    isStarred: false,
    day: 'Thursday'
  },

  // Friday, June 20 - Coors Light Main Stage
  {
    id: '9',
    name: 'Gillian Smith',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-20T15:00:00',
    endTime: '2025-06-20T16:00:00',
    isStarred: false,
    day: 'Friday'
  },
  {
    id: '10',
    name: 'Avery Anna',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-20T16:00:00',
    endTime: '2025-06-20T17:30:00',
    isStarred: false,
    day: 'Friday'
  },
  {
    id: '11',
    name: 'George Birge',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-20T17:30:00',
    endTime: '2025-06-20T19:00:00',
    isStarred: false,
    day: 'Friday'
  },
  {
    id: '12',
    name: 'Sam Barber',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-20T19:00:00',
    endTime: '2025-06-20T20:30:00',
    isStarred: true,
    day: 'Friday'
  },
  {
    id: '13',
    name: 'Warren Zeiders',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-20T20:30:00',
    endTime: '2025-06-20T22:00:00',
    isStarred: true,
    day: 'Friday'
  },
  {
    id: '14',
    name: 'Lainey Wilson',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-20T22:00:00',
    endTime: '2025-06-20T23:30:00',
    isStarred: true,
    day: 'Friday'
  },

  // Friday, June 20 - Patrón Tequila Stage
  {
    id: '15',
    name: 'Samantha Spanò',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-20T13:30:00',
    endTime: '2025-06-20T14:30:00',
    isStarred: false,
    day: 'Friday'
  },
  {
    id: '16',
    name: 'Lauren Davidson',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-20T14:30:00',
    endTime: '2025-06-20T15:30:00',
    isStarred: false,
    day: 'Friday'
  },
  {
    id: '17',
    name: 'Kaitlin Butts',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-20T15:30:00',
    endTime: '2025-06-20T16:30:00',
    isStarred: false,
    day: 'Friday'
  },
  {
    id: '18',
    name: 'LANCO',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-20T16:30:00',
    endTime: '2025-06-20T18:00:00',
    isStarred: true,
    day: 'Friday'
  },
  {
    id: '19',
    name: 'Meghan Patrick',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-20T20:00:00',
    endTime: '2025-06-20T21:30:00',
    isStarred: false,
    day: 'Friday'
  },
  {
    id: '20',
    name: 'Whey Jennings',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-20T21:30:00',
    endTime: '2025-06-20T23:00:00',
    isStarred: false,
    day: 'Friday'
  },

  // Saturday, June 21 - Coors Light Main Stage
  {
    id: '21',
    name: 'Willow Avalon',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-21T16:00:00',
    endTime: '2025-06-21T17:30:00',
    isStarred: false,
    day: 'Saturday'
  },
  {
    id: '22',
    name: 'Larry Fleet',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-21T17:30:00',
    endTime: '2025-06-21T19:00:00',
    isStarred: true,
    day: 'Saturday'
  },
  {
    id: '23',
    name: 'Boyz II Men',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-21T19:00:00',
    endTime: '2025-06-21T20:30:00',
    isStarred: true,
    day: 'Saturday'
  },
  {
    id: '24',
    name: 'Chris Janson',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-21T20:30:00',
    endTime: '2025-06-21T22:00:00',
    isStarred: false,
    day: 'Saturday'
  },
  {
    id: '25',
    name: 'Jason Aldean',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-21T22:00:00',
    endTime: '2025-06-21T23:30:00',
    isStarred: true,
    day: 'Saturday'
  },

  // Saturday, June 21 - Patrón Tequila Stage
  {
    id: '26',
    name: 'Holdyn Barder',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-21T13:30:00',
    endTime: '2025-06-21T15:30:00',
    isStarred: false,
    day: 'Saturday'
  },
  {
    id: '27',
    name: 'Don Louis',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-21T15:30:00',
    endTime: '2025-06-21T16:30:00',
    isStarred: false,
    day: 'Saturday'
  },
  {
    id: '28',
    name: 'Chris Cagle',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-21T16:30:00',
    endTime: '2025-06-21T18:00:00',
    isStarred: false,
    day: 'Saturday'
  },
  {
    id: '29',
    name: 'Austin Williams',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-21T20:00:00',
    endTime: '2025-06-21T21:30:00',
    isStarred: false,
    day: 'Saturday'
  },
  {
    id: '30',
    name: 'Lakeview',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-21T21:30:00',
    endTime: '2025-06-21T23:00:00',
    isStarred: false,
    day: 'Saturday'
  },

  // Sunday, June 22 - Coors Light Main Stage (Times TBA)
  {
    id: '31',
    name: 'Jelly Roll',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-22T22:00:00',
    endTime: '2025-06-22T23:30:00',
    isStarred: true,
    day: 'Sunday'
  },
  {
    id: '32',
    name: 'Jordan Davis',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-22T20:30:00',
    endTime: '2025-06-22T22:00:00',
    isStarred: true,
    day: 'Sunday'
  },
  {
    id: '33',
    name: 'Ella Langley',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-22T19:00:00',
    endTime: '2025-06-22T20:30:00',
    isStarred: false,
    day: 'Sunday'
  },
  {
    id: '34',
    name: 'Bayker Blankenship',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-22T17:30:00',
    endTime: '2025-06-22T19:00:00',
    isStarred: false,
    day: 'Sunday'
  },
  {
    id: '35',
    name: 'Davisson Brothers Band',
    stage: 'Coors Light Main Stage',
    startTime: '2025-06-22T16:00:00',
    endTime: '2025-06-22T17:30:00',
    isStarred: false,
    day: 'Sunday'
  },

  // Sunday, June 22 - Patrón Tequila Stage (Times TBA)
  {
    id: '36',
    name: 'Chayce Beckham',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-22T21:30:00',
    endTime: '2025-06-22T23:00:00',
    isStarred: true,
    day: 'Sunday'
  },
  {
    id: '37',
    name: 'Lanie Gardner',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-22T20:00:00',
    endTime: '2025-06-22T21:30:00',
    isStarred: false,
    day: 'Sunday'
  },
  {
    id: '38',
    name: 'Cat Country B.O.T.B Winner',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-22T18:00:00',
    endTime: '2025-06-22T19:00:00',
    isStarred: false,
    day: 'Sunday'
  },
  {
    id: '39',
    name: 'Thomas Edwards',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-22T16:30:00',
    endTime: '2025-06-22T17:30:00',
    isStarred: false,
    day: 'Sunday'
  },
  {
    id: '40',
    name: 'The Jack Wharff Band',
    stage: 'Patrón Tequila Stage',
    startTime: '2025-06-22T15:00:00',
    endTime: '2025-06-22T16:30:00',
    isStarred: false,
    day: 'Sunday'
  }
];

export const mockDrinkRound = {
  participants: ['Sarah', 'Jake', 'Emma', 'Mike', 'Ashley'],
  currentRound: 2,
  nextUp: 'Jake',
  lastCompleted: 'Emma',
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

export const mockWeather = {
  temperature: 78,
  description: 'Sunny',
  windSpeed: 8,
  uvIndex: 6,
  icon: 'sun',
  daisyComment: "Perfect beach weather, sugar! Time to get your boots sandy!"
};

export const mockChatHistory = [
  {
    id: '1',
    message: "Hey sugar! Welcome to Barefoot Country! What can this Southern belle help you with today?",
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
    message: "Well honey, it's lookin' mighty fine! Perfect beach weather for dancin' in the sand! Around 78°F with a sweet ocean breeze. Don't forget that sunscreen, darlin'!",
    isBot: true,
    timestamp: new Date(Date.now() - 5000).toISOString()
  }
];

export const festivalInfo = {
  bagPolicy: "Y'all can bring small bags (12\"x6\"x12\") but no large backpacks, sugar! Clear bags are always welcome!",
  food: "We got amazing Southern cuisine, BBQ, seafood, and all the festival favorites! Food trucks galore, honey!",
  parking: "Free parking is available bout a quarter mile from the beach entrance. Shuttle service runs every 15 minutes!",
  weather: "Perfect beach weather expected! Sunny skies, gentle ocean breeze, temps in the mid-70s to low 80s!",
  schedule: "Music starts at 1:30 PM each day and goes till midnight! Check your Setlist tab for all the deets, darlin'!"
};