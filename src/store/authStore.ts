import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storageKeys } from '../constants/storageKeys';
import { User, UserRole } from '../types/auth';

type AuthState = {
  token: string | null;
  user: User | null;
  role: UserRole | null;
  organizationId: number | null;
  isHydrated: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      organizationId: null,
      isHydrated: false,
      setSession: (token, user) =>
        set({
          token,
          user,
          role: user.role,
          organizationId: user.organization_id,
        }),
      setUser: (user) =>
        set({
          user,
          role: user.role,
          organizationId: user.organization_id,
        }),
      clearSession: () => set({ token: null, user: null, role: null, organizationId: null }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: storageKeys.auth,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
