import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API } from '../../App';
import axios from 'axios';

const GameCreativeWriting = () => {
  const { user } = useContext(AuthContext);
  const [prompt, setPrompt] = useState(null);
  const [userWriting, setUserWriting] = useState('');
  const [gameState, setGameState] = useState('loading'); // loading, writing, submitted, results
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [results, setResults] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    loadPrompt();
  }, []);

  useEffect(() => {
    if (gameState === 'writing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'writing') {
      handleSubmit();
    }
  }, [timeLeft, gameState]);

  useEffect(() => {
    setWordCount(userWriting.trim().split(/\s+/).filter(word => word.length > 0).length);
  }, [userWriting]);

  const loadPrompt = async () => {
    try {
      setGameState('loading');
      const response = await axios.get(`${API}/games/creative-writing/prompt`);
      setPrompt(response.data);
      setGameState('writing');
      setTimeLeft(300);
      setUserWriting('');
    } catch (error) {
      console.error('Error loading prompt:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setGameState('submitted');
      const timeUsed = 300 - timeLeft;

      // Log the data being sent to help with debugging
      console.log('Submitting creative writing:', {
        prompt_id: prompt.id,
        user_writing: userWriting.substring(0, 20) + '...', // Log just the beginning for brevity
        time_taken: timeUsed
      });

      const response = await axios.post(`${API}/games/creative-writing/submit`, {
        prompt_id: prompt.id,
        user_writing: userWriting,
        time_taken: timeUsed
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response received:', response.data);
      setResults(response.data);
      setGameState('results');
    } catch (error) {
      console.error('Error submitting writing:', error);
      // Provide more detailed error information
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      alert('Error submitting your writing. Please try again.');
      // Reset to writing state to allow resubmission
      setGameState('writing');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (wordCount >= prompt?.word_limit * 0.8) return 'text-green-600';
    if (wordCount >= prompt?.word_limit * 0.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading writing prompt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Creative Writing</h1>
          <p className="text-gray-600">Unleash your creativity and compete with AI storytelling</p>
        </div>

        {/* Writing Interface */}
        {(gameState === 'writing' || gameState === 'submitted') && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            {/* Prompt */}
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Writing Prompt</h2>
              <p className="text-gray-900 font-medium text-lg italic">{prompt?.prompt}</p>
            </div>

            {/* Stats Bar */}
            <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Words: </span>
                  <span className={`text-lg font-bold ${getProgressColor()}`}>
                    {wordCount}/{prompt?.word_limit}
                  </span>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((wordCount / prompt?.word_limit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-purple-600">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500">Time remaining</div>
              </div>
            </div>

            {/* Text Editor */}
            <div className="mb-6">
              <textarea
                value={userWriting}
                onChange={(e) => setUserWriting(e.target.value)}
                placeholder="Start writing your story here..."
                className="w-full h-80 p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none font-serif text-lg leading-relaxed"
                disabled={gameState !== 'writing'}
              />
            </div>

            {gameState === 'writing' && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={userWriting.trim().length === 0}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Writing
                </button>
                <button
                  onClick={loadPrompt}
                  className="px-8 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  New Prompt
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {gameState === 'results' && results && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Writing Comparison</h2>
            
            {/* Score Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Your Score</h3>
                <div className="text-4xl font-bold text-purple-600">{Math.round(results.user_score)}</div>
                <p className="text-gray-600 mt-2">Words: {results.word_count}</p>
                <p className="text-gray-600">Creativity Rating</p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">AI Score</h3>
                <div className="text-4xl font-bold text-blue-600">{results.ai_score}</div>
                <p className="text-gray-600 mt-2">AI Baseline</p>
                <p className="text-gray-600">Standard Performance</p>
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-l-4 border-green-500">
              <h3 className="text-lg font-semibold mb-2">Feedback</h3>
              <p className="text-gray-700">{results.feedback}</p>
            </div>

            {/* Writing Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-600">Your Writing</h3>
                <div className="p-4 bg-purple-50 rounded-lg h-64 overflow-y-auto">
                  <p className="text-gray-700 font-serif leading-relaxed">{results.user_writing}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">AI Writing</h3>
                <div className="p-4 bg-blue-50 rounded-lg h-64 overflow-y-auto">
                  <p className="text-gray-700 font-serif leading-relaxed">{results.ai_writing}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={loadPrompt}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Another Prompt
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

export default GameCreativeWriting;