import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { FullUserProfile, UpdateUserProfileData } from '@/lib/user/types';
import { useEtharisStore } from '@/lib/store'; 
import toast from 'react-hot-toast'; 
import { fetchProfile, updateProfile } from '@/lib/user/services';

const USER_QUERY_KEY = ['userProfile'];

export const useGetProfile = (): UseQueryResult<FullUserProfile, Error> => {
    const { isAuthenticated, user } = useEtharisStore(); 
    const isReady = isAuthenticated && !!user; 

    return useQuery<FullUserProfile, Error>({
        queryKey: USER_QUERY_KEY,
        queryFn: fetchProfile,
        enabled: isReady, 
        staleTime: 1000 * 60 * 5
    });
};

export const useUpdateProfile = (): UseMutationResult<FullUserProfile, any, UpdateUserProfileData> => {
    const queryClient = useQueryClient();
    const { login } = useEtharisStore();

    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (updatedProfile) => {
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
            
            const currentToken = localStorage.getItem('etharis_token') || '';
            login(updatedProfile, currentToken); 

            toast.success('Profile successfully updated!');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update profile.';
            toast.error(message);
        },
    });
};