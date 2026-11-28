import React, { useState } from 'react';
import {
  X,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useConversationStore } from '../store/conversationStore';
import { useDocumentStore } from '../store/documentStore';
import { useUiStore } from '../store/uiStore';

export const ChatSessionSelector = () => {
  const conversations = useConversationStore((s) => s.conversations);
  const activeConversationId = useConversationStore((s) => s.activeConversationId);
  const messagesByConversation = useConversationStore((s) => s.messagesByConversation);
  const selectChat = useConversationStore((s) => s.selectChat);
  const newChat = useConversationStore((s) => s.newChat);
  const deleteChat = useConversationStore((s) => s.deleteChat);
  const renameChat = useConversationStore((s) => s.renameChat);

  const isChatDrawerOpen = useUiStore((s) => s.isChatDrawerOpen);
  const setIsChatDrawerOpen = useUiStore((s) => s.setIsChatDrawerOpen);

  const documents = useDocumentStore((s) => s.documents);
  const switchToGeneralChat = useDocumentStore((s) => s.switchToGeneralChat);
  const switchToAllDocuments = useDocumentStore((s) => s.switchToAllDocuments);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isChatDrawerOpen) return null;

  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameChat(id, editTitle);
    }
    setEditingId(null);
  };

  const handleKeyDown = (id, e) => {
    if (e.key === 'Enter') {
      handleSaveRename(id, e);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const getDocName = (docId) => {
    if (!docId) return 'All Documents';
    const found = documents.find((d) => d.id === docId);
    return found ? found.fileName : 'Scoped Document';
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={() => setIsChatDrawerOpen(false)}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#0d1322] border-l border-slate-200 dark:border-[#1e293b] h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Chat Sessions
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              {conversations.length}
            </span>
          </div>
          <button
            onClick={() => setIsChatDrawerOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Options */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800/60 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              switchToGeneralChat();
              newChat({ title: 'General AI Chat', documentId: null });
              setIsChatDrawerOpen(false);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-medium transition"
            title="Chat without document retrieval"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Normal Chat</span>
          </button>
          <button
            onClick={() => {
              switchToAllDocuments();
              newChat({ title: 'Document RAG Chat', documentId: null });
              setIsChatDrawerOpen(false);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-[11px] font-medium transition shadow-sm"
            title="Search and answer using document vectors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Doc RAG Chat</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map((session) => {
            const isActive = session.id === activeConversationId;
            const isEditing = editingId === session.id;
            const msgCount = messagesByConversation[session.id]?.length ?? 0;

            return (
              <div
                key={session.id}
                onClick={() => {
                  selectChat(session.id);
                  setIsChatDrawerOpen(false);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500/50 shadow-md'
                    : 'bg-slate-50 dark:bg-[#131b2e]/60 hover:bg-slate-100 dark:hover:bg-[#131b2e] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(session.id, e)}
                          autoFocus
                          className="w-full bg-white dark:bg-[#101728] border border-blue-500 rounded px-2 py-1 text-xs text-slate-900 dark:text-white outline-none"
                        />
                        <button
                          onClick={(e) => handleSaveRename(session.id, e)}
                          className="p-1 text-emerald-500 hover:text-emerald-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`text-xs font-medium truncate ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-300 font-semibold'
                              : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}
                        >
                          {session.title}
                        </p>
                      </div>
                    )}

                    {/* Metadata line */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>{getDocName(session.documentId)}</span>
                      </span>
                      {msgCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{msgCount} messages</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartRename(session, e)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
                        title="Rename Chat"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {conversations.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(session.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1e293b] text-center text-[11px] text-slate-500 dark:text-slate-400">
          Saved in user-scoped browser storage
        </div>
      </div>
    </div>
  );
};
