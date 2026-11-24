import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bookmark, 
  Search, 
  ExternalLink, 
  Sun, 
  Moon, 
  Layers, 
  MessageSquare,
  FileText,
  Plus
} from 'lucide-react';

export const Navbar = () => {
  const {
    documents,
    selectedDocument,
    chatMode,
    switchToGeneralChat,
    switchToAllDocuments,
    setIsSearching,
    theme,
    toggleTheme,
    chatSessions,
    setIsChatDrawerOpen,
    createNewSession,
  } = useApp();

  const totalDocs = documents.length;
  let scopeLabel = `All Documents (${totalDocs})`;
  let scopeIcon = <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />;

  if (chatMode === 'general') {
    scopeLabel = 'Normal Chat (No Docs)';
    scopeIcon = <MessageSquare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />;
  } else if (chatMode === 'document' && selectedDocument) {
    scopeLabel = selectedDocument.fileName;
    scopeIcon = <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />;
  }

  const handleToggleScope = () => {
    if (chatMode === 'general') {
      switchToAllDocuments();
    } else {
      switchToGeneralChat();
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1017] px-4 flex items-center justify-between z-20 sticky top-0 transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-semibold shadow-sm">
          <Bookmark className="w-4 h-4 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 tracking-tight">ContextIQ</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
              RAG
            </span>
          </div>
        </div>
      </div>

      {/* Scope Pill (Center) */}
      <div className="hidden md:flex items-center">
        <button
          onClick={handleToggleScope}
          title="Click to toggle between Document RAG and Normal Chat"
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
        >
          {scopeIcon}
          <span className="truncate max-w-[200px]">
            Scope: <span className="font-medium text-slate-900 dark:text-slate-100">{scopeLabel}</span>
          </span>
          <span className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-1">
            (click to switch)
          </span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        {/* New Chat Button */}
        <button
          onClick={() => createNewSession('New Chat')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 transition shadow-sm"
          title="Start a new chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Chat History Drawer */}
        <button
          onClick={() => setIsChatDrawerOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800 transition"
          title="View conversation history"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {chatSessions.length}
          </span>
        </button>

        {/* Search Chunks Button */}
        <button
          onClick={() => setIsSearching(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800 transition"
          title="Search vector chunks (Cmd+K / Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Swagger UI link */}
        <a
          href="http://localhost:8081/swagger-ui.html"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/70 transition"
          title="Open API Documentation (Swagger)"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/70 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
