import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ScoreGauge = ({ score = 0, version = 'v1.0.0' }) => {
  const { isDark } = useTheme();
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { stroke: '#10b981', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900', label: 'Strong Match' };
    if (s >= 60) return { stroke: '#f59e0b', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900', label: 'Moderate Match' };
    return { stroke: '#ef4444', text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900', label: 'Needs Improvement' };
  };

  const status = getColor(score);
  const trackStroke = isDark ? '#27272a' : '#e2e8f0';

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-center shadow-sm">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Background track */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={trackStroke}
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={status.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tight ${status.text}`}>
            {Math.round(score)}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Score / 100</span>
        </div>
      </div>

      <div className="mt-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.badge}`}>
          {status.label}
        </span>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2">
        Evaluation version {version}
      </p>
    </div>
  );
};
