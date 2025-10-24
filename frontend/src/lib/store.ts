import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from './auth/types'; // Asumsi auth-types sudah ada
import { FullUserProfile } from './user/types';

interface UserBalance {
    current: number;
}

interface EtharisStore {
    isAuthenticated: boolean;
    user: FullUserProfile | null;
    
    balance: UserBalance;

    login: (profile: FullUserProfile, token: string) => void;
    profileInfo: (profile: FullUserProfile) => void
    logout: () => void;
    
    setCurrentBalance: (amount: number) => void; 
}

const initialBalance: UserBalance = { current: 0 };

export const useEtharisStore = create(
    persist<EtharisStore>(
        (set) => ({
            isAuthenticated: false,
            user: null,
            balance: initialBalance,

            login: (profile: FullUserProfile, token) => {
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
                localStorage.removeItem('etharis_token');
                localStorage.removeItem('refresh_etharis_token');
                set({ isAuthenticated: false, user: null, balance: initialBalance });
            },
            
            setCurrentBalance: (amount) => set((state) => ({ balance: { ...state.balance, current: amount } })),
        }),
        {
            name: 'etharis-auth-storage',
            storage: createJSONStorage(() => localStorage)
        }
    )
);
