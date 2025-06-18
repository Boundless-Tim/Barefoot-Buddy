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

if __name__ == "__main__":
    tester = BarefootBuddyTester()
    tester.run_all_tests()