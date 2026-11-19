import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export const SkillChips = ({ skillMatches = [], keywordMetrics = {} }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filtered = skillMatches.filter(s => {
    if (activeFilter === 'ALL') return true;
    return s.match_status.toUpperCase() === activeFilter;
  });

  const getStatusBadge = (status) => {
    switch (status.toUpperCase()) {
      case 'EXACT':
      case 'SYNONYM':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          icon: <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        };
      case 'PARTIAL':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          icon: <HelpCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
        };
      case 'MISSING':
      default:
        return {
          bg: 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
          icon: <AlertCircle className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
        };
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Skills & Keyword Coverage
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Coverage analysis across required and preferred competencies
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 text-xs">
          {['ALL', 'EXACT', 'PARTIAL', 'MISSING'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                activeFilter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {f === 'ALL' ? 'All Skills' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filtered.map((item, idx) => {
          const badge = getStatusBadge(item.match_status);
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border flex items-center justify-between ${badge.bg}`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                {badge.icon}
                <span className="text-xs font-medium truncate">{item.skill_name}</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/30">
                {item.importance}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-xs text-slate-400 dark:text-zinc-500 py-6">
            No skills in this filter category.
          </p>
        )}
      </div>
    </div>
  );
};
