// src/lib/auth-types.ts
// Berdasarkan asumsi struktur dari backend/src/modules/auth/auth-types.ts

export type UserRole = 'brand' | 'creator' | null;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress: string;
  isEmailVerified: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  data: {
    token: TokenResponse;
    user: UserProfile;
  }
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData extends LoginData {
  name: string;
  role: UserRole;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string; // Token dari link email
  password: string;
  passwordConfirm: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface LogoutData {
  refresh_token: string; // Diperlukan oleh Controller Backend
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
}

export interface MessageResponse {
  message: string;
}