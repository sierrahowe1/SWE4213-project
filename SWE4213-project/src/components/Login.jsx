import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';

const Login = ({ onLogin, onToggleView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url("/src/background.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12 w-full max-w-lg animate-fade-in">
        {/* Waving Hand Emoji */}
        <div className="mb-5">
          <span className="text-5xl">👋</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>

        {/* Subheading */}
        <p className="text-gray-500 mb-8">
          Please login to access your account.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="email" className="text-gray-700 font-medium text-sm">
                E-mail
              </label>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Type your e-mail"
              className="w-full px-5 py-3.5 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border-none"
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium text-sm mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password"
                className="w-full px-5 py-3.5 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border-none"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <a
              href="#"
              className="inline-block mt-2 text-sm text-primary hover:text-primary-dark transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-full transition-all duration-200 mt-6 shadow-md hover:shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{' '}
          <button
            onClick={onToggleView}
            className="text-primary hover:text-primary-dark font-medium transition-colors"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
