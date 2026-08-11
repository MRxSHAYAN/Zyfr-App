import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, User, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    // Pass base64 avatar (or empty — server will generate a UI-Avatars fallback)
    const result = await register(username, fullName, email, password, avatarBase64, bio);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-primary-500/10 dark:bg-primary-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-md card shadow-glass dark:shadow-glass-dark p-8 z-10 animate-fade-in">
        {/* Brand header */}
        <header className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-glow mb-3">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Create Account</h1>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            Join <span className="text-primary-500 font-semibold">ZYFR</span> — Real-Time Communication
          </p>
        </header>

        {/* Avatar uploader */}
        <div className="flex justify-center mb-6">
          <ImageUploader
            currentImageUrl={null}
            displayName={fullName || username}
            onImageSelect={(b64) => setAvatarBase64(b64 || '')}
            size="md"
          />
        </div>

        {/* Error alert */}
        {error && (
          <div role="alert" className="mb-5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3.5 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Username */}
          <div>
            <label htmlFor="reg-username" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
              Username <span className="text-red-400">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-surface-400 text-sm font-medium pointer-events-none select-none">@</span>
              <input
                id="reg-username"
                type="text"
                placeholder="alex_dev"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())}
                className="input-field pl-8"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Full name */}
          <div>
            <label htmlFor="reg-fullname" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
              Display Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-surface-400 absolute left-3.5 pointer-events-none" />
              <input
                id="reg-fullname"
                type="text"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field pl-10"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-surface-400 absolute left-3.5 pointer-events-none" />
              <input
                id="reg-email"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-surface-400 absolute left-3.5 pointer-events-none" />
              <input
                id="reg-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="reg-bio" className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1">
              Bio / Status
            </label>
            <div className="relative flex items-center">
              <FileText className="w-4 h-4 text-surface-400 absolute left-3.5 top-3 pointer-events-none" />
              <textarea
                id="reg-bio"
                rows={2}
                placeholder="Hey there! I am using ZYFR."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field pl-10 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            <span>{loading ? 'Creating Account…' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <footer className="mt-6 text-center text-xs text-surface-500 dark:text-surface-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-400 transition-colors">
            Sign In
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default Register;
