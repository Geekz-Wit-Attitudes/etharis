import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useEtharisStore } from '@/lib/store'; // Import Zustand Store
import { useRouter } from 'next/navigation';
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
import toast from 'react-hot-toast';
import { changePassword, forgotPassword, loginUser, logoutUser, refreshToken, resendVerificationEmailService, resetPassword, signupUser, verifyEmail } from '@/lib/auth/services';
import { fetchProfile } from '@/lib/user/services';

export const useLogin = (): UseMutationResult<AuthResponse, any, LoginData> => {
    const { profileInfo } = useEtharisStore();
    const router = useRouter();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: async ({data}) => {
            localStorage.setItem('etharis_token', data.token.access_token);
            localStorage.setItem('refresh_etharis_token', data.token.refresh_token);
            
            const userProfile = await fetchProfile()

            profileInfo(userProfile)

            toast.success(`Welcome back, ${data.user.name}!`);

            window.location.href = data.user.role === 'brand' ? '/dashboard' : '/creator';
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
            toast.error(message);
        },
    });
};

export const useSignup = (): UseMutationResult<{data: TokenResponse}, any, SignupData> => {
    const { profileInfo } = useEtharisStore(); // Ambil action login dari Zustand
    const router = useRouter();

    return useMutation({
        mutationFn: signupUser,
        onSuccess: async ({data}, signupData) => {
            localStorage.setItem('etharis_token', data.access_token);
            localStorage.setItem('refresh_etharis_token', data.refresh_token);

            const userData = await fetchProfile()
            profileInfo(userData);

            toast.success('Registration successful! Redirecting...');

            window.location.href = userData.role === 'brand' ? '/dashboard' : '/creator';
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Registration failed. Try a different email.';
            toast.error(message);
        },
    });
};

export const useForgotPassword = (): UseMutationResult<MessageResponse, any, ForgotPasswordData> => {
    return useMutation({
        mutationFn: forgotPassword,
        onSuccess: (data) => {
            toast.success(data.message || 'Password reset link sent to your email!');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Error sending reset link.';
            toast.error(message);
        },
    });
};

export const useResetPassword = (): UseMutationResult<MessageResponse, any, ResetPasswordData> => {
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: (data) => {
            toast.success(data.message || 'Password successfully reset. You can now log in.');
            window.location.href = '/auth/login';
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Error resetting password.';
            toast.error(message);
        },
    });
};

export const useChangePassword = (): UseMutationResult<MessageResponse, any, ChangePasswordData> => {
    const { logout } = useEtharisStore();
    const router = useRouter();

    return useMutation({
        mutationFn: changePassword,
        onSuccess: (data) => {
            toast.success(data.message || 'Password changed successfully! Please log in again.');
            logout();
            window.location.href = '/auth/login';
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Error changing password.';
            toast.error(message);
        },
    });
};

export const useLogout = (): UseMutationResult<MessageResponse, any, LogoutData | void> => {
    const { logout } = useEtharisStore();
    const router = useRouter();
    
    const refreshTokenValue = typeof window !== "undefined" ? localStorage.getItem('refresh_etharis_token') : '';
    
    return useMutation({
        mutationFn: (data) => logoutUser((data as LogoutData) || { refresh_token: refreshTokenValue }),
        onSuccess: (data) => {
            logout();
            toast.success(data.message || 'You have been logged out.');
            window.location.href = '/auth/login';
        },
        onError: (error: any) => {
            logout();
            const message = error.response?.data?.message || 'Logout failed on server, but local session cleared.';
            toast.error(message);
        },
    });
};

export const useRefreshToken = (): UseMutationResult<RefreshTokenResponse, any, void> => {
    const { logout } = useEtharisStore();
    return useMutation({
        mutationFn: refreshToken,
        onSuccess: (data) => {
            localStorage.setItem('etharis_token', data.token);
            localStorage.setItem('refresh_etharis_token', data.refresh_token);
            console.log("Token successfully refreshed.");
        },
        onError: (error: any) => {
            console.error("Token refresh failed. Logging out.");
            logout();
        },
    });
};

export const useVerifyEmail = (): UseMutationResult<MessageResponse, any, {token: string}> => {
    return useMutation({
        mutationFn: verifyEmail,
        onSuccess: (data) => {
            toast.success(data.message || 'Verification email resent!');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Error sending verification email.';
            toast.error(message);
        },
    });
};

export const useResendVerificationEmail = (): UseMutationResult<MessageResponse, any, void> => {
    return useMutation({
        mutationFn: resendVerificationEmailService,
        onSuccess: (data) => {
            toast.success(data.message || 'Verification email resent! Check your inbox.');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to resend email. Please try again later.';
            toast.error(message);
        },
    });
};