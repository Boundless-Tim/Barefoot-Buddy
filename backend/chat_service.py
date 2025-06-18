"""
Daisy DukeBot Chat Service using emergentintegrations
"""
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid
import os
from typing import List, Dict, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

class DaisyDukeBotService:
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db_client = db_client
        self.db = db_client[os.environ['DB_NAME']]
        self.openai_api_key = os.environ.get('OPENAI_API_KEY')
        
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

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