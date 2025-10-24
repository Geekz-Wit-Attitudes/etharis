import { 
    AuthResponse, 
    LoginData, 
    SignupData, 
    ForgotPasswordData, 
    ResetPasswordData, 
    ChangePasswordData, 
    LogoutData, 
    RefreshTokenResponse, 
    MessageResponse, 
    TokenResponse
  } from '@/lib/auth/types';
import { api } from '../api';

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

export const signupUser = async (data: SignupData): Promise<{data: TokenResponse}> => {
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
    const response = await api.post('/auth/change-password', data);
    return response.data;
};

export const logoutUser = async (data: LogoutData): Promise<MessageResponse> => {
    const response = await api.post('/auth/logout', data);
    return response.data;
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
    const response = await api.post('/auth/refresh-token');
    return response.data.data;
};

export const verifyEmail = async (data: {token: string}): Promise<MessageResponse> => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
};

export const resendVerificationEmailService = async (): Promise<MessageResponse> => {
    const response = await api.post('/auth/resend-verification-email');
    return response.data;
};