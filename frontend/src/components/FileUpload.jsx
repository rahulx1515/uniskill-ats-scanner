import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { atsService } from '../services/api';

export const FileUpload = ({ onUploadSuccess, uploadedResume, onReset }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setError(null);

    // Validate extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      setError(`Invalid file type '${ext}'. Please upload a PDF (.pdf) or Word document (.docx).`);
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller resume file.');
      return;
    }

    try {
      setUploading(true);
      setProgress(10);
      const res = await atsService.uploadResume(file, (percent) => {
        setProgress(Math.min(95, percent));
      });
      setProgress(100);
      onUploadSuccess(res);
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err.response?.data?.detail || 'Failed to upload and parse resume. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {!uploadedResume ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition relative overflow-hidden ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-600'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.docx"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              {uploading ? (
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
              ) : (
                <Upload className="h-8 w-8 text-indigo-400" />
              )}
            </div>

            <div>
              <p className="text-base font-semibold text-white">
                {uploading ? 'Analyzing and parsing resume...' : 'Click to upload or drag & drop resume'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: <span className="font-semibold text-slate-300">PDF (.pdf)</span> and <span className="font-semibold text-slate-300">Word (.docx)</span> up to 10MB
              </p>
            </div>

            {uploading && (
              <div className="w-full max-w-xs mt-2">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Extracting sections & formatting... {progress}%</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-white text-sm">{uploadedResume.filename}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PARSED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(uploadedResume.file_size / 1024).toFixed(1)} KB • {uploadedResume.file_type.toUpperCase()} • {uploadedResume.text_length} characters parsed
                </p>
              </div>
            </div>

            <button
              onClick={onReset}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Remove and upload different file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scanned warning */}
          {uploadedResume.is_scanned && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3 text-amber-300 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Scanned or Image-Based Document Detected</p>
                <p className="text-amber-300/80 mt-0.5">
                  Limited selectable text was detected. ATS parsers strongly favor native text documents over scanned images.
                </p>
              </div>
            </div>
          )}

          {/* Detected sections pills */}
          {uploadedResume.sections_detected && uploadedResume.sections_detected.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium mb-2">Detected Resume Sections:</p>
              <div className="flex flex-wrap gap-1.5">
                {uploadedResume.sections_detected.map((sec, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>{sec}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

