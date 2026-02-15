import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const TOPIC_COLORS = {
  Math: 'from-blue-500 to-blue-700',
  Physics: 'from-orange-500 to-orange-700',
  Chemistry: 'from-green-500 to-green-700',
  Biology: 'from-pink-500 to-pink-700',
  'Exam Prep': 'from-yellow-500 to-yellow-700',
  Other: 'from-gray-500 to-gray-700',
};

const stats = [
  { label: 'Courses Enrolled', value: '0', icon: '📚' },
  { label: 'Hours Studied', value: '0', icon: '⏱️' },
  { label: 'Quizzes Taken', value: '0', icon: '📝' },
  { label: 'Rank', value: '--', icon: '🏆' },
];

const features = [
  { title: 'Resource Library', desc: 'Access notes, videos & PDFs', icon: '📚', color: 'from-primary-500 to-primary-700' },
  { title: 'AI Assistant', desc: 'Get instant doubt solving', icon: '🤖', color: 'from-blue-500 to-blue-700' },
  { title: 'Live Chat', desc: 'Connect with peers & teachers', icon: '💬', color: 'from-purple-500 to-purple-700' },
  { title: 'Practice Tests', desc: 'Personalized quizzes & tests', icon: '🎯', color: 'from-green-500 to-green-700' },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [topTopics, setTopTopics] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('scholarsOrbitToken');
    if (!token) return;
    fetch(`${API_URL}/api/users/top-topics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.topics) setTopTopics(data.topics); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      {/* Top bar */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-display font-bold text-dark-900">
              Scholars<span className="text-primary-500">Orbit</span>
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-red-500 transition-colors font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-400 text-lg">Let's keep the momentum going.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-dark-800 rounded-xl p-5 border border-dark-700">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-2xl font-bold text-white mt-2">{s.value}</p>
              <p className="text-gray-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top Topics */}
        {topTopics.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-display font-bold text-white mb-4">Your Top Topics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {topTopics.map((t) => (
                <div key={t.topic} className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                  <div className={`w-10 h-10 bg-gradient-to-br ${TOPIC_COLORS[t.topic] || TOPIC_COLORS.Other} rounded-lg flex items-center justify-center mb-3`}>
                    <span className="text-white font-bold text-sm">{t.topic.charAt(0)}</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{t.topic}</p>
                  <p className="text-gray-400 text-xs mt-1">{t.count} question{t.count !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature cards */}
        <h2 className="text-xl font-display font-bold text-white mb-4">Quick Access</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const linkMap = {
              'AI Assistant': '/ai-study-bot',
              'Resource Library': '/resources',
            };
            const href = linkMap[f.title];
            const card = (
              <div
                key={f.title}
                className="bg-dark-800 rounded-xl p-6 border border-dark-700 hover:border-primary-500 transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${f.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            );
            return href ? (
              <Link to={href} key={f.title}>{card}</Link>
            ) : (
              card
            );
          })}
        </div>
      </div>
    </div>
  );
}
