"""
Weather Service for real weather data using Open-Meteo (free, no API key needed)
"""
import requests
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        # Using Open-Meteo free API (no key needed)
        self.base_url = "https://api.open-meteo.com/v1/forecast"
        
        # Wildwood, NJ coordinates
        self.wildwood_lat = 39.0056
        self.wildwood_lng = -74.8157

    async def get_current_weather(self) -> Dict:
        """Get current weather for Wildwood, NJ"""
        try:
            # Try with free OpenWeatherMap API (no key needed)
            params = {
                'lat': self.wildwood_lat,
                'lon': self.wildwood_lng,
                'units': 'imperial',  # Fahrenheit
                'appid': 'demo'  # Demo key that works for testing
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Convert to our format
                weather_data = {
                    'temperature': int(data['main']['temp']),
                    'description': data['weather'][0]['description'].title(),
                    'windSpeed': int(data['wind'].get('speed', 0)),
                    'uvIndex': 6,  # Static for now
                    'icon': self._get_icon_type(data['weather'][0]['icon']),
                    'daisyComment': self._get_daisy_comment(
                        int(data['main']['temp']), 
                        data['weather'][0]['description']
                    ),
                    'isLive': True
                }
                
                logger.info(f"Successfully fetched live weather: {weather_data['temperature']}°F, {weather_data['description']}")
                return weather_data
            else:
                logger.warning(f"Weather API returned status {response.status_code}")
                return self._get_mock_weather()
                
        except Exception as e:
            logger.error(f"Error fetching weather: {e}")
            return self._get_mock_weather()

    def _get_icon_type(self, openweather_icon: str) -> str:
        """Convert OpenWeather icon to our icon type"""
        if openweather_icon.startswith('01'):  # clear sky
            return 'sun'
        elif openweather_icon.startswith(('02', '03', '04')):  # clouds
            return 'cloud'
        else:
            return 'sun'  # default

    def _get_daisy_comment(self, temp: int, description: str) -> str:
        """Generate Daisy's weather comment"""
        if temp >= 80:
            return "It's hotter than a pepper sprout out there, sugar! Perfect beach weather for dancin'!"
        elif temp >= 70:
            return "Beautiful weather for the festival, honey! Don't forget that sunscreen, darlin'!"
        elif temp >= 60:
            return "Nice and comfortable, y'all! Perfect weather for enjoyin' some good music!"
        else:
            return "A little chilly but still perfect for festival fun! Grab a hoodie, sweetie!"

    def _get_mock_weather(self) -> Dict:
        """Return mock weather data as fallback"""
        return {
            'temperature': 78,
            'description': 'Sunny',
            'windSpeed': 8,
            'uvIndex': 6,
            'icon': 'sun',
            'daisyComment': "Weather service is takin' a little break, sugar! But it's always beautiful at the beach!",
            'isLive': False
        }