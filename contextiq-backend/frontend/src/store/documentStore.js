import { create } from 'zustand';
import toast from 'react-hot-toast';
import { documentApi } from '../services/api';

export const useDocumentStore = create((set, get) => ({
  documents: [],
  isLoadingDocs: false,
  selectedDocument: null,
  chatMode: 'all', // 'all' | 'document' | 'general'
  filterQuery: '',
  activeDocModal: null,

  setFilterQuery: (filterQuery) => set({ filterQuery }),
  setActiveDocModal: (activeDocModal) => set({ activeDocModal }),

  setSelectedDocument: (doc) => set({ selectedDocument: doc }),

  switchToGeneralChat: () =>
    set({
      chatMode: 'general',
      selectedDocument: null,
    }),

  switchToAllDocuments: () =>
    set({
      chatMode: 'all',
      selectedDocument: null,
    }),

  selectDocumentScope: (doc) =>
    set({
      selectedDocument: doc,
      chatMode: 'document',
    }),

  fetchDocuments: async () => {
    set({ isLoadingDocs: true });
    try {
      const docs = await documentApi.getMine();
      const safeDocs = Array.isArray(docs) ? docs : [];
      const currentSelected = get().selectedDocument;
      const stillExists = currentSelected
        ? safeDocs.find((d) => d.id === currentSelected.id) || null
        : null;

      set({
        documents: safeDocs,
        selectedDocument: stillExists,
        chatMode:
          get().chatMode === 'document' && !stillExists ? 'all' : get().chatMode,
      });
    } catch (err) {
      if (err?.response?.status !== 401) {
        const msg = err?.response?.data?.message || 'Failed to load your documents';
        toast.error(msg);
      }
      set({ documents: [] });
    } finally {
      set({ isLoadingDocs: false });
    }
  },

  deleteDocument: async (id) => {
    // Only allow deleting documents present in the user's own /documents/user list
    const ownedDoc = get().documents.find((d) => d.id === id);
    if (!ownedDoc) return;

    try {
      await documentApi.remove(id);
      toast.success(`Deleted ${ownedDoc.fileName}`);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error(err?.response?.data?.message || 'Failed to delete document');
      }
      throw err;
    }

    set((state) => {
      const isSelectedDeleted = state.selectedDocument?.id === id;
      const isModalDeleted = state.activeDocModal?.id === id;
      return {
        documents: state.documents.filter((d) => d.id !== id),
        selectedDocument: isSelectedDeleted ? null : state.selectedDocument,
        chatMode: isSelectedDeleted && state.chatMode === 'document' ? 'all' : state.chatMode,
        activeDocModal: isModalDeleted ? null : state.activeDocModal,
      };
    });
  },

  reset: () =>
    set({
      documents: [],
      isLoadingDocs: false,
      selectedDocument: null,
      chatMode: 'all',
      filterQuery: '',
      activeDocModal: null,
    }),
}));
