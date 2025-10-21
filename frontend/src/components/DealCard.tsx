// File: src/components/DealCard.tsx (ADJUSTMENT)

'use client';

import Link from 'next/link';
import { Clock, DollarSign, User, Zap } from 'lucide-react';
import { DealResponse, DealStatus } from '@/lib/deal/types';
import { ActionButtons } from './ActionsButton';

// Asumsi formatIDR dan formatTimestamp exist
const formatIDR = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatTimestamp = (ts: number) => new Date(ts * 1000).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });

interface DealCardProps {
  deal: DealResponse;
  userRole: 'BRAND' | 'CREATOR';
}

// Helper untuk Badge Status
const getStatusBadge = (status: DealStatus) => {
  const base = "px-3 py-1 rounded-full text-xs font-semibold uppercase";
  switch (status) {
    case 'ACTIVE':
    case 'COMPLETED':
    case 'RESOLVED_PAID':
      return <span className={`${base} bg-green-100 text-green-700`}>{status.replace('_', ' ')}</span>;
    case 'PENDING_REVIEW':
      return <span className={`${base} bg-blue-100 text-blue-700`}>Submitted</span>;
    case 'IN_DISPUTE':
      return <span className={`${base} bg-red-100 text-red-700`}>Dispute</span>;
    case 'CREATED':
    case 'PENDING_FUNDING':
      return <span className={`${base} bg-yellow-110 text-yellow-700`}>Pending Funding</span>;
    case 'CANCELLED':
    case 'REFUNDED':
        return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
  }
};

export function DealCard({ deal, userRole }: DealCardProps) {
  // Tentukan apakah user adalah Brand atau Creator
  const isBrand = userRole === 'BRAND';
  const counterpartyTitle = isBrand ? 'Creator' : 'Brand';
  
  // Tampilkan alamat lawan sebagai identitas
  const counterpartyAddress = isBrand ? deal.creator : deal.brand;

  // Hitung total deposit (Asumsi fee 2%)
  const totalDeposit = deal.amount * (1 + 0.02); 

  // Tentukan URL Detail: Brand & Creator menggunakan path yang sama /dashboard/deals/[id]
  const detailUrl = `/dashboard/deals/${deal.deal_id}`;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <Link href={detailUrl} className="block">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-[var(--color-primary)] truncate">
            Deal ID: {deal.deal_id.substring(0, 8)}...
          </h3>
          {getStatusBadge(deal.status)}
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span>Amount: **{formatIDR(deal.amount)}**</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Deposit: **{formatIDR(totalDeposit)}**</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-500" />
            <span>Deadline: **{formatTimestamp(deal.deadline)}**</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <span>{counterpartyTitle}: {counterpartyAddress.substring(0, 10)}...</span>
          </div>
        </div>

        <p className="text-xs text-gray-500">Hash Brief: {deal.brief_hash.substring(0, 15)}...</p>
      </Link>
      
      {/* AREA AKSI (TAMBAHAN UTAMA) */}
      <ActionButtons deal={deal} /> {/* <--- NEW COMPONENT CALL */}
    </div>
  );
}