import React, { useState } from 'react';
import { Download, ArrowLeft, RefreshCw, FileText, CheckCircle2, AlertTriangle, Layers, Calendar, Loader2 } from 'lucide-react';
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
        `UniSkill_ATS_Report_${(analysis.job_role_title || 'Analysis').replace(/\s+/g, '_')}.pdf`
      );
    } catch (err) {
      console.error("Authenticated blob download fallback:", err);
      window.open(atsService.getReportDownloadUrl(analysis.id), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <button
            onClick={onScanAgain}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Scan Another Resume</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              ATS Compatibility Analysis
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {analysis.job_role_title}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
            <span>Resume: <strong className="text-slate-300">{analysis.resume_filename}</strong></span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
            </span>
          </p>
        </div>

        {/* Download PDF button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>{downloading ? 'Preparing Official PDF...' : 'Download Official PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Gauge & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ScoreGauge score={analysis.overall_score} version={analysis.scoring_version} />

          {/* Quick Stats card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Document Statistics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">WORD COUNT</span>
                <span className="font-bold text-white text-sm">{analysis.formatting_feedback?.word_count || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">PAGE COUNT</span>
                <span className="font-bold text-white text-sm">{analysis.formatting_feedback?.page_count || 1}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">SECTIONS</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {analysis.formatting_feedback?.sections_found?.length || 0} Found
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CUSTOM JD</span>
                <span className="font-bold text-indigo-400 text-sm">
                  {analysis.custom_jd_applied ? 'Applied' : 'Standard'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
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

