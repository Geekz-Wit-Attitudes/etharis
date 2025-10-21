'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Handshake, Mail, Lock } from 'lucide-react'
import { useEtharisStore } from '@/lib/store'
import { useLogin } from '@/hooks/useAuth'
import Image from 'next/image'

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
        <div className="text-center mb-8 w-full">
          <div className="w-full flex items-center justify-center mb-4">
            <Image src={'/etharis-logo.png'} width={500} height={500} alt='logo' className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">SIGN IN TO ETHARIS</h1>
          <p className="text-[var(--color-primary)]/70 font-sans">Welcome back to guaranteed deals!</p>
        </div>

        {/* Card Neo-Brutalism */}
        <div className="p-8 border-4 border-[var(--color-primary)] bg-[var(--color-neutral)] rounded-none shadow-[6px_6px_0px_0px_var(--color-primary)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-primary)]/50" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-primary)]/50" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full text-lg" disabled={isPending}>
              {isPending ? 'LOADING...' : 'SIGN IN'}
            </button>
          </form>

          <p className="text-center text-[var(--color-primary)]/70 text-sm mt-6 font-sans">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[var(--color-primary)] font-extrabold transition-colors border-b border-dotted border-transparent hover:border-[var(--color-primary)]">
              SIGN UP NOW
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}