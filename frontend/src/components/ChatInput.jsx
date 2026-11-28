import React, { useState, useRef } from 'react';
import { ArrowUp, Square, FileText, Layers, Sparkles } from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useConversationStore } from '../store/conversationStore';

export const ChatInput = () => {
  const sendMessage = useConversationStore((s) => s.sendMessage);
  const isSending = useConversationStore((s) => s.isSending);
  const stopGenerating = useConversationStore((s) => s.stopGenerating);

  const selectedDocument = useDocumentStore((s) => s.selectedDocument);
  const chatMode = useDocumentStore((s) => s.chatMode);

  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const placeholderText =
    chatMode === 'general'
      ? 'Ask anything in general chat...'
      : selectedDocument
      ? `Ask a question about ${selectedDocument.fileName}...`
      : 'Ask a question across all documents...';

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    sendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  return (
    <div className="px-3 pb-3 pt-2 sm:p-4 shrink-0 bg-gradient-to-t from-slate-50 via-slate-50/80 dark:from-[#0b0f17] dark:via-[#0b0f17]/80 to-transparent">
      <div className="max-w-3xl mx-auto">
        {/* Input Card Container */}
        <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600 rounded-2xl p-2 sm:p-2.5 shadow-sm transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={isSending}
            className="w-full bg-transparent text-base sm:text-sm text-slate-800 placeholder-slate-400 dark:text-slate-100 dark:placeholder-slate-500 px-2 py-1 outline-none resize-none max-h-40 leading-relaxed font-sans"
          />

          {/* Bottom Toolbar inside input */}
          <div className="flex items-center justify-between gap-2 pt-1 px-1 mt-1 border-t border-slate-100 dark:border-slate-800/60">
            {/* Scope Indicator Pill */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0 flex-1">
              {chatMode === 'general' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="truncate">Normal AI Mode</span>
                </span>
              ) : selectedDocument ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 min-w-0">
                  <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[160px] sm:max-w-[220px]">{selectedDocument.fileName}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                  <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">All Documents</span>
                </span>
              )}
            </div>

            {/* Right Action: Send or Stop */}
            <div className="flex items-center gap-2 shrink-0">
              {isSending ? (
                <button
                  type="button"
                  onClick={stopGenerating}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-medium transition cursor-pointer shadow-sm"
                  title="Stop generating answer"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                    input.trim()
                      ? 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-sm cursor-pointer'
                      : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                  }`}
                  title="Send (Enter)"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Input Footer Instructions */}
        <div className="mt-1.5 hidden sm:flex items-center justify-center text-[11px] text-slate-400 dark:text-slate-500 select-none">
          <span>Enter to send • Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
