import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import GameAIImage from './components/games/GameAIImage';
import GameTextAI from './components/games/GameTextAI';
import GameMemory from './components/games/GameMemory';
import GameLogicalReasoning from './components/games/GameLogicalReasoning';
import GameCreativeWriting from './components/games/GameCreativeWriting';
import GameAudioRecognition from './components/games/GameAudioRecognition';
import ContentAuthentication from './components/ContentAuthentication';
import Leaderboard from './components/Leaderboard';
import UserStats from './components/UserStats';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context (kept for consumer components; defaults to Guest user)
const AuthContext = React.createContext();

function App() {
  const [user] = useState({ id: 'guest', username: 'Guest', total_games_played: 0, total_score: 0 });

  return (
    <AuthContext.Provider value={{ user }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/game/ai-image" element={<GameAIImage />} />
            <Route path="/game/text-ai" element={<GameTextAI />} />
            <Route path="/game/memory" element={<GameMemory />} />
            <Route path="/game/logical-reasoning" element={<GameLogicalReasoning />} />
            <Route path="/game/creative-writing" element={<GameCreativeWriting />} />
            <Route path="/game/audio-recognition" element={<GameAudioRecognition />} />
            <Route path="/content-authentication" element={<ContentAuthentication />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/stats" element={<UserStats />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

export { AuthContext, API };
export default App;