import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FileText, History, Settings, LogOut, Shield, User,
  Sun, Moon, CheckCircle2, ChevronRight, X
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
        setLbStatus({ backend: 'in-memory-fallback', status: 'online' });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'scanner',
      label: 'Resume Scanner',
      icon: FileText
    },
    {
      id: 'history',
      label: 'Analysis History',
      icon: History
    },
    ...(isAdmin ? [{
      id: 'admin',
      label: 'Keyword & Role DB',
      icon: Settings
    }] : [])
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => { setCurrentTab('scanner'); setMobileOpen(false); }}
          >
            <img
              src="/uniskill-logo.png"
              alt="UniSkill Logo"
              className="h-8 w-auto object-contain rounded-md"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">UniSkill</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  ATS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-none mt-0.5">Career Platform</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* System Load Balancer status pill */}
        <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-zinc-950/40 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Redis Cache</span>
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            {lbStatus?.backend === 'redis-cluster' ? 'Redis 6379' : 'Active'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`h-4 w-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                  <span>{item.label}</span>
                </div>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Theme Toggle & User Info */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <div className="flex items-center space-x-2">
              {isDark ? (
                <Moon className="h-4 w-4 text-zinc-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-mono">Toggle</span>
          </button>

          {/* User info card */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-7 w-7 rounded-md bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-zinc-300 flex-shrink-0">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-200 truncate leading-tight">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate leading-tight mt-0.5">
                  {user?.role === 'admin' ? 'Administrator' : 'Student'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
