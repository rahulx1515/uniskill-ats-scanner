import React from 'react';

export const ScoreGauge = ({ score = 0, version = 'v1.0.0' }) => {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { stroke: '#10b981', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'EXCELLENT MATCH' };
    if (s >= 60) return { stroke: '#f59e0b', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'GOOD COMPATIBILITY' };
    return { stroke: '#ef4444', text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'NEEDS OPTIMIZATION' };
  };

  const theme = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center relative overflow-hidden shadow-sm">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Background track */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1e293b"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={theme.stroke}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-medium">OUT OF 100</span>
        </div>
      </div>

      <div className="mt-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme.badge}`}>
          {theme.label}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 mt-2 font-mono">
        Algorithm: {version} (Deterministic NLP)
      </p>
    </div>
  );
};

