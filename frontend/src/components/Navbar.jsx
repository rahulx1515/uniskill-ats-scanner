import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, User, FileText, History, Settings, LogOut } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 shadow-md shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('scanner')}>
            <div className="relative">
              <img
                src="/uniskill-logo.png"
                alt="UniSkill Logo"
                className="h-10 w-auto object-contain rounded-xl shadow-md shadow-indigo-500/20"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">UniSkill</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  ATS PRO
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium tracking-wide">CAREER INTELLIGENCE</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('scanner')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                currentTab === 'scanner'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>ATS Scanner</span>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                currentTab === 'history'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Analysis History</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  currentTab === 'admin'
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Admin Keyword DB</span>
              </button>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                isAdmin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}>
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'User'}</p>
                <div className="flex items-center space-x-1">
                  {isAdmin ? <Shield className="h-2.5 w-2.5 text-purple-400" /> : <User className="h-2.5 w-2.5 text-slate-400" />}
                  <span className={`text-[10px] font-bold uppercase ${isAdmin ? 'text-purple-400' : 'text-slate-400'}`}>
                    {user?.role || 'Student'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/20 text-xs font-semibold transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

