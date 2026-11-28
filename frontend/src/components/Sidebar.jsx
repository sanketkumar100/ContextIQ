import React, { useState } from 'react';
import {
  FolderArchive,
  UploadCloud,
  Layers,
  Search,
  FileText,
  Trash2,
  Info,
  X,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useConversationStore } from '../store/conversationStore';
import { useUiStore } from '../store/uiStore';
import { ChatsPanel } from './ChatsPanel';

export const Sidebar = () => {
  const documents = useDocumentStore((s) => s.documents);
  const selectedDocument = useDocumentStore((s) => s.selectedDocument);
  const chatMode = useDocumentStore((s) => s.chatMode);
  const switchToGeneralChat = useDocumentStore((s) => s.switchToGeneralChat);
  const switchToAllDocuments = useDocumentStore((s) => s.switchToAllDocuments);
  const selectDocumentScope = useDocumentStore((s) => s.selectDocumentScope);
  const filterQuery = useDocumentStore((s) => s.filterQuery);
  const setFilterQuery = useDocumentStore((s) => s.setFilterQuery);
  const setActiveDocModal = useDocumentStore((s) => s.setActiveDocModal);
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments);
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);

  const conversationsCount = useConversationStore((s) => s.conversations.length);

  const sidebarTab = useUiStore((s) => s.sidebarTab);
  const setSidebarTab = useUiStore((s) => s.setSidebarTab);
  const setIsUploading = useUiStore((s) => s.setIsUploading);
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const setIsSidebarOpen = useUiStore((s) => s.setIsSidebarOpen);

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

  const filteredDocs = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'md' || ext === 'txt') return <FileCode className="w-4 h-4 text-slate-300" />;
    if (ext === 'csv') return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    return <FileText className="w-4 h-4 text-blue-400" />;
  };

  return (
    <>
      {/* Mobile / Tablet Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[85vw] max-w-xs lg:static lg:inset-auto lg:z-auto lg:w-72 xl:w-80 lg:max-w-none shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1017] flex flex-col h-full select-none shadow-2xl lg:shadow-none transition-transform duration-200 ease-out lg:transition-none lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Header */}
        <div className="flex lg:hidden items-center justify-between px-3.5 pt-3 pb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Workspace
          </span>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close navigation sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Tabs: Documents vs Chats */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl flex items-center gap-1 text-xs font-medium border border-slate-200/60 dark:border-slate-800/60">
          <button
            type="button"
            onClick={() => setSidebarTab('documents')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
              sidebarTab === 'documents'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Documents</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
              {documents.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab('chats')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
              sidebarTab === 'chats'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chats</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
              {conversationsCount}
            </span>
          </button>
        </div>
      </div>

      {sidebarTab === 'chats' ? (
        <ChatsPanel />
      ) : (
        <>
          {/* Mode Switcher: Segmented Tabs (Document RAG vs Normal Chat) */}
          <div className="p-3 pb-2">
            <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl flex items-center gap-1 text-xs font-medium border border-slate-200/60 dark:border-slate-800/60">
              <button
                onClick={switchToAllDocuments}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs ${
                  chatMode !== 'general'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Grounded answers using indexed document vectors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Document RAG</span>
              </button>
              <button
                onClick={switchToGeneralChat}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs ${
                  chatMode === 'general'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title="Conversational AI without document retrieval"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Normal Chat</span>
              </button>
            </div>
          </div>

          {/* Simple Upload Action */}
          <div className="px-3 pb-2">
            <button
              onClick={() => {
                setIsUploading(true);
                setIsSidebarOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/70 hover:bg-slate-100/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition"
            >
              <UploadCloud className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Upload Documents</span>
            </button>
          </div>

          {/* Filter Files Input */}
          <div className="px-3 pb-2">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 dark:bg-slate-900/60 dark:border-slate-800 dark:focus:border-slate-600 dark:text-slate-200 dark:placeholder-slate-500 outline-none transition"
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

          {/* Scope quick action (All Documents) */}
          <div className="px-3 pb-1">
            <button
              onClick={() => {
                switchToAllDocuments();
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                chatMode === 'all'
                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5" />
                <span className="truncate">Search All Documents</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {documents.length}
              </span>
            </button>
          </div>

          {/* Documents List Header */}
          <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 border-t border-b border-slate-100 dark:border-slate-800/60">
            <span>Files ({filteredDocs.length})</span>
            <span>Chunks</span>
          </div>

          {/* Document List Items */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-slate-400">
                {filterQuery ? 'No documents match filter' : 'No documents indexed yet'}
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = chatMode === 'document' && selectedDocument?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      selectDocumentScope(doc);
                      setIsSidebarOpen(false);
                    }}
                    className={`group relative p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-300 dark:border-slate-700 shadow-sm'
                        : 'bg-white hover:bg-slate-50/80 border-transparent hover:border-slate-200/80 dark:bg-transparent dark:hover:bg-slate-900/60 dark:hover:border-slate-800/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="mt-0.5 text-slate-500 dark:text-slate-400">
                          {getFileIcon(doc.fileName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs truncate ${
                              isSelected
                                ? 'text-slate-900 dark:text-slate-100 font-semibold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                            title={doc.fileName}
                          >
                            {doc.fileName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            <span>{formatSize(doc.fileSize)}</span>
                            <span>•</span>
                            <span>{doc.totalChunks ?? 0} chunks</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions on hover (always visible on touch/mobile) */}
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDocModal(doc);
                            setIsSidebarOpen(false);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                          title="Inspect chunks"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(doc.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Confirmation when Delete clicked */}
                    {confirmDeleteId === doc.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-[11px] bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg"
                      >
                        <span className="text-rose-600 dark:text-rose-300 font-medium">
                          Delete file?
                        </span>
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
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <button
              onClick={fetchDocuments}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Refresh corpus
            </button>
            <span className="text-[10px] font-mono">ContextIQ v1.0</span>
          </div>
        </>
      )}
      </aside>
    </>
  );
};
