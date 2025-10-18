// src/hooks/useUser.ts (New File)

import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FullUserProfile, UpdateUserProfileData, UserResponse } from '@/lib/user/types';
import { useEtharisStore } from '@/lib/store'; // Menggunakan store Zustand untuk status
import toast from 'react-hot-toast'; 

// --- Query Key ---
const USER_QUERY_KEY = ['userProfile'];

// --- Service Functions ---

const fetchProfile = async (): Promise<FullUserProfile> => {
    // GET /user/profile - Otentikasi dilakukan via token di header
    const response = await api.get('/user/profile');
    return response.data.data; // Asumsi backend mengembalikan { data: profile }
};

const updateProfile = async (data: UpdateUserProfileData): Promise<FullUserProfile> => {
    // POST /user/profile - Otentikasi dilakukan via token di header
    const response = await api.post('/user/profile', data);
    return response.data.data; // Asumsi backend mengembalikan { data: updatedProfile }
};

// --- Custom Hooks ---

/**
 * Hook untuk mengambil data profil pengguna (GET /user/profile).
 * Menggunakan useQuery.
 */
export const useGetProfile = (): UseQueryResult<FullUserProfile, Error> => {
    const { isAuthenticated } = useEtharisStore(); 
    const queryClient = useQueryClient();

    return useQuery<FullUserProfile, Error>({
        queryKey: USER_QUERY_KEY,
        queryFn: fetchProfile,
        // Hanya fetch jika pengguna terotentikasi
        enabled: isAuthenticated, 
        // Waktu cache: data ini tidak perlu di-fetch ulang terlalu sering
        staleTime: 1000 * 60 * 5, 
    });
};

/**
 * Hook untuk memperbarui data profil pengguna (POST /user/profile).
 * Menggunakan useMutation.
 */
export const useUpdateProfile = (): UseMutationResult<FullUserProfile, any, UpdateUserProfileData> => {
    const queryClient = useQueryClient();
    const { login } = useEtharisStore(); // Gunakan action login untuk update global state

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (updatedProfile) => {
            // 1. Invalidate cache lama untuk memaksa refresh di useGetProfile
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
            
            // 2. Update state global Zustand
            // Di sini kita berasumsi updatedProfile memiliki semua field UserProfile yang dibutuhkan
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