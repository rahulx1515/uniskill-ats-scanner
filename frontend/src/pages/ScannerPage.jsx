import React, { useState } from 'react';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { RoleSelector } from '../components/RoleSelector';
import { JobDescriptionInput } from '../components/JobDescriptionInput';
import { atsService } from '../services/api';

export const ScannerPage = ({ onAnalysisComplete }) => {
  const [step, setStep] = useState(1);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [customJd, setCustomJd] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleUploadSuccess = (resumeData) => {
    setUploadedResume(resumeData);
    setStep(2);
  };

  const handleResetUpload = () => {
    setUploadedResume(null);
    setStep(1);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedResume || !selectedRoleId) return;

    try {
      setError(null);
      setAnalyzing(true);
      setStep(3);

      const result = await atsService.analyzeResume(
        uploadedResume.id,
        selectedRoleId,
        customJd || null
      );

      onAnalysisComplete(result);
    } catch (err) {
      console.error('Analysis error:', err);
      const msg = err.response?.data?.detail || 'Resume analysis failed. Please try again.';
      setError(msg);
      setStep(2);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Resume Scanner
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Evaluate resume compatibility against industry standards, identify keyword gaps, and generate ATS scores.
        </p>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center space-x-2 text-xs">
        {[
          { n: 1, label: 'Upload' },
          { n: 2, label: 'Configure Role' },
          { n: 3, label: 'Analysis' }
        ].map((s, idx) => (
          <React.Fragment key={s.n}>
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              step >= s.n
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 border border-slate-200 dark:border-zinc-800'
            }`}>
              <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= s.n ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
              }`}>
                {s.n}
              </span>
              <span>{s.label}</span>
            </div>
            {idx < 2 && (
              <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Upload */}
      <div className={step >= 1 ? '' : 'hidden'}>
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          uploadedResume={uploadedResume}
          onReset={handleResetUpload}
        />
      </div>

      {/* Step 2: Role Selection & JD */}
      {step >= 2 && uploadedResume && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-3">
              Select Target Role
            </h3>
            <RoleSelector
              selectedRoleId={selectedRoleId}
              onSelectRole={setSelectedRoleId}
            />
          </div>

          <JobDescriptionInput customJd={customJd} setCustomJd={setCustomJd} />

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!selectedRoleId || analyzing}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white font-medium text-sm transition shadow-sm disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Analysis...</span>
              </>
            ) : (
              <>
                <span>Run Resume Compatibility Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 3: Loading */}
      {step === 3 && analyzing && (
        <div className="text-center py-16 space-y-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8">
          <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Evaluating Resume Against Target Criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              Running hybrid keyword matching, semantic sentence similarity, and document structure validation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
