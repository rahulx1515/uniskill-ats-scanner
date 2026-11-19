import React, { useState, useEffect } from 'react';
import {
  History, Trash2, Eye, BarChart3, Loader2,
  Calendar, FileText, Target, AlertTriangle, RefreshCw,
  TrendingUp, TrendingDown, Minus, Download
} from 'lucide-react';
import { atsService } from '../services/api';

export const HistoryPage = ({ onViewAnalysis }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [comparingLoading, setComparingLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await atsService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (resumeId) => {
    if (!confirm('Delete this resume and all associated analyses? This cannot be undone.')) return;
    try {
      setDeletingId(resumeId);
      await atsService.deleteResume(resumeId);
      setHistory((prev) => prev.filter((h) => h.resume_id !== resumeId));
      setSelectedIds((prev) => prev.filter((id) => id !== resumeId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.detail || 'Failed to delete resume.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewAnalysis = async (analysisId) => {
    try {
      const data = await atsService.getAnalysis(analysisId);
      onViewAnalysis(data);
    } catch (err) {
      console.error('Failed to load analysis:', err);
      alert('Failed to load analysis details.');
    }
  };

  const toggleCompareSelect = (analysisId) => {
    setSelectedIds((prev) => {
      if (prev.includes(analysisId)) return prev.filter((id) => id !== analysisId);
      if (prev.length >= 2) return [prev[1], analysisId];
      return [...prev, analysisId];
    });
    setComparison(null);
  };

  const handleCompare = async () => {
    if (selectedIds.length !== 2) return;
    try {
      setComparingLoading(true);
      const data = await atsService.compareAnalyses(selectedIds[0], selectedIds[1]);
      setComparison(data);
    } catch (err) {
      console.error('Compare failed:', err);
      alert(err.response?.data?.detail || 'Failed to compare analyses.');
    } finally {
      setComparingLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (score >= 60) return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-xs text-slate-500 dark:text-zinc-400">Loading analysis history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analysis History
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {history.length} {history.length === 1 ? 'record' : 'records'} logged
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setCompareMode(!compareMode); setSelectedIds([]); setComparison(null); }}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              compareMode
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{compareMode ? 'Cancel Compare' : 'Compare Two Runs'}</span>
          </button>
          <button
            onClick={fetchHistory}
            className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
            title="Refresh history"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {compareMode && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 text-xs">
          <span className="text-blue-800 dark:text-blue-300">
            {selectedIds.length === 0 ? 'Select two analyses below to view comparison.' : `${selectedIds.length} of 2 selected.`}
          </span>
          <button
            onClick={handleCompare}
            disabled={selectedIds.length !== 2 || comparingLoading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-md text-xs transition"
          >
            {comparingLoading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
          <FileText className="h-8 w-8 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">No analyses yet</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Scan your first resume to track score history here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 transition shadow-sm ${
                compareMode && selectedIds.includes(item.id)
                  ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  {compareMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleCompareSelect(item.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  )}

                  <div className={`h-11 w-11 rounded-lg border flex flex-col items-center justify-center flex-shrink-0 ${getScoreBg(item.overall_score)}`}>
                    <span className={`text-base font-bold leading-none ${getScoreColor(item.overall_score)}`}>
                      {Math.round(item.overall_score)}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">/ 100</span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{item.resume_filename}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{item.job_role_title}</span>
                      <span>&bull;</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => handleViewAnalysis(item.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => atsService.downloadReport(item.id, `UniSkill_ATS_${(item.job_role_title || 'Report').replace(/\s+/g, '_')}.pdf`)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition flex items-center space-x-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.resume_id)}
                    disabled={deletingId === item.resume_id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                    title="Delete"
                  >
                    {deletingId === item.resume_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {comparison && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Comparison Result</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-100 dark:border-zinc-800">
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{comparison.analysis_a?.resume_filename}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">{Math.round(comparison.analysis_a?.overall_score || 0)}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-100 dark:border-zinc-800 flex flex-col justify-center">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Score Diff</span>
              <span className={`text-lg font-bold mt-1 ${comparison.score_diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {comparison.score_diff > 0 ? '+' : ''}{(comparison.score_diff || 0).toFixed(1)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-100 dark:border-zinc-800">
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{comparison.analysis_b?.resume_filename}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">{Math.round(comparison.analysis_b?.overall_score || 0)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
