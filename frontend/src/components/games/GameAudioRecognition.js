import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API } from '../../App';
import axios from 'axios';

const GameAudioRecognition = () => {
  const { user } = useContext(AuthContext);
  const [audioClips, setAudioClips] = useState([]);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [gameState, setGameState] = useState('loading'); // loading, playing, submitted, results
  const [results, setResults] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);

  useEffect(() => {
    loadAudioClips();
  }, []);

  const loadAudioClips = async () => {
    try {
      setGameState('loading');
      const response = await axios.get(`${API}/games/audio-recognition/data`);
      setAudioClips(response.data.audio_clips);
      setCurrentClipIndex(0);
      setGameState('playing');
      setGameStartTime(Date.now());
    } catch (error) {
      console.error('Error loading audio clips:', error);
    }
  };

  const playAudio = () => {
    const currentClip = audioClips[currentClipIndex];
    if (currentClip) {
      setIsPlaying(true);
      const audio = new Audio(currentClip.url);
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
      });
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        console.error('Audio failed to load');
      };
    }
  };

  const handleAnswer = async (answer) => {
    try {
      setUserAnswer(answer);
      setGameState('submitted');
      
      const currentClip = audioClips[currentClipIndex];
      const timeUsed = Math.round((Date.now() - gameStartTime) / 1000);

      const response = await axios.post(`${API}/games/audio-recognition/submit`, {
        audio_id: currentClip.id,
        user_answer: answer,
        time_taken: timeUsed
      });

      setResults(response.data);
      setGameState('results');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const nextClip = () => {
    if (currentClipIndex < audioClips.length - 1) {
      setCurrentClipIndex(currentClipIndex + 1);
      setUserAnswer('');
      setGameState('playing');
      setGameStartTime(Date.now());
      setResults(null);
    } else {
      // Game finished
      setGameState('finished');
    }
  };

  const restartGame = () => {
    loadAudioClips();
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audio clips...</p>
        </div>
      </div>
    );
  }

  const currentClip = audioClips[currentClipIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Audio Recognition</h1>
          <p className="text-gray-600">Can you tell human-made audio from AI-generated?</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Clip {currentClipIndex + 1} of {audioClips.length}</span>
            <div className="flex space-x-2">
              {audioClips.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < currentClipIndex ? 'bg-green-500' : 
                    index === currentClipIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                ></div>
              ))}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentClipIndex + 1) / audioClips.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Audio Player */}
        {(gameState === 'playing' || gameState === 'submitted') && currentClip && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-4">Listen to this audio clip</h2>
              <p className="text-gray-600 mb-6">Duration: ~{currentClip.duration} seconds</p>
              
              {/* Audio Player Interface */}
              <div className="bg-gray-50 rounded-xl p-8 mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={playAudio}
                    disabled={isPlaying || gameState === 'submitted'}
                    className={`flex items-center justify-center w-20 h-20 rounded-full text-white text-2xl font-bold transition-all ${
                      isPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  {isPlaying ? 'Playing...' : 'Click to play audio'}
                </p>
              </div>

              {/* Answer Buttons */}
              {gameState === 'playing' && (
                <div className="space-y-4">
                  <p className="text-lg font-medium mb-6">Is this audio human-made or AI-generated?</p>
                  <div className="flex justify-center space-x-6">
                    <button
                      onClick={() => handleAnswer('human')}
                      className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
                    >
                      🎤 Human-Made
                    </button>
                    <button
                      onClick={() => handleAnswer('ai')}
                      className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-lg"
                    >
                      🤖 AI-Generated
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {gameState === 'results' && results && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-center mb-6">Result</h2>
            
            <div className="text-center mb-6">
              <div className={`text-6xl mb-4 ${results.correct ? 'text-green-600' : 'text-red-600'}`}>
                {results.correct ? '✅' : '❌'}
              </div>
              <h3 className={`text-2xl font-bold ${results.correct ? 'text-green-600' : 'text-red-600'}`}>
                {results.correct ? 'Correct!' : 'Incorrect'}
              </h3>
              <p className="text-gray-600 mt-2">
                This audio was <strong>{results.correct_answer}</strong>-generated
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Your Answer</h4>
                <p className="text-2xl font-bold text-blue-600 capitalize">{userAnswer}</p>
                <p className="text-gray-600 mt-2">Score: {results.score}</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">AI Accuracy</h4>
                <p className="text-2xl font-bold text-gray-600">94%</p>
                <p className="text-gray-600 mt-2">Baseline Performance</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <p className="text-center text-gray-700">{results.explanation}</p>
            </div>

            <div className="flex justify-center space-x-4">
              {currentClipIndex < audioClips.length - 1 ? (
                <button
                  onClick={nextClip}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Next Clip
                </button>
              ) : (
                <button
                  onClick={restartGame}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Play Again
                </button>
              )}
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Game Finished */}
        {gameState === 'finished' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Game Complete!</h2>
            <p className="text-gray-600 mb-6">You've tested all audio clips</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={restartGame}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Play Again
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

export default GameAudioRecognition;