import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openLogin, openSignup } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-display font-bold text-dark-900">
              Scholars<span className="text-primary-500">Orbit</span>
            </span>
          </div>

          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary-500 transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-primary-500 transition-colors">About</a>
            <a href="#contact" className="text-gray-600 hover:text-primary-500 transition-colors">Contact</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => openLogin()} className="text-gray-600 hover:text-dark-900 transition-colors">Login</button>
            <button onClick={() => openSignup()} className="btn-primary">Get Started</button>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-dark-900 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-dark-900 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-dark-900 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
            <a href="#features" className="block text-gray-600 hover:text-primary-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#about" className="block text-gray-600 hover:text-primary-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#contact" className="block text-gray-600 hover:text-primary-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <hr className="border-gray-200" />
            <button onClick={() => { setMobileMenuOpen(false); openLogin(); }} className="block w-full text-left text-gray-600 hover:text-dark-900 transition-colors">Login</button>
            <button onClick={() => { setMobileMenuOpen(false); openSignup(); }} className="btn-primary w-full">Get Started</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-primary-500/10 text-primary-400 px-4 py-2 rounded-full text-sm font-medium border border-primary-500/20">
                  🎯 JEE & NEET Preparation Platform
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight">
                Your Journey to
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-600">
                  {" "}Success{" "}
                </span>
                Starts Here
              </h1>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                Connect with expert teachers, collaborate with peers, access curated resources, 
                and get AI-powered study assistance—all in one platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => openSignup()} className="btn-primary text-lg">
                  Start Learning Free
                </button>
                <button className="btn-secondary text-lg">
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-white">10k+</p>
                  <p className="text-gray-400 text-sm">Active Students</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-gray-400 text-sm">Expert Teachers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">95%</p>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                </div>
              </div>
            </div>
            
            {/* Right Content - Feature Cards */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-600 opacity-20 blur-3xl"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="card space-y-3 transform hover:-translate-y-2 transition-transform">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Resource Library</h3>
                  <p className="text-sm text-gray-400">Access thousands of notes, videos & PDFs</p>
                </div>
                
                <div className="card space-y-3 transform hover:-translate-y-2 transition-transform mt-8">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">AI Study Assistant</h3>
                  <p className="text-sm text-gray-400">Get instant doubt solving 24/7</p>
                </div>
                
                <div className="card space-y-3 transform hover:-translate-y-2 transition-transform">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Peer Learning</h3>
                  <p className="text-sm text-gray-400">Connect with students nationwide</p>
                </div>
                
                <div className="card space-y-3 transform hover:-translate-y-2 transition-transform mt-8">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Expert Teachers</h3>
                  <p className="text-sm text-gray-400">Learn from IIT/AIIMS alumni</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Everything You Need to Excel</h2>
            <p className="section-subtitle">
              Comprehensive tools designed specifically for JEE and NEET aspirants
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">Smart Notes</h3>
              <p className="text-gray-400 leading-relaxed">
                Create, organize, and share notes with rich formatting. Collaborate with classmates in real-time.
              </p>
              <div className="mt-4 flex items-center text-primary-400 font-medium group-hover:gap-2 transition-all">
                <span>Learn more</span>
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="card group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">Live Chat</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect with teachers and students instantly. Join study groups and discussion forums.
              </p>
              <div className="mt-4 flex items-center text-primary-400 font-medium group-hover:gap-2 transition-all">
                <span>Learn more</span>
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="card group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">AI Practice</h3>
              <p className="text-gray-400 leading-relaxed">
                Personalized quizzes, flashcards, and practice tests powered by advanced AI technology.
              </p>
              <div className="mt-4 flex items-center text-primary-400 font-medium group-hover:gap-2 transition-all">
                <span>Learn more</span>
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card bg-gradient-to-r from-primary-600 to-blue-600 border-none">
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Ready to Transform Your Preparation?
            </h2>
            <p className="text-xl text-gray-100 mb-8">
              Join thousands of students who are already on their path to success
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => openSignup()} className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105">
                Create Free Account
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all">
                Talk to Advisor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-700 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 ScholarsOrbit. Empowering students to achieve their dreams.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;