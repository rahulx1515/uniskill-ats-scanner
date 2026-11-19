import React, { useState, useRef } from 'react';
import { Upload, FileText, X, RefreshCw, CheckCircle2 } from 'lucide-react';
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

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.pdf', '.docx'].includes(ext)) {
      setError(`Unsupported format '${ext}'. Please upload a PDF (.pdf) or Word (.docx) file.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    try {
      setUploading(true);
      setProgress(15);
      const res = await atsService.uploadResume(file, (percent) => {
        setProgress(Math.min(95, percent));
      });
      setProgress(100);
      onUploadSuccess(res);
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err.response?.data?.detail || 'Failed to upload and parse resume.';
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
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.docx"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {uploading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                {uploading ? 'Parsing resume document...' : 'Upload your resume'}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Drag and drop or browse from your computer (PDF or DOCX, max 10MB)
              </p>
            </div>

            {uploading && (
              <div className="w-full max-w-xs mt-3">
                <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Extracting text & sections... {progress}%</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-slate-900 dark:text-zinc-100 text-sm truncate">{uploadedResume.filename}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {(uploadedResume.file_size / 1024).toFixed(1)} KB &bull; {uploadedResume.file_type.toUpperCase()} &bull; {uploadedResume.text_length} chars extracted
              </p>
            </div>
          </div>

          <button
            onClick={onReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            title="Replace resume"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium">{error}</p>
      )}
    </div>
  );
};
