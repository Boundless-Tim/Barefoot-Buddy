from fastapi import FastAPI, APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import os
import logging
import json
import uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Import services
from chat_service import DaisyDukeBotService
from location_service import LocationService
from weather_service import WeatherService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
chat_service = DaisyDukeBotService(client)
location_service = LocationService(client)
weather_service = WeatherService()

# Create the main app
app = FastAPI(title="Barefoot Buddy API")

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Configure for production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ChatMessage(BaseModel):
    message: str

class ChatSessionCreate(BaseModel):
    user_id: str

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = 0
    ghost_mode: Optional[bool] = False

class GhostModeUpdate(BaseModel):
    ghost_mode: bool

class PresenceUpdate(BaseModel):
    online: bool

# WebSocket connection manager for real-time features
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                self.active_connections.remove(connection)

manager = ConnectionManager()

# ===== BASIC ENDPOINTS =====

@api_router.get("/")
async def root():
    return {"message": "Barefoot Buddy API", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# ===== WEATHER ENDPOINTS =====

@api_router.get("/weather")
async def get_weather():
    """Get current weather for Wildwood, NJ"""
    weather_data = await weather_service.get_current_weather()
    return weather_data

# ===== CHAT ENDPOINTS =====

@api_router.post("/chat/session")
async def create_chat_session(session_data: ChatSessionCreate):
    """Create a new chat session"""
    try:
        session_id = await chat_service.create_chat_session(session_data.user_id)
        return {"session_id": session_id, "status": "created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    try:
        history = await chat_service.get_chat_history(session_id)
        return {"messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/chat/{session_id}")
async def send_chat_message(session_id: str, message: ChatMessage, user_id: Optional[str] = "anonymous"):
    """Send a message to Daisy DukeBot"""
    try:
        response = await chat_service.send_message(session_id, message.message, user_id)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== LOCATION ENDPOINTS =====

@api_router.post("/location/update/{user_id}")
async def update_location(user_id: str, location: LocationUpdate):
    """Update user location"""
    try:
        result = await location_service.update_user_location(
            user_id=user_id,
            location_data=location.dict(),
            ghost_mode=location.ghost_mode
        )
        
        # Broadcast location update to connected clients
        await manager.broadcast({
            "type": "location_update",
            "user_id": user_id,
            "data": {
                "latitude": location.latitude,
                "longitude": location.longitude,
                "timestamp": int(datetime.utcnow().timestamp() * 1000),
                "ghost_mode": location.ghost_mode
            }
        })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/location/group/{group_id}")
async def get_group_locations(group_id: str = "default", exclude_user: Optional[str] = None):
    """Get all group member locations"""
    try:
        locations = await location_service.get_group_locations(group_id, exclude_user)
        return locations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/location/ghost-mode/{user_id}")
async def toggle_ghost_mode(user_id: str, ghost_update: GhostModeUpdate):
    """Toggle ghost mode for user"""
    try:
        result = await location_service.set_ghost_mode(user_id, ghost_update.ghost_mode)
        
        # Broadcast ghost mode change
        await manager.broadcast({
            "type": "ghost_mode_update",
            "user_id": user_id,
            "ghost_mode": ghost_update.ghost_mode
        })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/presence/{user_id}")
async def update_presence(user_id: str, presence: PresenceUpdate):
    """Update user presence"""
    try:
        result = await location_service.update_presence(user_id, presence.online)
        
        # Broadcast presence update
        await manager.broadcast({
            "type": "presence_update",
            "user_id": user_id,
            "online": presence.online
        })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/presence/group/{group_id}")
async def get_group_presence(group_id: str = "default"):
    """Get presence status for group"""
    try:
        presence = await location_service.get_presence_status(group_id)
        return presence
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== FESTIVAL DATA ENDPOINTS =====

@api_router.get("/artists")
async def get_artists():
    """Get festival artists and lineup"""
    try:
        artists = await db.artists.find().to_list(1000)
        # Convert ObjectId to string for JSON serialization
        for artist in artists:
            artist["_id"] = str(artist["_id"])
        return {"artists": artists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/artists/{artist_id}/star")
async def toggle_artist_star(artist_id: str, user_id: Optional[str] = "anonymous"):
    """Toggle star status for an artist"""
    try:
        # Get current star status
        artist = await db.artists.find_one({"id": artist_id})
        if not artist:
            raise HTTPException(status_code=404, detail="Artist not found")
        
        new_starred = not artist.get("isStarred", False)
        
        # Update star status
        await db.artists.update_one(
            {"id": artist_id},
            {"$set": {"isStarred": new_starred}}
        )
        
        return {"artist_id": artist_id, "isStarred": new_starred}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/drinks/round")
async def get_drink_round():
    """Get current drink round information"""
    try:
        drink_round = await db.drink_rounds.find_one({"active": True})
        if not drink_round:
            # Create default drink round if none exists
            default_round = {
                "participants": ["Sarah", "Jake", "Emma", "Mike", "Ashley"],
                "currentRound": 2,
                "nextUp": "Jake",
                "lastCompleted": "Emma",
                "barefootPoints": {
                    "Sarah": 15,
                    "Jake": 12,
                    "Emma": 18,
                    "Mike": 9,
                    "Ashley": 6
                },
                "roundHistory": [
                    {"round": 1, "buyer": "Sarah", "timestamp": datetime.utcnow()},
                    {"round": 2, "buyer": "Emma", "timestamp": datetime.utcnow()}
                ],
                "active": True
            }
            await db.drink_rounds.insert_one(default_round)
            drink_round = default_round
        
        # Convert ObjectId to string
        drink_round["_id"] = str(drink_round["_id"])
        return drink_round
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/drinks/complete")
async def complete_drink_round(user_id: str):
    """Complete a drink round"""
    try:
        # Update drink round logic here
        # This is a simplified implementation
        await db.drink_rounds.update_one(
            {"active": True},
            {
                "$inc": {"currentRound": 1},
                "$set": {"lastCompleted": user_id},
                "$push": {
                    "roundHistory": {
                        "round": {"$add": ["$currentRound", 1]},
                        "buyer": user_id,
                        "timestamp": datetime.utcnow()
                    }
                }
            }
        )
        
        return {"status": "success", "message": "Drink round completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/drinks/reset")
async def reset_drink_rounds():
    """Reset drink rounds"""
    try:
        # Reset to default state
        default_round = {
            "participants": ["Sarah", "Jake", "Emma", "Mike", "Ashley"],
            "currentRound": 1,
            "nextUp": "Sarah",
            "lastCompleted": None,
            "barefootPoints": {
                "Sarah": 0,
                "Jake": 0,
                "Emma": 0,
                "Mike": 0,
                "Ashley": 0
            },
            "roundHistory": [],
            "active": True
        }
        
        # Remove all existing rounds and create new default
        await db.drink_rounds.delete_many({})
        await db.drink_rounds.insert_one(default_round)
        
        return {"status": "success", "message": "Drink rounds reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== WEBSOCKET ENDPOINT =====

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            elif message.get("type") == "location_update":
                # Broadcast location updates to all connected clients
                await manager.broadcast(message)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Include API router in main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database with festival data if needed"""
    logger.info("Starting Barefoot Buddy API...")
    
    # Clear existing artists and repopulate with full data
    await db.artists.delete_many({})
    logger.info("Cleared existing artists data")
    await populate_artists_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

async def populate_artists_data():
    """Populate database with festival artists from mock data"""
    artists_data = [
        # Thursday, June 19 - Coors Light Main Stage
        {
            "id": "1",
            "name": "Mara Justine",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-19T15:30:00",
            "endTime": "2025-06-19T16:30:00",
            "isStarred": False,
            "day": "Thursday"
        },
        {
            "id": "2",
            "name": "Not Leaving Sober",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-19T16:30:00",
            "endTime": "2025-06-19T17:30:00",
            "isStarred": False,
            "day": "Thursday"
        },
        {
            "id": "3",
            "name": "Tigirlily Gold",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-19T17:30:00",
            "endTime": "2025-06-19T19:00:00",
            "isStarred": True,
            "day": "Thursday"
        },
        {
            "id": "4",
            "name": "Colt Ford",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-19T19:00:00",
            "endTime": "2025-06-19T20:30:00",
            "isStarred": False,
            "day": "Thursday"
        },
        {
            "id": "5",
            "name": "Megan Moroney",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-19T20:30:00",
            "endTime": "2025-06-19T22:00:00",
            "isStarred": True,
            "day": "Thursday"
        },
        {
            "id": "6",
            "name": "Rascal Flatts",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-19T22:00:00",
            "endTime": "2025-06-19T23:30:00",
            "isStarred": True,
            "day": "Thursday"
        },
        # Thursday, June 19 - Patrón Tequila Stage
        {
            "id": "7",
            "name": "12/OC",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-19T20:00:00",
            "endTime": "2025-06-19T21:30:00",
            "isStarred": False,
            "day": "Thursday"
        },
        {
            "id": "8",
            "name": "Kevin Mac",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-19T21:30:00",
            "endTime": "2025-06-19T23:00:00",
            "isStarred": False,
            "day": "Thursday"
        },
        # Friday, June 20 - Coors Light Main Stage
        {
            "id": "9",
            "name": "Gillian Smith",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-20T15:00:00",
            "endTime": "2025-06-20T16:00:00",
            "isStarred": False,
            "day": "Friday"
        },
        {
            "id": "10",
            "name": "Avery Anna",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-20T16:00:00",
            "endTime": "2025-06-20T17:30:00",
            "isStarred": False,
            "day": "Friday"
        },
        {
            "id": "11",
            "name": "George Birge",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-20T17:30:00",
            "endTime": "2025-06-20T19:00:00",
            "isStarred": False,
            "day": "Friday"
        },
        {
            "id": "12",
            "name": "Sam Barber",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-20T19:00:00",
            "endTime": "2025-06-20T20:30:00",
            "isStarred": True,
            "day": "Friday"
        },
        {
            "id": "13",
            "name": "Warren Zeiders",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-20T20:30:00",
            "endTime": "2025-06-20T22:00:00",
            "isStarred": True,
            "day": "Friday"
        },
        {
            "id": "14",
            "name": "Lainey Wilson",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-20T22:00:00",
            "endTime": "2025-06-20T23:30:00",
            "isStarred": True,
            "day": "Friday"
        },
        # Friday, June 20 - Patrón Tequila Stage
        {
            "id": "15",
            "name": "Samantha Spanò",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-20T13:30:00",
            "endTime": "2025-06-20T14:30:00",
            "isStarred": False,
            "day": "Friday"
        },
        {
            "id": "16",
            "name": "Lauren Davidson",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-20T14:30:00",
            "endTime": "2025-06-20T15:30:00",
            "isStarred": False,
            "day": "Friday"
        },
        {
            "id": "17",
            "name": "Kaitlin Butts",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-20T15:30:00",
            "endTime": "2025-06-20T16:30:00",
            "isStarred": False,
            "day": "Friday"
        },
        {
            "id": "18",
            "name": "LANCO",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-20T16:30:00",
            "endTime": "2025-06-20T18:00:00",
            "isStarred": True,
            "day": "Friday"
        },
        {
            "id": "19",
            "name": "Meghan Patrick",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-20T20:00:00",
            "endTime": "2025-06-20T21:30:00",
            "isStarred": False,
            "day": "Friday"
        },
        {
            "id": "20",
            "name": "Whey Jennings",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-20T21:30:00",
            "endTime": "2025-06-20T23:00:00",
            "isStarred": False,
            "day": "Friday"
        },
        # Saturday, June 21 - Coors Light Main Stage
        {
            "id": "21",
            "name": "Willow Avalon",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-21T16:00:00",
            "endTime": "2025-06-21T17:30:00",
            "isStarred": False,
            "day": "Saturday"
        },
        {
            "id": "22",
            "name": "Larry Fleet",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-21T17:30:00",
            "endTime": "2025-06-21T19:00:00",
            "isStarred": True,
            "day": "Saturday"
        },
        {
            "id": "23",
            "name": "Boyz II Men",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-21T19:00:00",
            "endTime": "2025-06-21T20:30:00",
            "isStarred": True,
            "day": "Saturday"
        },
        {
            "id": "24",
            "name": "Chris Janson",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-21T20:30:00",
            "endTime": "2025-06-21T22:00:00",
            "isStarred": False,
            "day": "Saturday"
        },
        {
            "id": "25",
            "name": "Jason Aldean",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-21T22:00:00",
            "endTime": "2025-06-21T23:30:00",
            "isStarred": True,
            "day": "Saturday"
        },
        # Saturday, June 21 - Patrón Tequila Stage
        {
            "id": "26",
            "name": "Holdyn Barder",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-21T13:30:00",
            "endTime": "2025-06-21T15:30:00",
            "isStarred": False,
            "day": "Saturday"
        },
        {
            "id": "27",
            "name": "Don Louis",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-21T15:30:00",
            "endTime": "2025-06-21T16:30:00",
            "isStarred": False,
            "day": "Saturday"
        },
        {
            "id": "28",
            "name": "Chris Cagle",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-21T16:30:00",
            "endTime": "2025-06-21T18:00:00",
            "isStarred": False,
            "day": "Saturday"
        },
        {
            "id": "29",
            "name": "Austin Williams",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-21T20:00:00",
            "endTime": "2025-06-21T21:30:00",
            "isStarred": False,
            "day": "Saturday"
        },
        {
            "id": "30",
            "name": "Lakeview",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-21T21:30:00",
            "endTime": "2025-06-21T23:00:00",
            "isStarred": False,
            "day": "Saturday"
        },
        # Sunday, June 22 - Coors Light Main Stage
        {
            "id": "31",
            "name": "Jelly Roll",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-22T22:00:00",
            "endTime": "2025-06-22T23:30:00",
            "isStarred": True,
            "day": "Sunday"
        },
        {
            "id": "32",
            "name": "Jordan Davis",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-22T20:30:00",
            "endTime": "2025-06-22T22:00:00",
            "isStarred": True,
            "day": "Sunday"
        },
        {
            "id": "33",
            "name": "Ella Langley",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-22T19:00:00",
            "endTime": "2025-06-22T20:30:00",
            "isStarred": False,
            "day": "Sunday"
        },
        {
            "id": "34",
            "name": "Bayker Blankenship",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-22T17:30:00",
            "endTime": "2025-06-22T19:00:00",
            "isStarred": False,
            "day": "Sunday"
        },
        {
            "id": "35",
            "name": "Davisson Brothers Band",
            "stage": "Coors Light Main Stage",
            "startTime": "2025-06-22T16:00:00",
            "endTime": "2025-06-22T17:30:00",
            "isStarred": False,
            "day": "Sunday"
        },
        # Sunday, June 22 - Patrón Tequila Stage
        {
            "id": "36",
            "name": "Chayce Beckham",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-22T21:30:00",
            "endTime": "2025-06-22T23:00:00",
            "isStarred": True,
            "day": "Sunday"
        },
        {
            "id": "37",
            "name": "Lanie Gardner",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-22T20:00:00",
            "endTime": "2025-06-22T21:30:00",
            "isStarred": False,
            "day": "Sunday"
        },
        {
            "id": "38",
            "name": "Cat Country B.O.T.B Winner",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-22T18:00:00",
            "endTime": "2025-06-22T19:00:00",
            "isStarred": False,
            "day": "Sunday"
        },
        {
            "id": "39",
            "name": "Thomas Edwards",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-22T16:30:00",
            "endTime": "2025-06-22T17:30:00",
            "isStarred": False,
            "day": "Sunday"
        },
        {
            "id": "40",
            "name": "The Jack Wharff Band",
            "stage": "Patrón Tequila Stage",
            "startTime": "2025-06-22T15:00:00",
            "endTime": "2025-06-22T16:30:00",
            "isStarred": False,
            "day": "Sunday"
        }
    ]
    
    await db.artists.insert_many(artists_data)
    logger.info(f"Inserted {len(artists_data)} artists into database")