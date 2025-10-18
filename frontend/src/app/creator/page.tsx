'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Inbox, Handshake, DollarSign, CheckCircle } from 'lucide-react'
import { DealCard } from '@/components/DealCard'
import { formatIDR } from '@/lib/utils'

// Mock Data for demonstration purposes (Creator's deals)
const mockCreatorDeals = [
    { id: '101', contractId: 'ETHR-011', brand: 'Kopi Nusantara', amount: '500000', platform: 'Instagram', status: 'PENDING_REVIEW', deadline: '2025-10-20T10:00:00Z', role: 'creator' },
    { id: '102', contractId: 'ETHR-012', brand: 'Fashion Kita', amount: '1500000', platform: 'YouTube', status: 'PAID', deadline: '2025-09-15T12:00:00Z', role: 'creator' },
    { id: '103', contractId: 'ETHR-013', brand: 'Gadget Mania', amount: '2500000', platform: 'TikTok', status: 'DISPUTED', deadline: '2025-10-25T14:30:00Z', role: 'creator' },
];

export default function CreatorDashboard() {
    // In a real app, this would be fetched based on user session
    const [deals, setDeals] = useState(mockCreatorDeals);
    const [userBalance, setUserBalance] = useState(5500000); // Mock Balance

    const totalDeals = deals.length;
    const completedDeals = deals.filter(d => d.status === 'PAID').length;
    const totalEarned = deals.filter(d => d.status === 'PAID').reduce((sum, d) => sum + Number(d.amount), 0);
    const completionRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0;

    return (
        <div className="min-h-screen bg-[var(--color-light)]">
            <nav className="border-b border-[var(--color-primary)]/10 bg-[var(--color-light)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">ETHARIS</Link>
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
                            <DollarSign className="w-8 h-8 text-[var(--color-primary)]" />
                            <div>
                                <p className="text-[var(--color-primary)]/70 text-sm">Total Earnings (Paid)</p>
                                <p className="text-4xl font-extrabold text-green-600">
                                    {formatIDR(totalEarned)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/profile" className="btn-primary">
                                Go to Wallet
                            </Link>
                            <button className="btn-secondary">
                                View Portfolio
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Creator Dashboard</h1>
                        <p className="text-[var(--color-primary)]/70">Secure your payments for every sponsorship contract.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="card-neutral">
                        <p className="text-[var(--color-primary)]/70 text-sm mb-1">Total Contracts</p>
                        <p className="text-2xl font-bold text-[var(--color-primary)]">{totalDeals}</p>
                    </div>
                    <div className="card-neutral">
                        <p className="text-[var(--color-primary)]/70 text-sm mb-1">Deals in Review</p>
                        <p className="text-2xl font-bold text-orange-600">
                            {deals.filter(d => d.status === 'PENDING_REVIEW').length}
                        </p>
                    </div>
                    <div className="card-neutral">
                        <p className="text-[var(--color-primary)]/70 text-sm mb-1">Completed Rate</p>
                        <p className="text-2xl font-bold text-blue-600">{completionRate.toFixed(0)}%</p>
                    </div>
                    <div className="card-neutral">
                        <p className="text-[var(--color-primary)]/70 text-sm mb-1">Disputed Contracts</p>
                        <p className="text-2xl font-bold text-red-600">
                            {deals.filter(d => d.status === 'DISPUTED').length}
                        </p>
                    </div>
                </div>

                {/* Deals List */}
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">My Contracts</h2>
                
                {deals.length === 0 ? (
                    <div className="card-neutral text-center py-12 border-dashed">
                        <Inbox className="w-16 h-16 text-[var(--color-primary)]/30 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-[var(--color-primary)] mb-4">No Contracts Yet</p>
                        <p className="text-[var(--color-primary)]/70 max-w-lg mx-auto">
                            Brands will invite you directly to a secured ETHARIS contract. No more manual searching!
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deals.map((deal) => (
                            <DealCard 
                                key={deal.id} 
                                id={deal.id} 
                                contractId={deal.contractId} 
                                creator={deal.brand} // Show Brand's name/ID
                                amount={deal.amount} 
                                platform={deal.platform} 
                                status={deal.status} 
                                deadline={deal.deadline} 
                                role="creator" 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}