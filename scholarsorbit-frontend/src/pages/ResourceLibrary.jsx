import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const CATEGORY_ICONS = {
  'Coaching Study Material': '🏫',
  'JEE PYQs': '📋',
  'NCERT Books for JEE': '📖',
  'JEE Handwritten Notes': '✍️',
  'JEE Physics Books': '⚛️',
  'JEE Mathematics Books': '📐',
  'JEE Chemistry Books': '🧪',
  'Main & Advanced Test Series': '🎯',
  'JEE Short Notes': '📝',
};

function ContentPanel({ title, data }) {
  if (!data || typeof data !== 'object') return null;

  const entries = Object.entries(data);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>

      <div className="space-y-4">
        {entries.map(([key, value]) => {
          if (!Array.isArray(value)) return null;
          const validLinks = value.filter((url) => url && url.startsWith('http'));
          if (validLinks.length === 0) return null;

          return (
            <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{key}</h3>
              <div className="flex flex-wrap gap-2">
                {validLinks.map((url, i) => (
                  <a
                    key={i}
                    href={url.replace(/\\/g, '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 hover:border-purple-200 transition-colors"
                  >
                    {validLinks.length === 1 ? 'Open' : `Part ${i + 1}`}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ResourceLibrary() {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exam, setExam] = useState('JEE');
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/resources`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load resources');
        return r.json();
      })
      .then((data) => {
        setResources(data);
        // Auto-select first category
        const archive = data['JEE Archive'];
        if (archive) {
          const categories = Object.keys(archive).filter(
            (k) => typeof archive[k] === 'object' && archive[k] !== null && Object.keys(archive[k]).length > 0
          );
          if (categories.length > 0) setActiveCategory(categories[0]);
        }
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const archive = resources?.['JEE Archive'] || {};
  const categories = Object.keys(archive).filter(
    (k) => typeof archive[k] === 'object' && archive[k] !== null && Object.keys(archive[k]).length > 0
  );

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-display font-bold text-gray-800">
              Scholars<span className="text-purple-600">Orbit</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/ai-study-bot"
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              AI Assistant
            </Link>
            <Link
              to="/dashboard"
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header + Toggle */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gray-900">Resource Library</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Curated study materials, books, notes, and previous year papers.
          </p>

          {/* JEE / NEET Toggle */}
          <div className="mt-4 inline-flex rounded-lg bg-gray-200 p-1">
            {['JEE', 'NEET'].map((tab) => (
              <button
                key={tab}
                onClick={() => setExam(tab)}
                className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  exam === tab
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading resources...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
            {error}. Make sure the backend server is running.
          </div>
        )}

        {/* NEET empty state */}
        {!loading && !error && exam === 'NEET' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🔬</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">NEET Resources Coming Soon</h2>
            <p className="text-gray-400 text-sm max-w-md">
              We're curating the best study materials for NEET preparation. Check back soon!
            </p>
          </div>
        )}

        {/* JEE Content */}
        {!loading && !error && exam === 'JEE' && resources && (
          <div className="flex gap-6">
            {/* Mobile category dropdown */}
            <div className="lg:hidden w-full mb-4">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700"
              >
                <span className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[activeCategory] || '📁'}</span>
                  {activeCategory || 'Select category'}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${mobileNavOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileNavOpen && (
                <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                        activeCategory === cat
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{CATEGORY_ICONS[cat] || '📁'}</span>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-20 bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
                </div>
                <nav className="p-2 max-h-[calc(100vh-10rem)] overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2.5 mb-0.5 ${
                        activeCategory === cat
                          ? 'bg-purple-50 text-purple-700 font-semibold border-l-2 border-purple-600 rounded-l-none'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <span className="text-base">{CATEGORY_ICONS[cat] || '📁'}</span>
                      <span className="truncate">{cat}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {activeCategory && archive[activeCategory] ? (
                <ContentPanel title={activeCategory} data={archive[activeCategory]} />
              ) : (
                <div className="text-center py-20 text-gray-400 text-sm">
                  Select a category to view resources.
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
