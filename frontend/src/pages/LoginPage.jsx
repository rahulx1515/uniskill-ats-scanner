import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, User, Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both Email/ID and Password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(email.trim(), password);
      // Role is automatically stored and handled by AuthContext
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center space-x-3">
            <img
              src="/uniskill-logo.png"
              alt="UniSkill Logo"
              className="h-12 w-auto object-contain rounded-xl shadow-lg shadow-indigo-500/20"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-tight text-white">UniSkill</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  ATS PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Career Intelligence Engine</p>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mt-4 tracking-tight">
            Sign In to UniSkill ATS
          </h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Enter your credentials. Your role (<strong className="text-indigo-400">Admin</strong> or <strong className="text-slate-300">Student</strong>) will be automatically detected.
          </p>
        </div>

        {/* Card Form */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2.5 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Email / User ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@uniskill.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Quick One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('rahul@uniskill.in', '1234567890')}
                className="flex flex-col items-start p-2.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/20 text-left transition group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
                  <Shield className="h-3 w-3" />
                  <span>Admin Role</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate w-full">rahul@uniskill.in</span>
                <span className="text-[9px] text-slate-500 font-mono">1234567890</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('student@uniskill.in', 'student123')}
                className="flex flex-col items-start p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
                  <User className="h-3 w-3 text-slate-400" />
                  <span>Student Role</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 truncate w-full">student@uniskill.in</span>
                <span className="text-[9px] text-slate-500 font-mono">student123</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          UniSkill ATS Resume Intelligence Engine &bull; Official platform of <a href="https://uniskill.in" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">uniskill.in</a>
        </p>
      </div>
    </div>
  );
};

