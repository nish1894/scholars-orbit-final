import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null

  useEffect(() => {
    const stored = localStorage.getItem('scholarsOrbitUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('scholarsOrbitUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Check against stored registered users
    const users = JSON.parse(localStorage.getItem('scholarsOrbitUsers') || '[]');
    const found = users.find((u) => u.email === email && u.password === password);

    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      localStorage.setItem('scholarsOrbitUser', JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const signup = ({ name, email, password }) => {
    const users = JSON.parse(localStorage.getItem('scholarsOrbitUsers') || '[]');

    if (users.some((u) => u.email === email)) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem('scholarsOrbitUsers', JSON.stringify(users));

    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem('scholarsOrbitUser', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('scholarsOrbitUser');
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
