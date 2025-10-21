// File: src/app/creator/page.tsx

'use client'

import { Loader2, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { useDealsQuery } from '@/hooks/useDeal';
import { DealCard } from '@/components/DealCard';

// --- DUMMY AUTH HOOKS (Ganti dengan implementasi nyata Anda) ---
const useAuth = () => ({ isAuthenticated: true, userRole: 'CREATOR', balance: 500000 }); 
const formatIDR = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
// -----------------------------------------------------------


export default function CreatorDashboardPage() {
  const { userRole, balance } = useAuth();
  const { data: deals, isLoading, isError, error } = useDealsQuery();

  if (userRole !== 'CREATOR') {
    return <div className="text-center py-20">Akses Ditolak. Anda bukan Creator.</div>;
  }

  const waitingSubmission = deals?.filter(d => d.status === 'ACTIVE').length || 0;
  const completedPayments = deals?.filter(d => d.status === 'COMPLETED' || d.status === 'RESOLVED_PAID').length || 0;


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">Creator Dashboard</h1>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Balance Card */}
        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">IDRX Balance (IDR)</p>
            <p className="text-3xl font-extrabold text-green-600">{formatIDR(balance)}</p>
          </div>
          <Zap className="w-8 h-8 text-yellow-500"/>
        </div>

        {/* Waiting Submission Card */}
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">Tugas Menunggu Submission</p>
            <p className="text-3xl font-extrabold text-blue-700">{waitingSubmission}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-blue-500"/>
        </div>

        {/* Completed Deals Card */}
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">Pembayaran Selesai</p>
            <p className="text-3xl font-extrabold text-green-700">{completedPayments}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500"/>
        </div>
      </div>

      {/* Deal List */}
      <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 mt-8">My Assignments</h2>

      {isLoading && (
        <div className="text-center py-10 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3"/> Loading Assignments...
        </div>
      )}

      {isError && (
        <div className="text-center py-10 text-red-600 border border-red-300 rounded-lg p-4">
          Error loading assignments: {error?.message}
        </div>
      )}

      {deals && deals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <DealCard key={deal.deal_id} deal={deal} userRole="CREATOR" />
          ))}
        </div>
      ) : (
        !isLoading && !isError && (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl p-8">
            <p className="text-lg text-gray-600">Anda belum memiliki tugas Deal aktif. Segera dapatkan micro-sponsorship!</p>
          </div>
        )
      )}
    </div>
  )
}