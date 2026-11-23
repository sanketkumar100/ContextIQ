import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Zap, Sparkles } from 'lucide-react';

export const ChatInput = () => {
  const { sendMessage, isSending, selectedDocument, chatMode } = useApp();
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const placeholderText = chatMode === 'general'
    ? 'Ask anything (coding, concepts, writing, brainstorming)...'
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
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="p-4 bg-gradient-to-t from-slate-50 via-slate-50/90 dark:from-[#090d16] dark:via-[#090d16]/90 to-transparent">
      <div className="max-w-4xl mx-auto">
        {/* Input container */}
        <div className="relative flex items-center bg-white dark:bg-[#101728] border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-blue-500 rounded-2xl p-2 shadow-lg shadow-black/5 dark:shadow-xl dark:shadow-black/40 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            disabled={isSending}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 dark:text-slate-100 dark:placeholder-slate-400 px-3 py-1.5 outline-none resize-none max-h-32 leading-relaxed"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              input.trim() && !isSending
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30 cursor-pointer transform hover:scale-105 active:scale-95'
                : 'bg-slate-200 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Input Footer Instructions */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2 select-none">
          <div className="flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 font-mono text-[10px] dark:text-slate-400">
              Enter
            </kbd>
            <span>to send,</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 border border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-700 font-mono text-[10px] dark:text-slate-400">
              Shift+Enter
            </kbd>
            <span>for newline</span>
          </div>

          {chatMode === 'general' ? (
            <div className="flex items-center gap-1 text-purple-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Normal AI Chat</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-blue-400 font-medium">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Grounded RAG</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
