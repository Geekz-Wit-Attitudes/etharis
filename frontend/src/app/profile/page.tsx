'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wallet, User, Mail, Building2, Loader2 } from 'lucide-react'
import { formatIDR } from '@/lib/utils'
import { useEtharisStore } from '@/lib/store'
import { useGetProfile, useUpdateProfile } from '@/hooks/useUser'

export default function ProfilePage() {
  const { user } = useEtharisStore();
    const { data: profile, isLoading: isProfileLoading, error } = useGetProfile(); // Query untuk fetch profil
    const { mutate: updateMutate, isPending: isUpdatePending } = useUpdateProfile(); // Mutation untuk update profil
    
    // State lokal untuk form (diisi dari data profile)
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setPhone(profile.phone || '');
        }
    }, [profile]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutate({ name, phone });
    };

    if (isProfileLoading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-[var(--color-light)]">
      {/* Navbar (Minimal) */}
      <nav className="border-b border-[var(--color-primary)]/10 bg-[var(--color-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
          <Link href="/" className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">ETHARIS</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-8">My Profile</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Balance Card */}
          {/* <div className="card-neutral">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-[var(--color-primary)]" />
              <h2 className="text-xl font-semibold text-[var(--color-primary)]">Wallet Balance</h2>
            </div>
            <div className="mb-6">
              <p className="text-[var(--color-primary)]/70 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-extrabold text-[var(--color-primary)]">
                {formatIDR(user.balance)}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-primary flex-1">Top Up</button>
              <button className="btn-secondary flex-1">Withdraw</button>
            </div>
          </div> */}

          {/* Wallet Address Card (For Transparency) */}
          <div className="card-neutral">
                        <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-4">Custodial Address</h2>
                        <p className="text-[var(--color-primary)]/70 text-sm mb-2">Platform-Managed Address</p>
                        <p className="text-[var(--color-primary)] font-mono text-sm bg-[var(--color-light)] p-3 rounded-lg border border-[var(--color-primary)]/20 break-all">
                            {profile.walletAddress}
                        </p>
                    </div>
        </div>

        {/* Profile Info */}
        <div className="card-neutral mt-6">
                    <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-6">Personal Information</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]/70 mb-2">
                                <User className="w-4 h-4" />
                                Full Name
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
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]/70 mb-2">
                                <Mail className="w-4 h-4" />
                                Email (Read Only)
                            </label>
                            <input type="email" defaultValue={profile.email} className="input bg-[var(--color-primary)]/10" readOnly />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]/70 mb-2">
                                Phone Number
                            </label>
                            <input 
                                type="text" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                className="input" 
                                placeholder="e.g., 0812xxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]/70 mb-2">
                                <Building2 className="w-4 h-4" />
                                Account Type
                            </label>
                            <input type="text" defaultValue={profile?.role?.toUpperCase()} className="input bg-[var(--color-primary)]/10" readOnly />
                        </div>
                        <button type="submit" className="btn-primary" disabled={isUpdatePending}>
                            {isUpdatePending ? (
                                <div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Saving...</div>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </form>
                </div>
      </div>
    </div>
  )
}