import { 
    AuthResponse, 
    LoginData, 
    SignupData, 
    ForgotPasswordData, 
    ResetPasswordData, 
    ChangePasswordData, 
    LogoutData, 
    RefreshTokenResponse, 
    MessageResponse 
  } from '@/lib/auth/types';
import { api } from '../api';

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

export const signupUser = async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const forgotPassword = async (data: ForgotPasswordData): Promise<MessageResponse> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
};

export const resetPassword = async (data: ResetPasswordData): Promise<MessageResponse> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
};

export const changePassword = async (data: ChangePasswordData): Promise<MessageResponse> => {
    // Route ini terlindungi, menggunakan token di header
    const response = await api.post('/auth/change-password', data);
    return response.data;
};

export const logoutUser = async (data: LogoutData): Promise<MessageResponse> => {
    // Kirim refresh_token di body sesuai permintaan controller backend
    const response = await api.post('/auth/logout', data);
    return response.data;
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
    // Controller backend menggunakan token yang sudah ada di header untuk rute ini
    const response = await api.post('/auth/refresh-token');
    // Asumsi rute /refresh-token mengembalikan objek { data: result }
    return response.data.data;
};

export const verifyEmail = async (): Promise<MessageResponse> => {
    // Route ini terlindungi, user ID diambil dari token di header
    const response = await api.post('/auth/verify-email');
    return response.data;
};