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

        # Initialize Perplexity client for web search
        self.perplexity_key = os.environ.get('PERPLEXITY_API_KEY', '')
        if self.perplexity_key:
            self.search_client = OpenAI(
                api_key=self.perplexity_key, 
                base_url="https://api.perplexity.ai"
            )

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
        """Send a message to Daisy DukeBot and get response"""
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

            # Create LlmChat instance with minimal system message (can be overridden by your system)
            chat = LlmChat(
                api_key=self.openai_api_key,
                session_id=session_id,
                system_message="You are a helpful assistant."
            ).with_model("openai", "gpt-4o")

            # Send message and get response
            message = UserMessage(text=user_message)
            bot_response = await chat.send_message(message)

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
            fallback_response = "Well bless your heart, I'm havin' a little technical trouble right now, sugar! Give me just a moment and try again, would ya?"
            
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