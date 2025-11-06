import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FullUserProfile } from './user/types';

interface EtharisStore {
    isAuthenticated: boolean;
    user: FullUserProfile | null;

    login: (profile: FullUserProfile, token: string) => void;
    profileInfo: (profile: FullUserProfile) => void
    logout: () => void;
}


export const useEtharisStore = create(
    persist<EtharisStore>(
        (set) => ({
            isAuthenticated: false,
            user: null,

            login: (profile: FullUserProfile, token) => {
                set({
                    isAuthenticated: true,
                    user: profile
                });
            },

            profileInfo: (profile: FullUserProfile) => {
                set({
                    isAuthenticated: true,
                    user: profile
                });
            },

            logout: () => {
                localStorage.removeItem('etharis_token');
                localStorage.removeItem('refresh_etharis_token');
                set({ isAuthenticated: false, user: null });
            },
        }),
        {
            name: 'etharis-auth-storage',
            storage: createJSONStorage(() => localStorage)
        }
    )
);
