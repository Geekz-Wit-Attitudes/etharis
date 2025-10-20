// src/lib/user-types.ts (New File)
export type UserRole = 'brand' | 'creator' | null;

export interface WalletProfile {
    id: string
    user_id: string
    address: string
    secret_path: string
    created_at: Date
  }

// Struktur profil lengkap yang dikembalikan oleh GET /user/profile
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

// Payload untuk POST /user/profile (Update)
export interface UpdateUserProfileData {
    name?: string;
    phone?: string;
    // Tambahkan field lain yang ingin diubah
}

// Response format dari backend (asumsi: { data: profile })
export interface UserResponse {
    data: FullUserProfile;
}