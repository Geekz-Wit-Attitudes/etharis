'use client'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { CreateDealForm } from '@/components/CreateDealForm'

export default function NewDealPage() {
    
    // NOTE: In the final custodial model, session checking happens on the backend/layout.
    // For the frontend component, we just handle the layout.

    return (
        <div className="min-h-screen bg-[var(--color-light)]">
            <nav className="border-b border-[var(--color-primary)]/10 bg-[var(--color-light)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
                    <Link href="/dashboard" className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">ETHARIS</Link>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] transition-colors mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Create New Deal</h1>
                    <p className="text-[var(--color-primary)]/70">Set up a secure sponsorship contract with a creator.</p>
                </div>

                <div className="card-neutral">
                    {/* The CreateDealForm component handles the core logic and styling */}
                    <CreateDealForm />
                </div>
            </div>
        </div>
    );
}