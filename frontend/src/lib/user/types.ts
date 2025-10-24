export type UserRole = 'brand' | 'creator' | null;

export interface WalletProfile {
    id: string
    user_id: string
    address: string
    secret_path: string
    created_at: Date
    balance: string
  }

export interface FullUserProfile {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    email_verified: boolean;
    wallet: WalletProfile;
    created_at: Date;
    updated_at: Date;
  }

export interface UpdateUserProfileData {
    name?: string;
    phone?: string;
}

export interface UserResponse {
    data: FullUserProfile;
}