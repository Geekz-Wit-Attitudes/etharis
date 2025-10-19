import { api } from "../api";
import { FullUserProfile, UpdateUserProfileData } from "./types";

/**
 * Mengambil profil pengguna saat ini (GET /user/profile).
 */
export const fetchProfile = async (): Promise<FullUserProfile> => {
    // Rute terotentikasi, menggunakan token di header
    const response = await api.get('/users/profile');
    // Backend controller mengembalikan { data: result }
    return response.data.data; 
};

/**
 * Mengirim pembaruan profil (POST /user/profile).
 */
export const updateProfile = async (data: UpdateUserProfileData): Promise<FullUserProfile> => {
    // Rute terotentikasi
    const response = await api.post('/users/profile', data);
    return response.data.data; 
};