#!/usr/bin/env python3
"""
Barefoot Buddy Backend API Test Suite
"""
import requests
import json
import time
import asyncio
import websockets
import uuid
import logging
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# API Base URL
BASE_URL = "http://localhost:8001/api"
WS_URL = "ws://localhost:8001/ws"

class BarefootBuddyTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_user_id = f"test_user_{str(uuid.uuid4())[:8]}"
        self.test_group_id = "default"
        self.chat_session_id = None
        self.test_results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "test_details": []
        }

    def log_test_result(self, test_name: str, passed: bool, details: Dict = None):
        """Log test result and update counters"""
        result = "PASSED" if passed else "FAILED"
        logger.info(f"Test: {test_name} - {result}")
        if details:
            logger.info(f"Details: {json.dumps(details, indent=2)}")
        
        self.test_results["total_tests"] += 1
        if passed:
            self.test_results["passed_tests"] += 1
        else:
            self.test_results["failed_tests"] += 1
        
        self.test_results["test_details"].append({
            "name": test_name,
            "passed": passed,
            "details": details
        })

    def test_health_endpoint(self):
        """Test the health check endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/health")
            response.raise_for_status()
            data = response.json()
            
            passed = data.get("status") == "healthy" and "timestamp" in data
            self.log_test_result("Health Endpoint", passed, data)
            return passed
        except Exception as e:
            logger.error(f"Health endpoint test failed: {e}")
            self.log_test_result("Health Endpoint", False, {"error": str(e)})
            return False

    def test_weather_endpoint(self):
        """Test the weather endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/weather")
            response.raise_for_status()
            data = response.json()
            
            required_fields = ["temperature", "description", "windSpeed", "uvIndex", "icon", "daisyComment"]
            passed = all(field in data for field in required_fields)
            
            self.log_test_result("Weather Endpoint", passed, data)
            return passed
        except Exception as e:
            logger.error(f"Weather endpoint test failed: {e}")
            self.log_test_result("Weather Endpoint", False, {"error": str(e)})
            return False

    def test_artists_endpoint(self):
        """Test the artists endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/artists")
            response.raise_for_status()
            data = response.json()
            
            passed = "artists" in data and isinstance(data["artists"], list) and len(data["artists"]) > 0
            if passed:
                # Check first artist has required fields
                first_artist = data["artists"][0]
                required_fields = ["id", "name", "stage", "startTime", "endTime", "day"]
                passed = all(field in first_artist for field in required_fields)
            
            self.log_test_result("Artists Endpoint", passed, {
                "artist_count": len(data["artists"]) if "artists" in data else 0,
                "sample_artist": data["artists"][0] if "artists" in data and len(data["artists"]) > 0 else None
            })
            return passed
        except Exception as e:
            logger.error(f"Artists endpoint test failed: {e}")
            self.log_test_result("Artists Endpoint", False, {"error": str(e)})
            return False

    def test_artist_starring(self):
        """Test starring an artist"""
        try:
            # Get artists first
            response = self.session.get(f"{BASE_URL}/artists")
            response.raise_for_status()
            data = response.json()
            
            if "artists" not in data or len(data["artists"]) == 0:
                self.log_test_result("Artist Starring", False, {"error": "No artists found"})
                return False
            
            # Get first artist ID
            artist_id = data["artists"][0]["id"]
            
            # Toggle star status
            response = self.session.post(
                f"{BASE_URL}/artists/{artist_id}/star",
                params={"user_id": self.test_user_id}
            )
            response.raise_for_status()
            star_data = response.json()
            
            passed = "artist_id" in star_data and "isStarred" in star_data
            self.log_test_result("Artist Starring", passed, star_data)
            return passed
        except Exception as e:
            logger.error(f"Artist starring test failed: {e}")
            self.log_test_result("Artist Starring", False, {"error": str(e)})
            return False

    def test_drink_round_endpoint(self):
        """Test the drink round endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/drinks/round")
            response.raise_for_status()
            data = response.json()
            
            required_fields = ["participants", "currentRound", "nextUp", "lastCompleted", "barefootPoints", "roundHistory"]
            passed = all(field in data for field in required_fields)
            
            self.log_test_result("Drink Round Endpoint", passed, data)
            return passed
        except Exception as e:
            logger.error(f"Drink round endpoint test failed: {e}")
            self.log_test_result("Drink Round Endpoint", False, {"error": str(e)})
            return False

    def test_chat_session_creation(self):
        """Test creating a chat session"""
        try:
            payload = {"user_id": self.test_user_id}
            response = self.session.post(f"{BASE_URL}/chat/session", json=payload)
            response.raise_for_status()
            data = response.json()
            
            passed = "session_id" in data and "status" in data and data["status"] == "created"
            if passed:
                self.chat_session_id = data["session_id"]
            
            self.log_test_result("Chat Session Creation", passed, data)
            return passed
        except Exception as e:
            logger.error(f"Chat session creation test failed: {e}")
            self.log_test_result("Chat Session Creation", False, {"error": str(e)})
            return False

    def test_chat_messaging(self):
        """Test sending messages to Daisy DukeBot"""
        if not self.chat_session_id:
            self.log_test_result("Chat Messaging", False, {"error": "No chat session ID available"})
            return False
        
        try:
            # Test message with festival question
            payload = {"message": "Tell me about the festival weather"}
            response = self.session.post(
                f"{BASE_URL}/chat/{self.chat_session_id}", 
                json=payload,
                params={"user_id": self.test_user_id}
            )
            response.raise_for_status()
            data = response.json()
            
            passed = "message" in data and "isBot" in data and data["isBot"] == True
            
            # Check for Southern personality markers
            southern_markers = ["y'all", "sugar", "honey", "darlin'", "sweetie"]
            has_southern_style = any(marker.lower() in data["message"].lower() for marker in southern_markers)
            
            # Check for festival knowledge
            festival_keywords = ["festival", "weather", "wildwood", "beach", "sunny", "temperature"]
            has_festival_knowledge = any(keyword.lower() in data["message"].lower() for keyword in festival_keywords)
            
            self.log_test_result("Chat Messaging", passed and has_southern_style and has_festival_knowledge, {
                "response": data["message"],
                "has_southern_style": has_southern_style,
                "has_festival_knowledge": has_festival_knowledge
            })
            return passed and has_southern_style and has_festival_knowledge
        except Exception as e:
            logger.error(f"Chat messaging test failed: {e}")
            self.log_test_result("Chat Messaging", False, {"error": str(e)})
            return False

    def test_chat_history(self):
        """Test retrieving chat history"""
        if not self.chat_session_id:
            self.log_test_result("Chat History", False, {"error": "No chat session ID available"})
            return False
        
        try:
            response = self.session.get(f"{BASE_URL}/chat/history/{self.chat_session_id}")
            response.raise_for_status()
            data = response.json()
            
            passed = "messages" in data and isinstance(data["messages"], list)
            if passed:
                # Should have at least 2 messages (user + bot)
                passed = len(data["messages"]) >= 2
            
            self.log_test_result("Chat History", passed, {
                "message_count": len(data["messages"]) if "messages" in data else 0,
                "sample_messages": data["messages"][:2] if "messages" in data and len(data["messages"]) >= 2 else []
            })
            return passed
        except Exception as e:
            logger.error(f"Chat history test failed: {e}")
            self.log_test_result("Chat History", False, {"error": str(e)})
            return False
            
    def test_function_calling_weather(self):
        """Test function calling for weather queries"""
        if not self.chat_session_id:
            self.log_test_result("Function Calling - Weather", False, {"error": "No chat session ID available"})
            return False
        
        try:
            # Test message that should trigger weather function call
            payload = {"message": "What's the weather like at the festival?"}
            response = self.session.post(
                f"{BASE_URL}/chat/{self.chat_session_id}", 
                json=payload,
                params={"user_id": self.test_user_id}
            )
            response.raise_for_status()
            data = response.json()
            
            passed = "message" in data and "isBot" in data and data["isBot"] == True
            
            # Check for weather-specific information that would come from function call
            weather_indicators = ["temperature", "degrees", "°F", "wind", "mph", "sunny", "cloudy", "rain"]
            has_weather_data = any(indicator.lower() in data["message"].lower() for indicator in weather_indicators)
            
            # Check for Wildwood specific mention
            location_indicators = ["wildwood", "new jersey", "nj", "beach"]
            has_location_data = any(indicator.lower() in data["message"].lower() for indicator in location_indicators)
            
            self.log_test_result("Function Calling - Weather", passed and has_weather_data, {
                "response": data["message"],
                "has_weather_data": has_weather_data,
                "has_location_data": has_location_data
            })
            return passed and has_weather_data
        except Exception as e:
            logger.error(f"Weather function calling test failed: {e}")
            self.log_test_result("Function Calling - Weather", False, {"error": str(e)})
            return False
            
    def test_function_calling_location(self):
        """Test function calling for location queries"""
        if not self.chat_session_id:
            self.log_test_result("Function Calling - Location", False, {"error": "No chat session ID available"})
            return False
        
        try:
            # First update location to ensure there's data
            location_payload = {
                "latitude": 39.0056,
                "longitude": -74.8157,
                "accuracy": 10.5,
                "ghost_mode": False
            }
            self.session.post(f"{BASE_URL}/location/update/{self.test_user_id}", json=location_payload)
            
            # Test message that should trigger location function call
            payload = {"message": "How many people are in our group?"}
            response = self.session.post(
                f"{BASE_URL}/chat/{self.chat_session_id}", 
                json=payload,
                params={"user_id": self.test_user_id}
            )
            response.raise_for_status()
            data = response.json()
            
            passed = "message" in data and "isBot" in data and data["isBot"] == True
            
            # Check for location/group specific information that would come from function call
            location_indicators = ["people", "group", "members", "users", "visible", "ghost"]
            has_location_data = any(indicator.lower() in data["message"].lower() for indicator in location_indicators)
            
            self.log_test_result("Function Calling - Location", passed and has_location_data, {
                "response": data["message"],
                "has_location_data": has_location_data
            })
            return passed and has_location_data
        except Exception as e:
            logger.error(f"Location function calling test failed: {e}")
            self.log_test_result("Function Calling - Location", False, {"error": str(e)})
            return False
            
    def test_function_calling_search(self):
        """Test function calling for web search queries"""
        if not self.chat_session_id:
            self.log_test_result("Function Calling - Search", False, {"error": "No chat session ID available"})
            return False
        
        try:
            # Test message that should trigger web search function call
            payload = {"message": "Where can we get good food near the festival?"}
            response = self.session.post(
                f"{BASE_URL}/chat/{self.chat_session_id}", 
                json=payload,
                params={"user_id": self.test_user_id}
            )
            response.raise_for_status()
            data = response.json()
            
            passed = "message" in data and "isBot" in data and data["isBot"] == True
            
            # Check for search-specific information that would come from function call
            search_indicators = ["restaurant", "food", "eat", "dining", "cafe", "bar", "grill"]
            has_search_data = any(indicator.lower() in data["message"].lower() for indicator in search_indicators)
            
            # Check for specific business names or addresses that would indicate real search results
            specific_indicators = ["street", "avenue", "located", "open", "serves", "menu", "popular"]
            has_specific_data = any(indicator.lower() in data["message"].lower() for indicator in specific_indicators)
            
            self.log_test_result("Function Calling - Search", passed and has_search_data, {
                "response": data["message"],
                "has_search_data": has_search_data,
                "has_specific_data": has_specific_data
            })
            return passed and has_search_data
        except Exception as e:
            logger.error(f"Search function calling test failed: {e}")
            self.log_test_result("Function Calling - Search", False, {"error": str(e)})
            return False

    def test_location_update(self):
        """Test updating user location"""
        try:
            payload = {
                "latitude": 39.0056,
                "longitude": -74.8157,
                "accuracy": 10.5,
                "ghost_mode": False
            }
            response = self.session.post(f"{BASE_URL}/location/update/{self.test_user_id}", json=payload)
            response.raise_for_status()
            data = response.json()
            
            passed = "status" in data and data["status"] == "success"
            self.log_test_result("Location Update", passed, data)
            return passed
        except Exception as e:
            logger.error(f"Location update test failed: {e}")
            self.log_test_result("Location Update", False, {"error": str(e)})
            return False

    def test_ghost_mode_toggle(self):
        """Test toggling ghost mode"""
        try:
            # Enable ghost mode
            payload = {"ghost_mode": True}
            response = self.session.post(f"{BASE_URL}/location/ghost-mode/{self.test_user_id}", json=payload)
            response.raise_for_status()
            data = response.json()
            
            passed = "status" in data and data["status"] == "success" and "ghost_mode" in data and data["ghost_mode"] == True
            
            # Disable ghost mode
            if passed:
                payload = {"ghost_mode": False}
                response = self.session.post(f"{BASE_URL}/location/ghost-mode/{self.test_user_id}", json=payload)
                response.raise_for_status()
                data = response.json()
                
                passed = "status" in data and data["status"] == "success" and "ghost_mode" in data and data["ghost_mode"] == False
            
            self.log_test_result("Ghost Mode Toggle", passed, data)
            return passed
        except Exception as e:
            logger.error(f"Ghost mode toggle test failed: {e}")
            self.log_test_result("Ghost Mode Toggle", False, {"error": str(e)})
            return False

    def test_group_location_retrieval(self):
        """Test retrieving group locations"""
        try:
            # First update location to ensure there's data
            payload = {
                "latitude": 39.0056,
                "longitude": -74.8157,
                "accuracy": 10.5,
                "ghost_mode": False
            }
            self.session.post(f"{BASE_URL}/location/update/{self.test_user_id}", json=payload)
            
            # Get group locations
            response = self.session.get(f"{BASE_URL}/location/group/{self.test_group_id}")
            response.raise_for_status()
            data = response.json()
            
            passed = "locations" in data and isinstance(data["locations"], dict)
            self.log_test_result("Group Location Retrieval", passed, {
                "location_count": len(data["locations"]) if "locations" in data else 0,
                "includes_test_user": self.test_user_id in data.get("locations", {})
            })
            return passed
        except Exception as e:
            logger.error(f"Group location retrieval test failed: {e}")
            self.log_test_result("Group Location Retrieval", False, {"error": str(e)})
            return False

    def test_presence_update(self):
        """Test updating user presence"""
        try:
            # Set online
            payload = {"online": True}
            response = self.session.post(f"{BASE_URL}/presence/{self.test_user_id}", json=payload)
            response.raise_for_status()
            data = response.json()
            
            passed = "status" in data and data["status"] == "success" and "online" in data and data["online"] == True
            
            # Set offline
            if passed:
                payload = {"online": False}
                response = self.session.post(f"{BASE_URL}/presence/{self.test_user_id}", json=payload)
                response.raise_for_status()
                data = response.json()
                
                passed = "status" in data and data["status"] == "success" and "online" in data and data["online"] == False
            
            self.log_test_result("Presence Update", passed, data)
            return passed
        except Exception as e:
            logger.error(f"Presence update test failed: {e}")
            self.log_test_result("Presence Update", False, {"error": str(e)})
            return False

    def test_group_presence(self):
        """Test retrieving group presence"""
        try:
            # First update presence to ensure there's data
            payload = {"online": True}
            self.session.post(f"{BASE_URL}/presence/{self.test_user_id}", json=payload)
            
            # Get group presence
            response = self.session.get(f"{BASE_URL}/presence/group/{self.test_group_id}")
            response.raise_for_status()
            data = response.json()
            
            passed = "presence" in data and isinstance(data["presence"], dict)
            self.log_test_result("Group Presence", passed, {
                "presence_count": len(data["presence"]) if "presence" in data else 0,
                "includes_test_user": self.test_user_id in data.get("presence", {})
            })
            return passed
        except Exception as e:
            logger.error(f"Group presence test failed: {e}")
            self.log_test_result("Group Presence", False, {"error": str(e)})
            return False

    async def test_websocket_connection(self):
        """Test WebSocket connection and real-time updates"""
        try:
            # Connect to WebSocket
            async with websockets.connect(WS_URL) as websocket:
                # Send ping message
                ping_message = json.dumps({"type": "ping"})
                await websocket.send(ping_message)
                
                # Wait for pong response with timeout
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(response)
                
                passed = "type" in data and data["type"] == "pong"
                
                # Send location update
                if passed:
                    location_message = json.dumps({
                        "type": "location_update",
                        "user_id": self.test_user_id,
                        "data": {
                            "latitude": 39.0056,
                            "longitude": -74.8157,
                            "timestamp": int(time.time() * 1000),
                            "ghost_mode": False
                        }
                    })
                    await websocket.send(location_message)
                    
                    # Try to receive broadcast (may not come back to same client)
                    try:
                        broadcast = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                        logger.info(f"Received broadcast: {broadcast}")
                    except asyncio.TimeoutError:
                        # This is acceptable as we might not receive our own broadcast
                        logger.info("No broadcast received within timeout (expected)")
                
                self.log_test_result("WebSocket Connection", passed, {
                    "ping_response": data
                })
                return passed
                
        except Exception as e:
            logger.error(f"WebSocket test failed: {e}")
            self.log_test_result("WebSocket Connection", False, {"error": str(e)})
            return False

    def run_all_tests(self):
        """Run all API tests"""
        logger.info("Starting Barefoot Buddy API tests...")
        
        # Basic endpoints
        self.test_health_endpoint()
        
        # Festival data endpoints
        self.test_weather_endpoint()
        self.test_artists_endpoint()
        self.test_artist_starring()
        self.test_drink_round_endpoint()
        
        # Chat endpoints
        self.test_chat_session_creation()
        self.test_chat_messaging()
        self.test_chat_history()
        
        # Location endpoints
        self.test_location_update()
        self.test_ghost_mode_toggle()
        self.test_group_location_retrieval()
        self.test_presence_update()
        self.test_group_presence()
        
        # WebSocket test (async)
        asyncio.run(self.test_websocket_connection())
        
        # Print summary
        self.print_summary()
        
        return self.test_results

    def print_summary(self):
        """Print test summary"""
        logger.info("=" * 50)
        logger.info("BAREFOOT BUDDY API TEST SUMMARY")
        logger.info("=" * 50)
        logger.info(f"Total Tests: {self.test_results['total_tests']}")
        logger.info(f"Passed: {self.test_results['passed_tests']}")
        logger.info(f"Failed: {self.test_results['failed_tests']}")
        logger.info("=" * 50)
        
        # Print failed tests for quick reference
        if self.test_results['failed_tests'] > 0:
            logger.info("FAILED TESTS:")
            for test in self.test_results['test_details']:
                if not test['passed']:
                    logger.info(f"- {test['name']}: {test.get('details', {}).get('error', 'Unknown error')}")
            logger.info("=" * 50)

