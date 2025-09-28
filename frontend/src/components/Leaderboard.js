import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Trophy, Crown, Medal, Zap, Users, Bot, ArrowLeft } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({
    human_leaders: [],
    ai_baselines: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`);
      setLeaderboardData(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;  
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    if (rank <= 3) {
      return `rank-${rank}`;
    }
    return '';
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
            <Link to="/leaderboard" className="nav-link active">
              Leaderboard
            </Link>
            <Link to="/stats" className="nav-link">
              Stats
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <h1 className="leaderboard-title">Global Leaderboard</h1>
          <p className="text-xl text-slate-400 mb-8">
            The ultimate showdown: Human intelligence vs Artificial intelligence
          </p>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-green-400" />
                <span className="text-slate-300 font-medium">Human Champions</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{leaderboardData.human_leaders.length}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Bot className="w-6 h-6 text-purple-400" />
                <span className="text-slate-300 font-medium">AI Models</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{leaderboardData.ai_baselines.length}</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-cyan-400" />
                <span className="text-slate-300 font-medium">Total Battles</span>
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {leaderboardData.human_leaders.reduce((sum, user) => sum + (user.total_games_played || 0), 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Grid */}
        <div className="leaderboard-grid">
          {/* Human Leaderboard */}
          <div className="leaderboard-section">
            <h2 className="section-title human">
              <Users className="w-6 h-6 inline mr-2" />
              Human Champions
            </h2>
            
            {leaderboardData.human_leaders.length > 0 ? (
              <ul className="leaderboard-list">
                {leaderboardData.human_leaders.map((user, index) => (
                  <li key={user.id} className={`leaderboard-item ${index < 3 ? 'top-3' : ''}`}>
                    <div className="flex items-center gap-3">
                      {getRankIcon(index + 1)}
                      <div>
                        <div className="leaderboard-name">{user.username}</div>
                        <div className="text-xs text-slate-500">
                          {user.total_games_played || 0} games played
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="leaderboard-score">{user.total_score || 0}</div>
                      <div className="text-xs text-slate-500">points</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No human players yet. Be the first champion!</p>
              </div>
            )}
          </div>

          {/* AI Baselines */}
          <div className="leaderboard-section">
            <h2 className="section-title ai">
              <Bot className="w-6 h-6 inline mr-2" />
              AI Baselines
            </h2>
            
            <ul className="leaderboard-list">
              {leaderboardData.ai_baselines.map((ai, index) => (
                <li key={ai.name} className={`leaderboard-item ${index < 3 ? 'top-3' : ''}`}>
                  <div className="flex items-center gap-3">
                    {getRankIcon(index + 1)}
                    <div>
                      <div className="leaderboard-name">{ai.name}</div>
                      <div className="text-xs text-slate-500">
                        {ai.games_played} games simulated
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="leaderboard-score text-purple-400">{ai.total_score}</div>
                    <div className="text-xs text-slate-500">points</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Combined Leaderboard */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Ultimate Rankings</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <div className="space-y-3">
              {/* Combine and sort all participants */}
              {[...leaderboardData.ai_baselines, ...leaderboardData.human_leaders]
                .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
                .slice(0, 10)
                .map((participant, index) => (
                  <div key={participant.name || participant.username} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index + 1)}
                        {participant.is_ai ? (
                          <Bot className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Users className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {participant.name || participant.username}
                        </div>
                        <div className="text-sm text-slate-400">
                          {participant.is_ai ? 'AI Model' : 'Human Player'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${participant.is_ai ? 'text-purple-400' : 'text-green-400'}`}>
                        {participant.total_score || 0}
                      </div>
                      <div className="text-xs text-slate-500">points</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20">
            <Trophy className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Climb the Rankings?</h3>
            <p className="text-slate-400 mb-6">
              Challenge AI models and prove human intelligence can compete with artificial intelligence.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              <Zap className="w-5 h-5" />
              Start Competing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;