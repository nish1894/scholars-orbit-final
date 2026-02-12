import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { level: 2, label: 'Medium', color: 'bg-yellow-500' };
  return { level: 3, label: 'Strong', color: 'bg-green-500' };
}

export default function SignupModal() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const { signup, closeAuth, openLogin } = useAuth();

  const strength = getPasswordStrength(form.password);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!agreed) errs.agreed = 'You must agree to the terms';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = signup({ name: form.name, email: form.email, password: form.password });
    if (result.success) {
      closeAuth();
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={closeAuth} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
        {/* Close button */}
        <button onClick={closeAuth} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>

        <h2 className="text-2xl font-display font-bold text-dark-900 text-center mb-2">Create Account</h2>
        <p className="text-gray-500 text-center mb-6">Start your learning journey</p>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="signup-email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="signup-password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400`}
              placeholder="Min. 6 characters"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-1 ${strength.level === 1 ? 'text-red-500' : strength.level === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400`}
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <button type="button" className="text-primary-500 hover:text-primary-600" onClick={() => alert('Terms & Conditions page coming soon.')}>
                  Terms & Conditions
                </button>{' '}
                and{' '}
                <button type="button" className="text-primary-500 hover:text-primary-600" onClick={() => alert('Privacy Policy page coming soon.')}>
                  Privacy Policy
                </button>
              </span>
            </label>
            {errors.agreed && <p className="text-red-500 text-sm mt-1">{errors.agreed}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <button onClick={openLogin} className="text-primary-500 hover:text-primary-600 font-medium">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
