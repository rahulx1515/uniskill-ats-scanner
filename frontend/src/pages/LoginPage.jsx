import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, User, Lock, Mail, ArrowRight, Loader2, AlertCircle, Sun, Moon } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail || 'Invalid email or password.';
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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleTheme();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer shadow-xs"
          title="Toggle light/dark theme"
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-slate-700" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src="/uniskill-logo.png"
            alt="UniSkill Logo"
            className="h-10 w-auto object-contain rounded-md"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign in to UniSkill ATS
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Card Form */}
        <div className="mt-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start space-x-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@uniskill.in"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>

          {/* Quick Demo Access for Candidates */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => fillCredentials('student@uniskill.in', 'student123')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-600 dark:text-zinc-400 transition cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Fill Candidate Demo (student@uniskill.in)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-zinc-500 mt-6">
          UniSkill ATS Resume Scanner &bull; <a href="https://uniskill.in" target="_blank" rel="noopener noreferrer" className="hover:underline">uniskill.in</a>
        </p>
      </div>
    </div>
  );
};
