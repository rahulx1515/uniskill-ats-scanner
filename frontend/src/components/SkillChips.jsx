import React, { useState } from 'react';
import { Check, X, AlertCircle, Info, Sparkles } from 'lucide-react';

export const SkillChips = ({ skillMatches = {}, keywordMetrics = {} }) => {
  const [filter, setFilter] = useState('all');
  const [activeSnippet, setActiveSnippet] = useState(null);

  const reqMatched = skillMatches.required_matched || [];
  const reqMissing = skillMatches.required_missing || [];
  const prefMatched = skillMatches.preferred_matched || [];
  const prefMissing = skillMatches.preferred_missing || [];
  const partialMatched = skillMatches.partial_matched || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Skills & Keyword Match Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Keyword coverage: <span className="font-bold text-indigo-400">{keywordMetrics.coverage_percentage || 0}%</span> ({keywordMetrics.matched_keywords_count || 0} of {keywordMetrics.total_role_keywords || 0} keywords found)
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'matched' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Matched ({reqMatched.length + prefMatched.length})
          </button>
          <button
            onClick={() => setFilter('missing')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              filter === 'missing' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Missing ({reqMissing.length + prefMissing.length})
          </button>
          {partialMatched.length > 0 && (
            <button
              onClick={() => setFilter('partial')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'partial' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Partial ({partialMatched.length})
            </button>
          )}
        </div>
      </div>

      {/* Snippet preview modal/banner if clicked */}
      {activeSnippet && (
        <div className="p-3 bg-slate-950 border border-indigo-500/30 rounded-xl text-xs space-y-1 relative">
          <button
            onClick={() => setActiveSnippet(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="font-semibold text-indigo-300">
            Context for: <span className="text-white">{activeSnippet.skill_name}</span> ({activeSnippet.importance})
          </p>
          <p className="text-slate-300 italic font-mono bg-slate-900/80 p-2 rounded border border-slate-800">
            "{activeSnippet.context_snippet || 'Found in resume skills list.'}"
          </p>
        </div>
      )}

      {/* 1. Required Skills Section */}
      {(filter === 'all' || filter === 'matched' || filter === 'missing') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Core Required Skills:</span>
            <span className="text-slate-500">
              {reqMatched.length} matched / {reqMissing.length} missing
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(filter !== 'missing') && reqMatched.map((s, idx) => (
              <span
                key={`rm-${idx}`}
                onClick={() => setActiveSnippet(s)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium cursor-pointer hover:bg-emerald-500/20 transition"
                title="Click to view context snippet"
              >
                <Check className="h-3 w-3 text-emerald-400" />
                <span>{s.skill_name}</span>
                {s.matched_term && s.matched_term.toLowerCase() !== s.skill_name.toLowerCase() && (
                  <span className="text-[10px] text-emerald-400/80 font-mono">({s.matched_term})</span>
                )}
              </span>
            ))}

            {(filter !== 'matched') && reqMissing.map((s, idx) => (
              <span
                key={`rx-${idx}`}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-medium"
              >
                <X className="h-3 w-3 text-rose-400" />
                <span>{s.skill_name}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-rose-500/20 text-rose-400 font-bold">REQUIRED</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Preferred Skills Section */}
      {(filter === 'all' || filter === 'matched' || filter === 'missing') && (
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Preferred & Nice-To-Have Skills:</span>
            <span className="text-slate-500">
              {prefMatched.length} matched / {prefMissing.length} missing
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(filter !== 'missing') && prefMatched.map((s, idx) => (
              <span
                key={`pm-${idx}`}
                onClick={() => setActiveSnippet(s)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium cursor-pointer hover:bg-emerald-500/20 transition"
              >
                <Check className="h-3 w-3 text-emerald-400" />
                <span>{s.skill_name}</span>
              </span>
            ))}

            {(filter !== 'matched') && prefMissing.map((s, idx) => (
              <span
                key={`px-${idx}`}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800 text-slate-400 border border-slate-700/60 text-xs font-medium"
              >
                <X className="h-3 w-3 text-slate-500" />
                <span>{s.skill_name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Partially Matched / Synonyms */}
      {(filter === 'all' || filter === 'partial') && partialMatched.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <p className="text-xs font-semibold text-amber-300 flex items-center space-x-1">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>Partially Matched or Morphological Variants:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {partialMatched.map((s, idx) => (
              <span
                key={`pt-${idx}`}
                onClick={() => setActiveSnippet(s)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium cursor-pointer hover:bg-amber-500/20 transition"
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>{s.skill_name}</span>
                {s.matched_term && (
                  <span className="text-[10px] text-amber-400/80 font-mono">({s.matched_term})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

