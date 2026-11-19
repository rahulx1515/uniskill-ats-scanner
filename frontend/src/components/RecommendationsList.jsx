import React from 'react';
import { Award, ArrowUpRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const RecommendationsList = ({ strengths = [], recommendations = [], disclaimer = '' }) => {
  return (
    <div className="space-y-4">
      {/* Strengths */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <Award className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Detected Resume Strengths
          </h3>
        </div>

        <div className="space-y-2">
          {strengths.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
              <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </span>
              <p className="leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
          <ArrowUpRight className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Actionable Optimization Recommendations
          </h3>
        </div>

        <div className="space-y-2.5">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <span className="h-5 w-5 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-slate-300 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Disclaimer */}
      {disclaimer && (
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-2.5 leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Transparency Notice: </span>
            {disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};

