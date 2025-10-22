'use client';

import Link from 'next/link';
import { Clock, DollarSign, User, Zap } from 'lucide-react';
import { DealResponse, DealStatus } from '@/lib/deal/types';
import { ActionButtons } from './ActionsButton'; // <-- Pastikan import benar (ActionsButton -> ActionButtons)

// Asumsi formatIDR dan formatTimestamp exist
const formatIDR = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatTimestamp = (ts: number) => new Date(ts * 1000).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });

interface DealCardProps {
  deal: DealResponse;
  userRole: 'BRAND' | 'CREATOR';
}

// Helper untuk Badge Status
const getStatusBadge = (status: DealStatus) => {
  const base = "px-3 py-1 rounded-sm text-xs font-bold uppercase border-2"; // Border tebal
  switch (status) {
    case 'ACTIVE':
    case 'COMPLETED':
      // Kontras Keras: Hijau terang dengan border hitam
      return <span className={`${base} bg-green-500 text-white border-green-700`}>{status.replace('_', ' ')}</span>;
    case 'PENDING_REVIEW':
      return <span className={`${base} bg-blue-500 text-white border-blue-700`}>Submitted</span>;
    case 'DISPUTED':
      return <span className={`${base} bg-red-600 text-white border-red-800`}>Dispute</span>;
    case 'PENDING':
      // Kontras Kuning/Orange (Secondary Anda)
      return <span className={`${base} bg-[var(--color-secondary)] text-[var(--color-primary)] border-[var(--color-primary)]`}>Pending Funding</span>;
    case 'CANCELLED':
        return <span className={`${base} bg-gray-300 text-gray-700 border-gray-500`}>{status}</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-700 border-gray-500`}>{status}</span>;
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
    <div 
        // Style Neo-Brutalism: Border tebal dan shadow offset
        className="bg-[var(--color-light)] border-4 border-[var(--color-primary)] p-6 
                   shadow-[6px_6px_0px_0px_var(--color-secondary)] 
                   hover:shadow-[8px_8px_0px_0px_var(--color-secondary)] 
                   transition-all duration-300 rounded-none"
    >
      <Link href={detailUrl} className="block">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-extrabold text-[var(--color-primary)] truncate uppercase">
            Deal ID: {deal.deal_id.substring(0, 8)}...
          </h3>
          {getStatusBadge(deal.status)}
        </div>

        {/* Informasi Detail */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm text-[var(--color-primary)]/80 mb-4 font-semibold">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600 border-2 border-[var(--color-primary)] p-[2px] bg-green-200" />
            <span>Amount: <br /> <b>{formatIDR(deal.amount)}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--color-primary)] border-2 border-[var(--color-primary)] p-[2px] bg-[var(--color-secondary)]" />
            <span>Deposit: <br /> <b>{formatIDR(totalDeposit)}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-600 border-2 border-[var(--color-primary)] p-[2px] bg-red-200" />
            <span>Deadline: <br /> <b>{formatTimestamp(deal.deadline)}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600 border-2 border-[var(--color-primary)] p-[2px] bg-blue-200" />
            <span>{counterpartyTitle}: {counterpartyAddress.substring(0, 10)}...</span>
          </div>
        </div>

        <p className="text-xs text-[var(--color-primary)]/60 pt-2 border-t border-dashed border-[var(--color-primary)]/50">Hash Brief: {deal.brief_hash.substring(0, 15)}...</p>
      </Link>
      
      {/* AREA AKSI (TAMBAHAN UTAMA) */}
      <ActionButtons deal={deal} />
    </div>
  );
}
