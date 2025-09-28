from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import aiosqlite
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

# Database setup
DATABASE_PATH = ROOT_DIR / os.environ.get('DB_NAME', 'cognitive_arena.db')

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Security
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

# Database initialization
async def init_database():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Create users table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TEXT NOT NULL,
                total_games_played INTEGER DEFAULT 0,
                total_score INTEGER DEFAULT 0
            )
        ''')
        
        # Create game_scores table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS game_scores (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                game_type TEXT NOT NULL,
                score INTEGER NOT NULL,
                accuracy REAL NOT NULL,
                time_taken INTEGER NOT NULL,
                ai_baseline_score INTEGER NOT NULL,
                ai_baseline_accuracy REAL NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create a guest user if it doesn't exist
        await db.execute('''
            INSERT OR IGNORE INTO users (id, username, email, password, created_at)
            VALUES ('guest', 'Guest', 'guest@example.com', '', ?)
        ''', (datetime.now(timezone.utc).isoformat(),))
        
        await db.commit()

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
    # If no credentials are provided, return the default Guest user
    if credentials is None:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            async with db.execute('SELECT * FROM users WHERE id = ?', ('guest',)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return User(
                        id=row[0], username=row[1], email=row[2],
                        created_at=datetime.fromisoformat(row[4]),
                        total_games_played=row[5], total_score=row[6]
                    )

    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        async with aiosqlite.connect(DATABASE_PATH) as db:
            async with db.execute('SELECT * FROM users WHERE id = ?', (user_id,)) as cursor:
                row = await cursor.fetchone()
                if row is None:
                    raise HTTPException(status_code=401, detail="User not found")
                
                return User(
                    id=row[0], username=row[1], email=row[2],
                    created_at=datetime.fromisoformat(row[4]),
                    total_games_played=row[5], total_score=row[6]
                )
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

# New Game Functions
def generate_logical_puzzle(difficulty: int = 1):
    """Generate logical reasoning puzzles"""
    puzzle_types = ['number_sequence', 'pattern_matching', 'logic_grid']
    puzzle_type = random.choice(puzzle_types)
    
    if puzzle_type == 'number_sequence':
        # Generate arithmetic or geometric sequences
        if random.choice([True, False]):
            # Arithmetic sequence
            start = random.randint(1, 10)
            diff = random.randint(2, 8)
            sequence = [start + i * diff for i in range(5)]
            answer = sequence[-1] + diff
            question = f"What is the next number in this sequence: {', '.join(map(str, sequence[:-1]))}?"
        else:
            # Geometric sequence
            start = random.randint(2, 5)
            ratio = random.randint(2, 3)
            sequence = [start * (ratio ** i) for i in range(4)]
            answer = sequence[-1] * ratio
            question = f"What is the next number in this sequence: {', '.join(map(str, sequence))}?"
        
        return {
            "id": str(uuid.uuid4()),
            "type": "number_sequence",
            "question": question,
            "answer": answer,
            "difficulty": difficulty
        }
    
    elif puzzle_type == 'pattern_matching':
        # Simple pattern matching
        patterns = [
            {"pattern": "ABAB", "next": "A", "options": ["A", "B", "C", "D"]},
            {"pattern": "AABB", "next": "A", "options": ["A", "B", "C", "D"]},
            {"pattern": "ABCD", "next": "A", "options": ["A", "B", "C", "D"]},
        ]
        pattern_data = random.choice(patterns)
        return {
            "id": str(uuid.uuid4()),
            "type": "pattern_matching",
            "question": f"What comes next in this pattern: {pattern_data['pattern']}?",
            "pattern": pattern_data["pattern"],
            "answer": pattern_data["next"],
            "options": pattern_data["options"],
            "difficulty": difficulty
        }
    
    else:  # logic_grid
        # Simple logic puzzle
        logic_puzzles = [
            {
                "question": "If all cats are animals, and some animals are pets, which statement is true?",
                "options": ["All cats are pets", "Some cats are pets", "No cats are pets", "Cannot be determined"],
                "answer": "Cannot be determined"
            },
            {
                "question": "In a race, if Alice finishes before Bob, and Bob finishes before Charlie, who finishes first?",
                "options": ["Alice", "Bob", "Charlie", "Cannot be determined"],
                "answer": "Alice"
            }
        ]
        puzzle = random.choice(logic_puzzles)
        return {
            "id": str(uuid.uuid4()),
            "type": "logic_grid",
            "question": puzzle["question"],
            "options": puzzle["options"],
            "answer": puzzle["answer"],
            "difficulty": difficulty
        }

def solve_logical_puzzle_ai(puzzle_data):
    """AI solver for logical puzzles"""
    # Simple AI logic - in a real implementation, this could be more sophisticated
    if puzzle_data["type"] == "number_sequence":
        # AI correctly solves number sequences with high accuracy
        return {"ai_answer": puzzle_data["answer"], "ai_confidence": 0.95}
    elif puzzle_data["type"] == "pattern_matching":
        # AI has good pattern recognition
        return {"ai_answer": puzzle_data["answer"], "ai_confidence": 0.90}
    else:  # logic_grid
        # AI has strong logical reasoning
        return {"ai_answer": puzzle_data["answer"], "ai_confidence": 0.92}

def get_creative_writing_prompts():
    """Generate creative writing prompts"""
    prompts = [
        "Write a short story about a time traveler who can only move forward one day at a time.",
        "Describe a world where colors have disappeared and one person can still see them.",
        "Tell the story of the last bookstore on Earth.",
        "Write about a character who can hear other people's thoughts but wishes they couldn't.",
        "Describe a day in the life of a superhero's pet.",
        "Write a story that takes place entirely in an elevator.",
        "Tell about a world where lying is impossible.",
        "Write about someone who finds a door that wasn't there yesterday."
    ]
    return {
        "id": str(uuid.uuid4()),
        "prompt": random.choice(prompts),
        "time_limit": 300,  # 5 minutes
        "word_limit": 200
    }

def generate_ai_writing(prompt):
    """Generate AI writing for comparison (placeholder - replace with actual AI service)"""
    # Placeholder AI responses - in production, integrate with GPT, Gemini, etc.
    ai_responses = {
        "Write a short story about a time traveler who can only move forward one day at a time.": 
            "Each morning, Sarah woke knowing she had moved one day closer to her destination. The time machine hummed softly, its blue light indicating another successful jump. She couldn't go back, couldn't skip ahead – just one day forward, always forward. Today marked day 1,247 of her journey to find the cure that would save her daughter, still frozen in 2024. The weight of time pressed on her shoulders as she stepped into another tomorrow.",
        
        "Describe a world where colors have disappeared and one person can still see them.":
            "The world turned grey on a Tuesday. Everyone woke to find their vibrant reality drained of hue, except Maya. She alone saw the crimson roses, the azure sky, the golden sunlight. At first, she thought others were playing a cruel joke. But their confused faces, their desperate reaching for something they'd lost but couldn't name, told her otherwise. Maya became the keeper of color in a monochrome world, painting memories for those who could no longer see beauty.",
            
        "Tell the story of the last bookstore on Earth.":
            "The sign read 'Miller's Books - Est. 1952' in faded letters. Inside, dust motes danced through streams of sunlight as Elena arranged the final shipment that would never come. Digital readers had won the war, and she was the last holdout. But as she touched each spine, each story, she felt the weight of preserving something sacred. The books whispered their tales, hoping someone would still listen in a world that had forgotten the magic of turning pages."
    }
    
    return ai_responses.get(prompt, "The AI pondered the prompt deeply, crafting a response that balanced creativity with logic, weaving words into a tapestry of meaning that reflected both human emotion and artificial precision.")

def generate_audio_clips():
    """Get audio clips for human vs AI recognition"""
    # In production, these would be actual audio files served from a CDN
    audio_clips = [
        {
            "id": 1,
            "url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
            "is_ai": False,
            "description": "Human-recorded bell sound",
            "duration": 3
        },
        {
            "id": 2,
            "url": "https://www.soundjay.com/buttons/sounds/button-3.wav", 
            "is_ai": True,
            "description": "AI-generated button sound",
            "duration": 2
        },
        {
            "id": 3,
            "url": "https://www.soundjay.com/buttons/sounds/button-09.wav",
            "is_ai": False,
            "description": "Human-recorded click",
            "duration": 1
        },
        {
            "id": 4,
            "url": "https://www.soundjay.com/misc/sounds/bell-ringing-04.wav",
            "is_ai": True, 
            "description": "AI-synthesized bell",
            "duration": 4
        }
    ]
    return random.sample(audio_clips, 3)

def analyze_image_authenticity(image_data):
    """Analyze if an image is authentic or AI-generated"""
    # Placeholder for image analysis - in production, integrate with detection models
    # This would use libraries like torch, tensorflow, or cloud APIs
    
    # Simulate different confidence levels for authentic vs AI-generated
    is_authentic = random.choice([True, False])
    confidence = random.uniform(0.7, 0.95)
    
    if is_authentic:
        result = "Authentic Image"
        indicators = ["Natural lighting variations", "Camera noise patterns", "Organic texture details"]
    else:
        result = "AI-Generated Image"
        indicators = ["Symmetrical face features", "Unnatural lighting", "Repetitive patterns"]
    
    return {
        "result": result,
        "confidence": round(confidence, 2),
        "indicators": indicators,
        "is_authentic": is_authentic
    }

# Routes
@api_router.get("/")
async def root():
    return {"message": "AI Cognitive Platform API", "version": "1.0.0"}

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    async with aiosqlite.connect(DATABASE_PATH) as db:
        async with db.execute('SELECT id FROM users WHERE username = ? OR email = ?', 
                             (user_data.username, user_data.email)) as cursor:
            if await cursor.fetchone():
                raise HTTPException(status_code=400, detail="Username or email already exists")
        
        # Create user
        hashed_password = hash_password(user_data.password)
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        
        await db.execute('''
            INSERT INTO users (id, username, email, password, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, user_data.username, user_data.email, hashed_password, created_at))
        await db.commit()
        
        token = create_jwt_token(user_id, user_data.username)
        user = User(id=user_id, username=user_data.username, email=user_data.email, 
                   created_at=datetime.fromisoformat(created_at))
        
        return {"message": "User created successfully", "token": token, "user": user}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        async with db.execute('SELECT * FROM users WHERE username = ?', (login_data.username,)) as cursor:
            row = await cursor.fetchone()
            if not row or not verify_password(login_data.password, row[3]):
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            token = create_jwt_token(row[0], row[1])
            user = User(
                id=row[0], username=row[1], email=row[2],
                created_at=datetime.fromisoformat(row[4]),
                total_games_played=row[5], total_score=row[6]
            )
            
            return {"message": "Login successful", "token": token, "user": user}

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
    async with aiosqlite.connect(DATABASE_PATH) as db:
        score_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        
        await db.execute('''
            INSERT INTO game_scores (id, user_id, game_type, score, accuracy, time_taken, 
                                   ai_baseline_score, ai_baseline_accuracy, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (score_id, current_user.id, score_data.game_type, score_data.score,
              score_data.accuracy, score_data.time_taken, ai_baseline_score,
              ai_baseline_accuracy, timestamp))
        
        # Update user stats
        await db.execute('''
            UPDATE users SET total_games_played = total_games_played + 1,
                           total_score = total_score + ?
            WHERE id = ?
        ''', (score_data.score, current_user.id))
        
        await db.commit()
    
    return {
        "message": "Score submitted successfully",
        "your_score": score_data.score,
        "ai_baseline": ai_baseline_score,
        "performance": "Better than AI" if score_data.score > ai_baseline_score else "AI performed better"
    }

@api_router.get("/leaderboard")
async def get_leaderboard():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        async with db.execute('SELECT * FROM users ORDER BY total_score DESC LIMIT 10') as cursor:
            rows = await cursor.fetchall()
            human_leaders = [
                User(
                    id=row[0], username=row[1], email=row[2],
                    created_at=datetime.fromisoformat(row[4]),
                    total_games_played=row[5], total_score=row[6]
                ) for row in rows if row[0] != 'guest'
            ]
    
    # Simulated AI baselines for leaderboard
    ai_baselines = [
        {"name": "GPT-5", "total_score": 8750, "games_played": 100, "is_ai": True},
        {"name": "Claude Sonnet 4", "total_score": 8520, "games_played": 100, "is_ai": True},
        {"name": "Gemini 2.5 Pro", "total_score": 8340, "games_played": 100, "is_ai": True}
    ]
    
    return {
        "human_leaders": human_leaders,
        "ai_baselines": ai_baselines
    }

@api_router.get("/stats/user")
async def get_user_stats(current_user: User = Depends(get_current_user)):
    async with aiosqlite.connect(DATABASE_PATH) as db:
        async with db.execute('SELECT * FROM game_scores WHERE user_id = ?', (current_user.id,)) as cursor:
            rows = await cursor.fetchall()
            
            # Calculate stats by game type
            stats = {}
            for game_type in ['ai_image', 'text_ai', 'memory_challenge']:
                type_scores = [row for row in rows if row[2] == game_type]  # game_type is index 2
                if type_scores:
                    avg_accuracy = sum(row[4] for row in type_scores) / len(type_scores)  # accuracy is index 4
                    avg_time = sum(row[5] for row in type_scores) / len(type_scores)  # time_taken is index 5
                    best_score = max(row[3] for row in type_scores)  # score is index 3
                    games_played = len(type_scores)
                else:
                    avg_accuracy = avg_time = best_score = games_played = 0
                    
                stats[game_type] = {
                    "games_played": games_played,
                    "avg_accuracy": round(avg_accuracy, 1),
                    "avg_time": round(avg_time, 1),
                    "best_score": best_score
                }
            
            return {"user_stats": stats, "total_games": len(rows)}

# New Game API Endpoints
@api_router.get("/games/logical-reasoning/data")
async def get_logical_reasoning_data(difficulty: int = 1, current_user: User = Depends(get_current_user)):
    puzzle = generate_logical_puzzle(difficulty)
    ai_solution = solve_logical_puzzle_ai(puzzle)
    return {
        "puzzle": puzzle,
        "ai_baseline": ai_solution
    }

@api_router.post("/games/logical-reasoning/submit")
async def submit_logical_reasoning_answer(
    puzzle_id: str, 
    user_answer: str, 
    time_taken: int,
    current_user: User = Depends(get_current_user)
):
    # In a real implementation, you'd retrieve the puzzle by ID and validate
    # For now, we'll simulate the scoring
    is_correct = random.choice([True, False])  # Placeholder logic
    score = 100 if is_correct else 0
    accuracy = 100.0 if is_correct else 0.0
    
    return {
        "correct": is_correct,
        "score": score,
        "accuracy": accuracy,
        "explanation": "Well reasoned!" if is_correct else "Try again! The logic was close."
    }

@api_router.get("/games/creative-writing/prompt")
async def get_creative_writing_prompt(current_user: User = Depends(get_current_user)):
    return get_creative_writing_prompts()

@api_router.post("/games/creative-writing/submit")
async def submit_creative_writing(
    prompt_id: str,
    user_writing: str,
    time_taken: int,
    current_user: User = Depends(get_current_user)
):
    # Generate AI writing for comparison
    # In production, extract the original prompt and generate AI response
    sample_prompt = "Write a short story about a time traveler who can only move forward one day at a time."
    ai_writing = generate_ai_writing(sample_prompt)
    
    # Simple scoring based on length and creativity (placeholder)
    word_count = len(user_writing.split())
    creativity_score = min(word_count * 0.5, 100)
    
    return {
        "user_writing": user_writing,
        "ai_writing": ai_writing,
        "user_score": creativity_score,
        "ai_score": 85,  # AI baseline
        "feedback": "Great creativity!" if creativity_score > 50 else "Try to be more descriptive!",
        "word_count": word_count
    }

@api_router.get("/games/audio-recognition/data")
async def get_audio_recognition_data(current_user: User = Depends(get_current_user)):
    return {"audio_clips": generate_audio_clips()}

@api_router.post("/games/audio-recognition/submit")
async def submit_audio_recognition_answer(
    audio_id: int,
    user_answer: str,  # "human" or "ai"
    time_taken: int,
    current_user: User = Depends(get_current_user)
):
    # In production, validate against the actual audio clip data
    audio_clips = generate_audio_clips()
    correct_answer = "ai" if audio_id % 2 == 0 else "human"  # Placeholder logic
    is_correct = user_answer.lower() == correct_answer
    
    score = 100 if is_correct else 0
    accuracy = 100.0 if is_correct else 0.0
    
    return {
        "correct": is_correct,
        "correct_answer": correct_answer,
        "score": score,
        "accuracy": accuracy,
        "explanation": "Correct identification!" if is_correct else f"This was {correct_answer}-generated audio."
    }

@api_router.post("/content-authentication/analyze-image")
async def analyze_uploaded_image(
    file: bytes,
    current_user: User = Depends(get_current_user)
):
    # Analyze the uploaded image for authenticity
    analysis_result = analyze_image_authenticity(file)
    
    return {
        "analysis": analysis_result,
        "processing_time": random.uniform(0.5, 2.0),  # Simulate processing time
        "model_version": "v2.1.0"
    }

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

@app.on_event("startup")
async def startup_event():
    await init_database()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="localhost", port=port)