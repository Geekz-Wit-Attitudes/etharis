// src/lib/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiLogin, apiSignup } from './api/auth';

// --- Interfaces ---

export type UserRole = 'brand' | 'creator' | null;

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    walletAddress: string; // Custodial wallet address for transparency
}

export type DealStatus = 'PENDING' | 'ACTIVE' | 'PENDING_REVIEW' | 'DISPUTED' | 'PAID' | 'FAILED' | 'CANCELLED';

interface Deal {
    id: string; // Local/Database ID (cuid())
    contractId: string; // Smart Contract ID (ETHR-001)
    brandId: string; // Database ID of Brand
    creatorId: string; // Database ID of Creator
    partnerName: string; // Name of the counterparty (Brand/Creator)
    amount: string; // Amount in IDR (e.g., '500000')
    platform: string;
    status: DealStatus;
    deadline: string; // ISO string
}

interface UserBalance {
    current: number; // Current available balance (in IDR)
    totalEarned: number; // Only relevant for Creator (Lifetime earnings)
    totalLocked: number; // Sum of all active/pending deal amounts
}


// --- Store Interface ---

interface EtharisStore {
    // Authentication & Profile State
    isAuthenticated: boolean;
    user: UserProfile | null;
    token: string | null; // NEW: JWT token state
    isLoading: boolean; // NEW: Global loading state
    
    // Financial State (Balance)
    balance: UserBalance;

    // Deal State
    deals: Deal[];

    // --- ASYNC ACTIONS (API READY) ---
    loginAsync: (email: string, password: string) => Promise<void>;
    signupAsync: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
    logout: () => void;

    // --- SYNCHRONOUS ACTIONS ---
    setBalance: (update: Partial<UserBalance>) => void;
    addDeal: (deal: Deal) => void;
    updateDeal: (dealId: string, updates: Partial<Deal>) => void;
    
    // Mock for demo purposes
    loadMockData: () => void;
}

// --- Mock Data ---
export const MOCK_USER_BRAND: UserProfile = {
    id: 'user-001-brand',
    name: 'Budi Santoso (Brand)',
    email: 'budi@etharis.id',
    role: 'brand',
    walletAddress: '0x132318...E1FF76'
};
export const MOCK_BALANCE_BRAND: UserBalance = {
    current: 1250000,
    totalEarned: 0,
    totalLocked: 3000000,
};
export const MOCK_DEALS_BRAND: Deal[] = [
    { id: '1', contractId: 'ETHR-001', brandId: 'user-001-brand', creatorId: 'user-002-creator', partnerName: 'Sari Foodie', amount: '500000', platform: 'Instagram', status: 'PENDING_REVIEW', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '2', contractId: 'ETHR-002', brandId: 'user-001-brand', creatorId: 'user-003-creator', partnerName: 'Travel ID', amount: '1500000', platform: 'YouTube', status: 'PAID', deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '3', contractId: 'ETHR-003', brandId: 'user-001-brand', creatorId: 'user-004-creator', partnerName: 'Gadget Man', amount: '2500000', platform: 'TikTok', status: 'DISPUTED', deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() },
];

export const MOCK_USER_CREATOR: UserProfile = {
    id: 'user-002-creator',
    name: 'Sari Foodie (Creator)',
    email: 'sari@etharis.id',
    role: 'creator',
    walletAddress: '0x213218...E1FF77'
};
export const MOCK_BALANCE_CREATOR: UserBalance = {
    current: 5500000,
    totalEarned: 12500000,
    totalLocked: 500000,
};
export const MOCK_DEALS_CREATOR: Deal[] = [
    { id: '101', contractId: 'ETHR-001', brandId: 'user-001-brand', creatorId: 'user-002-creator', partnerName: 'Kopi Nusantara', amount: '500000', platform: 'Instagram', status: 'PENDING_REVIEW', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '102', contractId: 'ETHR-004', brandId: 'user-005-brand', creatorId: 'user-002-creator', partnerName: 'Fashion Brand', amount: '2000000', platform: 'YouTube', status: 'PAID', deadline: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
];


// --- Zustand Store ---

export const useEtharisStore = create(
    persist<EtharisStore>(
        (set, get) => ({
            // Initial State
            isAuthenticated: false,
            user: null,
            balance: { current: 0, totalEarned: 0, totalLocked: 0 },
            token: "",
            isLoading: false,
            deals: [],

            // --- ASYNC ACTIONS ---
            loginAsync: async (email, password) => {
                set({ isLoading: true });
                try {
                    const response = await apiLogin(email, password);
                    
                    // In a real app, you'd fetch deals using the token:
                    // const deals = await apiFetchDeals(response.token, response.user.role);

                    set({
                        isAuthenticated: true,
                        user: response.user,
                        token: response.token,
                        balance: response.balance,
                        // deals: deals,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error; // Re-throw the error for component to display
                }
            },

            signupAsync: async (name, email, password, role) => {
                set({ isLoading: true });
                try {
                    const response = await apiSignup(name, email, password, role);
                    
                    // Immediately log user in after successful signup
                    set({
                        isAuthenticated: true,
                        user: response.user,
                        token: response.token,
                        balance: response.balance,
                        deals: [],
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => set({ 
                isAuthenticated: false, 
                user: null, 
                token: null,
                deals: [], 
                balance: { current: 0, totalEarned: 0, totalLocked: 0 } 
            }),

            // --- SYNCHRONOUS ACTIONS ---
            setBalance: (update) => set((state) => ({ balance: { ...state.balance, ...update } })),
            addDeal: (deal) => set((state) => ({ deals: [deal, ...state.deals] })),
            
            updateDeal: (dealId, updates) => set((state) => ({
                deals: state.deals.map(d => d.id === dealId ? { ...d, ...updates } : d)
            })),
            
            loadMockData: () => set({ 
                user: MOCK_USER_BRAND, 
                isAuthenticated: true,
                deals: MOCK_DEALS_BRAND,
                balance: MOCK_BALANCE_BRAND,
            }),
        }),
        {
            name: 'etharis-storage', // key in localStorage
            storage: createJSONStorage(() => localStorage), // use localStorage
            // partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);