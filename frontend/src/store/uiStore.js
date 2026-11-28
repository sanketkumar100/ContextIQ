import { create } from 'zustand';

const STORAGE_KEY_THEME = 'contextiq_theme_v1';

const getInitialTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  } catch {
    return 'dark';
  }
};

const applyThemeToDom = (theme) => {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const initialTheme = getInitialTheme();
applyThemeToDom(initialTheme);

export const useUiStore = create((set, get) => ({
  theme: initialTheme,
  sidebarTab: 'documents', // 'documents' | 'chats'
  isSidebarOpen: true,
  isUploading: false,
  isSearching: false,
  isChatDrawerOpen: false,

  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setIsSidebarOpen: (open) =>
    set((state) => ({
      isSidebarOpen: typeof open === 'function' ? open(state.isSidebarOpen) : open,
    })),
  setIsUploading: (open) => set({ isUploading: open }),
  setIsSearching: (open) =>
    set((state) => ({
      isSearching: typeof open === 'function' ? open(state.isSearching) : open,
    })),
  setIsChatDrawerOpen: (open) =>
    set((state) => ({
      isChatDrawerOpen: typeof open === 'function' ? open(state.isChatDrawerOpen) : open,
    })),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY_THEME, next);
    } catch {
      // ignore
    }
    applyThemeToDom(next);
    set({ theme: next });
  },

  resetModals: () =>
    set({
      sidebarTab: 'documents',
      isUploading: false,
      isSearching: false,
      isChatDrawerOpen: false,
    }),
}));
