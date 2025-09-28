# Overview

This is a full-stack AI Cognitive Platform application that allows users to test their cognitive abilities against AI systems through interactive games. The platform features three main games: AI Image Detection (distinguishing between AI-generated and real images), Text AI Detection (identifying AI-written versus human-written text), and Memory Challenge (sequence recall). The application includes a leaderboard system to compare human performance against AI baselines and provides user statistics tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18+ using Create React App as the foundation. It follows a component-based architecture with:

- **UI Framework**: React with React Router DOM for client-side routing
- **Styling**: Tailwind CSS for utility-first styling combined with custom CSS for specialized animations and landing page effects
- **Component Library**: Radix UI components integrated with shadcn/ui for consistent, accessible UI elements
- **State Management**: React Context API for user authentication state and local component state for game logic
- **HTTP Client**: Axios for API communication with the backend
- **Development Tools**: CRACO for webpack configuration customization, PostCSS for CSS processing

The frontend implements a guest-first approach where users can play games without authentication, with the auth system designed but currently disabled.

## Backend Architecture
The backend uses FastAPI as the web framework with two database implementation options:

- **Primary Implementation**: SQLite with aiosqlite for local development and testing
- **Alternative Implementation**: MongoDB with Motor (async driver) for production deployments
- **API Design**: RESTful API with `/api` prefix routing
- **Authentication**: JWT-based authentication system with bcrypt password hashing
- **Security**: HTTPBearer token authentication with configurable auto-error handling

The backend follows a modular design with separate routers and implements proper CORS middleware for cross-origin requests.

## Data Storage Solutions
The application supports dual database strategies:

- **SQLite Database**: Lightweight, file-based storage using aiosqlite for async operations, ideal for development and single-instance deployments
- **MongoDB Database**: NoSQL document database using Motor async driver for scalable production deployments

Both implementations maintain the same API interface, allowing seamless switching between storage backends.

## Game Engine Architecture
Each game implements a standardized pattern:

- **Data Fetching**: REST endpoints serve game content (images, text, sequences)
- **State Management**: Local React state handles game progression, scoring, and timing
- **Result Submission**: Async API calls submit game results for scoring and leaderboard updates
- **Timer System**: Client-side countdown timers with automatic submission on timeout

# External Dependencies

## Frontend Dependencies
- **UI/Styling**: Tailwind CSS, Radix UI components, Lucide React icons
- **Routing**: React Router DOM for single-page application navigation
- **HTTP**: Axios for API communication
- **Build Tools**: React Scripts, CRACO for build customization
- **Forms**: React Hook Form with Hookform Resolvers for form validation

## Backend Dependencies
- **Web Framework**: FastAPI for API development, Uvicorn for ASGI server
- **Database**: aiosqlite for SQLite async operations, Motor for MongoDB async operations
- **Authentication**: PyJWT for token generation, Passlib with bcrypt for password hashing
- **Validation**: Pydantic for request/response validation and serialization
- **Environment**: python-dotenv for environment variable management
- **Development**: pytest for testing, black/isort/flake8 for code formatting and linting

## Infrastructure Dependencies
- **Database Options**: SQLite (file-based) or MongoDB (cloud/self-hosted)
- **Environment Variables**: JWT secrets, database URLs, and configuration settings
- **CORS Configuration**: Allows cross-origin requests for frontend-backend communication

## Game Content Dependencies
The platform requires external content sources for games:
- **AI Image Detection**: Real and AI-generated image datasets
- **Text AI Detection**: Human and AI-written text samples
- **Memory Challenge**: Algorithmically generated number sequences

The backend serves this content through dedicated game endpoints, allowing for dynamic content updates without frontend changes.