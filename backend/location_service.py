"""
Firebase Realtime Database Location Tracking Service
"""
import firebase_admin
from firebase_admin import credentials, db
import os
import time
import json
from typing import Dict, Optional, List
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

class LocationService:
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db_client = db_client
        self.db = db_client[os.environ['DB_NAME']]
        
        # Initialize Firebase if not already done
        if not firebase_admin._apps:
            try:
                # For Firebase without service account file (using database URL only)
                firebase_admin.initialize_app(options={
                    'databaseURL': os.environ['FIREBASE_DATABASE_URL']
                })
                logger.info("Firebase initialized successfully")
            except Exception as e:
                logger.error(f"Firebase initialization error: {e}")
                
        self.firebase_db = db
        self.locations_ref = self.firebase_db.reference('locations')
        self.presence_ref = self.firebase_db.reference('presence')

    async def update_user_location(self, user_id: str, location_data: Dict, ghost_mode: bool = False):
        """Update user's location in Firebase and MongoDB"""
        try:
            timestamp = int(time.time() * 1000)
            
            location_update = {
                'latitude': location_data['latitude'],
                'longitude': location_data['longitude'],
                'timestamp': timestamp,
                'ghost_mode': ghost_mode,
                'accuracy': location_data.get('accuracy', 0)
            }
            
            # Update Firebase (only if not in ghost mode)
            if not ghost_mode:
                self.locations_ref.child(user_id).set(location_update)
            else:
                # Remove location when in ghost mode
                self.locations_ref.child(user_id).delete()
            
            # Always update presence
            self.presence_ref.child(user_id).set({
                'online': True,
                'last_seen': timestamp,
                'ghost_mode': ghost_mode
            })

            # Also store in MongoDB for persistence
            await self.db.user_locations.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "user_id": user_id,
                        "latitude": location_data['latitude'],
                        "longitude": location_data['longitude'],
                        "timestamp": timestamp,
                        "ghost_mode": ghost_mode,
                        "accuracy": location_data.get('accuracy', 0)
                    }
                },
                upsert=True
            )

            return {"status": "success", "message": "Location updated"}

        except Exception as e:
            logger.error(f"Error updating location: {e}")
            return {"status": "error", "message": str(e)}

    async def get_group_locations(self, group_id: str = "default", exclude_user: str = None) -> Dict:
        """Get all locations for a group, excluding ghost mode users"""
        try:
            # Get from Firebase for real-time data
            locations = self.locations_ref.get() or {}
            group_locations = {}
            
            for user_id, location in locations.items():
                if user_id != exclude_user and not location.get('ghost_mode', False):
                    group_locations[user_id] = location
            
            return {"locations": group_locations}

        except Exception as e:
            logger.error(f"Error getting group locations: {e}")
            # Fallback to MongoDB if Firebase fails
            try:
                locations_cursor = self.db.user_locations.find({
                    "ghost_mode": {"$ne": True}
                })
                locations = await locations_cursor.to_list(100)
                
                group_locations = {}
                for loc in locations:
                    if loc["user_id"] != exclude_user:
                        group_locations[loc["user_id"]] = {
                            "latitude": loc["latitude"],
                            "longitude": loc["longitude"],
                            "timestamp": loc["timestamp"],
                            "accuracy": loc.get("accuracy", 0)
                        }
                
                return {"locations": group_locations}
            except Exception as mongo_error:
                logger.error(f"MongoDB fallback also failed: {mongo_error}")
                return {"locations": {}}

    async def set_ghost_mode(self, user_id: str, ghost_mode: bool):
        """Toggle ghost mode for user"""
        try:
            timestamp = int(time.time() * 1000)
            
            if ghost_mode:
                # Remove location when entering ghost mode
                self.locations_ref.child(user_id).delete()
            
            # Update presence
            self.presence_ref.child(user_id).update({
                'ghost_mode': ghost_mode,
                'last_seen': timestamp
            })

            # Update MongoDB
            await self.db.user_locations.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "ghost_mode": ghost_mode,
                        "last_seen": timestamp
                    }
                }
            )

            return {"status": "success", "ghost_mode": ghost_mode}

        except Exception as e:
            logger.error(f"Error setting ghost mode: {e}")
            return {"status": "error", "message": str(e)}

    async def update_presence(self, user_id: str, online: bool):
        """Update user presence status"""
        try:
            timestamp = int(time.time() * 1000)
            
            self.presence_ref.child(user_id).update({
                'online': online,
                'last_seen': timestamp
            })

            # Update MongoDB
            await self.db.user_presence.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "user_id": user_id,
                        "online": online,
                        "last_seen": timestamp
                    }
                },
                upsert=True
            )

            return {"status": "success", "online": online}

        except Exception as e:
            logger.error(f"Error updating presence: {e}")
            return {"status": "error", "message": str(e)}

    async def get_presence_status(self, group_id: str = "default") -> Dict:
        """Get presence status for all users"""
        try:
            presence = self.presence_ref.get() or {}
            return {"presence": presence}
        except Exception as e:
            logger.error(f"Error getting presence: {e}")
            return {"presence": {}}