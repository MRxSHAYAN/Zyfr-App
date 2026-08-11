import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Ambient glow — visible in both modes */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-primary-500/10 dark:bg-primary-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Theme toggle — top right */}
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      {/* Main card */}
      <main className="w-full max-w-md card shadow-glass dark:shadow-glass-dark p-8 z-10 animate-fade-in">
        {/* Brand header */}
        <header className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-glow mb-3">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Welcome Back</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Sign in to <span className="text-primary-500 font-semibold">ZYFR</span>
          </p>
        </header>

        {/* Error alert */}
        {error && (
          <div role="alert" className="mb-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3.5 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-identifier" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-surface-400 absolute left-3.5 pointer-events-none" />
              <input
                id="login-identifier"
                type="text"
                placeholder="john_doe or john@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-field pl-10"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-surface-400 absolute left-3.5 pointer-events-none" />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            <span>{loading ? 'Signing in…' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-500 font-semibold hover:text-primary-400 transition-colors">
            Create one
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default Login;
