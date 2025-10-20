'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Inbox, Handshake, DollarSign, CheckCircle } from 'lucide-react'
import { DealCard } from '@/components/DealCard'
import { formatIDR } from '@/lib/utils'
import { Navbar } from '@/components/Navbar' // Assuming Navbar is used here

// Mock Data for demonstration purposes (Creator's deals)
const mockCreatorDeals = [
    { id: '101', contractId: 'ETHR-011', brand: 'Kopi Nusantara', amount: '500000', platform: 'Instagram', status: 'PENDING_REVIEW', deadline: '2025-10-20T10:00:00Z', role: 'creator' },
    { id: '102', contractId: 'ETHR-012', brand: 'Fashion Kita', amount: '1500000', platform: 'YouTube', status: 'PAID', deadline: '2025-09-15T12:00:00Z', role: 'creator' },
    { id: '103', contractId: 'ETHR-013', brand: 'Gadget Mania', amount: '2500000', platform: 'TikTok', status: 'DISPUTED', deadline: '2025-10-25T14:30:00Z', role: 'creator' },
];

const StatCard = ({ title, value, colorClass }: { title: string, value: string, colorClass?: string }) => (
    <div className="p-4 border-2 border-[var(--color-primary)] bg-[var(--color-light)] rounded-none shadow-[3px_3px_0px_0px_var(--color-primary)]">
        <p className="text-[var(--color-primary)]/70 text-xs mb-1 font-sans">{title}</p>
        <p className={`text-xl font-extrabold ${colorClass || 'text-[var(--color-primary)]'}`}>{value}</p>
    </div>
);


export default function CreatorDashboard() {
    const [deals, setDeals] = useState(mockCreatorDeals);
    // Asumsi totalEarned dihitung dari mock data
    const totalEarned = deals.filter(d => d.status === 'PAID').reduce((sum, d) => sum + Number(d.amount), 0);

    const totalDeals = deals.length;
    const completedDeals = deals.filter(d => d.status === 'PAID').length;
    const completionRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0;

    return (
        <div className="min-h-screen bg-[var(--color-light)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
                {/* Balance Card - Menggunakan Card Neo-Brutalism */}
                <div className="p-6 mb-8 border-4 border-[var(--color-primary)] bg-[var(--color-neutral)] rounded-none shadow-[6px_6px_0px_0px_var(--color-primary)]">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            {/* Ikon dengan blok warna solid */}
                            <div className="w-10 h-10 bg-green-600 border-2 border-[var(--color-primary)] flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-[var(--color-primary)]/70 text-sm font-sans">TOTAL EARNINGS (PAID)</p>
                                <p className="text-3xl font-extrabold text-green-600">
                                    {formatIDR(totalEarned)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/profile" className="btn-small">
                                GO TO WALLET
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Dashboard Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-1">CREATOR DASHBOARD</h1>
                        <p className="text-[var(--color-primary)]/70 font-sans">Secure your payments for every sponsorship contract.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    <StatCard title="TOTAL CONTRACTS" value={totalDeals.toString()} />
                    <StatCard title="DEALS IN REVIEW" value={deals.filter(d => d.status === 'PENDING_REVIEW').length.toString()} colorClass="text-orange-600" />
                    <StatCard title="COMPLETED RATE" value={`${completionRate.toFixed(0)}%`} colorClass="text-blue-600" />
                    <StatCard title="DISPUTED CONTRACTS" value={deals.filter(d => d.status === 'DISPUTED').length.toString()} colorClass="text-red-600" />
                </div>

                {/* Deals List */}
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 tracking-tight border-b-2 border-dashed border-[var(--color-primary)] inline-block pb-1">MY CONTRACTS</h2>
                
                {deals.length === 0 ? (
                    <div className="card-neutral text-center py-12 border-dashed">
                        <Inbox className="w-16 h-16 text-[var(--color-primary)]/30 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-[var(--color-primary)] mb-4">No Contracts Yet</p>
                        <p className="text-[var(--color-primary)]/70 max-w-lg mx-auto font-sans">
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

            {/* Footer */}
            <footer className="py-8 border-t-4 border-[var(--color-primary)] bg-[var(--color-neutral)] mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--color-primary)]/80 font-mono">
                    &copy; 2025 ETHARIS. TRUSTLESS DEALS, GUARANTEED RESULTS.
                </div>
            </footer>
        </div>
    );
}
