import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, openLogin, openSignup, logout } = useAuth();

  return (
    <nav className="sticky top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-display font-bold text-dark-900">
            Scholars<span className="text-primary-500">Orbit</span>
          </span>
        </Link>

        <div className="hidden md:flex space-x-8">
          <Link to="/#features" className="text-gray-600 hover:text-primary-500 transition-colors">Features</Link>
          <Link to="/#about" className="text-gray-600 hover:text-primary-500 transition-colors">About</Link>
          <Link to="/#contact" className="text-gray-600 hover:text-primary-500 transition-colors">Contact</Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to={`/profile/${user.id}`}
                className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform"
                aria-label="Go to profile"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Link>
              <button onClick={logout} className="text-gray-600 hover:text-red-500 transition-colors text-sm font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => openLogin()} className="text-gray-600 hover:text-dark-900 transition-colors">Login</button>
              <button onClick={() => openSignup()} className="btn-primary">Get Started</button>
            </>
          )}
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

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
          <Link to="/#features" className="block text-gray-600 hover:text-primary-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</Link>
          <Link to="/#about" className="block text-gray-600 hover:text-primary-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/#contact" className="block text-gray-600 hover:text-primary-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <hr className="border-gray-200" />
          {user ? (
            <>
              <Link
                to={`/profile/${user.id}`}
                className="block text-gray-600 hover:text-primary-500 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Go to profile"
              >
                Profile
              </Link>
              <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="block w-full text-left text-gray-600 hover:text-red-500 transition-colors">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { setMobileMenuOpen(false); openLogin(); }} className="block w-full text-left text-gray-600 hover:text-dark-900 transition-colors">Login</button>
              <button onClick={() => { setMobileMenuOpen(false); openSignup(); }} className="btn-primary w-full">Get Started</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
