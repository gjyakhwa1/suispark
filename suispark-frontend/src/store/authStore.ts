import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  wallet: string | null;
  setAuthenticated: (status: boolean, wallet?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  wallet: null,
  setAuthenticated: (status, wallet?: string | null) => set({ isAuthenticated: status, wallet }),
  logout: () => set({ isAuthenticated: false, wallet: null }),
}));