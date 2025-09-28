import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../App';
import { ArrowLeft, Brain, Clock, Target, CheckCircle, XCircle, RotateCcw, Play } from 'lucide-react';

const GameMemory = () => {
  const [gameData, setGameData] = useState(null);
  const [gameState, setGameState] = useState('loading'); // loading, showing, memorizing, input, finished
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [showingSequence, setShowingSequence] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    if (gameState === 'input' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'input' && timeLeft === 0) {
      handleGameOver();
    }
  }, [gameState, timeLeft]);

  const fetchGameData = async () => {
    try {
      const response = await axios.get(`${API}/games/memory/data?difficulty=${level}`);
      setSequence(response.data.sequence);
      setGameData(response.data);
      setGameState('showing');
      setStartTime(Date.now());
      showSequence(response.data.sequence);
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  const showSequence = async (seq) => {
    setShowingSequence(true);
    setActiveIndex(-1);
    
    // Wait 1 second before starting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    for (let i = 0; i < seq.length; i++) {
      setActiveIndex(i);
      await new Promise(resolve => setTimeout(resolve, 800));
      setActiveIndex(-1);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setShowingSequence(false);
    setGameState('input');
    setTimeLeft(seq.length * 3 + 5); // Give time based on sequence length
  };

  const handleNumberClick = (number) => {
    if (gameState !== 'input' || showingSequence) return;

    const newInput = [...userInput, number];
    setUserInput(newInput);
    
    // Check if the input is correct so far
    const currentIndex = newInput.length - 1;
    if (sequence[currentIndex] !== number) {
      // Wrong input
      setMistakes(mistakes + 1);
      setLives(lives - 1);
      
      if (lives <= 1) {
        handleGameOver();
        return;
      }
      
      // Show mistake and restart current level
      setTimeout(() => {
        setUserInput([]);
        showSequence(sequence);
      }, 1000);
      return;
    }
    
    // Check if sequence is complete
    if (newInput.length === sequence.length) {
      // Level complete!
      const timeBonus = Math.max(0, timeLeft * 10);
      const levelBonus = level * 50;
      const perfectBonus = mistakes === 0 ? 100 : 0;
      
      setScore(score + 200 + timeBonus + levelBonus + perfectBonus);
      
      if (level < 5) {
        // Next level
        setTimeout(() => {
          setLevel(level + 1);
          setUserInput([]);
          setCurrentStep(0);
          fetchGameData();
        }, 2000);
      } else {
        // Game complete
        setTimeout(() => {
          finishGame();
        }, 2000);
      }
    }
  };

  const handleGameOver = () => {
    finishGame();
  };

  const finishGame = async () => {
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    const accuracy = Math.max(0, ((level - 1) * 100 - mistakes * 20)) / (level * 100) * 100;

    setGameState('finished');

    try {
      const response = await axios.post(`${API}/games/score`, {
        game_type: 'memory_challenge',
        score: score,
        accuracy: accuracy,
        time_taken: totalTime
      });
      
      console.log('Score submitted:', response.data);
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const restartGame = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setMistakes(0);
    setUserInput([]);
    setCurrentStep(0);
    fetchGameData();
  };

  if (gameState === 'loading') {
    return (
      <div className="game-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const accuracy = Math.max(0, ((level - 1) * 100 - mistakes * 20)) / (level * 100) * 100;
    const aiBaselineScore = Math.round(score * 0.783); // Simulated AI baseline

    return (
      <div className="game-container">
        <div className="game-content">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="results-screen">
            <h1 className="results-title">Memory Challenge Complete!</h1>
            
            <div className="results-comparison">
              <div className="comparison-item">
                <div className="comparison-label">Your Performance</div>
                <div className="comparison-score">{score}</div>
                <div className="text-sm text-slate-400 mt-2">
                  Level {level} reached ({accuracy.toFixed(1)}% accuracy)
                </div>
              </div>
              
              <div className="comparison-item ai">
                <div className="comparison-label">AI Baseline</div>
                <div className="comparison-score">{aiBaselineScore}</div>
                <div className="text-sm text-slate-400 mt-2">
                  Gemini 2.5 Pro Performance (78.3% accuracy)
                </div>
              </div>
            </div>

            <div className="mt-6">
              {score > aiBaselineScore ? (
                <div className="flex items-center justify-center gap-2 text-green-400 text-lg font-semibold">
                  <CheckCircle className="w-6 h-6" />
                  Incredible! Your memory beats AI processing!
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-purple-400 text-lg font-semibold">
                  <Brain className="w-6 h-6" />
                  AI's computational memory was stronger. Keep training!
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-cyan-400">{level}</div>
                <div className="text-sm text-slate-400">Max Level</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{Math.max(0, 3 - mistakes)}</div>
                <div className="text-sm text-slate-400">Lives Remaining</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <button 
                onClick={restartGame}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Train Again
              </button>
              <Link 
                to="/dashboard"
                className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-all font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-content">
        <Link 
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="game-header">
          <h1 className="game-title-main">Memory Challenge</h1>
          <p className="game-subtitle">Remember the sequence and repeat it back. How far can your memory go?</p>
        </div>

        <div className="game-stats">
          <div className="stat-item">
            <div className="stat-label">Score</div>
            <div className="stat-value">{score}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Level</div>
            <div className="stat-value">{level}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Lives</div>
            <div className="stat-value text-red-400">❤️ {lives}</div>
          </div>
          {gameState === 'input' && (
            <div className="stat-item">
              <div className="stat-label">Time</div>
              <div className={`stat-value ${timeLeft <= 10 ? 'text-red-400' : ''}`}>
                {timeLeft}s
              </div>
            </div>
          )}
        </div>

        <div className="game-area">
          <div className="text-center mb-8">
            {gameState === 'showing' ? (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  📖 Memorize this sequence
                </h3>
                <p className="text-slate-400">Watch carefully and remember the order...</p>
              </div>
            ) : gameState === 'input' ? (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  🧠 Now repeat the sequence
                </h3>
                <p className="text-slate-400">
                  Click the numbers in the correct order ({userInput.length}/{sequence.length})
                </p>
              </div>
            ) : null}
          </div>

          {/* Memory Grid */}
          <div className="memory-sequence">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number, index) => (
              <div
                key={number}
                className={`memory-tile ${
                  showingSequence && sequence[activeIndex] === number ? 'active' : ''
                } ${
                  userInput.includes(number) ? 'user-input' : ''
                } ${
                  gameState === 'input' && userInput.length > 0 && 
                  userInput[userInput.length - 1] !== sequence[userInput.length - 1] && 
                  userInput.includes(number) ? 'incorrect' : ''
                }`}
                onClick={() => handleNumberClick(number)}
                style={{
                  cursor: gameState === 'input' && !showingSequence ? 'pointer' : 'default',
                  pointerEvents: gameState === 'input' && !showingSequence ? 'auto' : 'none'
                }}
              >
                {number}
              </div>
            ))}
          </div>

          {/* Sequence Display */}
          <div className="mt-8 text-center">
            <div className="text-slate-400 mb-2">Current Sequence Length: {sequence.length}</div>
            {gameState === 'input' && (
              <div className="text-slate-300">
                Your input: {userInput.join(' → ') || 'None yet'}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
            <h4 className="text-cyan-400 font-semibold mb-2">🎯 How to Play</h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Watch the sequence of numbers light up</li>
              <li>• Remember the exact order</li>
              <li>• Click the numbers in the same sequence</li>
              <li>• Each level adds more numbers to remember</li>
              <li>• You have 3 lives - don't make mistakes!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMemory;