import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Target, Trophy, Users, BarChart } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Image Detection",
      description: "Test your ability to distinguish between AI-generated and real images. Compare your perception against advanced AI models."
    },
    {
      icon: Zap,
      title: "Text Analysis Challenge",
      description: "Can you identify AI-written text? Challenge yourself against GPT-5, Claude, and Gemini in detecting artificial content."
    },
    {
      icon: Target,
      title: "Memory Mastery",
      description: "Push your cognitive limits with sequence memory challenges. See how your recall compares to AI memory systems."
    },
    {
      icon: Trophy,
      title: "Logic Puzzles",
      description: "Solve complex reasoning problems and compare your logical thinking speed against AI problem-solving algorithms."
    },
    {
      icon: Users,
      title: "Global Leaderboard",
      description: "Compete with humans worldwide and see how humanity stacks up against the latest AI models."
    },
    {
      icon: BarChart,
      title: "Performance Analytics",
      description: "Track your cognitive performance over time and identify areas where humans excel or fall behind AI."
    }
  ];

  return (
    <div className="landing-hero">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            CognitiveArena
          </div>
          <div className="flex gap-4">
            <Link to="/dashboard" className="px-6 py-3 text-slate-300 hover:text-cyan-400 transition-colors font-medium">
              Dashboard
            </Link>
            <Link to="/leaderboard" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 font-medium">
              View Leaderboard
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="hero-title">
            Human vs AI
            <br />
            Cognitive Arena
          </h1>
          <p className="hero-subtitle">
            Challenge the world's most advanced AI models in cognitive tasks. 
            Discover where human intelligence shines and where AI dominates.
          </p>
          <div className="flex justify-center gap-6 mt-8">
            <Link 
              to="/dashboard" 
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Challenging AI
            </Link>
            <Link 
              to="/leaderboard" 
              className="px-8 py-4 border border-slate-600 text-slate-300 text-lg font-semibold rounded-xl hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
            >
              View Leaderboard
            </Link>
          </div>
        </div>

        {/* Hero Images Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 opacity-80">
          <div className="aspect-square rounded-xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1673255745677-e36f618550d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxBSSUyMGJyYWluJTIwdGVjaG5vbG9neXxlbnwwfHx8fDE3NTY5ODExODV8MA&ixlib=rb-4.1.0&q=85" 
              alt="AI Technology" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square rounded-xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1549925245-f20a1bac6454?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxBSSUyMGJyYWluJTIwdGVjaG5vbG9neXxlbnwwfHx8fDE3NTY5ODExODV8MA&ixlib=rb-4.1.0&q=85" 
              alt="Brain Visualization" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square rounded-xl overflow-hidden">
            <img 
              src="https://images.pexels.com/photos/8438864/pexels-photo-8438864.jpeg" 
              alt="Robot Chess" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square rounded-xl overflow-hidden">
            <img 
              src="https://images.pexels.com/photos/8438954/pexels-photo-8438954.jpeg" 
              alt="AI vs Human" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <feature.icon className="feature-icon" />
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">The Battle Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="text-3xl font-bold text-cyan-400 mb-2">92.5%</div>
              <div className="text-slate-300">AI Average Accuracy</div>
              <div className="text-sm text-slate-400 mt-1">Across all cognitive tasks</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="text-3xl font-bold text-purple-400 mb-2">87.3%</div>
              <div className="text-slate-300">Human Average Accuracy</div>
              <div className="text-sm text-slate-400 mt-1">The gap is closing!</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="text-3xl font-bold text-green-400 mb-2">15</div>
              <div className="text-slate-300">Tasks Where Humans Win</div>
              <div className="text-sm text-slate-400 mt-1">Creative and intuitive challenges</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-12 border border-cyan-500/20">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Test Your Mind?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of humans challenging AI in the ultimate cognitive arena. 
              Discover your strengths and push the boundaries of human intelligence.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Brain className="w-6 h-6" />
              Enter the Arena
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;