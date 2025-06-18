"""
Daisy DukeBot Chat Service using emergentintegrations with function calling
"""
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid
import os
from typing import List, Dict, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import json
import requests
from openai import OpenAI

logger = logging.getLogger(__name__)

class DaisyDukeBotService:
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db_client = db_client
        self.db = db_client[os.environ['DB_NAME']]
        self.openai_api_key = os.environ.get('OPENAI_API_KEY')
        
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        # Initialize LangSearch client for web search
        self.langsearch_key = os.environ.get('LANGSEARCH_API_KEY', '')
        if self.langsearch_key:
            import httpx
            self.search_client = httpx.AsyncClient()

    def _get_current_weather(self, location: str = "Wildwood, NJ") -> Dict:
        """Get current weather data"""
        try:
            # Import here to avoid circular imports
            from weather_service import WeatherService
            import asyncio
            
            weather_service = WeatherService()
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            weather_data = loop.run_until_complete(weather_service.get_current_weather())
            loop.close()
            
            return {
                "location": location,
                "temperature": weather_data.get("temperature", "Unknown"),
                "description": weather_data.get("description", "Unknown"),
                "wind_speed": weather_data.get("windSpeed", "Unknown"),
                "daisy_comment": weather_data.get("daisyComment", "")
            }
        except Exception as e:
            logger.error(f"Error getting weather: {e}")
            return {"location": location, "error": "Weather data unavailable"}

    def _get_group_locations(self) -> Dict:
        """Get current group location data"""
        try:
            import asyncio
            
            async def fetch_locations():
                locations = await self.db.user_locations.find({}).to_list(100)
                total_users = len(locations)
                visible_users = len([loc for loc in locations if not loc.get("ghost_mode", False)])
                ghost_users = len([loc for loc in locations if loc.get("ghost_mode", False)])
                
                return {
                    "total_users": total_users,
                    "visible_users": visible_users,
                    "ghost_users": ghost_users,
                    "locations": [
                        {
                            "user_id": loc["user_id"],
                            "latitude": loc.get("latitude"),
                            "longitude": loc.get("longitude"),
                            "ghost_mode": loc.get("ghost_mode", False)
                        } for loc in locations if not loc.get("ghost_mode", False)
                    ]
                }
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(fetch_locations())
            loop.close()
            
            return result
        except Exception as e:
            logger.error(f"Error getting group locations: {e}")
            return {"error": "Location data unavailable"}

    def _search_web(self, query: str) -> Dict:
        """Search the web using Perplexity API"""
        if not self.perplexity_key:
            return {"error": "Web search not available - no API key configured"}
        
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that provides current information about local businesses, events, and recommendations near Wildwood, NJ. Focus on practical, actionable information."
                },
                {
                    "role": "user", 
                    "content": f"Search for information about: {query}. Please provide current, relevant results with specific details."
                }
            ]
            
            response = self.search_client.chat.completions.create(
                model="sonar",
                messages=messages,
                max_tokens=500
            )
            
            return {
                "query": query,
                "result": response.choices[0].message.content
            }
        except Exception as e:
            logger.error(f"Error in web search: {e}")
            return {"query": query, "error": "Search unavailable"}

    async def create_chat_session(self, user_id: str) -> str:
        """Create a new chat session for a user"""
        session_id = str(uuid.uuid4())
        
        # Store session in database
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "message_count": 0
        }
        
        await self.db.chat_sessions.insert_one(session_data)
        return session_id

    async def get_chat_history(self, session_id: str) -> List[Dict]:
        """Get chat history for a session"""
        messages = await self.db.chat_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(100)
        
        return [
            {
                "id": str(msg["_id"]),
                "message": msg["content"],
                "isBot": msg["is_bot"],
                "timestamp": msg["timestamp"].isoformat()
            }
            for msg in messages
        ]

    async def send_message(self, session_id: str, user_message: str, user_id: str) -> Dict:
        """Send a message to Daisy DukeBot and get response with function calling"""
        try:
            # Store user message in database
            user_msg_data = {
                "session_id": session_id,
                "user_id": user_id,
                "content": user_message,
                "is_bot": False,
                "timestamp": datetime.utcnow()
            }
            await self.db.chat_messages.insert_one(user_msg_data)

            # Define available functions for OpenAI
            tools = [
                {
                    "type": "function",
                    "function": {
                        "name": "get_current_weather",
                        "description": "Get current weather information for the festival location",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "location": {
                                    "type": "string",
                                    "description": "Location to get weather for (defaults to Wildwood, NJ)"
                                }
                            }
                        }
                    }
                },
                {
                    "type": "function", 
                    "function": {
                        "name": "get_group_locations",
                        "description": "Get information about group members' locations and status",
                        "parameters": {"type": "object", "properties": {}}
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "search_web",
                        "description": "Search the web for current information about local businesses, restaurants, events, or attractions near the festival",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string",
                                    "description": "Search query for local information"
                                }
                            },
                            "required": ["query"]
                        }
                    }
                }
            ]

            # Create OpenAI client for function calling
            openai_client = OpenAI(api_key=self.openai_api_key)
            
            # Get recent chat history for context
            recent_messages = await self.db.chat_messages.find(
                {"session_id": session_id}
            ).sort("timestamp", -1).limit(10).to_list(10)
            
            # Build conversation history
            conversation = [
                {
                    "role": "system",
                    "content": "You are Daisy DukeBot, a helpful festival assistant for Barefoot Country Music Festival in Wildwood, NJ. You can access current weather, group location data, and search for local information to help festival-goers."
                }
            ]
            
            # Add recent conversation history (reverse to get chronological order)
            for msg in reversed(recent_messages[1:]):  # Skip the current message
                role = "assistant" if msg["is_bot"] else "user"
                conversation.append({"role": role, "content": msg["content"]})
            
            # Add current user message
            conversation.append({"role": "user", "content": user_message})

            # Make request with function calling
            response = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=conversation,
                tools=tools,
                tool_choice="auto"
            )

            # Handle function calls
            message = response.choices[0].message
            
            if message.tool_calls:
                # Execute function calls
                for tool_call in message.tool_calls:
                    function_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)
                    
                    if function_name == "get_current_weather":
                        function_result = self._get_current_weather(
                            arguments.get("location", "Wildwood, NJ")
                        )
                    elif function_name == "get_group_locations":
                        function_result = self._get_group_locations()
                    elif function_name == "search_web":
                        function_result = self._search_web(arguments["query"])
                    else:
                        function_result = {"error": "Unknown function"}
                    
                    # Add function result to conversation
                    conversation.append({
                        "role": "assistant",
                        "content": None,
                        "tool_calls": [tool_call]
                    })
                    conversation.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(function_result)
                    })
                
                # Get final response with function results
                final_response = openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=conversation
                )
                bot_response = final_response.choices[0].message.content
            else:
                bot_response = message.content

            # Store bot response in database
            bot_msg_data = {
                "session_id": session_id,
                "user_id": user_id,
                "content": bot_response,
                "is_bot": True,
                "timestamp": datetime.utcnow()
            }
            await self.db.chat_messages.insert_one(bot_msg_data)

            # Update session activity
            await self.db.chat_sessions.update_one(
                {"session_id": session_id},
                {
                    "$set": {"last_activity": datetime.utcnow()},
                    "$inc": {"message_count": 2}  # user + bot message
                }
            )

            return {
                "id": str(uuid.uuid4()),
                "message": bot_response,
                "isBot": True,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error in chat service: {e}")
            fallback_response = "I'm having some technical trouble right now. Please try again in a moment!"
            
            # Store fallback response
            bot_msg_data = {
                "session_id": session_id,
                "user_id": user_id,
                "content": fallback_response,
                "is_bot": True,
                "timestamp": datetime.utcnow(),
                "error": True
            }
            await self.db.chat_messages.insert_one(bot_msg_data)

            return {
                "id": str(uuid.uuid4()),
                "message": fallback_response,
                "isBot": True,
                "timestamp": datetime.utcnow().isoformat()
            }