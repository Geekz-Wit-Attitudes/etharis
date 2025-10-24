'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Handshake, Mail, Lock, User } from 'lucide-react'
import { useSignup } from '@/hooks/useAuth'
import { SignupData } from '@/lib/auth/types'
import Image from 'next/image'

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
    role: 'brand',
  })

  const { mutate: signUpMutate, isPending } = useSignup();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signUpMutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)] py-10">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <div className="w-full flex items-center justify-center mb-4">
            <Image src={'/etharis-logo.png'} width={500} height={500} alt='logo' className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">CREATE YOUR ETHARIS ACCOUNT</h1>
          <p className="text-[var(--color-primary)]/70 font-sans">Start securing your deals today</p>
        </div>

        <div className="p-8 border-4 border-[var(--color-primary)] bg-[var(--color-neutral)] rounded-none shadow-[6px_6px_0px_0px_var(--color-primary)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                FULL NAME
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
              <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                EMAIL ADDRESS
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
              <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                PASSWORD
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

            <div className='pt-2'>
              <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                I AM A
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'brand'})}
                  className={`py-3 px-4 rounded-none border-2 transition-colors font-bold text-base shadow-none hover:shadow-[2px_2px_0px_0px_var(--color-primary)] ${
                    formData.role === 'brand'
                      ? 'border-[var(--color-primary)] bg-[var(--color-secondary)] text-[var(--color-primary)]'
                      : 'border-[var(--color-primary)]/50 text-[var(--color-primary)]/80 hover:border-[var(--color-primary)] bg-[var(--color-light)]'
                  }`}
                >
                  BRAND
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'creator'})}
                  className={`py-3 px-4 rounded-none border-2 transition-colors font-bold text-base shadow-none hover:shadow-[2px_2px_0px_0px_var(--color-primary)] ${
                    formData.role === 'creator'
                      ? 'border-[var(--color-primary)] bg-[var(--color-secondary)] text-[var(--color-primary)]'
                      : 'border-[var(--color-primary)]/50 text-[var(--color-primary)]/80 hover:border-[var(--color-primary)] bg-[var(--color-light)]'
                  }`}
                >
                  CREATOR
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full text-lg" disabled={isPending}>
              {isPending ? 'LOADING...' : 'SIGN UP NOW'}
            </button>
          </form>

          <p className="text-center text-[var(--color-primary)]/70 text-sm mt-6 font-sans">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--color-primary)] font-extrabold hover:text-[var(--color-secondary)] transition-colors border-b border-dotted border-transparent hover:border-[var(--color-primary)]">
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}