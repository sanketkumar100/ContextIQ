import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Auth bridge registered by authStore to avoid circular imports.
let authHandlers = {
  getToken: () => {
    try {
      const raw = localStorage.getItem('docmind-auth');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state?.token || null;
    } catch {
      return null;
    }
  },
  onUnauthorized: () => {},
};

let isHandlingUnauthorized = false;

export const registerAuthHandlers = (handlers) => {
  authHandlers = { ...authHandlers, ...handlers };
};

export const resetUnauthorizedFlag = () => {
  isHandlingUnauthorized = false;
};

export const handleUnauthorized = () => {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  try {
    authHandlers.onUnauthorized?.();
  } catch {
    // ignore cleanup errors
  }

  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/register') {
      window.location.replace('/login');
    }
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isAuthRoute = (url = '') =>
  url.includes('/auth/login') || url.includes('/auth/register');

apiClient.interceptors.request.use(
  (config) => {
    if (!isAuthRoute(config.url)) {
      const token = authHandlers.getToken?.();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    if (status === 401 && !isAuthRoute(url)) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const documentApi = {
  // Current logged-in user's documents only (GET /api/v1/documents/user)
  async getMine() {
    const response = await apiClient.get('/documents/user');
    return response.data?.data ?? [];
  },

  // ADMIN-only list of all documents across users (never call as default list)
  async getAll() {
    const response = await apiClient.get('/documents');
    return response.data?.data ?? [];
  },

  async getById(id) {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data?.data;
  },

  async upload(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data?.data;
  },

  async uploadMultiple(files, onUploadProgress) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    const response = await apiClient.post('/documents/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data?.data ?? [];
  },

  async remove(id) {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  async getChunks(documentId, fileName = 'document') {
    try {
      const response = await apiClient.get(`/documents/${documentId}/chunks`);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (err) {
      if (err?.response?.status === 401) throw err;
      // Fallback: use similarity search scoped to this document
      const searchRes = await apiClient.post('/chat/search/similarity', {
        query: fileName || 'content overview details',
        documentId,
        topK: 50,
        similaritySearch: 0.0,
      });
      if (searchRes.data?.data?.matches?.length > 0) {
        return searchRes.data.data.matches;
      }
    }
    return [];
  },
};

/**
 * Authenticated streaming fetch helper.
 * Uses raw fetch solely to read the chunked/SSE response body while attaching
 * the Bearer token from authStore and handling 401 responses consistently.
 */
export async function fetchAuthorizedStream(path, payload, signal) {
  const token = authHandlers.getToken?.();
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream, text/plain, */*',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  if (response.status === 401) {
    handleUnauthorized();
    const unauthorizedError = new Error('Session expired. Please sign in again.');
    unauthorizedError.status = 401;
    throw unauthorizedError;
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    const httpError = new Error(`Stream error: ${response.status} ${errText || response.statusText}`);
    httpError.status = response.status;
    throw httpError;
  }

  if (!response.body) {
    throw new Error('Response body is not readable for streaming.');
  }

  return response;
}

export const chatApi = {
  async query({ question, documentId, topK = 5, minSimilarity = 0.0, conversationId, useDocuments = true }) {
    const payload = {
      question,
      documentId: documentId || null,
      topK: Number(topK) || 5,
      minSimilarity: Number(minSimilarity) || 0.0,
      conversationId: conversationId || null,
      useDocuments: useDocuments !== false,
    };
    const response = await apiClient.post('/chat/query', payload);
    return response.data?.data;
  },

  async stream(
    { question, documentId, topK = 5, minSimilarity = 0.0, conversationId, useDocuments = true },
    onChunk,
    signal
  ) {
    const payload = {
      question,
      documentId: documentId || null,
      topK: Number(topK) || 5,
      minSimilarity: Number(minSimilarity) || 0.0,
      conversationId: conversationId || null,
      useDocuments: useDocuments !== false,
    };

    const response = await fetchAuthorizedStream('/chat/stream', payload, signal);

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';
    let isSseMode = null;
    let sseBuffer = '';
    const tokenQueue = [];
    let isNetworkDone = false;
    let networkError = null;

    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          if (!chunkText) continue;

          if (isSseMode === null) {
            const ct = response.headers.get('content-type') || '';
            isSseMode = ct.includes('text/event-stream') || chunkText.includes('data:');
          }

          if (isSseMode) {
            sseBuffer += chunkText;
            const lines = sseBuffer.split(/\r?\n/);
            sseBuffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(':') || trimmed.startsWith('event:')) continue;

              if (line.startsWith('data:')) {
                let p = line.slice(5);
                if (p.startsWith(' ') && (p.startsWith(' {') || p.trim() === '[DONE]')) {
                  p = p.slice(1);
                }
                if (p.trim() === '[DONE]') continue;

                let tok = p;
                try {
                  const t = p.trim();
                  if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('"') && t.endsWith('"'))) {
                    const obj = JSON.parse(t);
                    if (typeof obj === 'object' && obj !== null) {
                      tok = obj.content ?? obj.text ?? obj.chunk ?? obj.delta ?? obj.answer ?? p;
                    } else if (typeof obj === 'string') {
                      tok = obj;
                    }
                  }
                } catch {
                  // treat as plain token
                }

                if (tok !== undefined && tok !== null && tok !== '') {
                  tokenQueue.push(tok);
                }
              } else {
                tokenQueue.push(line);
              }
            }
          } else {
            // Raw chunked text (Flux<String>)
            tokenQueue.push(chunkText);
          }
        }

        if (isSseMode && sseBuffer.trim()) {
          let p = sseBuffer.startsWith('data:') ? sseBuffer.slice(5) : sseBuffer;
          if (p.startsWith(' ') && (p.startsWith(' {') || p.trim() === '[DONE]')) {
            p = p.slice(1);
          }
          if (p.trim() !== '[DONE]') {
            let tok = p;
            try {
              const t = p.trim();
              if (t.startsWith('{') && t.endsWith('}')) {
                const obj = JSON.parse(t);
                tok = obj.content ?? obj.text ?? obj.chunk ?? tok;
              }
            } catch {
              // ignore
            }
            if (tok) tokenQueue.push(tok);
          }
        }
      } catch (err) {
        networkError = err;
      } finally {
        isNetworkDone = true;
      }
    };

    const streamPromise = readStream();

    try {
      while (!isNetworkDone || tokenQueue.length > 0) {
        if (signal?.aborted) {
          try {
            reader.cancel();
          } catch {
            // ignore
          }
          break;
        }

        if (tokenQueue.length > 0) {
          const tok = tokenQueue.shift();
          accumulated += tok;
          if (onChunk) onChunk(tok, accumulated);

          const delay = isNetworkDone
            ? tokenQueue.length > 10
              ? 2
              : 6
            : tokenQueue.length > 15
            ? 4
            : tokenQueue.length > 5
            ? 10
            : 18;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
      }

      await streamPromise;
      if (networkError && !signal?.aborted && accumulated.length === 0) {
        throw networkError;
      }
    } catch (err) {
      if (err.name === 'AbortError' || signal?.aborted) {
        return accumulated;
      }
      throw err;
    }

    return accumulated;
  },

  async searchSimilarity({ query, documentId, topK = 10, similaritySearch = 0.60 }) {
    const payload = {
      query,
      documentId: documentId || null,
      topK: Number(topK) || 10,
      similaritySearch: Number(similaritySearch) || 0.60,
    };
    const response = await apiClient.post('/chat/search/similarity', payload);
    return response.data?.data;
  },
};
