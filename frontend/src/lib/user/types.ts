// src/lib/user-types.ts (New File)

export type UserRole = 'brand' | 'creator' | null;

// Struktur profil lengkap yang dikembalikan oleh GET /user/profile
export interface FullUserProfile {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    walletAddress: string;
    phone?: string;
    // Tambahkan field lain yang relevan seperti social handles, dll.
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