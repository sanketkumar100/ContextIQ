import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Clock } from 'lucide-react';
import { useConversationStore } from '../store/conversationStore';
import { useUiStore } from '../store/uiStore';

const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now';
  const diffMs = Date.now() - new Date(isoString).getTime();
  if (Number.isNaN(diffMs) || diffMs < 60_000) return 'Just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
};

export const ChatsPanel = () => {
  const conversations = useConversationStore((s) => s.conversations);
  const activeConversationId = useConversationStore((s) => s.activeConversationId);
  const selectChat = useConversationStore((s) => s.selectChat);
  const newChat = useConversationStore((s) => s.newChat);
  const deleteChat = useConversationStore((s) => s.deleteChat);
  const setIsSidebarOpen = useUiStore((s) => s.setIsSidebarOpen);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const handleDeleteConfirm = async (chatId, e) => {
    e.stopPropagation();
    setIsDeletingId(chatId);
    try {
      await deleteChat(chatId);
    } finally {
      setIsDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Prominent New Chat Action */}
      <div className="p-3 pb-2">
        <button
          onClick={() => {
            newChat();
            setIsSidebarOpen(false);
          }}
          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chats List Header */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 border-t border-b border-slate-100 dark:border-slate-800/60">
        <span>Conversations ({conversations.length})</span>
        <span>Updated</span>
      </div>

      {/* Chat Items */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 px-4 text-xs text-slate-400">
            No conversations yet
          </div>
        ) : (
          conversations.map((chat) => {
            const isActive = chat.id === activeConversationId;
            return (
              <div
                key={chat.id}
                onClick={() => {
                  selectChat(chat.id);
                  setIsSidebarOpen(false);
                }}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/35 border-indigo-300 dark:border-indigo-500/40 shadow-sm'
                    : 'bg-white hover:bg-slate-50/80 border-transparent hover:border-slate-200/80 dark:bg-transparent dark:hover:bg-slate-900/60 dark:hover:border-slate-800/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div
                      className={`mt-0.5 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs truncate ${
                          isActive
                            ? 'text-slate-900 dark:text-slate-100 font-semibold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                        title={chat.title}
                      >
                        {chat.title}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatRelativeTime(chat.updatedAt || chat.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Delete Button (always visible on touch/mobile) */}
                  <div className="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(chat.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Confirmation matching Sidebar document delete */}
                {confirmDeleteId === chat.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-[11px] bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg"
                  >
                    <span className="text-rose-600 dark:text-rose-300 font-medium">
                      Delete chat?
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleDeleteConfirm(chat.id, e)}
                        disabled={isDeletingId === chat.id}
                        className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold transition disabled:opacity-50"
                      >
                        {isDeletingId === chat.id ? 'Deleting...' : 'Delete'}
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
    </div>
  );
};
