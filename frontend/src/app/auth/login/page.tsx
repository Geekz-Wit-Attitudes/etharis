'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Call API /api/auth/login
    console.log('Login:', formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16  mx-auto mb-4" />
          <h1 className="text-3xl font-bold  mb-2">Masuk ke Etharis</h1>
          <p className="">Selamat datang kembali</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium  mb-2">
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
              <label className="block text-sm font-medium  mb-2">
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

            <button type="submit" className="btn-primary w-full">
              Masuk
            </button>
          </form>

          <p className="text-center  text-sm mt-4">
            Belum punya akun?{' '}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}