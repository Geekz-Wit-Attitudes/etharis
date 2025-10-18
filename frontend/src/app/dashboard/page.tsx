'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Handshake, TrendingUp, DollarSign, AlertCircle, CheckCircle, Wallet, Loader2 } from 'lucide-react'
import { DealCard } from '@/components/DealCard'
import { formatIDR } from '@/lib/utils'
import { useEtharisStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

// Mock Data for demonstration purposes (replace with Tanstack Query fetching later)
const mockDeals = [
    { id: '1', contractId: 'ETHR-001', creator: 'sari_foodie', amount: '500000', platform: 'Instagram', status: 'PENDING_REVIEW', deadline: '2025-10-20T10:00:00Z', role: 'brand' },
    { id: '2', contractId: 'ETHR-002', creator: 'travel_vlog_id', amount: '1500000', platform: 'YouTube', status: 'PAID', deadline: '2025-09-15T12:00:00Z', role: 'brand' },
    { id: '3', contractId: 'ETHR-003', creator: 'tech_reviewer', amount: '2500000', platform: 'TikTok', status: 'DISPUTED', deadline: '2025-10-25T14:30:00Z', role: 'brand' },
];

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
    </div>
);

export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, user, balance } = useEtharisStore();
    const [deals, setDeals] = useState(mockDeals); // Placeholder for deal data

    // --- ACCESS CONTROL LOGIC ---
    const isCorrectRole = user?.role === 'brand';

    useEffect(() => {
        // Cek jika state sudah selesai dimuat (Zustand persist)
        if (typeof isAuthenticated !== 'undefined') {
            if (!isAuthenticated) {
                // 1. Tidak terautentikasi -> Redirect ke Login
                router.push('/auth/login');
            } else if (!isCorrectRole) {
                // 2. Role salah (Creator mencoba masuk ke Brand Dashboard) -> Redirect ke Creator Dashboard
                router.push('/creator');
            }
        }
    }, [isAuthenticated, isCorrectRole, router]);

    // Tampilkan spinner selama proses pengecekan atau redirect
    if (!isAuthenticated || !isCorrectRole) {
        return <LoadingSpinner />;
    }

    const totalDeals = deals.length;
    const activeDeals = deals.filter(d => d.status === 'ACTIVE' || d.status === 'PENDING_REVIEW').length;
    const completedDeals = deals.filter(d => d.status === 'PAID').length;

    // Total Locked Value dihitung dari semua deal yang belum selesai
    const totalLockedValue = deals
        .filter(d => d.status !== 'PAID' && d.status !== 'FAILED' && d.status !== 'CANCELLED')
        .reduce((sum, d) => sum + Number(d.amount), 0);


    return (
        <div className="min-h-screen bg-[var(--color-light)]">
            <nav className="border-b border-[var(--color-primary)]/10 bg-[var(--color-light)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/dashboard" className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">ETHARIS</Link>
                    <Link href="/profile" className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-secondary)] transition-colors">
                        My Profile
                    </Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Balance Card */}
                <div className="card-neutral mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <Wallet className="w-8 h-8 text-[var(--color-primary)]" />
                            <div>
                                <p className="text-[var(--color-primary)]/70 text-sm">Available Balance</p>
                                <p className="text-3xl font-extrabold text-[var(--color-primary)]">
                                    {formatIDR(balance.current)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn-primary">Top Up</button>
                            <Link href="/profile" className="btn-secondary">
                                Profile
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Brand Dashboard</h1>
                            <p className="text-[var(--color-primary)]/70">Manage your active sponsorship contracts.</p>
                        </div>
                        <Link href="/dashboard/deals/new" className="btn-primary flex items-center gap-2 text-base">
                            <Plus className="w-5 h-5" />
                            Create New Deal
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-6 mb-12">
                        <div className="card-neutral">
                            <p className="text-[var(--color-primary)]/70 text-sm mb-1">Total Deals</p>
                            <p className="text-2xl font-bold text-[var(--color-primary)]">{totalDeals}</p>
                        </div>
                        <div className="card-neutral">
                            <p className="text-[var(--color-primary)]/70 text-sm mb-1">Active / Review</p>
                            <p className="text-2xl font-bold text-blue-600">{activeDeals}</p>
                        </div>
                        <div className="card-neutral">
                            <p className="text-[var(--color-primary)]/70 text-sm mb-1">Completed Deals</p>
                            <p className="text-2xl font-bold text-green-600">{completedDeals}</p>
                        </div>
                        <div className="card-neutral">
                            <p className="text-[var(--color-primary)]/70 text-sm mb-1">Total Locked Value</p>
                            <p className="text-2xl font-bold text-[var(--color-primary)]">
                                {formatIDR(deals.filter(d => d.status !== 'PAID' && d.status !== 'FAILED').reduce((sum, d) => sum + Number(d.amount), 0))}
                            </p>
                        </div>
                    </div>

                    {/* Deals List */}
                    <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Active Contracts</h2>

                    {deals.length === 0 ? (
                        <div className="card-neutral text-center py-12 border-dashed">
                            <Handshake className="w-16 h-16 text-[var(--color-primary)]/30 mx-auto mb-4" />
                            <p className="text-xl font-semibold text-[var(--color-primary)] mb-4">No Active Deals</p>
                            <p className="text-[var(--color-primary)]/70 max-w-lg mx-auto">
                                Start a new sponsorship by clicking "Create New Deal" and securing your payment with our smart contract escrow.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {deals.map((deal) => (
                                <DealCard
                                    key={deal.id}
                                    id={deal.id}
                                    contractId={deal.contractId}
                                    creator={deal.creator}
                                    amount={deal.amount}
                                    platform={deal.platform}
                                    status={deal.status}
                                    deadline={deal.deadline}
                                    role="brand"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}