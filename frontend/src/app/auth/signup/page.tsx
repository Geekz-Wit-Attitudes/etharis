'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Handshake, Mail, Lock, User } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <Handshake className="w-16 h-16 text-[var(--color-primary)] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Create Your ETHARIS Account</h1>
          <p className="text-[var(--color-primary)]/70">Start securing your deals today</p>
        </div>

        <div className="card-neutral">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-primary)]/50" />
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
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-primary)]/50" />
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
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-primary)]/50" />
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
              <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'brand'})}
                  className={`py-3 px-4 rounded-full border-2 transition-colors font-semibold ${
                    formData.role === 'brand'
                      ? 'border-[var(--color-primary)] bg-[var(--color-secondary)] text-[var(--color-primary)]'
                      : 'border-[var(--color-primary)]/50 text-[var(--color-primary)]/80 hover:border-[var(--color-primary)]'
                  }`}
                >
                  Brand
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'creator'})}
                  className={`py-3 px-4 rounded-full border-2 transition-colors font-semibold ${
                    formData.role === 'creator'
                      ? 'border-[var(--color-primary)] bg-[var(--color-secondary)] text-[var(--color-primary)]'
                      : 'border-[var(--color-primary)]/50 text-[var(--color-primary)]/80 hover:border-[var(--color-primary)]'
                  }`}
                >
                  Creator
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full text-lg">
              Sign Up Now
            </button>
          </form>

          <p className="text-center text-[var(--color-primary)]/70 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-secondary)] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}