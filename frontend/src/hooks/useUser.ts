// src/hooks/useUser.ts

import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FullUserProfile, UpdateUserProfileData } from '@/lib/user/types';
import { useEtharisStore } from '@/lib/store'; 
import toast from 'react-hot-toast'; 
import { fetchProfile, updateProfile } from '@/lib/user/services';

// --- Query Key ---
const USER_QUERY_KEY = ['userProfile'];

/**
 * Hook untuk mengambil data profil pengguna (GET /user/profile).
 */
export const useGetProfile = (): UseQueryResult<FullUserProfile, Error> => {
    const { isAuthenticated, user } = useEtharisStore(); 
    // Siap jika pengguna terotentikasi dan objek user ada
    const isReady = isAuthenticated && !!user; 

    return useQuery<FullUserProfile, Error>({
        queryKey: USER_QUERY_KEY,
        queryFn: fetchProfile,
        enabled: isReady, // Hanya fetch jika isReady
        staleTime: 1000 * 60 * 5, // Cache selama 5 menit
    });
};

/**
 * Hook untuk memperbarui data profil pengguna (POST /user/profile).
 */
export const useUpdateProfile = (): UseMutationResult<FullUserProfile, any, UpdateUserProfileData> => {
    const queryClient = useQueryClient();
    const { login } = useEtharisStore(); // Gunakan action login untuk update global state

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (updatedProfile) => {
            // 1. Invalidate cache agar useGetProfile me-refetch data baru
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
            
            // 2. Update global state Zustand (User Profile)
            // Ambil token lama dan panggil action login untuk update profile di state
            const currentToken = localStorage.getItem('auth_token') || '';
            login(updatedProfile, currentToken); 

            toast.success('Profile successfully updated!');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update profile.';
            toast.error(message);
        },
    });
};