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
  let dotColor = 'bg-emerald-500';

  if (chatMode === 'general') {
    contextLabel = 'Normal Chat (General Knowledge)';
    dotColor = 'bg-purple-500';
  } else if (chatMode === 'document' && selectedDocument) {
    contextLabel = selectedDocument.fileName;
    dotColor = 'bg-blue-500';
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
    <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-slate-50/50 dark:bg-[#0b0f17] relative overflow-hidden transition-colors">
      {/* Top Context & Controls Bar */}
      <div className="h-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1017]/70 backdrop-blur-sm px-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 z-10 select-none">
        {/* Left Context Indicator */}
        <div className="flex items-center gap-2 truncate">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <span className="text-slate-400 dark:text-slate-500 font-normal">Context:</span>
          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{contextLabel}</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Stream Answers Toggle Pill */}
          <button
            type="button"
            onClick={() => setStreamTokens((prev) => !prev)}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer select-none ${
              streamTokens
                ? 'bg-blue-50/70 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-300'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#121620] dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60'
            }`}
            title={`Streaming answers is ${streamTokens ? 'ENABLED (ON)' : 'DISABLED (OFF)'}. Click to toggle.`}
            role="switch"
            aria-checked={streamTokens}
          >
            <Radio className={`w-3.5 h-3.5 ${streamTokens ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-[11px] font-normal">Stream answers</span>
            <div
              className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ${
                streamTokens ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  streamTokens ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                streamTokens
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-200'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {streamTokens ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Export & Clear if conversation has messages */}
          {activeMessages.length > 0 && (
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
              <button
                onClick={handleExport}
                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 transition"
                title="Export conversation as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearCurrentChat}
                className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
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
