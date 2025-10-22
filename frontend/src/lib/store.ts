// src/lib/store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from './auth/types'; // Asumsi auth-types sudah ada
import { FullUserProfile } from './user/types';

// --- UPDATED INTERFACE FOR UserBalance ---
// Menghapus 'totalEarned' dan 'totalLocked' dari store karena ini lebih baik dihitung
// real-time di Dashboard menggunakan useDealsQuery.
interface UserBalance {
    current: number; // Current available balance (in IDR)
}

// --- UPDATED INTERFACE FOR EtharisStore ---
interface EtharisStore {
    // Authentication & Profile State
    isAuthenticated: boolean;
    user: FullUserProfile | null;
    
    // Financial State (Hanya saldo saat ini)
    balance: UserBalance;

    // Actions
    login: (profile: FullUserProfile, token: string) => void;
    profileInfo: (profile: FullUserProfile) => void
    logout: () => void;
    
    // Action spesifik untuk update saldo (dipanggil setelah Minting atau penarikan)
    setCurrentBalance: (amount: number) => void; 
}

const initialBalance: UserBalance = { current: 0 };

export const useEtharisStore = create(
    persist<EtharisStore>(
        (set) => ({
            // Initial State
            isAuthenticated: false,
            user: null,
            balance: initialBalance,

            // Actions
            login: (profile: FullUserProfile, token) => {
                // Asumsi: Profile dari API Login sekarang MUNGKIN membawa saldo awal.
                // Jika tidak, saldo tetap 0, dan akan di-fetch oleh hook lain.
                // const initialCurrentBalance = profile.wallet?.balance || 0; 
                const initialCurrentBalance = 0; 

                set({
                    isAuthenticated: true,
                    user: profile,
                    balance: { current: initialCurrentBalance }
                });
            },

            profileInfo: (profile: FullUserProfile) => {
                set({
                    isAuthenticated: true,
                    user: profile,
                    balance: { current: Number(profile.wallet.balance) }
                });
            },
            
            logout: () => {
                // Pastikan token dihapus di sini
                localStorage.removeItem('etharis_token');
                localStorage.removeItem('refresh_etharis_token');
                set({ isAuthenticated: false, user: null, balance: initialBalance });
            },
            
            // New dedicated action to update the current available balance
            setCurrentBalance: (amount) => set((state) => ({ balance: { ...state.balance, current: amount } })),
        }),
        {
            name: 'etharis-auth-storage', // key di localStorage
            storage: createJSONStorage(() => localStorage), // gunakan localStorage
            // Kita menyimpan user dan status auth untuk persistensi sesi
            // Menghapus 'balance' dari persistensi jika Anda lebih memilih mengambilnya secara real-time.
            // partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
