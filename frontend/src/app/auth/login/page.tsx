'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Handshake, Mail, Lock } from 'lucide-react'
import { useEtharisStore } from '@/lib/store'
import { useLogin } from '@/hooks/useAuth'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { mutate: loginMutate, isPending } = useLogin(); // Dapatkan mutator dari hook

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Panggil mutation
    loginMutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <Handshake className="w-16 h-16 text-[var(--color-primary)] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Sign In to ETHARIS</h1>
          <p className="text-[var(--color-primary)]/70">Welcome back!</p>
        </div>

        <div className="card-neutral">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button type="submit" className="btn-primary w-full text-lg">
              Sign In
            </button>
          </form>

          <p className="text-center text-[var(--color-primary)]/70 text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-secondary)] transition-colors">
              Sign Up Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}