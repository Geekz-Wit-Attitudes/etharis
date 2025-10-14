'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, Wallet, User, Mail, Building2 } from 'lucide-react'

export default function ProfilePage() {
  const [user] = useState({
    name: 'Budi Santoso',
    email: 'budi@kopinusantara.com',
    role: 'brand',
    balance: '1250000', // Rp balance
    walletAddress: '0x1234...5678',
  })

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 " />
              <span className="text-2xl font-bold ">Etharis</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2  hover: mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>

        <h1 className="text-3xl font-bold  mb-8">Profil Saya</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 " />
              <h2 className="text-xl font-semibold ">Saldo</h2>
            </div>
            <div className="mb-4">
              <p className=" text-sm mb-1">Saldo Tersedia</p>
              <p className="text-3xl font-bold ">
                Rp {parseInt(user.balance).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1">Top Up</button>
              <button className="btn-secondary flex-1">Tarik Dana</button>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold ">Wallet Address</h2>
            </div>
            <p className=" text-sm mb-2">Alamat Wallet Anda</p>
            <p className=" font-mono text-sm bg-gray-800 p-3 rounded-lg break-all">
              {user.walletAddress}
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold  mb-6">Informasi Profil</h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <User className="w-4 h-4" />
                Nama Lengkap
              </label>
              <input
                type="text"
                defaultValue={user.name}
                className="input"
                readOnly
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                defaultValue={user.email}
                className="input"
                readOnly
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Building2 className="w-4 h-4" />
                Tipe Akun
              </label>
              <input
                type="text"
                defaultValue={user.role === 'brand' ? 'Brand' : 'Creator'}
                className="input"
                readOnly
              />
            </div>

            <button className="btn-primary">Edit Profil</button>
          </div>
        </div>
      </div>
    </div>
  )
}