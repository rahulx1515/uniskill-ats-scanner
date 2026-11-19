import React, { useState } from 'react';
import { Download, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { SkillChips } from '../components/SkillChips';
import { RecommendationsList } from '../components/RecommendationsList';
import { atsService } from '../services/api';

export const ResultsPage = ({ analysis, onScanAgain }) => {
  const [downloading, setDownloading] = useState(false);
  if (!analysis) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await atsService.downloadReport(
        analysis.id,
        `UniSkill_ATS_${(analysis.job_role_title || 'Report').replace(/\s+/g, '_')}.pdf`
      );
    } catch (err) {
      console.error("Download fallback:", err);
      window.open(atsService.getReportDownloadUrl(analysis.id), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div>
          <button
            onClick={onScanAgain}
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Scan Another Resume</span>
          </button>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Compatibility Analysis
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {analysis.job_role_title}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center space-x-2">
            <span>File: <strong className="text-slate-700 dark:text-zinc-300">{analysis.resume_filename}</strong></span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
            </span>
          </p>
        </div>

        {/* Download PDF button */}
        <div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span>{downloading ? 'Preparing PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Gauge & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <ScoreGauge score={analysis.overall_score} version={analysis.scoring_version} />

          {/* Quick Stats card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Document Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase">Words</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{analysis.formatting_feedback?.word_count || 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase">Pages</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{analysis.formatting_feedback?.page_count || 1}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase">Sections</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {analysis.formatting_feedback?.sections_found?.length || 0} Detected
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800">
                <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase">Custom JD</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {analysis.custom_jd_applied ? 'Applied' : 'Standard'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ScoreBreakdown categoryScores={analysis.category_scores} weights={analysis.weights} />
        </div>
      </div>

      {/* Skills Matrix */}
      <SkillChips skillMatches={analysis.skill_matches} keywordMetrics={analysis.keyword_metrics} />

      {/* Recommendations & Strengths */}
      <RecommendationsList
        strengths={analysis.strengths}
        recommendations={analysis.recommendations}
        disclaimer={analysis.disclaimer}
      />
    </div>
  );
};
