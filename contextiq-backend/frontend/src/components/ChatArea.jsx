import React from 'react';
import { useApp } from '../context/AppContext';
import { WelcomeTemplates } from './WelcomeTemplates';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { 
  Download, 
  RotateCcw, 
  ToggleLeft, 
  ToggleRight,
  Radio
} from 'lucide-react';

export const ChatArea = () => {
  const {
    selectedDocument,
    chatMode,
    activeMessages,
    clearCurrentChat,
    streamTokens,
    setStreamTokens,
    activeSession,
  } = useApp();

  let contextLabel = 'All Uploaded Documents';
  let dotColor = 'bg-emerald-400 shadow-emerald-400/50';

  if (chatMode === 'general') {
    contextLabel = 'Normal Chat (General AI • No Documents)';
    dotColor = 'bg-purple-400 shadow-purple-400/50';
  } else if (chatMode === 'document' && selectedDocument) {
    contextLabel = selectedDocument.fileName;
    dotColor = 'bg-emerald-400 shadow-emerald-400/50';
  }

  // Export conversation as markdown file
  const handleExport = () => {
    if (!activeMessages.length) return;
    const content = activeMessages
      .map((m) => `### ${m.role === 'user' ? 'User' : 'ContextIQ AI'}\n\n${m.text}\n\n`)
      .join('---\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contextiq-chat-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#090d16] relative overflow-hidden transition-colors">
      {/* Top Context & Controls Bar */}
      <div className="h-11 border-b border-slate-200 dark:border-[#1e293b]/70 bg-white/80 dark:bg-[#0b101c]/80 backdrop-blur-sm px-6 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 z-10 select-none">
        {/* Left Context Indicator */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-slate-500 dark:text-slate-400">Context:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{contextLabel}</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Stream Tokens Toggle */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="stream-toggle"
              className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none"
            >
              Stream Tokens
            </label>
            <button
              id="stream-toggle"
              role="switch"
              aria-checked={streamTokens}
              onClick={() => setStreamTokens(!streamTokens)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                streamTokens ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  streamTokens ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Export & Clear if conversation has messages */}
          {activeMessages.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-[#131b2e] dark:hover:bg-[#18233c] dark:border-slate-800 dark:text-slate-300 dark:hover:text-white transition"
                title="Export conversation as markdown"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export</span>
              </button>

              <button
                onClick={clearCurrentChat}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-600 dark:bg-[#131b2e] dark:hover:bg-rose-950/40 dark:border-slate-800 dark:hover:border-rose-900/50 dark:text-slate-300 dark:hover:text-rose-400 transition"
                title="Clear current messages"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Chat Body */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeMessages.length === 0 ? (
          <WelcomeTemplates />
        ) : (
          <ChatMessages messages={activeMessages} />
        )}
      </div>

      {/* Bottom Chat Input */}
      <ChatInput />
    </main>
  );
};