def test_smart_daisy_functionality():
    """Test the updated Smart Daisy functionality"""
    tester = BarefootBuddyTester()
    
    # Create a chat session first
    tester.test_chat_session_creation()
    
    if not tester.chat_session_id:
        logger.error("Failed to create chat session, cannot test Smart Daisy functionality")
        return False
    
    # Test 1: Weather Query Testing
    logger.info("\n=== TESTING SMART DAISY WEATHER FUNCTIONALITY ===")
    weather_queries = [
        "What's the weather like?",
        "How's the temperature at the festival?"
    ]
    
    weather_results = []
    for query in weather_queries:
        try:
            logger.info(f"Testing weather query: '{query}'")
            payload = {"message": query}
            response = tester.session.post(
                f"{BASE_URL}/chat/{tester.chat_session_id}", 
                json=payload,
                params={"user_id": tester.test_user_id}
            )
            response.raise_for_status()
            data = response.json()
            
            # Check for weather indicators
            weather_indicators = ["temperature", "degrees", "°F", "wind", "mph", "sunny", "cloudy", "rain"]
            has_weather_data = any(indicator.lower() in data["message"].lower() for indicator in weather_indicators)
            
            # Check for Southern personality
            southern_markers = ["y'all", "sugar", "honey", "darlin'", "sweetie"]
            has_southern_style = any(marker.lower() in data["message"].lower() for marker in southern_markers)
            
            result = {
                "query": query,
                "response": data["message"],
                "has_weather_data": has_weather_data,
                "has_southern_style": has_southern_style,
                "passed": has_weather_data and has_southern_style
            }
            weather_results.append(result)
            logger.info(f"Weather query test {'PASSED' if result['passed'] else 'FAILED'}")
            logger.info(f"Response: {data['message']}")
            logger.info(f"Has weather data: {has_weather_data}")
            logger.info(f"Has Southern style: {has_southern_style}")
            
        except Exception as e:
            logger.error(f"Error testing weather query: {e}")
            weather_results.append({
                "query": query,
                "error": str(e),
                "passed": False
            })
    
    # Test 2: Web Search Testing
    logger.info("\n=== TESTING SMART DAISY WEB SEARCH FUNCTIONALITY ===")
    search_queries = [
        "Where can I find good restaurants?",
        "Best pizza near the festival?"
    ]
    
    search_results = []
    for query in search_queries:
        try:
            logger.info(f"Testing search query: '{query}'")
            payload = {"message": query}
            response = tester.session.post(
                f"{BASE_URL}/chat/{tester.chat_session_id}", 
                json=payload,
                params={"user_id": tester.test_user_id}
            )
            response.raise_for_status()
            data = response.json()
            
            # Check for search-specific information
            search_indicators = ["restaurant", "food", "eat", "dining", "cafe", "bar", "grill", "pizza"]
            has_search_data = any(indicator.lower() in data["message"].lower() for indicator in search_indicators)
            
            # Check for specific business names or addresses
            specific_indicators = ["street", "avenue", "located", "open", "serves", "menu", "popular"]
            has_specific_data = any(indicator.lower() in data["message"].lower() for indicator in specific_indicators)
            
            # Check for Southern personality
            southern_markers = ["y'all", "sugar", "honey", "darlin'", "sweetie"]
            has_southern_style = any(marker.lower() in data["message"].lower() for marker in southern_markers)
            
            result = {
                "query": query,
                "response": data["message"],
                "has_search_data": has_search_data,
                "has_specific_data": has_specific_data,
                "has_southern_style": has_southern_style,
                "passed": has_search_data and has_southern_style
            }
            search_results.append(result)
            logger.info(f"Search query test {'PASSED' if result['passed'] else 'FAILED'}")
            logger.info(f"Response: {data['message']}")
            logger.info(f"Has search data: {has_search_data}")
            logger.info(f"Has specific data: {has_specific_data}")
            logger.info(f"Has Southern style: {has_southern_style}")
            
        except Exception as e:
            logger.error(f"Error testing search query: {e}")
            search_results.append({
                "query": query,
                "error": str(e),
                "passed": False
            })
    
    # Test 3: Location Query Testing
    logger.info("\n=== TESTING SMART DAISY LOCATION FUNCTIONALITY ===")
    location_queries = [
        "How many people are in our group?",
        "Where is everyone?"
    ]
    
    # First update location to ensure there's data
    try:
        location_payload = {
            "latitude": 39.0056,
            "longitude": -74.8157,
            "accuracy": 10.5,
            "ghost_mode": False
        }
        tester.session.post(f"{BASE_URL}/location/update/{tester.test_user_id}", json=location_payload)
    except Exception as e:
        logger.error(f"Error setting up location data: {e}")
    
    location_results = []
    for query in location_queries:
        try:
            logger.info(f"Testing location query: '{query}'")
            payload = {"message": query}
            response = tester.session.post(
                f"{BASE_URL}/chat/{tester.chat_session_id}", 
                json=payload,
                params={"user_id": tester.test_user_id}
            )
            response.raise_for_status()
            data = response.json()
            
            # Check for location/group specific information
            location_indicators = ["people", "group", "members", "users", "visible", "ghost"]
            has_location_data = any(indicator.lower() in data["message"].lower() for indicator in location_indicators)
            
            # Check for Southern personality
            southern_markers = ["y'all", "sugar", "honey", "darlin'", "sweetie"]
            has_southern_style = any(marker.lower() in data["message"].lower() for marker in southern_markers)
            
            result = {
                "query": query,
                "response": data["message"],
                "has_location_data": has_location_data,
                "has_southern_style": has_southern_style,
                "passed": has_location_data and has_southern_style
            }
            location_results.append(result)
            logger.info(f"Location query test {'PASSED' if result['passed'] else 'FAILED'}")
            logger.info(f"Response: {data['message']}")
            logger.info(f"Has location data: {has_location_data}")
            logger.info(f"Has Southern style: {has_southern_style}")
            
        except Exception as e:
            logger.error(f"Error testing location query: {e}")
            location_results.append({
                "query": query,
                "error": str(e),
                "passed": False
            })
    
    # Test 4: General Chat Testing
    logger.info("\n=== TESTING SMART DAISY GENERAL CHAT FUNCTIONALITY ===")
    general_queries = [
        "Hello Daisy!",
        "Tell me about the festival"
    ]
    
    general_results = []
    for query in general_queries:
        try:
            logger.info(f"Testing general query: '{query}'")
            payload = {"message": query}
            response = tester.session.post(
                f"{BASE_URL}/chat/{tester.chat_session_id}", 
                json=payload,
                params={"user_id": tester.test_user_id}
            )
            response.raise_for_status()
            data = response.json()
            
            # Check for festival information
            festival_indicators = ["festival", "barefoot", "country", "music", "wildwood", "beach"]
            has_festival_info = any(indicator.lower() in data["message"].lower() for indicator in festival_indicators)
            
            # Check for Southern personality
            southern_markers = ["y'all", "sugar", "honey", "darlin'", "sweetie"]
            has_southern_style = any(marker.lower() in data["message"].lower() for marker in southern_markers)
            
            result = {
                "query": query,
                "response": data["message"],
                "has_festival_info": has_festival_info,
                "has_southern_style": has_southern_style,
                "passed": has_festival_info and has_southern_style
            }
            general_results.append(result)
            logger.info(f"General query test {'PASSED' if result['passed'] else 'FAILED'}")
            logger.info(f"Response: {data['message']}")
            logger.info(f"Has festival info: {has_festival_info}")
            logger.info(f"Has Southern style: {has_southern_style}")
            
        except Exception as e:
            logger.error(f"Error testing general query: {e}")
            general_results.append({
                "query": query,
                "error": str(e),
                "passed": False
            })
    
    # Summarize results
    logger.info("\n=== SMART DAISY FUNCTIONALITY TEST SUMMARY ===")
    
    weather_passed = all(result.get("passed", False) for result in weather_results)
    search_passed = all(result.get("passed", False) for result in search_results)
    location_passed = all(result.get("passed", False) for result in location_results)
    general_passed = all(result.get("passed", False) for result in general_results)
    
    logger.info(f"Weather Query Tests: {'PASSED' if weather_passed else 'FAILED'}")
    logger.info(f"Web Search Tests: {'PASSED' if search_passed else 'FAILED'}")
    logger.info(f"Location Query Tests: {'PASSED' if location_passed else 'FAILED'}")
    logger.info(f"General Chat Tests: {'PASSED' if general_passed else 'FAILED'}")
    
    overall_passed = weather_passed and search_passed and location_passed and general_passed
    logger.info(f"Overall Smart Daisy Functionality: {'PASSED' if overall_passed else 'FAILED'}")
    
    return {
        "overall_passed": overall_passed,
        "weather_passed": weather_passed,
        "search_passed": search_passed,
        "location_passed": location_passed,
        "general_passed": general_passed,
        "weather_results": weather_results,
        "search_results": search_results,
        "location_results": location_results,
        "general_results": general_results
    }

if __name__ == "__main__":
    # Run standard tests
    tester = BarefootBuddyTester()
    tester.run_all_tests()
    
    # Run Smart Daisy specific tests
    logger.info("\n\n=== RUNNING SMART DAISY FUNCTIONALITY TESTS ===\n")
    smart_daisy_results = test_smart_daisy_functionality()
    
    # Print final summary
    logger.info("\n=== FINAL TEST SUMMARY ===")
    if isinstance(smart_daisy_results, dict):
        logger.info(f"Smart Daisy Functionality: {'PASSED' if smart_daisy_results.get('overall_passed', False) else 'FAILED'}")
        logger.info(f"- Weather Queries: {'PASSED' if smart_daisy_results.get('weather_passed', False) else 'FAILED'}")
        logger.info(f"- Web Search Queries: {'PASSED' if smart_daisy_results.get('search_passed', False) else 'FAILED'}")
        logger.info(f"- Location Queries: {'PASSED' if smart_daisy_results.get('location_passed', False) else 'FAILED'}")
        logger.info(f"- General Chat: {'PASSED' if smart_daisy_results.get('general_passed', False) else 'FAILED'}")
    else:
        logger.info("Smart Daisy Functionality: FAILED (Test execution error)")