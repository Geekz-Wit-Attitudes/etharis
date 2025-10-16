'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wallet, User, Mail, Building2 } from 'lucide-react'
import { formatIDR } from '@/lib/utils'

export default function ProfilePage() {
  // Mock User Data for Custodial Model
  const [user] = useState({
    name: 'Budi Santoso',
    email: 'budi@kopinusantara.com',
    role: 'Brand',
    balance: '1250000', // Rp balance
    // In the custodial model, the wallet address is the platform-managed address
    walletAddress: '0x132318...E1FF76', 
  })

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
          <div className="card-neutral">
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
          </div>

          {/* Wallet Address Card (For Transparency) */}
          <div className="card-neutral">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-[var(--color-primary)]" />
              <h2 className="text-xl font-semibold text-[var(--color-primary)]">Custodial Address</h2>
            </div>
            <p className="text-[var(--color-primary)]/70 text-sm mb-2">Platform-Managed Address (For Transparency)</p>
            <p className="text-[var(--color-primary)] font-mono text-sm bg-[var(--color-light)] p-3 rounded-lg border border-[var(--color-primary)]/20 break-all">
              {user.walletAddress}
            </p>
            <p className="text-[var(--color-primary)]/70 text-xs mt-2">
                *This address is controlled by ETHARIS and holds your IDRX balance securely on the Base network.
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="card-neutral mt-6">
          <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-6">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]/70 mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input type="text" defaultValue={user.name} className="input" readOnly />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]/70 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input type="email" defaultValue={user.email} className="input" readOnly />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]/70 mb-2">
                <Building2 className="w-4 h-4" />
                Account Type
              </label>
              <input type="text" defaultValue={user.role} className="input" readOnly />
            </div>
            <button className="btn-secondary">Update Profile</button>
          </div>
        </div>
      </div>
    </div>
  )
}