import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const { login, closeAuth, openSignup } = useAuth();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = login(email, password);
    if (result.success) {
      closeAuth();
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAuth} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-[fadeIn_0.2s_ease-out]">
        {/* Close button */}
        <button onClick={closeAuth} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>

        <h2 className="text-2xl font-display font-bold text-dark-900 text-center mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-center mb-6">Sign in to your account</p>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => alert('Forgot password functionality will be available once the backend is connected.')}
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{' '}
          <button onClick={openSignup} className="text-primary-500 hover:text-primary-600 font-medium">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
