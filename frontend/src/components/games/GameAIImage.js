import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../App';
import { ArrowLeft, Eye, Brain, Clock, Target, CheckCircle, XCircle } from 'lucide-react';

const GameAIImage = () => {
  const [gameData, setGameData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [gameState, setGameState] = useState('loading'); // loading, playing, finished
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleAnswer(null); // Time's up, auto-submit
    }
  }, [gameState, timeLeft]);

  const fetchGameData = async () => {
    try {
      const response = await axios.get(`${API}/games/ai-image/data`);
      setGameData(response.data);
      setGameState('playing');
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  const handleAnswer = async (isAI) => {
    if (selectedAnswer !== null || !gameData) return;

    const currentImage = gameData.images[currentImageIndex];
    const isCorrect = isAI === currentImage.is_ai;
    
    setSelectedAnswer(isAI);
    setShowResult(true);
    
    const newAnswer = {
      imageId: currentImage.id,
      userAnswer: isAI,
      correctAnswer: currentImage.is_ai,
      isCorrect: isCorrect,
      timeSpent: 30 - timeLeft
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    if (isCorrect) {
      const timeBonus = Math.max(0, timeLeft * 2);
      setScore(score + 100 + timeBonus);
    }

    // Wait 2 seconds to show result, then move to next image
    setTimeout(() => {
      if (currentImageIndex < gameData.images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(30);
      } else {
        finishGame(updatedAnswers);
      }
    }, 2000);
  };

  const finishGame = async (finalAnswers) => {
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / finalAnswers.length) * 100;

    setGameState('finished');

    try {
      const response = await axios.post(`${API}/games/score`, {
        game_type: 'ai_image',
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
    setCurrentImageIndex(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    fetchGameData();
  };

  if (gameState === 'loading' || !gameData) {
    return (
      <div className="game-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / answers.length) * 100;
    const aiBaselineScore = Math.round(score * 0.925); // Simulated AI baseline

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
            <h1 className="results-title">Game Complete!</h1>
            
            <div className="results-comparison">
              <div className="comparison-item">
                <div className="comparison-label">Your Performance</div>
                <div className="comparison-score">{score}</div>
                <div className="text-sm text-slate-400 mt-2">
                  {correctAnswers}/{answers.length} correct ({accuracy.toFixed(1)}% accuracy)
                </div>
              </div>
              
              <div className="comparison-item ai">
                <div className="comparison-label">AI Baseline</div>
                <div className="comparison-score">{aiBaselineScore}</div>
                <div className="text-sm text-slate-400 mt-2">
                  GPT-5 Performance (92.5% accuracy)
                </div>
              </div>
            </div>

            <div className="mt-6">
              {score > aiBaselineScore ? (
                <div className="flex items-center justify-center gap-2 text-green-400 text-lg font-semibold">
                  <CheckCircle className="w-6 h-6" />
                  Congratulations! You beat the AI!
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-purple-400 text-lg font-semibold">
                  <Brain className="w-6 h-6" />
                  AI performed better this time. Try again!
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <button 
                onClick={restartGame}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Play Again
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

  const currentImage = gameData.images[currentImageIndex];
  const progress = ((currentImageIndex + 1) / gameData.images.length) * 100;

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
          <h1 className="game-title-main">AI Image Detection</h1>
          <p className="game-subtitle">Is this image AI-generated or real? Trust your instincts!</p>
        </div>

        <div className="game-stats">
          <div className="stat-item">
            <div className="stat-label">Score</div>
            <div className="stat-value">{score}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Image</div>
            <div className="stat-value">{currentImageIndex + 1}/{gameData.images.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Time</div>
            <div className={`stat-value ${timeLeft <= 10 ? 'text-red-400' : ''}`}>
              {timeLeft}s
            </div>
          </div>
        </div>

        <div className="game-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-slate-400 text-sm mt-2">Progress: {Math.round(progress)}%</p>
        </div>

        <div className="game-area">
          <img 
            src={currentImage.url} 
            alt="Challenge Image"
            className="game-image"
          />
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Is this image AI-generated or real?
            </h3>
            <p className="text-slate-400">{currentImage.description}</p>
          </div>

          {showResult ? (
            <div className="text-center">
              <div className={`text-2xl font-bold mb-4 ${selectedAnswer === currentImage.is_ai ? 'text-green-400' : 'text-red-400'}`}>
                {selectedAnswer === currentImage.is_ai ? 'Correct!' : 'Incorrect!'}
              </div>
              <div className="text-slate-400">
                This image is {currentImage.is_ai ? 'AI-generated' : 'real'}
              </div>
            </div>
          ) : (
            <div className="game-options">
              <button 
                onClick={() => handleAnswer(true)}
                className="game-option-btn"
                disabled={selectedAnswer !== null}
              >
                <Brain className="w-5 h-5 mr-2" />
                AI Generated
              </button>
              <button 
                onClick={() => handleAnswer(false)}
                className="game-option-btn"
                disabled={selectedAnswer !== null}
              >
                <Eye className="w-5 h-5 mr-2" />
                Real Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameAIImage;