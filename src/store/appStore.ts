import { create } from 'zustand';

type AppState = {
  lastInfoMessage: string | null;
  setInfoMessage: (message: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  lastInfoMessage: null,
  setInfoMessage: (message) => set({ lastInfoMessage: message }),
}));
