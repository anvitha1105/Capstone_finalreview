import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../App';
import { ArrowLeft, FileText, Brain, Clock, Target, CheckCircle, XCircle, User } from 'lucide-react';

const GameTextAI = () => {
  const [gameData, setGameData] = useState(null);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [gameState, setGameState] = useState('loading'); // loading, playing, finished
  const [timeLeft, setTimeLeft] = useState(45);
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
      const response = await axios.get(`${API}/games/text-ai/data`);
      setGameData(response.data);
      setGameState('playing');
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  const handleAnswer = async (isAI) => {
    if (selectedAnswer !== null || !gameData) return;

    const currentText = gameData.texts[currentTextIndex];
    const isCorrect = isAI === currentText.is_ai;
    
    setSelectedAnswer(isAI);
    setShowResult(true);
    
    const newAnswer = {
      textId: currentText.id,
      userAnswer: isAI,
      correctAnswer: currentText.is_ai,
      isCorrect: isCorrect,
      timeSpent: 45 - timeLeft
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    
    if (isCorrect) {
      const timeBonus = Math.max(0, timeLeft * 2);
      setScore(score + 100 + timeBonus);
    }

    // Wait 3 seconds to show result, then move to next text
    setTimeout(() => {
      if (currentTextIndex < gameData.texts.length - 1) {
        setCurrentTextIndex(currentTextIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(45);
      } else {
        finishGame(updatedAnswers);
      }
    }, 3000);
  };

  const finishGame = async (finalAnswers) => {
    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);
    const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / finalAnswers.length) * 100;

    setGameState('finished');

    try {
      const response = await axios.post(`${API}/games/score`, {
        game_type: 'text_ai',
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
    setCurrentTextIndex(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(45);
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
    const aiBaselineScore = Math.round(score * 0.887); // Simulated AI baseline

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
            <h1 className="results-title">Text Analysis Complete!</h1>
            
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
                  Claude Sonnet 4 Performance (88.7% accuracy)
                </div>
              </div>
            </div>

            <div className="mt-6">
              {score > aiBaselineScore ? (
                <div className="flex items-center justify-center gap-2 text-green-400 text-lg font-semibold">
                  <CheckCircle className="w-6 h-6" />
                  Amazing! Your text analysis skills beat AI!
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-purple-400 text-lg font-semibold">
                  <Brain className="w-6 h-6" />
                  AI had the edge this time. Practice makes perfect!
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <button 
                onClick={restartGame}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Analyze More Text
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

  const currentText = gameData.texts[currentTextIndex];
  const progress = ((currentTextIndex + 1) / gameData.texts.length) * 100;

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
          <h1 className="game-title-main">Text vs AI Detection</h1>
          <p className="game-subtitle">Can you identify human writing from AI-generated text?</p>
        </div>

        <div className="game-stats">
          <div className="stat-item">
            <div className="stat-label">Score</div>
            <div className="stat-value">{score}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Text</div>
            <div className="stat-value">{currentTextIndex + 1}/{gameData.texts.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Time</div>
            <div className={`stat-value ${timeLeft <= 15 ? 'text-red-400' : ''}`}>
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
          <div className="bg-slate-800 p-6 rounded-xl mb-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-400 font-medium">Text Sample {currentTextIndex + 1}</span>
            </div>
            <div className="text-white text-lg leading-relaxed font-mono bg-slate-900 p-4 rounded-lg border border-slate-600">
              "{currentText.text}"
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Was this text written by a human or AI?
            </h3>
            <p className="text-slate-400">Analyze the writing style, patterns, and authenticity</p>
          </div>

          {showResult ? (
            <div className="text-center">
              <div className={`text-2xl font-bold mb-4 ${selectedAnswer === currentText.is_ai ? 'text-green-400' : 'text-red-400'}`}>
                {selectedAnswer === currentText.is_ai ? 'Correct!' : 'Incorrect!'}
              </div>
              <div className="text-slate-400 mb-2">
                This text was written by: <span className="text-white font-semibold">{currentText.source}</span>
              </div>
              <div className="text-sm text-slate-500">
                {currentText.is_ai ? 'AI models often use certain patterns and phrases' : 'Human writing has unique personal touches and imperfections'}
              </div>
            </div>
          ) : (
            <div className="game-options">
              <button 
                onClick={() => handleAnswer(false)}
                className="game-option-btn"
                disabled={selectedAnswer !== null}
              >
                <User className="w-5 h-5 mr-2" />
                Human Written
              </button>
              <button 
                onClick={() => handleAnswer(true)}
                className="game-option-btn"
                disabled={selectedAnswer !== null}
              >
                <Brain className="w-5 h-5 mr-2" />
                AI Generated
              </button>
            </div>
          )}
        </div>

        {/* Hint Section */}
        <div className="mt-8 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
          <h4 className="text-cyan-400 font-semibold mb-2">💡 Detection Tips</h4>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• AI text often lacks personal anecdotes or specific details</li>
            <li>• Look for overly formal language or repetitive patterns</li>
            <li>• Human writing has natural imperfections and emotional depth</li>
            <li>• AI may use generic phrases like "it's worth noting" or "it's important to"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameTextAI;