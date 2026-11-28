import { create } from 'zustand';
import toast from 'react-hot-toast';
import { chatApi } from '../services/api';
import {
  conversationApi,
  getActiveConversationKey,
  getStreamPrefKey,
} from '../services/conversationApi';
import { useDocumentStore } from './documentStore';

const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem('docmind-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
};

const makeInitialConversation = (title = 'New Conversation', documentId = null) => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    documentId,
    createdAt: now,
    updatedAt: now,
  };
};

export const useConversationStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  isSending: false,
  streamTokens: true,
  _abortController: null,
  _loadedForUserId: null,

  setStreamTokens: (valOrFn) => {
    const next =
      typeof valOrFn === 'function' ? valOrFn(get().streamTokens) : Boolean(valOrFn);
    set({ streamTokens: next });
    const uid = getCurrentUserId();
    if (uid !== null) {
      try {
        localStorage.setItem(getStreamPrefKey(uid), JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  },

  loadChats: async (explicitUserId) => {
    const uid = explicitUserId ?? getCurrentUserId();
    if (uid === null || uid === undefined) return;

    let savedStreamPref = true;
    try {
      const rawPref = localStorage.getItem(getStreamPrefKey(uid));
      if (rawPref !== null) {
        savedStreamPref = JSON.parse(rawPref);
      }
    } catch {
      savedStreamPref = true;
    }

    const list = await conversationApi.list(uid);
    let savedActiveId = null;
    try {
      savedActiveId = localStorage.getItem(getActiveConversationKey(uid));
    } catch {
      savedActiveId = null;
    }

    if (list.length === 0) {
      const initial = makeInitialConversation();
      conversationApi.saveConversations([initial], uid);
      conversationApi.saveMessages(initial.id, [], uid);
      try {
        localStorage.setItem(getActiveConversationKey(uid), initial.id);
      } catch {
        // ignore
      }
      set({
        conversations: [initial],
        activeConversationId: initial.id,
        messagesByConversation: { [initial.id]: [] },
        streamTokens: savedStreamPref,
        _loadedForUserId: uid,
      });
      return;
    }

    const activeId =
      savedActiveId && list.some((c) => c.id === savedActiveId)
        ? savedActiveId
        : list[0].id;

    try {
      localStorage.setItem(getActiveConversationKey(uid), activeId);
    } catch {
      // ignore
    }

    const activeMessages = await conversationApi.getMessages(activeId, uid);

    set({
      conversations: list,
      activeConversationId: activeId,
      messagesByConversation: {
        ...get().messagesByConversation,
        [activeId]: activeMessages,
      },
      streamTokens: savedStreamPref,
      _loadedForUserId: uid,
    });
  },

  newChat: (options = {}) => {
    const uid = getCurrentUserId();
    const { selectedDocument } = useDocumentStore.getState();
    const title = options.title || 'New Conversation';
    const docId =
      options.documentId !== undefined
        ? options.documentId
        : selectedDocument?.id ?? null;

    const fresh = makeInitialConversation(title, docId);
    const updatedConversations = [fresh, ...get().conversations];

    if (uid !== null) {
      conversationApi.saveConversations(updatedConversations, uid);
      conversationApi.saveMessages(fresh.id, [], uid);
      try {
        localStorage.setItem(getActiveConversationKey(uid), fresh.id);
      } catch {
        // ignore
      }
    }

    set((state) => ({
      conversations: updatedConversations,
      activeConversationId: fresh.id,
      messagesByConversation: {
        ...state.messagesByConversation,
        [fresh.id]: [],
      },
    }));

    return fresh.id;
  },

  selectChat: async (id) => {
    const uid = getCurrentUserId();
    if (!id) return;

    if (uid !== null) {
      try {
        localStorage.setItem(getActiveConversationKey(uid), id);
      } catch {
        // ignore
      }
    }

    const cached = get().messagesByConversation[id];
    if (cached) {
      set({ activeConversationId: id });
      return;
    }

    const loaded = await conversationApi.getMessages(id, uid);
    set((state) => ({
      activeConversationId: id,
      messagesByConversation: {
        ...state.messagesByConversation,
        [id]: loaded,
      },
    }));
  },

  deleteChat: async (id) => {
    const uid = getCurrentUserId();
    await conversationApi.remove(id, uid);

    const remaining = get().conversations.filter((c) => c.id !== id);
    const nextMap = { ...get().messagesByConversation };
    delete nextMap[id];

    if (remaining.length === 0) {
      const fresh = makeInitialConversation();
      if (uid !== null) {
        conversationApi.saveConversations([fresh], uid);
        conversationApi.saveMessages(fresh.id, [], uid);
        try {
          localStorage.setItem(getActiveConversationKey(uid), fresh.id);
        } catch {
          // ignore
        }
      }
      set({
        conversations: [fresh],
        activeConversationId: fresh.id,
        messagesByConversation: { [fresh.id]: [] },
      });
      return;
    }

    const wasActive = get().activeConversationId === id;
    const nextActiveId = wasActive ? remaining[0].id : get().activeConversationId;

    if (wasActive && uid !== null) {
      try {
        localStorage.setItem(getActiveConversationKey(uid), nextActiveId);
      } catch {
        // ignore
      }
    }

    if (wasActive && !nextMap[nextActiveId]) {
      nextMap[nextActiveId] = await conversationApi.getMessages(nextActiveId, uid);
    }

    set({
      conversations: remaining,
      activeConversationId: nextActiveId,
      messagesByConversation: nextMap,
    });
  },

  renameChat: (id, newTitle) => {
    const uid = getCurrentUserId();
    const cleaned = newTitle.trim() || 'Untitled Chat';
    const now = new Date().toISOString();
    const updated = get().conversations.map((c) =>
      c.id === id ? { ...c, title: cleaned, updatedAt: now } : c
    );
    set({ conversations: updated });
    if (uid !== null) {
      conversationApi.saveConversations(updated, uid);
    }
  },

  clearCurrentChat: () => {
    const uid = getCurrentUserId();
    const activeId = get().activeConversationId;
    if (!activeId) return;

    const now = new Date().toISOString();
    const updatedConversations = get().conversations.map((c) =>
      c.id === activeId ? { ...c, updatedAt: now } : c
    );

    set((state) => ({
      conversations: updatedConversations,
      messagesByConversation: {
        ...state.messagesByConversation,
        [activeId]: [],
      },
    }));

    if (uid !== null) {
      conversationApi.saveMessages(activeId, [], uid);
      conversationApi.saveConversations(updatedConversations, uid);
    }
  },

  appendMessage: (conversationId, message, { persist = true } = {}) => {
    const uid = getCurrentUserId();
    const existing = get().messagesByConversation[conversationId] || [];
    const nextMessages = [...existing, message];
    const now = new Date().toISOString();

    const updatedConversations = get().conversations.map((c) => {
      if (c.id !== conversationId) return c;
      let nextTitle = c.title;
      if (
        existing.length === 0 &&
        message.messageType === 'USER' &&
        (c.title === 'New Conversation' || c.title === 'New Chat')
      ) {
        const text = message.content || '';
        nextTitle = text.slice(0, 36) + (text.length > 36 ? '...' : '');
      }
      return { ...c, title: nextTitle, updatedAt: now };
    });

    set((state) => ({
      conversations: updatedConversations,
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: nextMessages,
      },
    }));

    if (persist && uid !== null) {
      conversationApi.saveMessages(conversationId, nextMessages, uid);
      conversationApi.saveConversations(updatedConversations, uid);
    }
  },

  updateMessage: (conversationId, messageId, updater, { persist = true } = {}) => {
    const uid = getCurrentUserId();
    const existing = get().messagesByConversation[conversationId] || [];
    const nextMessages = existing.map((m) =>
      m.id === messageId ? (typeof updater === 'function' ? updater(m) : { ...m, ...updater }) : m
    );
    const now = new Date().toISOString();
    const updatedConversations = persist
      ? get().conversations.map((c) =>
          c.id === conversationId ? { ...c, updatedAt: now } : c
        )
      : get().conversations;

    set((state) => ({
      conversations: updatedConversations,
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: nextMessages,
      },
    }));

    if (persist && uid !== null) {
      conversationApi.saveMessages(conversationId, nextMessages, uid);
      conversationApi.saveConversations(updatedConversations, uid);
    }
  },

  stopGenerating: () => {
    const ctrl = get()._abortController;
    if (ctrl) {
      ctrl.abort();
      set({ _abortController: null });
    }
  },

  sendMessage: async (text) => {
    if (!text || !text.trim() || get().isSending) return;

    const trimmed = text.trim();
    let conversationId = get().activeConversationId;
    if (!conversationId) {
      conversationId = get().newChat();
    }

    const userMsgId = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();
    const now = new Date().toISOString();

    const userMessage = {
      id: userMsgId,
      messageType: 'USER',
      content: trimmed,
      createdAt: now,
    };

    const initialBotMessage = {
      id: assistantMsgId,
      messageType: 'ASSISTANT',
      content: '',
      isStreaming: true,
      citations: [],
      responseTimeMs: null,
      createdAt: now,
    };

    get().appendMessage(conversationId, userMessage, { persist: true });
    get().appendMessage(conversationId, initialBotMessage, { persist: false });

    const { chatMode, selectedDocument } = useDocumentStore.getState();
    const useDocs = chatMode !== 'general';
    const docId = chatMode === 'document' && selectedDocument ? selectedDocument.id : null;
    const startTime = Date.now();

    const controller = new AbortController();
    set({ isSending: true, _abortController: controller });

    let citationsPromise = null;
    if (useDocs) {
      citationsPromise = chatApi
        .searchSimilarity({
          query: trimmed,
          documentId: docId,
          topK: 5,
          similaritySearch: 0.50,
        })
        .catch(() => null);
    }

    try {
      if (get().streamTokens) {
        let currentText = '';
        try {
          await chatApi.stream(
            {
              question: trimmed,
              documentId: docId,
              conversationId,
              useDocuments: useDocs,
            },
            (_delta, accumulated) => {
              currentText = accumulated;
              get().updateMessage(
                conversationId,
                assistantMsgId,
                { content: accumulated },
                { persist: false }
              );
            },
            controller.signal
          );
        } catch (streamErr) {
          if (controller.signal.aborted || streamErr?.status === 401) {
            throw streamErr;
          }
          // Fallback to non-streaming /chat/query for non-auth stream errors
          const result = await chatApi.query({
            question: trimmed,
            documentId: docId,
            conversationId,
            useDocuments: useDocs,
          });
          currentText = result?.answer || 'No response returned from the model.';
          if (result?.citations?.length > 0) {
            citationsPromise = Promise.resolve({ matches: result.citations });
          }
        }

        let citations = [];
        if (citationsPromise) {
          try {
            const searchRes = await citationsPromise;
            citations = searchRes?.matches || [];
          } catch {
            // ignore citation failure
          }
        }

        const totalDuration = Date.now() - startTime;
        get().updateMessage(
          conversationId,
          assistantMsgId,
          (m) => ({
            ...m,
            content: currentText || 'Received response.',
            citations: citations.length > 0 ? citations : m.citations,
            isStreaming: false,
            responseTimeMs: totalDuration,
          }),
          { persist: true }
        );
      } else {
        const result = await chatApi.query({
          question: trimmed,
          documentId: docId,
          conversationId,
          useDocuments: useDocs,
        });

        const totalDuration = result?.responseTimeMs || Date.now() - startTime;
        get().updateMessage(
          conversationId,
          assistantMsgId,
          {
            content: result?.answer || 'No response returned from the model.',
            citations: result?.citations || [],
            responseTimeMs: totalDuration,
            isStreaming: false,
          },
          { persist: true }
        );
      }
    } catch (err) {
      if (err?.status === 401 || err?.response?.status === 401) {
        // 401 handler in api.js logs out and redirects to /login
        return;
      }

      if (err.name === 'AbortError' || controller.signal.aborted) {
        const totalDuration = Date.now() - startTime;
        get().updateMessage(
          conversationId,
          assistantMsgId,
          {
            isStreaming: false,
            responseTimeMs: totalDuration,
          },
          { persist: true }
        );
      } else {
        const totalDuration = Date.now() - startTime;
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to get a response from the backend.';
        toast.error(errorMsg);

        get().updateMessage(
          conversationId,
          assistantMsgId,
          {
            content: errorMsg,
            isStreaming: false,
            responseTimeMs: totalDuration,
          },
          { persist: true }
        );
      }
    } finally {
      set({ isSending: false, _abortController: null });
    }
  },

  reset: () => {
    const ctrl = get()._abortController;
    if (ctrl) {
      try {
        ctrl.abort();
      } catch {
        // ignore
      }
    }
    set({
      conversations: [],
      activeConversationId: null,
      messagesByConversation: {},
      isSending: false,
      streamTokens: true,
      _abortController: null,
      _loadedForUserId: null,
    });
  },
}));
