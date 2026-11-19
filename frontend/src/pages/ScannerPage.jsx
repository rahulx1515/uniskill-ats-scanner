import React, { useState } from 'react';
import { Sparkles, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { RoleSelector } from '../components/RoleSelector';
import { JobDescriptionInput } from '../components/JobDescriptionInput';
import { atsService } from '../services/api';

export const ScannerPage = ({ onAnalysisComplete }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Role + JD, 3: Analyzing
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
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI-POWERED RESUME INTELLIGENCE ENGINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          ATS Resume Compatibility Scanner
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, select a target role, and receive a comprehensive deterministic ATS compatibility
          analysis with keyword density scoring, skill-gap identification, and actionable improvement recommendations.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center space-x-2 text-xs font-medium">
        {[
          { n: 1, label: 'Upload Resume' },
          { n: 2, label: 'Select Role & Analyze' },
          { n: 3, label: 'View Results' }
        ].map((s, idx) => (
          <React.Fragment key={s.n}>
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              step >= s.n
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= s.n ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                {s.n}
              </span>
              <span>{s.label}</span>
            </div>
            {idx < 2 && (
              <ArrowRight className={`h-3.5 w-3.5 ${step > s.n ? 'text-indigo-500' : 'text-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: File Upload */}
      <div className={step >= 1 ? '' : 'hidden'}>
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          uploadedResume={uploadedResume}
          onReset={handleResetUpload}
        />
      </div>

      {/* Step 2: Role Selection + JD + Launch */}
      {step >= 2 && uploadedResume && (
        <div className="space-y-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span>Select Target Job Role</span>
            </h3>
            <RoleSelector
              selectedRoleId={selectedRoleId}
              onSelectRole={setSelectedRoleId}
            />
          </div>

          <JobDescriptionInput customJd={customJd} setCustomJd={setCustomJd} />

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!selectedRoleId || analyzing}
            className="w-full flex items-center justify-center space-x-2.5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5 disabled:translate-y-0"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running NLP Analysis Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Launch ATS Compatibility Analysis</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 3: Analyzing Loading State */}
      {step === 3 && analyzing && (
        <div className="text-center py-16 space-y-6">
          <div className="relative inline-flex items-center justify-center">
            <div className="h-20 w-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-pulse">
              <Sparkles className="h-10 w-10 text-indigo-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Analyzing Resume Against Target Role...</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
              Running hybrid NLP keyword matching, synonym expansion, semantic similarity scoring,
              and formatting audit across 7 evaluation dimensions.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
            {['Parsing sections', 'Matching keywords', 'Scoring categories', 'Generating PDF'].map((label, i) => (
              <span key={i} className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

