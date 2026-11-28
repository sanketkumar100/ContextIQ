import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/authApi';
import { registerAuthHandlers, resetUnauthorizedFlag } from '../services/api';
import { clearUserStorageKeys } from '../services/conversationApi';
import { useDocumentStore } from './documentStore';
import { useConversationStore } from './conversationStore';
import { useUiStore } from './uiStore';

const LEGACY_KEYS = [
  'contextiq_chat_sessions_v1',
  'contextiq_active_session_v1',
  'contextiq_stream_tokens_v1',
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const data = await authApi.login(username, password);
          resetUnauthorizedFlag();
          set({
            user: data.user,
            token: data.accessToken,
            isLoading: false,
          });
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true });
        try {
          const userDto = await authApi.register(username, email, password);
          set({ isLoading: false });
          return userDto;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        const userId = get().user?.id;

        if (userId !== undefined && userId !== null) {
          clearUserStorageKeys(userId);
        }

        LEGACY_KEYS.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch {
            // ignore
          }
        });

        set({ user: null, token: null, isLoading: false });

        useDocumentStore.getState().reset();
        useConversationStore.getState().reset();
        useUiStore.getState().resetModals();
      },
    }),
    {
      name: 'docmind-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Wire authStore into api.js interceptors without circular module imports
registerAuthHandlers({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().logout(),
});
