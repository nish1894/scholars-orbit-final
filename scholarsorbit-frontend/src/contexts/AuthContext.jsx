import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null

  useEffect(() => {
    const stored = localStorage.getItem('scholarsOrbitUser');
    const token = localStorage.getItem('scholarsOrbitToken');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('scholarsOrbitUser');
        localStorage.removeItem('scholarsOrbitToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || 'Invalid credentials' };
      }

      setUser(data.user);
      localStorage.setItem('scholarsOrbitUser', JSON.stringify(data.user));
      localStorage.setItem('scholarsOrbitToken', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const signup = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.message || data.errors?.[0]?.msg || 'Registration failed';
        return { success: false, error: errorMsg };
      }

      setUser(data.user);
      localStorage.setItem('scholarsOrbitUser', JSON.stringify(data.user));
      localStorage.setItem('scholarsOrbitToken', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('scholarsOrbitUser');
    localStorage.removeItem('scholarsOrbitToken');
  };

  const openLogin = () => setAuthModal('login');
  const openSignup = () => setAuthModal('signup');
  const closeAuth = () => setAuthModal(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, authModal, openLogin, openSignup, closeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
