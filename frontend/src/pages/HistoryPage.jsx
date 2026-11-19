import React, { useState, useEffect } from 'react';
import {
  History, Trash2, Eye, BarChart3, ArrowRight, Loader2,
  Calendar, FileText, Target, AlertTriangle, RefreshCw, ChevronDown, ChevronUp,
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
      setError('Failed to load analysis history. Please try again.');
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
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const getDiffIcon = (diff) => {
    if (diff > 0) return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
    if (diff < 0) return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />;
    return <Minus className="h-3.5 w-3.5 text-slate-500" />;
  };

  const getDiffColor = (diff) => {
    if (diff > 0) return 'text-emerald-400';
    if (diff < 0) return 'text-rose-400';
    return 'text-slate-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading analysis history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
        <p className="text-sm text-rose-400">{error}</p>
        <button onClick={fetchHistory} className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <History className="h-6 w-6 text-indigo-400" />
            <span>Analysis History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {history.length} analysis {history.length === 1 ? 'record' : 'records'} found
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setCompareMode(!compareMode); setSelectedIds([]); setComparison(null); }}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              compareMode
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{compareMode ? 'Exit Compare' : 'Compare Scores'}</span>
          </button>
          <button
            onClick={fetchHistory}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Compare bar */}
      {compareMode && (
        <div className="flex items-center justify-between bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
          <p className="text-xs text-indigo-300">
            {selectedIds.length === 0
              ? 'Select two analyses to compare their scores.'
              : selectedIds.length === 1
              ? 'Select one more analysis to compare.'
              : 'Two analyses selected. Click Compare to view differences.'}
          </p>
          <button
            onClick={handleCompare}
            disabled={selectedIds.length !== 2 || comparingLoading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-bold transition"
          >
            {comparingLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BarChart3 className="h-3.5 w-3.5" />}
            <span>{comparingLoading ? 'Comparing...' : 'Compare'}</span>
          </button>
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <FileText className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white">No Analyses Yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Upload a resume and run your first ATS compatibility analysis to see your history here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className={`group relative bg-slate-900/90 border rounded-2xl p-5 transition shadow-lg hover:border-indigo-500/40 ${
                compareMode && selectedIds.includes(item.id)
                  ? 'border-indigo-500/60 bg-indigo-500/10'
                  : 'border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left info */}
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  {compareMode && (
                    <button
                      onClick={() => toggleCompareSelect(item.id)}
                      className={`mt-1 h-5 w-5 rounded-md border flex-shrink-0 flex items-center justify-center transition ${
                        selectedIds.includes(item.id)
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-500 hover:border-indigo-500'
                      }`}
                    >
                      {selectedIds.includes(item.id) && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* Score badge */}
                  <div className={`flex-shrink-0 h-14 w-14 rounded-xl border flex flex-col items-center justify-center ${getScoreBg(item.overall_score)}`}>
                    <span className={`text-lg font-extrabold ${getScoreColor(item.overall_score)}`}>
                      {Math.round(item.overall_score)}
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold">/ 100</span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{item.resume_filename}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-300">
                      <span className="flex items-center space-x-1.5">
                        <Target className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="font-semibold text-indigo-300">{item.job_role_title}</span>
                      </span>
                      <span className="flex items-center space-x-1.5 text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleViewAnalysis(item.id)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 text-xs font-semibold transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => atsService.downloadReport(item.id, `UniSkill_ATS_${(item.job_role_title || 'Report').replace(/\s+/g, '_')}.pdf`)}
                    title="Download Official PDF Report"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs font-semibold transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.resume_id)}
                    disabled={deletingId === item.resume_id}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold transition disabled:opacity-50"
                  >
                    {deletingId === item.resume_id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <span>Score Comparison</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Analysis A */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Analysis A</p>
              <p className="text-xs text-slate-300 font-semibold truncate">{comparison.analysis_a?.resume_filename}</p>
              <p className="text-[11px] text-slate-400">{comparison.analysis_a?.job_role_title}</p>
              <div className={`text-2xl font-extrabold ${getScoreColor(comparison.analysis_a?.overall_score || 0)}`}>
                {Math.round(comparison.analysis_a?.overall_score || 0)}
              </div>
            </div>

            {/* Diff */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Difference</p>
              <div className="flex items-center space-x-2">
                {getDiffIcon(comparison.score_diff || 0)}
                <span className={`text-2xl font-extrabold ${getDiffColor(comparison.score_diff || 0)}`}>
                  {comparison.score_diff > 0 ? '+' : ''}{(comparison.score_diff || 0).toFixed(1)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">points</p>
            </div>

            {/* Analysis B */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Analysis B</p>
              <p className="text-xs text-slate-300 font-semibold truncate">{comparison.analysis_b?.resume_filename}</p>
              <p className="text-[11px] text-slate-400">{comparison.analysis_b?.job_role_title}</p>
              <div className={`text-2xl font-extrabold ${getScoreColor(comparison.analysis_b?.overall_score || 0)}`}>
                {Math.round(comparison.analysis_b?.overall_score || 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

