import React from 'react';

const CATEGORY_META = {
  required_skills: { label: 'Required Technical Skills', desc: 'Core mandatory competencies for the target role' },
  preferred_skills: { label: 'Preferred & Bonus Skills', desc: 'Secondary qualifications and tools' },
  keyword_relevance: { label: 'Keyword Density & Match', desc: 'Coverage of role-specific ATS keywords' },
  experience_relevance: { label: 'Experience Alignment', desc: 'Relevance of detected job titles & experience length' },
  education_relevance: { label: 'Education Alignment', desc: 'Degree, field of study, and academic background' },
  project_relevance: { label: 'Project Portfolio', desc: 'Technical projects and implementation depth' },
  formatting: { label: 'Document Structure & Sections', desc: 'Header clarity, section organization, and readability' }
};

export const ScoreBreakdown = ({ categoryScores = {}, weights = {} }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Evaluation Breakdown
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Weighted contribution across 7 assessment dimensions
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const rawScore = categoryScores[key] || 0;
          const weight = weights[key] || 0;
          const earned = rawScore * weight;
          const percent = Math.min(100, Math.round(rawScore * 100));

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 dark:text-zinc-200">{meta.label}</span>
                <span className="text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                  {earned.toFixed(1)} / {(weight * 100).toFixed(0)} pts
                </span>
              </div>

              <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
