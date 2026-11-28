import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Search,
  ExternalLink,
  Sun,
  Moon,
  Layers,
  MessageSquare,
  FileText,
  Plus,
  LogOut,
  ChevronDown,
  Shield,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDocumentStore } from '../store/documentStore';
import { useConversationStore } from '../store/conversationStore';
import { useUiStore } from '../store/uiStore';

const getInitials = (username = '') => {
  const clean = username.trim();
  if (!clean) return 'U';
  const parts = clean.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

export const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const documents = useDocumentStore((s) => s.documents);
  const selectedDocument = useDocumentStore((s) => s.selectedDocument);
  const chatMode = useDocumentStore((s) => s.chatMode);
  const switchToGeneralChat = useDocumentStore((s) => s.switchToGeneralChat);
  const switchToAllDocuments = useDocumentStore((s) => s.switchToAllDocuments);

  const conversations = useConversationStore((s) => s.conversations);
  const newChat = useConversationStore((s) => s.newChat);

  const setIsSearching = useUiStore((s) => s.setIsSearching);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const setIsChatDrawerOpen = useUiStore((s) => s.setIsChatDrawerOpen);
  const setIsSidebarOpen = useUiStore((s) => s.setIsSidebarOpen);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1017] px-2.5 sm:px-4 flex items-center justify-between gap-2 z-20 sticky top-0 transition-colors">
      {/* Brand & Mobile Sidebar Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button
          type="button"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70 transition"
          title="Open documents & chats"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-semibold shadow-sm">
          <Bookmark className="w-4 h-4 fill-current" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 tracking-tight truncate">
              ContextIQ
            </span>
            <span className="hidden sm:inline-block text-[10px] text-slate-500 dark:text-slate-400 font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
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
          <span className="truncate max-w-[120px] lg:max-w-[180px] xl:max-w-[200px]">
            <span className="hidden lg:inline">Scope:{' '}</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {scopeLabel}
            </span>
          </span>
          <span className="hidden xl:inline text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-1">
            (click to switch)
          </span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* New Chat Button */}
        <button
          onClick={() => newChat({ title: 'New Chat' })}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 transition shadow-sm"
          title="Start a new chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Chat History Drawer */}
        <button
          onClick={() => setIsChatDrawerOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800 transition"
          title="View conversation history"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {conversations.length}
          </span>
        </button>

        {/* Search Chunks Button */}
        <button
          onClick={() => setIsSearching(true)}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800 transition"
          title="Search vector chunks (Cmd+K / Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden md:inline-block text-[10px] font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Swagger UI link */}
        <a
          href="http://localhost:8081/swagger-ui.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/70 transition"
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

        {/* User Menu */}
        {user && (
          <div className="relative pl-1 sm:pl-1.5 ml-0.5 sm:ml-1 border-l border-slate-200 dark:border-slate-800" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition cursor-pointer"
              title={`${user.username} (${user.role || 'USER'})`}
            >
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                {getInitials(user.username)}
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {user.username}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {user.role || 'USER'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {user.username}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                      <Shield className="w-2.5 h-2.5" />
                      {user.role || 'USER'}
                    </span>
                  </div>
                  {user.email && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  )}
                </div>

                <div className="px-1.5 pt-1.5 space-y-0.5">
                  <a
                    href="http://localhost:8081/swagger-ui.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="sm:hidden w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>API Docs (Swagger)</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
