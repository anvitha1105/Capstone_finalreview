
# CognitiveArena - Human vs AI Cognitive Platform

A full-stack web application that allows users to test their cognitive abilities against advanced AI systems through interactive games and challenges.

## Overview

CognitiveArena is an interactive platform where humans can compete against AI in various cognitive tasks. The platform features multiple games designed to test different cognitive abilities including pattern recognition, text analysis, and memory recall. Users can track their performance, compare scores with AI baselines, and climb the global leaderboard.

## Features

### Games & Challenges

- **AI Image Detection** - Test your ability to distinguish between AI-generated and real images
- **Text AI Detection** - Identify whether text was written by humans or AI
- **Memory Challenge** - Test your sequence recall abilities against AI performance
- **Creative Writing** - Challenge your creative writing skills
- **Logical Reasoning** - Solve logical puzzles and problems
- **Audio Recognition** - Test your audio pattern recognition abilities

### Core Features

- User authentication system with JWT tokens
- Real-time leaderboard tracking
- Personal statistics and performance analytics
- Guest mode for playing without registration
- Responsive design for all devices
- Real-time scoring against AI baselines

## Technology Stack

### Frontend

- **Framework**: React 19.0
- **Routing**: React Router DOM 7.5
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI + shadcn/ui
- **HTTP Client**: Axios
- **Build Tool**: Create React App with CRACO
- **Icons**: Lucide React

### Backend

- **Framework**: FastAPI 0.110+
- **Server**: Uvicorn (ASGI)
- **Database**: SQLite with aiosqlite (async)
- **Authentication**: JWT with PyJWT
- **Password Hashing**: bcrypt
- **Validation**: Pydantic v2
- **Testing**: pytest

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Git

### Quick Start (Replit)

If you're running this on Replit, the project is already configured:

1. The dependencies are automatically installed
2. Both frontend and backend workflows are configured
3. Simply click the "Run" button or ensure both workflows are running

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd cognitive-arena
```

#### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file (optional)
cp .env.example .env

# Run the backend server
python server.py
```

The backend will start on `http://localhost:8000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm start
```

The frontend will start on `http://localhost:5000`

## Project Structure

```
cognitive-arena/
├── backend/
│   ├── server.py              # Main FastAPI application (SQLite)
│   ├── server_mongodb.py      # Alternative MongoDB implementation
│   ├── requirements.txt       # Python dependencies
│   ├── cognitive_arena.db     # SQLite database (auto-generated)
│   └── Procfile              # Deployment configuration
│
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── games/       # Game components
│   │   │   ├── ui/          # UI components (shadcn)
│   │   │   ├── Dashboard.js
│   │   │   ├── LandingPage.js
│   │   │   ├── Leaderboard.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   └── UserStats.js
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── tests/                    # Test files
└── README.md                # This file
```

## Environment Variables

### Backend (.env)

```bash
# Database
DB_NAME=cognitive_arena.db

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# MongoDB (optional - for server_mongodb.py)
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=cognitive_arena
```

### Frontend

The frontend automatically connects to the backend. On Replit, it uses the environment's domain. For local development, it defaults to `http://localhost:8000`.

## API Documentation

### Authentication Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and receive JWT token
- `GET /api/user/me` - Get current user profile

### Game Endpoints

- `GET /api/games/ai-image` - Get AI image detection game data
- `GET /api/games/text-ai` - Get text AI detection game data
- `GET /api/games/memory` - Get memory challenge game data
- `POST /api/scores` - Submit game score

### Leaderboard

- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/game/{game_type}` - Get game-specific leaderboard
- `GET /api/user/stats` - Get user statistics

### API Documentation (Interactive)

Once the backend is running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Run with coverage
pytest --cov=. --cov-report=html
```

### Code Quality

The project includes linting and formatting tools:

```bash
# Format Python code
black backend/

# Sort imports
isort backend/

# Run linter
flake8 backend/

# Type checking
mypy backend/
```

### Frontend Development

```bash
cd frontend

# Run development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Database

### SQLite (Default)

The application uses SQLite for data storage. The database file (`cognitive_arena.db`) is automatically created on first run.

**Schema:**

- **users**: User accounts and authentication
- **game_scores**: Individual game results
- **leaderboard**: Aggregated user performance

### MongoDB (Alternative)

To use MongoDB instead:

1. Update your `.env` file with MongoDB connection string
2. Run `server_mongodb.py` instead of `server.py`

## Deployment

### Replit Deployment

This project is configured for easy deployment on Replit:

1. Click the "Publish" button in Replit
2. Configure your deployment settings
3. Your app will be live with a public URL

### Manual Deployment

For deployment to other platforms:

1. **Backend**: Use the included `Procfile` for Heroku or similar platforms
2. **Frontend**: Build with `npm run build` and serve the static files
3. Update CORS settings in `server.py` for your production domain

## Usage

### For Players

1. Visit the landing page
2. Choose to play as a guest or create an account
3. Select a game from the dashboard
4. Complete challenges and compete against AI
5. Check your rankings on the leaderboard

### For Developers

1. Review the API documentation at `/docs`
2. Explore the component structure in `frontend/src/components`
3. Add new games by creating components in `components/games/`
4. Extend the backend by adding routes in `server.py`

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Troubleshooting

### Frontend won't start

- Ensure all dependencies are installed: `npm install --legacy-peer-deps`
- Check that port 5000 is not in use
- Clear npm cache: `npm cache clean --force`

### Backend issues

- Verify Python dependencies: `pip install -r requirements.txt`
- Check database file permissions
- Ensure port 8000 is available

### WebSocket errors in browser console

These are expected warnings from the development server and don't affect functionality.

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Happy Challenging!** Test your cognitive abilities against AI and see where humans still shine!
