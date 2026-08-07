import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Lock, Mail, User, Image, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
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
    const result = await register(username, email, password, avatar);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00a884]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-[#111b21] border border-[#222d34] rounded-2xl shadow-2xl p-8 z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#00a884] flex items-center justify-center text-[#111b21] shadow-lg shadow-[#00a884]/20 mb-3">
            <MessageSquare className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-[#e9edef]">Create Account</h2>
          <p className="text-sm text-[#8696a0] mt-1">Join WhatsApp Web Clone instantly</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-center space-x-3 text-red-400 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1.5">
              Username *
            </label>
            <div className="relative flex items-center">
              <User className="w-5 h-5 text-[#8696a0] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="alex_dev"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#202c33] border border-[#222d34] rounded-xl pl-11 pr-4 py-3 text-sm text-[#e9edef] placeholder-[#8696a0] outline-none focus:border-[#00a884] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-[#8696a0] absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#202c33] border border-[#222d34] rounded-xl pl-11 pr-4 py-3 text-sm text-[#e9edef] placeholder-[#8696a0] outline-none focus:border-[#00a884] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1.5">
              Password *
            </label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-[#8696a0] absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#202c33] border border-[#222d34] rounded-xl pl-11 pr-4 py-3 text-sm text-[#e9edef] placeholder-[#8696a0] outline-none focus:border-[#00a884] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] uppercase tracking-wider mb-1.5">
              Avatar Image URL (Optional)
            </label>
            <div className="relative flex items-center">
              <Image className="w-5 h-5 text-[#8696a0] absolute left-3.5 pointer-events-none" />
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg (Auto-generated if empty)"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-[#202c33] border border-[#222d34] rounded-xl pl-11 pr-4 py-3 text-sm text-[#e9edef] placeholder-[#8696a0] outline-none focus:border-[#00a884] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#00a884] hover:bg-[#008069] disabled:opacity-50 text-[#111b21] font-bold rounded-xl shadow-lg shadow-[#00a884]/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>{loading ? 'Creating account...' : 'Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Toggle Link */}
        <div className="mt-8 text-center text-sm text-[#8696a0]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00a884] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
