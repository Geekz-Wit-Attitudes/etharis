'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Mail, Lock, User } from 'lucide-react'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'brand', // brand | creator
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Call API /api/auth/signup
    console.log('Signup:', formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Daftar Etharis</h1>
          <p className="text-gray-400">Buat akun untuk memulai</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 " />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 " />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 " />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Saya adalah
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'brand'})}
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                    formData.role === 'brand'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Brand
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'creator'})}
                  className={`py-3 px-4 rounded-lg border-2 transition-colors ${
                    formData.role === 'creator'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Creator
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Daftar Sekarang
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-4">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}