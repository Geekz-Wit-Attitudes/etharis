import { api } from "../api";
import { FullUserProfile, UpdateUserProfileData } from "./types";

export const fetchProfile = async (): Promise<FullUserProfile> => {
    const response = await api.get('/user/profile');
    return response.data.data; 
};

export const updateProfile = async (data: UpdateUserProfileData): Promise<FullUserProfile> => {
    const response = await api.post('/user/profile', data);
    return response.data.data; 
};