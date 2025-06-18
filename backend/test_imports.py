#!/usr/bin/env python3
import sys
sys.path.append('/app/backend')

# Test imports
try:
    from chat_service import DaisyDukeBotService
    print("✓ chat_service imported successfully")
except Exception as e:
    print(f"✗ chat_service import failed: {e}")

try:
    from location_service import LocationService
    print("✓ location_service imported successfully")
except Exception as e:
    print(f"✗ location_service import failed: {e}")

try:
    from weather_service import WeatherService
    print("✓ weather_service imported successfully")
except Exception as e:
    print(f"✗ weather_service import failed: {e}")

print("All services imported successfully!")