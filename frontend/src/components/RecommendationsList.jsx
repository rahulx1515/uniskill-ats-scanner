import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const RecommendationsList = ({ strengths = [], recommendations = [], disclaimer = '' }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Document Strengths</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">&bull;</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Optimization Recommendations</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">&bull;</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {disclaimer && (
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center leading-relaxed px-4">
          {disclaimer}
        </p>
      )}
    </div>
  );
};
