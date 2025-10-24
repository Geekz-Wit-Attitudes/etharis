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
  token: string; 
  password: string;
  passwordConfirm: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface LogoutData {
  refresh_token: string; 
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
}

export interface MessageResponse {
  message: string;
}

export interface CompleteVerificationData {
  verificationToken: string;
}

export interface CompleteVerificationResponse {
  message: string;
  token?: string;
}