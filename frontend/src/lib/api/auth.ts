// src/lib/api.ts

import { UserProfile, UserRole } from '../store';

// Mock API response types
interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        walletAddress: string;
    };
    balance: {
        current: number;
        totalEarned: number;
        totalLocked: number;
    };
}

/**
 * Mocks the API call to log the user in.
 * In a real application, this would be an actual HTTP request.
 */
export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    // --- Mock Authentication Logic ---
    if (password !== 'password123') {
        throw new Error('Invalid email or password.');
    }

    let userProfile: UserProfile;
    let userBalance = { current: 1250000, totalEarned: 0, totalLocked: 3000000 };

    if (email === 'brand@etharis.id') {
        userProfile = {
            id: 'user-001-brand',
            name: 'Budi Santoso (Brand)',
            email: 'brand@etharis.id',
            role: 'brand',
            walletAddress: '0x132318...E1FF76',
        };
    } else if (email === 'creator@etharis.id') {
        userProfile = {
            id: 'user-002-creator',
            name: 'Sari Foodie (Creator)',
            email: 'creator@etharis.id',
            role: 'creator',
            walletAddress: '0x213218...E1FF77',
        };
        userBalance = { current: 5500000, totalEarned: 12500000, totalLocked: 500000 };
    } else {
        throw new Error('User not found. Try brand@etharis.id or creator@etharis.id.');
    }

    return {
        token: `mock-jwt-token-${userProfile.id}-${Date.now()}`,
        user: userProfile,
        balance: userBalance,
    };
}

/**
 * Mocks the API call for user registration.
 */
export async function apiSignup(name: string, email: string, password: string, role: UserRole): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple mock check
    if (email.includes('taken')) {
        throw new Error('Email already registered.');
    }

    const newUserProfile: UserProfile = {
        id: `user-${Date.now()}`,
        name: name,
        email: email,
        role: role,
        walletAddress: `0xNewUser...${Math.random().toString(16).slice(2, 6)}`,
    };

    return {
        token: `mock-jwt-token-new-${Date.now()}`,
        user: newUserProfile,
        balance: { current: 0, totalEarned: 0, totalLocked: 0 },
    };
}