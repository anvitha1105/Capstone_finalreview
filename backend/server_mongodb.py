from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
import random
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Security
# Allow missing credentials to enable anonymous access
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI(title="AI Cognitive Platform API")
@app.get("/")
async def home():
    return {"message": "Welcome to AI Cognitive Platform API!"}


# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_games_played: int = Field(default=0)
    total_score: int = Field(default=0)

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class GameScore(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    game_type: str  # 'ai_image', 'text_ai', 'memory_challenge'
    score: int
    accuracy: float
    time_taken: int  # seconds
    ai_baseline_score: int
    ai_baseline_accuracy: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GameScoreCreate(BaseModel):
    game_type: str
    score: int
    accuracy: float
    time_taken: int

class AIImageGameData(BaseModel):
    images: List[Dict[str, Any]]
    
class TextAIGameData(BaseModel):
    texts: List[Dict[str, Any]]

class MemoryGameData(BaseModel):
    sequence: List[int]
    difficulty: int

# Authentication helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, username: str) -> str:
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # If no credentials are provided, return or create a default Guest user
    if credentials is None:
        guest = await db.users.find_one({"id": "guest"})
        if not guest:
            guest_user = User(id="guest", username="Guest", email="guest@example.com")
            await db.users.insert_one(guest_user.dict())
            return guest_user
        return User(**guest)

    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# AI Baseline Data (Simulated for MVP)
AI_BASELINES = {
    'ai_image': {
        'accuracy': 92.5,
        'average_time': 3.2,
        'score_multiplier': 100
    },
    'text_ai': {
        'accuracy': 88.7,
        'average_time': 5.1,
        'score_multiplier': 100
    },
    'memory_challenge': {
        'accuracy': 78.3,
        'average_time': 12.5,
        'score_multiplier': 100
    }
}

# Game Data (Simulated for MVP)
def get_ai_image_game_data():
    """Generate AI Image vs Real Image game data"""
    images = [
        {
            "id": 1,
            "url": "https://images.unsplash.com/photo-1673255745677-e36f618550d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxBSSUyMGJyYWluJTIwdGVjaG5vbG9neXxlbnwwfHx8fDE3NTY5ODExODV8MA&ixlib=rb-4.1.0&q=85",
            "is_ai": True,
            "description": "Futuristic AI Robot"
        },
        {
            "id": 2,
            "url": "https://images.unsplash.com/photo-1549925245-f20a1bac6454?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxBSSUyMGJyYWluJTIwdGVjaG5vbG9neXxlbnwwfHx8fDE3NTY5ODExODV8MA&ixlib=rb-4.1.0&q=85",
            "is_ai": False, 
            "description": "Brain Visualization"
        },
        {
            "id": 3,
            "url": "https://images.pexels.com/photos/8438864/pexels-photo-8438864.jpeg",
            "is_ai": False,
            "description": "Robot Playing Chess"
        },
        {
            "id": 4,
            "url": "https://images.pexels.com/photos/8438954/pexels-photo-8438954.jpeg", 
            "is_ai": False,
            "description": "AI vs Human Chess Match"
        },
        {
            "id": 5,
            "url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw1fHxBSSUyMGJyYWluJTIwdGVjaG5vbG9neXxlbnwwfHx8fDE3NTY5ODExODV8MA&ixlib=rb-4.1.0&q=85",
            "is_ai": True,
            "description": "AI Technology"
        }
    ]
    return random.sample(images, 3)

def get_text_ai_game_data():
    """Generate Text vs AI game data"""
    texts = [
        {
            "id": 1,
            "text": "The sun dipped below the horizon, painting the sky in brilliant shades of orange and pink. Sarah watched from her window, lost in the beauty of the moment.",
            "is_ai": False,
            "source": "Human Writer"
        },
        {
            "id": 2,
            "text": "As an AI language model, I can assist you in generating content that meets your specific requirements. However, it's important to note that the effectiveness of this approach may vary depending on various factors.",
            "is_ai": True,
            "source": "AI Generated"
        },
        {
            "id": 3, 
            "text": "Innovation thrives at the intersection of creativity and technology. When human imagination meets computational power, extraordinary possibilities emerge from the synthesis.",
            "is_ai": True,
            "source": "AI Generated"
        },
        {
            "id": 4,
            "text": "I remember my grandmother's kitchen always smelled like cinnamon and fresh bread. She'd tell us stories about her childhood while we helped her knead dough for Sunday dinner.",
            "is_ai": False,
            "source": "Human Writer"
        }
    ]
    return random.sample(texts, 3)

def get_memory_game_data(difficulty: int = 1):
    """Generate Memory Challenge game data"""
    sequence_length = 4 + (difficulty * 2)  # Start with 4, increase by 2 per difficulty
    sequence = [random.randint(1, 9) for _ in range(sequence_length)]
    return {"sequence": sequence, "difficulty": difficulty}

# Routes
@api_router.get("/")
async def root():
    return {"message": "AI Cognitive Platform API", "version": "1.0.0"}

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(username=user_data.username, email=user_data.email)
    user_dict = user.dict()
    user_dict['password'] = hashed_password
    
    await db.users.insert_one(user_dict)
    token = create_jwt_token(user.id, user.username)
    
    return {"message": "User created successfully", "token": token, "user": user}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"username": login_data.username})
    if not user or not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user['id'], user['username'])
    user_obj = User(**user)
    
    return {"message": "Login successful", "token": token, "user": user_obj}

