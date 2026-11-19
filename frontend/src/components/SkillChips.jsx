import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export const SkillChips = ({ skillMatches = {}, keywordMetrics = {} }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Normalize skillMatches to an array whether it is an object with category keys or an array
  const rawList = Array.isArray(skillMatches)
    ? skillMatches
    : skillMatches && typeof skillMatches === 'object'
      ? Object.values(skillMatches).flat().filter(Boolean)
      : [];

  // Normalize each item structure
  const skills = rawList.map((item) => {
    const status = (item.status || item.match_status || 'missing').toUpperCase();
    const importance = (item.importance || 'required').toUpperCase();
    return {
      name: item.skill_name || item.name || item.keyword || 'Skill',
      status,
      importance,
      matchedTerm: item.matched_term,
      contextSnippet: item.context_snippet
    };
  });

  const filtered = skills.filter((s) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'EXACT') return s.status === 'EXACT' || s.status === 'SYNONYM';
    if (activeFilter === 'PARTIAL') return s.status === 'PARTIAL';
    if (activeFilter === 'MISSING') return s.status === 'MISSING';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'EXACT':
      case 'SYNONYM':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
          label: status === 'SYNONYM' ? 'Synonym' : 'Matched'
        };
      case 'PARTIAL':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: <HelpCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
          label: 'Partial'
        };
      case 'MISSING':
      default:
        return {
          bg: 'bg-rose-50 dark:bg-zinc-800 text-rose-800 dark:text-zinc-300 border-rose-200 dark:border-zinc-700',
          icon: <AlertCircle className="h-3.5 w-3.5 text-rose-500 dark:text-zinc-400 flex-shrink-0" />,
          label: 'Missing'
        };
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Skills & Keyword Coverage
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {skills.length} role competencies evaluated ({keywordMetrics?.coverage_percentage || 0}% keyword coverage)
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'EXACT', label: 'Matched' },
            { id: 'PARTIAL', label: 'Partial' },
            { id: 'MISSING', label: 'Missing' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.map((item, idx) => {
          const badge = getStatusBadge(item.status);
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border flex items-center justify-between transition ${badge.bg}`}
            >
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                {badge.icon}
                <span className="text-xs font-semibold truncate">{item.name}</span>
              </div>
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/40 text-slate-700 dark:text-zinc-300 border border-black/5 dark:border-white/10">
                  {item.importance}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-xs text-slate-500 dark:text-zinc-400 py-6">
            No competencies match the selected filter.
          </p>
        )}
      </div>
    </div>
  );
};
