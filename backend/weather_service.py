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
            # Open-Meteo free API parameters
            params = {
                'latitude': self.wildwood_lat,
                'longitude': self.wildwood_lng,
                'current_weather': 'true',
                'temperature_unit': 'fahrenheit',
                'windspeed_unit': 'mph'
            }
            
            response = requests.get(self.base_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                current = data['current_weather']
                
                # Convert to our format
                weather_data = {
                    'temperature': int(current['temperature']),
                    'description': self._get_description(current['weathercode']),
                    'windSpeed': int(current['windspeed']),
                    'uvIndex': 6,  # Static for now
                    'icon': self._get_icon_type(current['weathercode']),
                    'daisyComment': self._get_daisy_comment(
                        int(current['temperature']), 
                        self._get_description(current['weathercode'])
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

    def _get_description(self, weather_code: int) -> str:
        """Convert weather code to description"""
        descriptions = {
            0: 'Clear Sky',
            1: 'Mainly Clear', 
            2: 'Partly Cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing Rime Fog',
            51: 'Light Drizzle',
            53: 'Moderate Drizzle',
            55: 'Dense Drizzle',
            61: 'Slight Rain',
            63: 'Moderate Rain',
            65: 'Heavy Rain',
            80: 'Slight Rain Showers',
            81: 'Moderate Rain Showers',
            82: 'Violent Rain Showers'
        }
        return descriptions.get(weather_code, 'Clear')

    def _get_icon_type(self, weather_code: int) -> str:
        """Convert weather code to our icon type"""
        if weather_code in [0, 1]:  # clear/mainly clear
            return 'sun'
        elif weather_code in [2, 3]:  # cloudy
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