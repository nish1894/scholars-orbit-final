import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPageFull from './pages/LoginPageFull';
import SignupPageFull from './pages/SignupPageFull';
import ProtectedRoute from './components/ProtectedRoute';
import LoginModal from './pages/LoginPage';
import SignupModal from './pages/SignupPage';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { authModal } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPageFull />} />
        <Route path="/signup" element={<SignupPageFull />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {authModal === 'login' && <LoginModal />}
      {authModal === 'signup' && <SignupModal />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
