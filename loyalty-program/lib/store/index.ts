import { create } from "zustand";
import { WalletSession, UserStats, Badge } from "../types";

interface AuthStore {
  session: WalletSession | null;
  setSession: (session: WalletSession) => void;
  clearSession: () => void;
}

interface UserStore {
  stats: UserStats | null;
  badges: Badge[];
  setStats: (stats: UserStats) => void;
  setBadges: (badges: Badge[]) => void;
  updateStats: (updates: Partial<UserStats>) => void;
}

interface AdminStore {
  selectedBadgeId: string | null;
  selectedPrizeId: string | null;
  setSelectedBadgeId: (id: string | null) => void;
  setSelectedPrizeId: (id: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));

export const useUserStore = create<UserStore>((set) => ({
  stats: null,
  badges: [],
  setStats: (stats) => set({ stats }),
  setBadges: (badges) => set({ badges }),
  updateStats: (updates) =>
    set((state) => ({
      stats: state.stats ? { ...state.stats, ...updates } : null,
    })),
}));

export const useAdminStore = create<AdminStore>((set) => ({
  selectedBadgeId: null,
  selectedPrizeId: null,
  setSelectedBadgeId: (id) => set({ selectedBadgeId: id }),
  setSelectedPrizeId: (id) => set({ selectedPrizeId: id }),
}));
