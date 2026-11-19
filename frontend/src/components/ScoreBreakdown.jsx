import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export const ScoreBreakdown = ({ categoryScores = {}, weights = {} }) => {
  const categories = [
    {
      key: 'required_skills',
      title: 'Required Skills Match',
      weight: weights.required_skills ?? 0.30,
      score: categoryScores.required_skills ?? 0.0,
      desc: 'Mandatory technical skills and languages from centralized database.'
    },
    {
      key: 'preferred_skills',
      title: 'Preferred Skills Match',
      weight: weights.preferred_skills ?? 0.10,
      score: categoryScores.preferred_skills ?? 0.10,
      desc: 'Secondary and nice-to-have tools that enhance candidacy.'
    },
    {
      key: 'keyword_relevance',
      title: 'Keyword Density & Coverage',
      weight: weights.keyword_relevance ?? 0.20,
      score: categoryScores.keyword_relevance ?? 0.0,
      desc: 'Total percentage of role-specific keywords indexed across text.'
    },
    {
      key: 'experience_relevance',
      title: 'Experience Semantic Match',
      weight: weights.experience_relevance ?? 0.15,
      score: categoryScores.experience_relevance ?? 0.0,
      desc: 'Contextual similarity of work history to role responsibilities.'
    },
    {
      key: 'education_relevance',
      title: 'Education & Degree Match',
      weight: weights.education_relevance ?? 0.10,
      score: categoryScores.education_relevance ?? 0.0,
      desc: 'Alignment with target academic qualification requirements.'
    },
    {
      key: 'project_relevance',
      title: 'Projects & Tech Depth',
      weight: weights.project_relevance ?? 0.10,
      score: categoryScores.project_relevance ?? 0.0,
      desc: 'Technical stack application inside personal and academic projects.'
    },
    {
      key: 'formatting',
      title: 'ATS Formatting & Structure',
      weight: weights.formatting ?? 0.05,
      score: categoryScores.formatting ?? 0.0,
      desc: 'Section headings, contact details, word count, and bullet metrics.'
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          7-Dimension ATS Scoring Breakdown
        </h3>
        <span className="text-xs text-slate-400 font-medium">Configurable Weights</span>
      </div>

      <div className="space-y-3.5">
        {categories.map((cat) => {
          const scorePercent = Math.round(cat.score * 100);
          const earnedPoints = (cat.weight * cat.score * 100).toFixed(1);
          const maxPoints = Math.round(cat.weight * 100);

          let barColor = 'bg-rose-500';
          if (scorePercent >= 75) barColor = 'bg-emerald-500';
          else if (scorePercent >= 50) barColor = 'bg-amber-500';

          return (
            <div key={cat.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">{cat.title}</span>
                  <span className="text-[11px] text-slate-400 ml-2">({maxPoints}% Weight)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">{earnedPoints} / {maxPoints} pts</span>
                  <span className="text-slate-400 font-mono text-[11px]">({scorePercent}%)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-700 rounded-full`}
                  style={{ width: `${Math.max(4, scorePercent)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                {cat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

