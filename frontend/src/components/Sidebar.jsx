import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FileText, History, Settings, LogOut, Shield, User,
  Sparkles, Sun, Moon, Server, ChevronRight, Menu, X, Activity
} from 'lucide-react';
import { adminService } from '../services/api';

export const Sidebar = ({ currentTab, setCurrentTab, mobileOpen, setMobileOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [lbStatus, setLbStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await adminService.getLoadBalancerStatus();
        setLbStatus(data);
      } catch (e) {
        setLbStatus({ backend: 'in-memory-balancer', status: 'online' });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'scanner',
      label: 'ATS Scanner',
      desc: 'Resume Analysis & Score',
      icon: FileText
    },
    {
      id: 'history',
      label: 'Analysis History',
      desc: 'Scores, Reports & Compare',
      icon: History
    },
    ...(isAdmin ? [{
      id: 'admin',
      label: 'Admin Keyword DB',
      desc: 'Roles, Keywords & Users',
      icon: Settings
    }] : [])
  ];

  // Theme styling for the Sidebar:
  // Dark mode: Green & Black (emerald/black)
  // Light mode: Light Black (charcoal)
  const sidebarBg = isDark
    ? 'bg-gradient-to-b from-[#060c08] via-[#040805] to-[#020503] border-r border-emerald-500/25 shadow-2xl shadow-emerald-950/40'
    : 'bg-[#181a20] border-r border-slate-700/80 shadow-2xl shadow-black/40';

  const brandGlow = isDark ? 'shadow-emerald-500/20' : 'shadow-indigo-500/20';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarBg}`}
      >
        {/* Top Header / Branding */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => { setCurrentTab('scanner'); setMobileOpen(false); }}
          >
            <div className="relative">
              <img
                src="/uniskill-logo.png"
                alt="UniSkill Logo"
                className={`h-10 w-auto object-contain rounded-xl shadow-lg ${brandGlow}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 items-center justify-center text-white">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">UniSkill</span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  }`}
                >
                  ATS PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">CAREER INTELLIGENCE</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Redis Load Balancer Badge */}
        <div className="px-5 py-3 border-b border-white/5 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isDark ? 'bg-emerald-400' : 'bg-blue-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isDark ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
              </span>
              <span className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1">
                <Server className="h-3 w-3 text-slate-400" />
                <span>Redis Load Balancer</span>
              </span>
            </div>
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                isDark
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
              }`}
            >
              {lbStatus?.backend === 'redis-cluster' ? 'Redis 6379' : 'Active LB'}
            </span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1">
            Dynamic request distribution & NLP cache enabled
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Features
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;

            const activeStyle = isDark
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
              : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-500/10';

            const inactiveStyle = isDark
              ? 'text-slate-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent'
              : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent';

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition group ${
                  active ? activeStyle : inactiveStyle
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition ${
                      active
                        ? isDark
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-indigo-600 text-white font-bold'
                        : isDark
                        ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20'
                        : 'bg-white/5 text-slate-300 group-hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight truncate mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 flex-shrink-0 transition ${
                    active ? (isDark ? 'text-emerald-400' : 'text-indigo-400') : 'text-slate-600 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Footer Settings & User Card */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-black/25">
          {/* Theme Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              isDark
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isDark ? (
                <Moon className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              )}
              <span>{isDark ? 'Dark (Green & Black)' : 'Light (Charcoal)'}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Theme</span>
          </button>

          {/* User Profile Info */}
          <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-2.5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  isAdmin
                    ? isDark
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : isDark
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.full_name || 'User'}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  {isAdmin ? (
                    <Shield className={`h-2.5 w-2.5 ${isDark ? 'text-emerald-400' : 'text-purple-400'}`} />
                  ) : (
                    <User className="h-2.5 w-2.5 text-slate-400" />
                  )}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isAdmin ? (isDark ? 'text-emerald-400' : 'text-purple-300') : 'text-slate-400'
                    }`}
                  >
                    {user?.role || 'Student'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

