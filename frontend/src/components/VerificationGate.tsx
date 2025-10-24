// src/components/VerificationGate.tsx (New File)
'use client';

import React, { ReactNode } from 'react';
import { Loader2, AlertTriangle, Send } from 'lucide-react';
import { useGetProfile } from '@/hooks/useUser';
import { useResendVerificationEmail } from '@/hooks/useAuth'; 
import { useEtharisStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VerificationGateProps {
    children: ReactNode;
    // Judul yang spesifik untuk fitur yang diblokir (misal: "Membuat Deal Baru")
    featureTitle: string; 
}

/**
 * Komponen wrapper yang memblokir akses ke konten inti jika email pengguna belum diverifikasi.
 */
export function VerificationGate({ children, featureTitle }: VerificationGateProps) {
    const router = useRouter();
    const { isAuthenticated } = useEtharisStore();
    
    const { data: profile, isLoading: isProfileLoading, isError: isProfileError, isFetched } = useGetProfile(); 
    
    const { mutate: resendMutate, isPending: isResendPending } = useResendVerificationEmail();

    const isVerified = profile?.email_verified ?? false; 

    if (isProfileLoading || !isFetched) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }
    
    if (isProfileError || !isAuthenticated) {
        window.location.href = '/auth/login'; 
        return null; 
    }

    if (!isVerified) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="card-neutral p-10 max-w-lg text-center border-l-4 border-red-600">
                    <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-3">Akses Diblokir: Verifikasi Diperlukan</h1>
                    <p className="text-[var(--color-primary)]/80 mb-6">
                        Fitur <b>{featureTitle}</b> diblokir karena email Anda <b>{profile?.email}</b> belum terverifikasi. Silakan cek inbox Anda.
                    </p>
                    
                    <div className="flex flex-col items-center">
                        <button 
                            onClick={() => resendMutate()} 
                            disabled={isResendPending}
                            className="btn-danger font-bold w-full flex items-center justify-center gap-2"
                        >
                            {isResendPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4"/>}
                            {isResendPending ? 'Mengirim Ulang...' : 'Kirim Ulang Link Verifikasi'}
                        </button>
                        <Link href="/profile" className="btn-secondary w-xs mt-3">
                            Kembali ke Profil
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Akses Diizinkan
    return <>{children}</>;
}