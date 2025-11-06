'use client'

import Link from 'next/link'
import { Inbox, DollarSign, Loader2, Zap, AlertTriangle, Handshake, CheckCircle } from 'lucide-react'
import { DealCard } from '@/components/DealCard'
import { useDealsQuery } from '@/hooks/useDeal';
import { useEtharisStore } from '@/lib/store';
import { formatIDR } from '@/lib/utils';

const StatCard = ({ title, value, colorClass }: { title: string, value: string, colorClass?: string }) => (
    // Menggunakan styling Neo-Brutalism asli dari Kode 1
    <div className="p-4 border-2 border-[var(--color-primary)] bg-[var(--color-light)] rounded-none shadow-[3px_3px_0px_0px_var(--color-primary)]">
        <p className="text-[var(--color-primary)]/70 text-xs mb-1 font-sans">{title}</p>
        <p className={`text-xl font-extrabold ${colorClass || 'text-[var(--color-primary)]'}`}>{value}</p>
    </div>
);

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-light)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
    </div>
);

export default function CreatorDashboard() {
    const { user, isAuthenticated } = useEtharisStore();
    const { data: deals, isLoading, isError } = useDealsQuery();

    const isCorrectRole = user?.role === 'creator';

    if (!isCorrectRole && isAuthenticated) {
        return <div className="text-center py-20">Akses Ditolak. Anda bukan Creator.</div>;
    } else if (!isAuthenticated || !isCorrectRole) {
        return <LoadingSpinner />;
    }
    
    // --- LOGIC CALCULATIONS DARI HOOKS ---
    const allDeals = deals || [];
    const totalEarned = allDeals
        // Gunakan amount dari DealResponse (sudah berupa number)
        .filter(d => d.status === 'COMPLETED')
        .reduce((sum, d) => sum + (d.accepted_dispute ? (Math.round(Number(d.amount)) / 2) : Math.round(Number(d.amount))), 0);

    const dealsInReview = allDeals.filter(d => d.status === 'PENDING_REVIEW').length;
    const disputedDeals = allDeals.filter(d => d.status === 'DISPUTED').length;
    const completedDealsCount = allDeals.filter(d => d.status === 'COMPLETED').length;
    const totalDealsCount = allDeals.length;
    const completionRate = totalDealsCount > 0 ? (completedDealsCount / totalDealsCount) * 100 : 0;


    return (
        <div className="min-h-screen bg-[var(--color-light)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
                
                <div className="p-6 mb-10 border-4 border-[var(--color-primary)] bg-[var(--color-neutral)] rounded-none shadow-[6px_6px_0px_0px_var(--color-primary)]">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
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
                            <Link href="/profile" className="btn-small shadow-[3px_3px_0px_0px_var(--color-primary)]">
                                GO TO WALLET
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-1">CREATOR DASHBOARD</h1>
                        <p className="text-[var(--color-primary)]/70 font-sans">Secure your payments for every sponsorship contract.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    <StatCard title="TOTAL CONTRACTS" value={totalDealsCount.toString()} />
                    <StatCard title="DEALS IN REVIEW" value={dealsInReview.toString()} colorClass="text-orange-600" />
                    <StatCard title="COMPLETED RATE" value={`${completionRate.toFixed(0)}%`} colorClass="text-blue-600" />
                    <StatCard title="DISPUTED CONTRACTS" value={disputedDeals.toString()} colorClass="text-red-600" />
                </div>

                {/* Deals List */}
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 tracking-tight border-b-2 border-dashed border-[var(--color-primary)] inline-block pb-1">MY CONTRACTS</h2>
                
                {isLoading && (
                    <div className="text-center py-12 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4"/> Loading Contracts...
                    </div>
                )}
                
                {isError && (
                    <div className="text-center py-12 text-red-600 border-2 border-red-400 p-4 rounded-none shadow-[4px_4px_0px_0px_red]">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2"/> Error fetching deals.
                    </div>
                )}

                {allDeals.length === 0 && !isLoading && !isError ? (
                    <div className="card-neutral text-center py-12 border-dashed border-2 border-[var(--color-primary)]/50">
                        <Inbox className="w-16 h-16 text-[var(--color-primary)]/30 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-[var(--color-primary)] mb-4">No Contracts Yet</p>
                        <p className="text-[var(--color-primary)]/70 max-w-lg mx-auto font-sans">
                            Brands will invite you directly to a secured ETHARIS contract. No more manual searching!
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allDeals.map((deal) => (
                            // DealCard yang sudah diimplementasikan sebelumnya
                            <DealCard 
                                key={deal.deal_id} 
                                deal={deal} 
                                userRole="CREATOR" 
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
