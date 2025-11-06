// src/app/user/verify/[token]/page.tsx (New File)
'use client';

import { useEffect } from 'react';
import { CheckCircle, Shield, Loader2, ArrowLeft } from 'lucide-react';
import { useVerifyEmail } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEtharisStore } from '@/lib/store';

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
    </div>
);

export default function VerifyEmailPage() {
    const params = useParams();
    const token = params.token as string;

    const {user} = useEtharisStore()
    const path = user?.role === 'brand' ? '/dashboard' : '/creator'
    const { mutate: verifyMutate, isPending, isError, isSuccess, error } = useVerifyEmail();

    useEffect(() => {
        if (token) {
            verifyMutate({token: token});
        }
    }, [token, verifyMutate]);

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
                <div className="text-center card-neutral p-8">
                    <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-[var(--color-primary)]">Verifying Your Email...</h1>
                    <p className="text-[var(--color-primary)]/70 mt-2">Please wait, we are confirming your account token.</p>
                </div>
            </div>
        );
    }
    
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
                <div className="text-center card-neutral p-12 border-l-4 border-green-600">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-[var(--color-primary)]">Verification Successful!</h1>
                    <p className="text-[var(--color-primary)]/80 mt-3 mb-6">Your email address has been verified. You can now access all features of Etharis.</p>
                    <Link href={path} className="btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
                <div className="text-center card-neutral p-12 border-l-4 border-red-600">
                    <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-[var(--color-primary)]">Verification Failed</h1>
                    <p className="text-[var(--color-primary)]/80 mt-3 mb-6">The token is expired or invalid. Please request a new verification email.</p>
                    <Link href="/profile" className="btn-secondary flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Go to Profile to Resend
                    </Link>
                </div>
            </div>
        );
    }
    
    return <LoadingSpinner />;
}