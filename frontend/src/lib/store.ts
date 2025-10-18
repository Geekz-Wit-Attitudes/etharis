// src/lib/store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from './auth/types'; // Asumsi auth-types sudah ada

interface UserBalance {
    current: number; // Current available balance (in IDR)
    totalEarned: number; // Only relevant for Creator (Lifetime earnings)
    totalLocked: number; // Sum of all active/pending deal amounts
}

interface EtharisStore {
    // Authentication & Profile State
    isAuthenticated: boolean;
    user: UserProfile | null;
    
    // Financial State
    balance: UserBalance;

    // Actions
    login: (profile: UserProfile, token: string) => void;
    logout: () => void;
    setBalance: (update: Partial<UserBalance>) => void;
}

const initialBalance: UserBalance = { current: 0, totalEarned: 0, totalLocked: 0 };

export const useEtharisStore = create(
    persist<EtharisStore>(
        (set) => ({
            // Initial State
            isAuthenticated: false,
            user: null,
            balance: initialBalance,

            // Actions
            login: (profile, token) => {
                // Simpan token di local storage (dilakukan di hook Tanstack)
                // Di sini kita hanya update state profile
                set({
                    isAuthenticated: true,
                    user: profile,
                    // Di aplikasi nyata, kita akan panggil API untuk mendapatkan balance
                    balance: initialBalance // Reset atau ambil dari profile
                });
            },
            logout: () => {
                localStorage.removeItem('auth_token');
                set({ isAuthenticated: false, user: null, balance: initialBalance });
            },
            
            setBalance: (update) => set((state) => ({ balance: { ...state.balance, ...update } })),
        }),
        {
            name: 'etharis-auth-storage', // key di localStorage
            storage: createJSONStorage(() => localStorage), // gunakan localStorage
            // partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);