'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Handshake, TrendingUp, DollarSign, AlertCircle, CheckCircle, Wallet, Loader2 } from 'lucide-react'
import { DealCard } from '@/components/DealCard'
import { formatIDR } from '@/lib/utils'
import { useEtharisStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar' // Assuming Navbar is used here
import { useDealsQuery } from '@/hooks/useDeal'
import Image from 'next/image'

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

// Stat Card component dengan gaya Neo-Brutalism
const StatCard = ({ title, value, colorClass }: { title: string, value: string, colorClass?: string }) => (
    <div className="p-4 border-2 border-[var(--color-primary)] bg-[var(--color-neutral)] rounded-none shadow-[3px_3px_0px_0px_var(--color-primary)]">
        <p className="text-[var(--color-primary)]/70 text-xs mb-1 font-sans">{title}</p>
        <p className={`text-xl font-extrabold ${colorClass || 'text-[var(--color-primary)]'}`}>{value}</p>
    </div>
);


export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, user, balance } = useEtharisStore();
    // const [deals, setDeals] = useState(mockDeals); // Placeholder for deal data
    const { data: deals, isLoading, isError, error } = useDealsQuery();

    // --- ACCESS CONTROL LOGIC ---
    const isCorrectRole = user?.role === 'brand';

    useEffect(() => {
        // Cek jika state sudah selesai dimuat (Zustand persist)
        if (typeof isAuthenticated !== 'undefined' && typeof window !== "undefined") {
            if (!isAuthenticated) {
                // 1. Tidak terautentikasi -> Redirect ke Login
                // router.push('/auth/login');
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

    const totalDeals = deals?.length || 0;
    const activeDeals = deals?.filter(d => d.status === 'ACTIVE' || d.status === 'PENDING_REVIEW').length || 0;
    const completedDeals = deals?.filter(d => d.status === 'COMPLETED').length || 0;

    // Total Locked Value dihitung dari semua deal yang belum selesai
    const totalLockedValue = deals
        ?.filter(d => d.status !== 'COMPLETED' && d.status !== 'CANCELLED' && d.status !== 'REFUNDED')
        .reduce((sum, d) => sum + Number(d.amount), 0) 
        || 0;


    return (
        <div className="min-h-screen bg-[var(--color-light)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
                {/* Dashboard Header - Menggunakan Card Neo-Brutalism */}
                <div className="p-6 mb-8 border-4 border-[var(--color-primary)] bg-[var(--color-light)] rounded-none shadow-[6px_6px_0px_0px_var(--color-primary)]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-1">BRAND DASHBOARD</h1>
                            <p className="text-[var(--color-primary)]/70 font-sans">Manage your active sponsorship contracts.</p>
                        </div>
                        <Link href="/dashboard/deals/new" className="btn-small flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            CREATE NEW DEAL
                        </Link>
                    </div>
                </div>


                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    <StatCard title="TOTAL DEALS" value={totalDeals.toString()} />
                    <StatCard title="ACTIVE / REVIEW" value={activeDeals.toString()} colorClass="text-blue-600" />
                    <StatCard title="COMPLETED DEALS" value={completedDeals.toString()} colorClass="text-green-600" />
                    <StatCard title="TOTAL LOCKED VALUE" value={formatIDR(totalLockedValue)} />
                </div>

                {/* Deals List */}
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 tracking-tight border-b-2 border-dashed border-[var(--color-primary)] inline-block pb-1">ACTIVE CONTRACTS</h2>

                {deals?.length === 0 || !deals ? (
                    <div className="card-neutral text-center py-12 border-dashed">
                        <Image src={'/handshake.png'} width={500} height={500} alt='handshake' className="w-50 h-auto text-[var(--color-primary)]/30 mx-auto mb-4" />
                        <p className="text-xl font-semibold text-[var(--color-primary)] mb-4">No Active Deals</p>
                        <p className="text-[var(--color-primary)]/70 max-w-lg mx-auto font-sans">
                            Start a new sponsorship by clicking "Create New Deal" and securing your payment with our smart contract escrow.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deals?.map((deal, i) => (
                            <DealCard
                            key={i}
                            deal={deal}
                            userRole='BRAND'
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Footer - Dibuat konsisten di layout.tsx atau di setiap halaman jika tidak ada layout global */}
            <footer className="py-8 border-t-4 border-[var(--color-primary)] bg-[var(--color-neutral)] mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--color-primary)]/80 font-mono">
                    &copy; 2025 ETHARIS. TRUSTLESS DEALS, GUARANTEED RESULTS.
                </div>
            </footer>
        </div>
    );
}
