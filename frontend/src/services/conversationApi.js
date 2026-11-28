// TODO(backend): replace with real endpoint

/**
 * Conversation shape:
 * { id: string, title: string, createdAt: string, updatedAt: string, documentId?: string | null, chatMode?: string }
 *
 * Message shape:
 * { id: string, messageType: 'USER' | 'ASSISTANT' | 'SYSTEM', content: string, createdAt: string, citations?: Array, responseTimeMs?: number | null }
 */

const getCurrentUserId = (explicitUserId) => {
  if (explicitUserId !== undefined && explicitUserId !== null) {
    return explicitUserId;
  }
  try {
    const raw = localStorage.getItem('docmind-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
};

export const getConversationsKey = (userId) => `docmind:${userId}:conversations`;
export const getMessagesKey = (userId, conversationId) =>
  `docmind:${userId}:messages:${conversationId}`;
export const getActiveConversationKey = (userId) =>
  `docmind:${userId}:active_conversation`;
export const getStreamPrefKey = (userId) => `docmind:${userId}:stream_tokens`;

export const clearUserStorageKeys = (userId) => {
  if (userId === undefined || userId === null) return;
  const prefix = `docmind:${userId}:`;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

export const conversationApi = {
  async list(userId) {
    const uid = getCurrentUserId(userId);
    if (uid === null) return [];
    try {
      const raw = localStorage.getItem(getConversationsKey(uid));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async getMessages(conversationId, userId) {
    const uid = getCurrentUserId(userId);
    if (uid === null || !conversationId) return [];
    try {
      const raw = localStorage.getItem(getMessagesKey(uid, conversationId));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async remove(conversationId, userId) {
    const uid = getCurrentUserId(userId);
    if (uid === null || !conversationId) return;
    const existing = await this.list(uid);
    const updated = existing.filter((c) => c.id !== conversationId);
    localStorage.setItem(getConversationsKey(uid), JSON.stringify(updated));
    localStorage.removeItem(getMessagesKey(uid, conversationId));
  },

  // Local cache write helpers used by conversationStore until backend endpoints exist
  saveConversations(conversations, userId) {
    const uid = getCurrentUserId(userId);
    if (uid === null) return;
    try {
      localStorage.setItem(getConversationsKey(uid), JSON.stringify(conversations));
    } catch {
      // ignore storage quota errors
    }
  },

  saveMessages(conversationId, messages, userId) {
    const uid = getCurrentUserId(userId);
    if (uid === null || !conversationId) return;
    try {
      localStorage.setItem(getMessagesKey(uid, conversationId), JSON.stringify(messages));
    } catch {
      // ignore storage quota errors
    }
  },
};
