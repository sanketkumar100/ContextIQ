import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Cpu,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documentApi } from '../services/api';
import { useDocumentStore } from '../store/documentStore';
import { useUiStore } from '../store/uiStore';

export const UploadModal = () => {
  const isUploading = useUiStore((s) => s.isUploading);
  const setIsUploading = useUiStore((s) => s.setIsUploading);
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments);

  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'completed'
  const fileInputRef = useRef(null);

  if (!isUploading) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(
      (f) => !files.some((existing) => existing.file.name === f.name)
    );
    const mapped = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending', // 'pending' | 'uploading' | 'indexed' | 'failed'
      error: null,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id) => {
    if (uploadStatus === 'uploading') return;
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (uploadStatus === 'uploading') return;
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const startUpload = async () => {
    if (files.length === 0 || uploadStatus === 'uploading') return;

    setUploadStatus('uploading');
    let failedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      if (item.status === 'indexed') continue;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: 'uploading', progress: 10 } : f
        )
      );

      try {
        await documentApi.upload(item.file, (percent) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, progress: Math.max(10, Math.min(95, percent)) }
                : f
            )
          );
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, progress: 100, status: 'indexed' } : f
          )
        );
      } catch (err) {
        if (err?.response?.status === 401) {
          setUploadStatus('idle');
          return;
        }
        failedCount += 1;
        const msg =
          err?.response?.data?.message || err.message || 'Processing failed';
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'failed', error: msg } : f
          )
        );
      }
    }

    setUploadStatus('completed');
    await fetchDocuments();

    if (failedCount === 0) {
      toast.success('Documents indexed successfully');
    } else {
      toast.error(`${failedCount} document(s) failed to upload`);
    }
  };

  const handleClose = () => {
    if (uploadStatus === 'uploading') return;
    setIsUploading(false);
    setFiles([]);
    setUploadStatus('idle');
  };

  const totalProgress = files.length
    ? Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length)
    : 0;

  const allIndexed = files.length > 0 && files.every((f) => f.status === 'indexed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-[#1e293b] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upload Documents to ContextIQ
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Single or multiple files • Auto-chunking &amp; pgvector embedding
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploadStatus === 'uploading'}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-200 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.md,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
              Drag &amp; drop files here, or click to browse
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PDF, Word, Markdown, TXT, CSV (max 25MB each)
            </p>
          </div>

          {/* Selected Files & Progress */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Selected Files ({files.length})</span>
                {uploadStatus === 'uploading' && (
                  <span className="text-blue-600 dark:text-blue-400 font-mono">
                    {totalProgress}%
                  </span>
                )}
              </div>

              {uploadStatus === 'uploading' && (
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              )}

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {files.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                            {item.file.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {formatSize(item.file.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.status === 'indexed' && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Indexed
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span
                            className="flex items-center gap-1 text-[11px] text-rose-500 dark:text-rose-400 font-medium"
                            title={item.error}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                        {item.status === 'uploading' && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                            {item.progress}%
                          </span>
                        )}
                        {uploadStatus !== 'uploading' && (
                          <button
                            onClick={() => removeFile(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {(item.status === 'uploading' || item.status === 'indexed') && (
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            item.status === 'indexed' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0b101c] flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {allIndexed ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                All documents indexed!
              </span>
            ) : files.length > 0 ? (
              <span>
                {files.length} document{files.length > 1 ? 's' : ''} queued
              </span>
            ) : (
              <span>Select files to proceed</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              disabled={uploadStatus === 'uploading'}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition disabled:opacity-40"
            >
              {allIndexed ? 'Done' : 'Cancel'}
            </button>

            {!allIndexed && (
              <button
                onClick={startUpload}
                disabled={files.length === 0 || uploadStatus === 'uploading'}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    <span>Indexing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload &amp; Index</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
