'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wallet, User, Mail, Building2, Loader2, AlertTriangle } from 'lucide-react'
import { formatIDR } from '@/lib/utils'
import { useEtharisStore } from '@/lib/store'
import { useGetProfile, useUpdateProfile } from '@/hooks/useUser';
import { Navbar } from '@/components/Navbar' // Assuming Navbar is used here
import { useResendVerificationEmail } from '@/hooks/useAuth'

export default function ProfilePage() {
    const { balance } = useEtharisStore();

    const { data: profile, isLoading: isProfileLoading, error: profileError } = useGetProfile();
    const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateProfile();
    const { mutate: resendMutate, isPending: isResendPending } = useResendVerificationEmail();

    const [name, setName] = useState('');

    const isEmailVerified = profile?.email_verified

    useEffect(() => {
        if (profile) {
            setName(profile.name ?? '');
        }
    }, [profile]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updateData = { name };
        updateMutate(updateData);
    };

    if (isProfileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                    <p className="text-[var(--color-primary)] mt-3">LOADING PROFILE DATA...</p>
                </div>
            </div>
        );
    }

    if (profileError || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
                <div className="text-center p-8 border-4 border-red-700 bg-red-100 rounded-none shadow-[6px_6px_0px_0px_red]">
                    <h2 className="text-xl text-red-700 mb-4">ERROR LOADING PROFILE</h2>
                    <p className="text-[var(--color-primary)]/70 font-sans">Please log in again or check your network connection.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-light)]">
            <div className="flex flex-col max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">
                <Link href={profile.role === "brand" ? "/dashboard" : "/creator"} className="inline-flex items-center gap-2 text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] transition-colors mb-6 font-bold border-b border-dotted border-transparent hover:border-[var(--color-primary)]">
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO DASHBOARD
                </Link>

                <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-8 tracking-tight border-b-2 border-dashed border-[var(--color-primary)] pb-1">MY PROFILE</h1>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border-4 border-[var(--color-primary)] bg-[var(--color-secondary)] rounded-none shadow-[6px_6px_0px_0px_var(--color-primary)]">
                        <div className="flex items-center gap-3 mb-4">
                            <Wallet className="w-6 h-6 text-[var(--color-primary)]" />
                            <h2 className="text-xl font-bold text-[var(--color-primary)]">WALLET BALANCE</h2>
                        </div>
                        <div className="mb-6">
                            <p className="text-[var(--color-primary)]/70 text-sm mb-1 font-sans">AVAILABLE BALANCE</p>
                            <p className="text-4xl font-extrabold text-[var(--color-primary)]">
                                {formatIDR(balance.current)}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn-small-secondary flex-1">WITHDRAW</button>
                        </div>
                    </div>

                    <div className="p-6 border-2 border-[var(--color-primary)] bg-[var(--color-light)] rounded-none shadow-[3px_3px_0px_0px_var(--color-primary)]">
                        <div className="flex items-center gap-3 mb-4">
                            <Wallet className="w-6 h-6 text-[var(--color-primary)]" />
                            <h2 className="text-xl font-bold text-[var(--color-primary)]">CUSTODIAL ADDRESS</h2>
                        </div>
                        <p className="text-[var(--color-primary)]/70 text-sm mb-2 font-sans">Platform-Managed Address</p>
                        <p className="text-[var(--color-primary)] font-mono text-sm bg-[var(--color-neutral)] p-3 rounded-none border-2 border-[var(--color-primary)]/30 break-all">
                            {profile.wallet.address}
                        </p>
                    </div>
                </div>

                {!isEmailVerified && (
                    <div className="card-neutral mt-6 p-4 border-l-4 border-orange-500">
                        <h3 className="text-lg font-semibold text-orange-700 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Email Verification Required
                        </h3>
                        <p className="text-[var(--color-primary)]/80 text-sm mb-4">
                            You must verify your email to access core features
                        </p>
                        <button
                            onClick={() => resendMutate()}
                            disabled={isResendPending}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2"
                        >
                            {isResendPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resend Verification Link'}
                        </button>
                    </div>
                )}

                <div className="p-8 mt-6 border-4 border-[var(--color-primary)] bg-[var(--color-neutral)] rounded-none shadow-[6px_6px_0px_0px_var(--color-primary)]">
                    <h2 className="text-xl font-bold text-[var(--color-primary)] mb-6 tracking-tight border-b-2 border-dashed border-[var(--color-primary)] inline-block pb-1">PERSONAL INFORMATION</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]/90 mb-2">
                                <User className="w-4 h-4" />
                                FULL NAME
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]/90 mb-2">
                                <Mail className="w-4 h-4" />
                                EMAIL (READ ONLY)
                            </label>
                            <input type="email" defaultValue={profile.email} className="input bg-[var(--color-primary)]/10" readOnly />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]/90 mb-2">
                                <Building2 className="w-4 h-4" />
                                ACCOUNT TYPE
                            </label>
                            <input type="text" defaultValue={profile?.role?.toUpperCase()} className="input bg-[var(--color-primary)]/10" readOnly />
                        </div>
                        <button type="submit" className="btn-small w-full mt-4" disabled={isUpdatePending}>
                            {isUpdatePending ? (
                                <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> SAVING...</div>
                            ) : (
                                'SAVE CHANGES'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 border-t-4 border-[var(--color-primary)] bg-[var(--color-neutral)] mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--color-primary)]/80 font-mono">
                    &copy; 2025 ETHARIS. TRUSTLESS DEALS, GUARANTEED RESULTS.
                </div>
            </footer>
        </div>
    );
}
