import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '../App';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Trophy, 
  ArrowLeft,
  Image,
  FileText,
  Brain,
  Zap
} from 'lucide-react';

const UserStats = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${API}/stats/user`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameIcon = (gameType) => {
    switch (gameType) {
      case 'ai_image':
        return Image;
      case 'text_ai':
        return FileText;
      case 'memory_challenge':
        return Brain;
      default:
        return Target;
    }
  };

  const getGameTitle = (gameType) => {
    switch (gameType) {
      case 'ai_image':
        return 'AI Image Detection';
      case 'text_ai':
        return 'Text vs AI';
      case 'memory_challenge':
        return 'Memory Challenge';
      default:
        return 'Unknown Game';
    }
  };

  const getGameColor = (gameType) => {
    switch (gameType) {
      case 'ai_image':
        return 'from-blue-500 to-cyan-500';
      case 'text_ai':
        return 'from-purple-500 to-pink-500';
      case 'memory_challenge':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/dashboard" className="nav-brand">
            CognitiveArena
          </Link>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/leaderboard" className="nav-link">
              Leaderboard
            </Link>
            <Link to="/stats" className="nav-link active">
              Stats
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Performance Analytics
          </h1>
          <p className="text-xl text-slate-400">
            Track your cognitive performance across all challenges
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-slate-400">Total Games</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.total_games || 0}
            </div>
            <div className="text-sm text-slate-500">Challenges completed</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              <span className="text-slate-400">Total Score</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {user?.total_score || 0}
            </div>
            <div className="text-sm text-slate-500">Points earned</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-green-400" />
              <span className="text-slate-400">Avg Accuracy</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.total_games > 0 ? 
                Math.round(
                  Object.values(stats.user_stats).reduce((sum, stat) => sum + (stat.avg_accuracy || 0), 0) / 
                  Object.keys(stats.user_stats).length
                ) : 0
              }%
            </div>
            <div className="text-sm text-slate-500">Across all games</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <span className="text-slate-400">Rank</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats?.total_games > 0 ? '#42' : 'N/A'}
            </div>
            <div className="text-sm text-slate-500">Global ranking</div>
          </div>
        </div>

        {/* Game-Specific Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Game Performance Breakdown
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats && Object.entries(stats.user_stats).map(([gameType, gameStat]) => {
              const GameIcon = getGameIcon(gameType);
              const gameTitle = getGameTitle(gameType);
              const gameColor = getGameColor(gameType);
              
              return (
                <div key={gameType} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${gameColor} bg-opacity-20`}>
                      <GameIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{gameTitle}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Games Played</span>
                      <span className="text-white font-semibold">{gameStat.games_played}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Best Score</span>
                      <span className="text-white font-semibold">{gameStat.best_score}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Avg Accuracy</span>
                      <span className="text-white font-semibold">{gameStat.avg_accuracy}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Avg Time</span>
                      <span className="text-white font-semibold">{gameStat.avg_time}s</span>
                    </div>
                    
                    {/* Progress Bar for Accuracy */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Accuracy Progress</span>
                        <span className="text-slate-400">{gameStat.avg_accuracy}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${gameColor}`}
                          style={{ width: `${gameStat.avg_accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Performance Insights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Strengths</h3>
              <div className="space-y-3">
                {stats && Object.entries(stats.user_stats)
                  .sort((a, b) => b[1].avg_accuracy - a[1].avg_accuracy)
                  .slice(0, 2)
                  .map(([gameType, gameStat]) => (
                    <div key={gameType} className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium">{getGameTitle(gameType)}</span>
                      <span className="text-green-300 text-sm">({gameStat.avg_accuracy}% accuracy)</span>
                    </div>
                  ))
                }
                {(!stats || Object.keys(stats.user_stats).length === 0) && (
                  <div className="text-slate-400 italic">Play some games to see your strengths!</div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Areas for Improvement</h3>
              <div className="space-y-3">
                {stats && Object.entries(stats.user_stats)
                  .sort((a, b) => a[1].avg_accuracy - b[1].avg_accuracy)
                  .slice(0, 2)
                  .map(([gameType, gameStat]) => (
                    <div key={gameType} className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-yellow-400 font-medium">{getGameTitle(gameType)}</span>
                      <span className="text-yellow-300 text-sm">({gameStat.avg_accuracy}% accuracy)</span>
                    </div>
                  ))
                }
                {(!stats || Object.keys(stats.user_stats).length === 0) && (
                  <div className="text-slate-400 italic">Complete more challenges to get insights!</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <h4 className="text-cyan-400 font-semibold mb-2">💡 Pro Tip</h4>
            <p className="text-slate-300 text-sm">
              Consistent practice in your weaker areas can significantly improve your overall cognitive performance. 
              Focus on accuracy first, then work on speed!
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <Brain className="w-5 h-5" />
            Continue Training
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserStats;