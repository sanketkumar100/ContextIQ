import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { UploadModal } from './components/UploadModal';
import { SearchModal } from './components/SearchModal';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { ChatSessionSelector } from './components/ChatSessionSelector';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthStore } from './store/authStore';
import { useDocumentStore } from './store/documentStore';
import { useConversationStore } from './store/conversationStore';
import { useUiStore } from './store/uiStore';

const Workspace = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const token = useAuthStore((s) => s.token);
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments);
  const loadChats = useConversationStore((s) => s.loadChats);
  const setIsSearching = useUiStore((s) => s.setIsSearching);

  useEffect(() => {
    if (token && userId !== undefined && userId !== null) {
      fetchDocuments();
      loadChats(userId);
    }
  }, [token, userId, fetchDocuments, loadChats]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearching((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearching]);

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0c1017] dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors duration-150">
      <Navbar />
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <Sidebar />
        <ChatArea />
      </div>
      <UploadModal />
      <SearchModal />
      <DocumentDetailModal />
      <ChatSessionSelector />
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            fontSize: '13px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
