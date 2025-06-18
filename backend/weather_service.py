"""
Weather Service for real weather data (OpenWeatherMap placeholder)
"""
import requests
import os
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.api_key = os.environ.get('OPENWEATHER_API_KEY')
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"
        
        # Wildwood, NJ coordinates
        self.wildwood_lat = 39.0056
        self.wildwood_lng = -74.8157

    async def get_current_weather(self) -> Dict:
        """Get current weather for Wildwood, NJ"""
        try:
            if not self.api_key or self.api_key == "placeholder_need_to_get_key":
                # Return mock data if no API key, but make it more dynamic
                import random
                temps = [75, 76, 77, 78, 79, 80, 81, 82]
                descriptions = ['Sunny', 'Partly Cloudy', 'Clear', 'Mostly Sunny']
                winds = [6, 7, 8, 9, 10, 11, 12]
                
                temp = random.choice(temps)
                desc = random.choice(descriptions)
                wind = random.choice(winds)
                
                return {
                    'temperature': temp,
                    'description': desc,
                    'windSpeed': wind,
                    'uvIndex': 6,
                    'icon': 'sun',
                    'daisyComment': self._get_daisy_comment(temp, desc),
                    'isLive': False  # Flag to indicate this is mock data
                }
            
            params = {
                'lat': self.wildwood_lat,
                'lon': self.wildwood_lng,
                'appid': self.api_key,
                'units': 'imperial'  # Fahrenheit
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Convert to our format
            weather_data = {
                'temperature': int(data['main']['temp']),
                'description': data['weather'][0]['description'].title(),
                'windSpeed': int(data['wind']['speed']),
                'uvIndex': 6,  # OpenWeather UV requires separate API call
                'icon': self._get_icon_type(data['weather'][0]['icon']),
                'daisyComment': self._get_daisy_comment(
                    int(data['main']['temp']), 
                    data['weather'][0]['description']
                ),
                'isLive': True  # Flag to indicate this is real data
            }
            
            return weather_data
            
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
        """Return mock weather data"""
        return {
            'temperature': 78,
            'description': 'Sunny',
            'windSpeed': 8,
            'uvIndex': 6,
            'icon': 'sun',
            'daisyComment': "Perfect beach weather, sugar! Time to get your boots sandy!"
        }