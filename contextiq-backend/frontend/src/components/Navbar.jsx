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
  Sparkles 
} from 'lucide-react';

export const Navbar = () => {
  const {
    documents,
    selectedDocument,
    setSelectedDocument,
    chatMode,
    switchToGeneralChat,
    switchToAllDocuments,
    setIsSearching,
    theme,
    toggleTheme,
    chatSessions,
    setIsChatDrawerOpen,
  } = useApp();

  const totalDocs = documents.length;
  let scopeLabel = `All Documents (${totalDocs})`;
  let dotColor = 'bg-blue-400';
  if (chatMode === 'general') {
    scopeLabel = 'Normal Chat (No Documents)';
    dotColor = 'bg-purple-400';
  } else if (chatMode === 'document' && selectedDocument) {
    scopeLabel = selectedDocument.fileName;
    dotColor = 'bg-blue-400';
  }

  const handleCycleScope = () => {
    if (chatMode === 'general') {
      switchToAllDocuments();
    } else {
      switchToGeneralChat();
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-[#1e293b] bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md px-4 flex items-center justify-between z-20 sticky top-0 transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
          <Bookmark className="w-5 h-5 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">ContextIQ</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              AI RAG
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
            Spring AI • PostgreSQL, pgvector • OpenAI
          </p>
        </div>
      </div>

      {/* Scope Badge (Center) */}
      <div className="hidden md:flex items-center">
        <button
          onClick={handleCycleScope}
          title="Click to toggle between Normal Chat and Document RAG"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer shadow-sm ${
            chatMode === 'general'
              ? 'bg-purple-50 hover:bg-purple-100/80 border-purple-200 text-purple-700 dark:bg-[#18142a] dark:border-purple-500/30 dark:hover:border-purple-500/60 dark:hover:bg-[#1e1936] dark:text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 dark:bg-[#131b2e] dark:border-blue-500/20 dark:hover:border-blue-500/50 dark:hover:bg-[#18233c] dark:text-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
          <span>
            Scope: <span className="text-slate-900 dark:text-white font-semibold">{scopeLabel}</span>
          </span>
          <span className="ml-1 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white underline">
            Switch
          </span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Chat History / Sessions Button */}
        <button
          onClick={() => setIsChatDrawerOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-[#131b2e] dark:hover:bg-[#18233c] dark:border-slate-800 dark:text-slate-300 dark:hover:text-white transition"
          title="View chat conversations"
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span>Chats</span>
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
            {chatSessions.length}
          </span>
        </button>

        {/* Search Chunks Button */}
        <button
          onClick={() => setIsSearching(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-[#131b2e] dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:border-blue-500/40 dark:hover:bg-[#18233c] transition group"
          title="Search vector chunks (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
          <span>Search Chunks</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            ⌘ K
          </kbd>
        </button>

        {/* Swagger API External Link */}
        <a
          href="http://localhost:8081/swagger-ui.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-[#131b2e] dark:border-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 transition"
          title="Open Backend Swagger UI"
        >
          <span>Swagger API</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-[#131b2e] transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
