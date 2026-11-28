import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Copy,
  Check,
  Trash2,
  MessageSquare,
  HardDrive,
  Layers,
  FileCode,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documentApi } from '../services/api';
import { useDocumentStore } from '../store/documentStore';
import { useConversationStore } from '../store/conversationStore';

export const DocumentDetailModal = () => {
  const activeDocModal = useDocumentStore((s) => s.activeDocModal);
  const setActiveDocModal = useDocumentStore((s) => s.setActiveDocModal);
  const selectDocumentScope = useDocumentStore((s) => s.selectDocumentScope);
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);
  const newChat = useConversationStore((s) => s.newChat);

  const [copiedId, setCopiedId] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const doc = activeDocModal;

  useEffect(() => {
    if (!doc) {
      setChunks([]);
      setShowConfirmDelete(false);
      return;
    }

    let cancelled = false;
    const loadChunks = async () => {
      setIsLoadingChunks(true);
      try {
        const fetched = await documentApi.getChunks(doc.id, doc.fileName);
        if (!cancelled) {
          setChunks(Array.isArray(fetched) ? fetched : []);
        }
      } catch (err) {
        if (!cancelled && err?.response?.status !== 401) {
          toast.error(err?.response?.data?.message || 'Could not load document chunks.');
          setChunks([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingChunks(false);
        }
      }
    };

    loadChunks();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  if (!doc) return null;

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(
        d.getDate()
      ).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return 'N/A';
    }
  };

  const handleCopyId = () => {
    if (doc?.id) {
      navigator.clipboard.writeText(doc.id.toString());
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!doc?.id) return;
    setIsDeleting(true);
    try {
      await deleteDocument(doc.id);
    } catch {
      // handled by store toast
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChatWithDocument = () => {
    selectDocumentScope(doc);
    newChat({ title: `Chat with ${doc.fileName}`, documentId: doc.id });
    setActiveDocModal(null);
  };

  const displayId = doc.id ? `${doc.id.toString().slice(0, 14)}...` : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setActiveDocModal(null)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[90dvh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight break-words">
                {doc.fileName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {displayId}
                </span>
                <button
                  onClick={handleCopyId}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title="Copy Document ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {doc.status || 'INDEXED'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveDocModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/50 dark:bg-[#131b2e]/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <HardDrive className="w-3.5 h-3.5" />
                <span>File Size</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {formatSize(doc.fileSize)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/50 dark:bg-[#131b2e]/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Vector Chunks</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {doc.totalChunks ?? chunks.length} Chunks
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/50 dark:bg-[#131b2e]/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <FileCode className="w-3.5 h-3.5" />
                <span>Total Pages</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {doc.totalPages || 1} Pages
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/50 dark:bg-[#131b2e]/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Uploaded</span>
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {formatDate(doc.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Chunks Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>INDEXED VECTOR CHUNKS</span>
            <span className="text-[10px] tracking-normal px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono">
              {chunks.length} CHUNKS
            </span>
          </div>

          <div className="space-y-3">
            {isLoadingChunks ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Loading vector chunks...
              </div>
            ) : chunks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No vector chunks available for this document.
              </div>
            ) : (
              chunks.map((chunk, index) => {
                const chunkNum =
                  chunk.chunkIndex !== undefined && chunk.chunkIndex !== null
                    ? chunk.chunkIndex
                    : index;
                const snippetText = chunk.snippet || chunk.text || '';

                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#131b2e]/40 space-y-2"
                  >
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Chunk #{chunkNum}
                    </div>
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap select-text break-words">
                      {snippetText}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b101c] flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {showConfirmDelete ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-rose-500 font-medium">
                  Are you sure?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Document</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={() => setActiveDocModal(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
            >
              Close
            </button>

            <button
              onClick={handleChatWithDocument}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow-sm transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with Document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
