import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FolderArchive, 
  UploadCloud, 
  Layers, 
  Search, 
  FileText, 
  GitFork, 
  CheckCircle2, 
  Trash2, 
  Info,
  X,
  FileSpreadsheet,
  FileCode,
  File,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const {
    documents,
    selectedDocument,
    chatMode,
    switchToGeneralChat,
    switchToAllDocuments,
    selectDocumentScope,
    filterQuery,
    setFilterQuery,
    setIsUploading,
    setActiveDocModal,
    fetchDocuments,
    deleteDocument,
  } = useApp();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const handleDeleteConfirm = async (docId, e) => {
    e.stopPropagation();
    setIsDeletingId(docId);
    try {
      await deleteDocument(docId);
    } finally {
      setIsDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const fileInputRef = useRef(null);

  // Filter documents
  const filteredDocs = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'md' || ext === 'txt') return <FileCode className="w-4 h-4 text-slate-300" />;
    if (ext === 'csv') return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    return <FileText className="w-4 h-4 text-blue-400" />;
  };

  return (
    <aside className="w-80 border-r border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0d1322] flex flex-col h-[calc(100vh-4rem)] select-none transition-colors">
      {/* Knowledge Base Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-[#1e293b]/60 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-950/70 dark:border-blue-500/30 dark:text-blue-400 flex items-center justify-center">
          <FolderArchive className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wide">Knowledge Base</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">Indexed vector documents</p>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="p-3">
        <div
          onClick={() => setIsUploading(true)}
          className="border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 dark:border-blue-500/30 dark:hover:border-blue-500/60 dark:bg-blue-950/15 dark:hover:bg-blue-950/25 rounded-xl p-4 text-center cursor-pointer transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 group-hover:bg-blue-200/80 border border-blue-300 text-blue-600 dark:bg-blue-600/20 dark:group-hover:bg-blue-600/30 dark:border-blue-500/40 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 transition-transform duration-200 group-hover:scale-105">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white">
            Upload document or drag here
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            PDF, Word, Markdown, TXT, CSV (max 25MB)
          </p>
        </div>
      </div>

      {/* Chat Modes: Normal Chat & All Documents */}
      <div className="px-3 pb-2 space-y-1.5">
        {/* Normal Chat Button (No documents) */}
        <button
          onClick={switchToGeneralChat}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
            chatMode === 'general'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200 dark:bg-[#131b2e] dark:hover:bg-[#18233c] dark:text-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className={`p-1.5 rounded-lg ${chatMode === 'general' ? 'bg-white/20' : 'bg-purple-100 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold">Normal Chat</div>
              <div className={`text-[10px] leading-tight ${chatMode === 'general' ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'}`}>
                Chat freely without documents
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            chatMode === 'general'
              ? 'bg-white text-purple-700'
              : 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-500/20'
          }`}>
            General
          </span>
        </button>

        {/* All Documents Button */}
        <button
          onClick={switchToAllDocuments}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
            chatMode === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200 dark:bg-[#131b2e] dark:hover:bg-[#18233c] dark:text-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className={`p-1.5 rounded-lg ${chatMode === 'all' ? 'bg-white/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'}`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold">All Documents</div>
              <div className={`text-[10px] leading-tight ${chatMode === 'all' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                Search across complete corpus
              </div>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            chatMode === 'all' ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            {documents.length}
          </span>
        </button>
      </div>

      {/* Filter Files Input */}
      <div className="px-3 py-1.5">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter files..."
            className="w-full bg-slate-100 border border-slate-200 focus:border-blue-500 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 dark:bg-[#101728] dark:border-slate-800 dark:focus:border-blue-500/60 dark:text-slate-200 dark:placeholder-slate-500 outline-none transition"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Documents List Header */}
      <div className="px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-[#1e293b]/50">
        <span>DOCUMENTS ({filteredDocs.length})</span>
        <span>STATUS</span>
      </div>

      {/* Document List Items */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-8 px-4 text-xs text-slate-500">
            {filterQuery ? 'No documents match filter' : 'No documents indexed yet'}
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isSelected = chatMode === 'document' && selectedDocument?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => selectDocumentScope(doc)}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-400/70 shadow-sm dark:bg-blue-950/40 dark:border-blue-500/50'
                    : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 hover:border-slate-300 dark:bg-[#131b2e]/60 dark:hover:bg-[#131b2e] dark:border-slate-800/80 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5 p-1 rounded-md bg-slate-200/80 border border-slate-300 text-slate-700 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {getFileIcon(doc.fileName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-medium truncate ${
                          isSelected ? 'text-blue-600 dark:text-blue-300 font-semibold' : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}
                        title={doc.fileName}
                      >
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{formatSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{doc.totalPages || 1}p</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{doc.status || 'Indexed'}</span>
                    </div>
                  </div>
                </div>

                {/* Inline Confirmation when Delete clicked */}
                {confirmDeleteId === doc.id ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-[11px] bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg"
                  >
                    <span className="text-rose-600 dark:text-rose-300 font-medium">Delete document?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleDeleteConfirm(doc.id, e)}
                        disabled={isDeletingId === doc.id}
                        className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold transition disabled:opacity-50"
                      >
                        {isDeletingId === doc.id ? 'Deleting...' : 'Delete'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Sub row with chunks count + Info & Delete triggers */
                  <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3 h-3 text-slate-400" />
                      <span>{doc.totalChunks ?? 0} chunks</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDocModal(doc);
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 dark:bg-slate-800 dark:hover:bg-blue-600 dark:hover:text-white dark:text-slate-300 text-[10px] transition-colors flex items-center gap-1"
                        title="Inspect vector chunks"
                      >
                        <Info className="w-2.5 h-2.5" />
                        <span>Chunks</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(doc.id);
                        }}
                        className="p-1 rounded bg-slate-200 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-900/60 dark:hover:text-rose-400 dark:text-slate-400 text-[10px] transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-[#1e293b]/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <button
          onClick={fetchDocuments}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          Refresh corpus
        </button>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">v1.0.0</span>
      </div>
    </aside>
  );
};
