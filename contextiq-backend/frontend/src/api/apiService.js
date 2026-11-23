import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

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

  // Streaming Q&A via SSE
  async streamQuestion({ question, documentId, topK = 5, minSimilarity = 0.0, conversationId, useDocuments = true }, onChunk, signal) {
    const payload = {
      question,
      documentId: documentId || null,
      topK: Number(topK) || 5,
      minSimilarity: Number(minSimilarity) || 0.0,
      conversationId: conversationId || null,
      useDocuments: useDocuments !== false,
    };

    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Stream error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      let text = decoder.decode(value, { stream: true });
      // Clean SSE data: prefix if present
      if (text.includes('data:')) {
        const lines = text.split('\n');
        text = lines
          .filter((line) => line.trim().startsWith('data:'))
          .map((line) => line.replace(/^data:\s?/, ''))
          .join('');
      }
      accumulated += text;
      if (onChunk && text) {
        onChunk(text, accumulated);
      }
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