@api_router.get("/auth/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/games/ai-image/data")
async def get_ai_image_data(current_user: User = Depends(get_current_user)):
    return {"images": get_ai_image_game_data()}

@api_router.get("/games/text-ai/data")
async def get_text_ai_data(current_user: User = Depends(get_current_user)):
    return {"texts": get_text_ai_game_data()}

@api_router.get("/games/memory/data")
async def get_memory_data(difficulty: int = 1, current_user: User = Depends(get_current_user)):
    return get_memory_game_data(difficulty)

@api_router.post("/games/score")
async def submit_game_score(score_data: GameScoreCreate, current_user: User = Depends(get_current_user)):
    # Get AI baseline for comparison
    baseline = AI_BASELINES.get(score_data.game_type, {})
    ai_baseline_accuracy = baseline.get('accuracy', 80.0)
    ai_baseline_score = int(score_data.score * (ai_baseline_accuracy / 100) * baseline.get('score_multiplier', 100) / 100)
    
    # Create game score record
    game_score = GameScore(
        user_id=current_user.id,
        game_type=score_data.game_type,
        score=score_data.score,
        accuracy=score_data.accuracy,
        time_taken=score_data.time_taken,
        ai_baseline_score=ai_baseline_score,
        ai_baseline_accuracy=ai_baseline_accuracy
    )
    
    await db.game_scores.insert_one(game_score.dict())
    
    # Update user stats
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"total_games_played": 1, "total_score": score_data.score}}
    )
    
    return {
        "message": "Score submitted successfully",
        "your_score": score_data.score,
        "ai_baseline": ai_baseline_score,
        "performance": "Better than AI" if score_data.score > ai_baseline_score else "AI performed better"
    }

@api_router.get("/leaderboard")
async def get_leaderboard():
    # Get top human players
    human_leaders = await db.users.find().sort("total_score", -1).limit(10).to_list(10)
    
    # Simulated AI baselines for leaderboard
    ai_baselines = [
        {"name": "GPT-5", "total_score": 8750, "games_played": 100, "is_ai": True},
        {"name": "Claude Sonnet 4", "total_score": 8520, "games_played": 100, "is_ai": True},
        {"name": "Gemini 2.5 Pro", "total_score": 8340, "games_played": 100, "is_ai": True}
    ]
    
    return {
        "human_leaders": [User(**user) for user in human_leaders],
        "ai_baselines": ai_baselines
    }

@api_router.get("/stats/user")
async def get_user_stats(current_user: User = Depends(get_current_user)):
    # Get user's game history
    game_scores = await db.game_scores.find({"user_id": current_user.id}).to_list(100)
    
    # Calculate stats by game type
    stats = {}
    for game_type in ['ai_image', 'text_ai', 'memory_challenge']:
        type_scores = [score for score in game_scores if score['game_type'] == game_type]
        if type_scores:
            avg_accuracy = sum(score['accuracy'] for score in type_scores) / len(type_scores)
            avg_time = sum(score['time_taken'] for score in type_scores) / len(type_scores)
            best_score = max(score['score'] for score in type_scores)
            games_played = len(type_scores)
        else:
            avg_accuracy = avg_time = best_score = games_played = 0
            
        stats[game_type] = {
            "games_played": games_played,
            "avg_accuracy": round(avg_accuracy, 1),
            "avg_time": round(avg_time, 1),
            "best_score": best_score
        }
    
    return {"user_stats": stats, "total_games": len(game_scores)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.environ.get("PORT", 8000))  # Use Render PORT or 8000 default
    uvicorn.run(app, host="0.0.0.0", port=port)

