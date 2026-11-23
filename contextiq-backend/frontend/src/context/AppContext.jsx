import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../api/apiService';

const AppContext = createContext(null);

const STORAGE_KEY_SESSIONS = 'contextiq_chat_sessions_v1';
const STORAGE_KEY_ACTIVE_SESSION = 'contextiq_active_session_v1';
const STORAGE_KEY_STREAM = 'contextiq_stream_tokens_v1';
const STORAGE_KEY_THEME = 'contextiq_theme_v1';

// Initial sample documents if backend is fresh/empty
const SAMPLE_DOCUMENTS = [
  {
    id: '844bb5e1-45d5-4a7b-8912-3f8921a93b41',
    fileName: 'Chapter-18-ingress.md',
    contentType: 'text/markdown',
    fileSize: 176128, // 172 KB
    totalPages: 1,
    totalChunks: 7,
    status: 'INDEXED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a91c24e0-32b1-4c12-98ab-87df21901a12',
    fileName: 'Chapter-29-CICD-with-Ku...',
    contentType: 'text/markdown',
    fileSize: 17305, // 16.9 KB
    totalPages: 1,
    totalChunks: 7,
    status: 'INDEXED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'b712fa90-54a2-4a01-8bfa-1209384910ab',
    fileName: 'Chapter-36-GitOps.md',
    contentType: 'text/markdown',
    fileSize: 21196, // 20.7 KB
    totalPages: 1,
    totalChunks: 8,
    status: 'INDEXED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c8201fa2-89b1-4f12-a123-5689123498cd',
    fileName: 'Chapter-27-Monitoring.md',
    contentType: 'text/markdown',
    fileSize: 19558, // 19.1 KB
    totalPages: 1,
    totalChunks: 8,
    status: 'INDEXED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd93012ef-1010-410a-b333-890123fa4567',
    fileName: '05_Docker_Images.md',
    contentType: 'text/markdown',
    fileSize: 7270, // 7.1 KB
    totalPages: 1,
    totalChunks: 3,
    status: 'INDEXED',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const AppProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null); // null means "All Documents" or "General"
  const [chatMode, setChatMode] = useState('all'); // 'all' | 'document' | 'general'
  const [filterQuery, setFilterQuery] = useState('');

  const switchToGeneralChat = () => {
    setChatMode('general');
    setSelectedDocument(null);
  };

  const switchToAllDocuments = () => {
    setChatMode('all');
    setSelectedDocument(null);
  };

  const selectDocumentScope = (doc) => {
    setSelectedDocument(doc);
    setChatMode('document');
  };

  // Modals state
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeDocModal, setActiveDocModal] = useState(null); // Doc for Document Chunks Information Modal
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  // Settings
  const [streamTokens, setStreamTokens] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STREAM);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  });

  // Chat Sessions
  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    const defaultSessionId = 'session-' + Date.now();
    return [
      {
        id: defaultSessionId,
        title: 'New Conversation',
        documentId: null,
        messages: [],
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    return saved || (chatSessions[0]?.id ?? '');
  });

  const [isSending, setIsSending] = useState(false);

  // Sync theme
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync stream setting
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STREAM, JSON.stringify(streamTokens));
  }, [streamTokens]);

  // Sync sessions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, activeSessionId);
    }
  }, [activeSessionId]);

  // Fetch documents from backend
  const fetchDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await apiService.getDocuments();
      if (Array.isArray(docs) && docs.length > 0) {
        setDocuments(docs);
      } else if (Array.isArray(docs)) {
        setDocuments([]);
      } else {
        setDocuments(SAMPLE_DOCUMENTS);
      }
    } catch (err) {
      console.warn('Backend offline or error fetching docs, using sample corpus:', err);
      setDocuments(SAMPLE_DOCUMENTS);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearching((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active chat session
  const activeSession = chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];
  const activeMessages = activeSession ? activeSession.messages : [];

  // Create new session
  const createNewSession = (title = 'New Conversation', docId = null) => {
    const newSession = {
      id: 'session-' + Date.now(),
      title,
      documentId: docId || selectedDocument?.id || null,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  // Delete session
  const deleteSession = (id) => {
    setChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh = {
          id: 'session-' + Date.now(),
          title: 'New Conversation',
          documentId: null,
          messages: [],
          createdAt: new Date().toISOString(),
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename session
  const renameSession = (id, newTitle) => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle.trim() || 'Untitled Chat' } : s))
    );
  };

  // Clear current chat messages
  const clearCurrentChat = () => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s))
    );
  };

  // Update messages in current session
  const updateActiveMessages = (updater) => {
    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const nextMsgs = typeof updater === 'function' ? updater(s.messages) : updater;
          // auto title from first question
          let updatedTitle = s.title;
          if (s.messages.length === 0 && nextMsgs.length > 0) {
            const firstUserMsg = nextMsgs.find((m) => m.role === 'user');
            if (firstUserMsg && s.title === 'New Conversation') {
              updatedTitle = firstUserMsg.text.slice(0, 32) + (firstUserMsg.text.length > 32 ? '...' : '');
            }
          }
          return { ...s, messages: nextMsgs, title: updatedTitle };
        }
        return s;
      })
    );
  };

  // Send message handler (Supports both stream and standard Q&A)
  const sendMessage = async (text) => {
    if (!text || !text.trim() || isSending) return;

    const trimmed = text.trim();
    const userMsgId = 'msg-' + Date.now() + '-user';
    const assistantMsgId = 'msg-' + Date.now() + '-bot';

    const userMessage = {
      id: userMsgId,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const initialBotMessage = {
      id: assistantMsgId,
      role: 'assistant',
      text: '',
      isStreaming: true,
      citations: [],
      responseTimeMs: null,
      timestamp: new Date().toISOString(),
    };

    updateActiveMessages((prev) => [...prev, userMessage, initialBotMessage]);
    setIsSending(true);

    const useDocs = chatMode !== 'general';
    const docId = (chatMode === 'document' && selectedDocument) ? selectedDocument.id : null;
    const startTime = Date.now();

    try {
      if (streamTokens) {
        // Stream token by token
        let currentText = '';
        await apiService.streamQuestion(
          {
            question: trimmed,
            documentId: docId,
            conversationId: activeSessionId,
            useDocuments: useDocs,
          },
          (delta, accumulated) => {
            currentText = accumulated;
            updateActiveMessages((prev) =>
              prev.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulated } : m))
            );
          }
        );

        // Streaming finished
        const totalDuration = Date.now() - startTime;
        updateActiveMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: currentText || 'Received response.',
                  isStreaming: false,
                  responseTimeMs: totalDuration,
                }
              : m
          )
        );
      } else {
        // Standard query endpoint
        const result = await apiService.askQuestion({
          question: trimmed,
          documentId: docId,
          conversationId: activeSessionId,
          useDocuments: useDocs,
        });

        const totalDuration = result?.responseTimeMs || (Date.now() - startTime);
        updateActiveMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: result?.answer || 'No response returned from the model.',
                  citations: result?.citations || [],
                  responseTimeMs: totalDuration,
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Error generating answer:', err);
      // Graceful conversational response if backend offline or error
      const totalDuration = Date.now() - startTime;
      const errorMsg =
        err?.response?.data?.message ||
        `Hello! I received your question: "${trimmed}". The ContextIQ backend is currently connecting or processing your request. Please ensure the backend is running at http://localhost:8081.`;

      updateActiveMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: errorMsg,
                isStreaming: false,
                responseTimeMs: totalDuration,
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  // Delete document from backend and state
  const deleteDocument = async (id) => {
    try {
      await apiService.deleteDocument(id);
    } catch (err) {
      console.warn('Backend delete error or backend offline:', err);
    }
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
    if (activeDocModal?.id === id) {
      setActiveDocModal(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        documents,
        setDocuments,
        isLoadingDocs,
        fetchDocuments,
        deleteDocument,
        selectedDocument,
        setSelectedDocument,
        chatMode,
        setChatMode,
        switchToGeneralChat,
        switchToAllDocuments,
        selectDocumentScope,
        filterQuery,
        setFilterQuery,
        // Modals
        isUploading,
        setIsUploading,
        isSearching,
        setIsSearching,
        activeDocModal,
        setActiveDocModal,
        isChatDrawerOpen,
        setIsChatDrawerOpen,
        // Sessions
        chatSessions,
        activeSessionId,
        setActiveSessionId,
        createNewSession,
        deleteSession,
        renameSession,
        clearCurrentChat,
        activeSession,
        activeMessages,
        sendMessage,
        isSending,
        // Preferences
        streamTokens,
        setStreamTokens,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
