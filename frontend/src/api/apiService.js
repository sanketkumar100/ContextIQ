import axios from 'axios';

// Base API URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Direct backend stream URL for local development (avoids dev proxy buffering)
const getStreamUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${import.meta.env.VITE_API_BASE_URL}/chat/stream`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return `http://${window.location.hostname}:8081/api/v1/chat/stream`;
  }
  return `${API_BASE}/chat/stream`;
};

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Document Management
  async getDocuments() {
    const response = await apiClient.get('/documents');
    return response.data?.data || [];
  },

  async getDocumentById(id) {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data?.data;
  },

  async uploadDocument(file, onUploadProgress) {
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
    return response.data;
  },

  async uploadMultipleDocuments(files, onUploadProgress) {
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
    return response.data;
  },

  async deleteDocument(id) {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  // Chat & Q&A
  async askQuestion({ question, documentId, topK = 5, minSimilarity = 0.0, conversationId, useDocuments = true }) {
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

  // Streaming Q&A via SSE with smooth token-by-token pacing
  async streamQuestion({ question, documentId, topK = 5, minSimilarity = 0.0, conversationId, useDocuments = true }, onChunk, signal) {
    const payload = {
      question,
      documentId: documentId || null,
      topK: Number(topK) || 5,
      minSimilarity: Number(minSimilarity) || 0.0,
      conversationId: conversationId || null,
      useDocuments: useDocuments !== false,
    };

    let streamUrl = getStreamUrl();
    let response;
    try {
      response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, text/plain, */*',
        },
        body: JSON.stringify(payload),
        signal,
      });
      if (!response.ok && streamUrl !== `${API_BASE}/chat/stream`) {
        throw new Error(`Direct connection status ${response.status}`);
      }
    } catch (e) {
      if (signal?.aborted) throw e;
      streamUrl = `${API_BASE}/chat/stream`;
      response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, text/plain, */*',
        },
        body: JSON.stringify(payload),
        signal,
      });
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Stream error: ${response.status} ${errText || response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is not readable for streaming.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';
    let isSseMode = null;
    let sseBuffer = '';
    const tokenQueue = [];
    let isNetworkDone = false;
    let networkError = null;

    // Background reader: extracts tokens from stream and pushes into tokenQueue
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
                } catch {}

                if (tok !== undefined && tok !== null && tok !== '') {
                  tokenQueue.push(tok);
                }
              } else {
                tokenQueue.push(line);
              }
            }
          } else {
            // Direct chunked text
            tokenQueue.push(chunkText);
          }
        }

        // Flush leftover buffer
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
            } catch {}
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

    // Foreground consumer: delivers tokens smoothly to the UI and yields to the browser
    try {
      while (!isNetworkDone || tokenQueue.length > 0) {
        if (signal?.aborted) {
          try { reader.cancel(); } catch {}
          break;
        }

        if (tokenQueue.length > 0) {
          const tok = tokenQueue.shift();
          accumulated += tok;
          if (onChunk) onChunk(tok, accumulated);

          // Pacing delay dynamically adapts to prevent lag while ensuring tokens visibly animate
          const delay = isNetworkDone
            ? (tokenQueue.length > 10 ? 2 : 6)
            : (tokenQueue.length > 15 ? 4 : (tokenQueue.length > 5 ? 10 : 18));
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

  // Semantic Similarity Search
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

  // Get Document Chunks (with fallback)
  async getDocumentChunks(documentId, fileName = 'document') {
    try {
      // First attempt backend specific endpoint if exists
      const response = await apiClient.get(`/documents/${documentId}/chunks`);
      if (response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback: use semantic search to fetch chunks of this document
      try {
        const searchRes = await apiClient.post('/chat/search/similarity', {
          query: fileName || 'content overview details',
          documentId,
          topK: 50,
          similaritySearch: 0.0,
        });
        if (searchRes.data?.data?.matches?.length > 0) {
          return searchRes.data.data.matches;
        }
      } catch (err) {
        console.warn('Could not fetch chunks via similarity search:', err);
      }
    }
    return [];
  },
};

export default apiService;
