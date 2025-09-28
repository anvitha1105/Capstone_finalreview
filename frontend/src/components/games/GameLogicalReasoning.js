import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API } from '../../App';
import axios from 'axios';

const GameLogicalReasoning = () => {
  const { user } = useContext(AuthContext);
  const [puzzle, setPuzzle] = useState(null);
  const [aiBaseline, setAiBaseline] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [gameState, setGameState] = useState('loading'); // loading, playing, submitted, results
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [results, setResults] = useState(null);
  const [difficulty, setDifficulty] = useState(1);

  useEffect(() => {
    loadPuzzle();
  }, [difficulty]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleSubmit();
    }
  }, [timeLeft, gameState]);

  const loadPuzzle = async () => {
    try {
      setGameState('loading');
      const response = await axios.get(`${API}/games/logical-reasoning/data?difficulty=${difficulty}`);
      setPuzzle(response.data.puzzle);
      setAiBaseline(response.data.ai_baseline);
      setGameState('playing');
      setTimeLeft(120);
      setUserAnswer('');
      setSelectedOption('');
    } catch (error) {
      console.error('Error loading puzzle:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setGameState('submitted');
      const startTime = 120 - timeLeft;
      const answer = puzzle.type === 'pattern_matching' || puzzle.type === 'logic_grid' 
        ? selectedOption 
        : userAnswer;

      const response = await axios.post(`${API}/games/logical-reasoning/submit`, {
        puzzle_id: puzzle.id,
        user_answer: answer,
        time_taken: startTime
      });

      setResults(response.data);
      setGameState('results');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPuzzleContent = () => {
    if (!puzzle) return null;

    switch (puzzle.type) {
      case 'number_sequence':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{puzzle.question}</p>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter your answer"
              disabled={gameState !== 'playing'}
            />
          </div>
        );

      case 'pattern_matching':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{puzzle.question}</p>
            <div className="text-2xl font-mono tracking-wider text-center p-4 bg-gray-100 rounded-lg">
              {puzzle.pattern}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {puzzle.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(option)}
                  className={`p-3 rounded-lg border-2 text-lg font-medium transition-colors ${
                    selectedOption === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={gameState !== 'playing'}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'logic_grid':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{puzzle.question}</p>
            <div className="space-y-2">
              {puzzle.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                    selectedOption === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={gameState !== 'playing'}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <p>Unknown puzzle type</p>;
    }
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Logical Reasoning</h1>
          <p className="text-gray-600">Challenge your logic against AI reasoning</p>
        </div>

        {/* Game Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-500">Difficulty:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="border rounded px-3 py-1"
                disabled={gameState === 'playing'}
              >
                <option value={1}>Easy</option>
                <option value={2}>Medium</option>
                <option value={3}>Hard</option>
              </select>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-indigo-600">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500">Time remaining</div>
            </div>
          </div>
        </div>

        {/* Puzzle Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {renderPuzzleContent()}
          
          {gameState === 'playing' && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={
                  (puzzle.type === 'number_sequence' && !userAnswer) ||
                  ((puzzle.type === 'pattern_matching' || puzzle.type === 'logic_grid') && !selectedOption)
                }
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Answer
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {gameState === 'results' && results && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-center mb-6">Results</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Your Performance</h3>
                <div className={`text-3xl font-bold ${results.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {results.correct ? '✓ Correct' : '✗ Incorrect'}
                </div>
                <p className="text-gray-600 mt-2">Score: {results.score}</p>
                <p className="text-gray-600">Accuracy: {results.accuracy}%</p>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">AI Performance</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {aiBaseline?.ai_confidence ? Math.round(aiBaseline.ai_confidence * 100) : 90}%
                </div>
                <p className="text-gray-600 mt-2">AI Confidence</p>
                <p className="text-gray-600">Baseline Score: {Math.round(aiBaseline?.ai_confidence * 100) || 90}</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-center text-gray-700">{results.explanation}</p>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={loadPuzzle}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Another Puzzle
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLogicalReasoning;