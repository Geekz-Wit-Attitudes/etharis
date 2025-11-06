'use client';

import { useParams, useRouter } from 'next/navigation';
import { Loader2, Clock, User, DollarSign, FileText, Send, XCircle, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { useDealQuery } from '@/hooks/useDeal';
import { ActionButtons } from '@/components/ActionsButton';
import { TimerCountdown } from '@/components/TimerCountdown';
import { getSecureDownloadUrl, initiateDealFunding } from '@/lib/deal/services';
import { useEtharisStore } from '@/lib/store';
import { useState } from 'react';
import { FundingInitiationResponse, DealResponse, DealStatus } from '@/lib/deal/types';
import { DealFundingModal } from '@/components/DealFundingModal';
import toast from 'react-hot-toast';
import { formatIDR, formatTimestamp } from '@/lib/utils';



export default function DealDetailPage() {
  const params = useParams();
  const dealId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user } = useEtharisStore();
  const userRole = user?.role;
  const { data: deal, isLoading, isError, error } = useDealQuery(dealId as string);

  const dealStatus = deal?.status || "PENDING"

  const [fundingData, setFundingData] = useState<FundingInitiationResponse | null>(null);

  const totalDeposit = deal ? deal.amount * (1 + 0.025) : 0;

  const handleInitiateFunding = async (dealToFund: DealResponse) => {
    try {
      const response = await initiateDealFunding(dealToFund.deal_id, dealToFund.amount);
      setFundingData(response);
    } catch (e) {
      toast.error('Gagal menginisiasi funding. Coba refresh halaman.');
      console.error(e);
    }
  };

  const handleCloseFunding = () => {
    setFundingData(null);
  };


  if (!dealId || isLoading) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" /> Loading Deal Details...
      </div>
    );
  }

  if (isError || !deal) {
    return (
      <div className="text-center py-20 text-red-600 border border-red-300 rounded-lg p-4 mx-auto max-w-xl">
        <XCircle className="w-8 h-8 mx-auto mb-3" />
        Error: Deal not found or access denied. {error?.message}
      </div>
    );
  }

  // Logic untuk Review Countdown
  const isBrand = userRole === 'brand';
  const showReviewCountdown = dealStatus === 'PENDING_REVIEW' && deal.review_deadline && isBrand;
  const deadlineTimestamp = deal.review_deadline || 0;

  const handleDownloadBrief = async () => {
    try {
      const briefId = deal.brief_hash;
      if (!briefId) {
        return toast.error('Dokumen Brief tidak ditemukan.');
      }
      const secureUrl = await getSecureDownloadUrl(briefId);
      window.open(secureUrl, '_blank');
    } catch (e) {
      toast.error('Gagal mendapatkan URL download Brief.');
      console.error(e);
    }
  };

  // Helper untuk menentukan warna Brutalism status
  const getBrutalStatusColor = (status: DealStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500 border-green-700 text-white';
      case 'ACTIVE':
        return 'bg-blue-600 border-blue-800 text-white';
      case 'DISPUTED':
      case 'CANCELLED':
        return 'bg-red-600 border-red-800 text-white';
      case 'PENDING':
      case 'PENDING_REVIEW':
      default:
        return 'bg-yellow-500 border-[var(--color-primary)] text-[var(--color-primary)]';
    }
  }

  const handleRefresh = () => {
    window.location.href = "/dashboard/deals/" + dealId
  }


  return (
    <div className="container mx-auto py-8 px-4">
      {/* MODAL FUNDING DARI CALLBACK */}
      {fundingData && <DealFundingModal fundingData={fundingData} onClose={handleCloseFunding} onNavigate={handleRefresh} />}

      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-4 uppercase">Detail Deal #{deal.deal_id.substring(0, 8)}</h1>

      {/* Status Card (BRUTALISM BANNER) */}
      <div className={`p-6 mb-8 border-4 border-[var(--color-primary)] shadow-[8px_8px_0px_0px_var(--color-primary)] ${getBrutalStatusColor(dealStatus)}`}>
        <p className="text-sm font-semibold uppercase opacity-90">Current Status</p>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold uppercase">
            {dealStatus.replace('_', ' ')}
          </h2>
          {showReviewCountdown && (
            <div className="text-right">
              <p className="text-sm font-semibold uppercase flex items-center justify-end mb-2">
                <AlertTriangle className="w-3 h-3 mr-1" /> REVIEW COUNTDOWN
              </p>
              <TimerCountdown expiresAt={deadlineTimestamp} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Detail Utama (2/3 lebar) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Kontrak Information Card */}
          <div className="bg-white p-6 space-y-4 border-4 border-[var(--color-primary)] shadow-[4px_4px_0px_0px_var(--color-primary)]">
            <h3 className="text-xl font-bold border-b-2 border-dashed border-[var(--color-primary)] pb-2 mb-4 uppercase">Informasi Kontrak</h3>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-600 uppercase">Deadline Konten</p>
                <p className="text-lg font-extrabold text-[var(--color-primary)] flex items-center gap-1"><Clock className="w-5 h-5 text-red-600" />{formatTimestamp(deal.deadline)}</p>
              </div>
              {deal.disputed_at
                ? (<div className='btn-primary bg-red-500 text-neutral flex flex-col'>
                  <p>Dispute Reason:</p>
                  <p className='my-2 bg-[var(--color-secondary)] text-[var(--color-primary)] py-3 px-2 rounded-none border-4 border-[var(--color-primary)] '>{deal.dispute_reason}</p>
                  <p>Status: {deal.status === "DISPUTED" ? "Menunggu Creator" : deal.accepted_dispute ? "Creator menerima 50/50" : "Creator tidak menerima dispute. Dana dikembalikan ke Brand."}</p>
                </div>)
                : null}
            </div>
          </div>

          {/* Konten Submitted Card */}
          {deal.content_url && (
            <div className="bg-[var(--color-neutral)] p-6 space-y-3 border-4 border-[var(--color-primary)] shadow-[4px_4px_0px_0px_var(--color-primary)]">
              <h3 className="text-xl font-bold border-b-2 border-dashed border-[var(--color-primary)] pb-2 flex items-center gap-2 uppercase">
                <Send className="w-5 h-5 text-[var(--color-primary)]" /> Konten Creator
              </h3>
              <p className="text-sm text-[var(--color-primary)]/70">URL yang diserahkan Creator:</p>
              <a
                href={deal.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 font-extrabold break-all underline"
              >
                {deal.content_url}
              </a>
            </div>
          )}

          {/* Brief Download Card */}
          <div className="bg-white p-6 space-y-3 border-4 border-[var(--color-primary)] shadow-[4px_4px_0px_0px_var(--color-primary)]">
            <h3 className="text-xl font-bold border-b-2 border-dashed border-[var(--color-primary)] pb-2 flex items-center gap-2 uppercase">
              <FileText className="w-5 h-5 text-[var(--color-primary)]" /> Dokumen Brief
            </h3>
            <button
              onClick={handleDownloadBrief}
              className="btn-secondary flex items-center gap-2 border-2 border-[var(--color-primary)] shadow-[2px_2px_0px_0px_var(--color-primary)] hover:shadow-[4px_4px_0px_0px_var(--color-primary)]"
              disabled={!deal.brief_hash}
            >
              Download Brief ({deal.brief_hash ? deal.brief_hash.substring(0, 8) : 'N/A'}...)
            </button>
          </div>

          {/* Timestamps Card */}
          <div className="bg-white p-6 text-sm text-gray-600 border-4 border-[var(--color-primary)] shadow-[4px_4px_0px_0px_var(--color-primary)]">
            <h3 className="text-xl font-bold border-b-2 border-dashed border-[var(--color-primary)] pb-2 mb-4 uppercase">Riwayat Waktu</h3>
            <div className="space-y-2 font-mono text-[var(--color-primary)]">
              <p className="flex justify-between"><span>Didanai:</span> <span>{formatTimestamp(deal.funded_at)}</span></p>
              <p className="flex justify-between"><span>Diserahkan:</span> <span>{formatTimestamp(deal.submitted_at)}</span></p>
              <p className="flex justify-between"><span>Review Selesai:</span> <span>{formatTimestamp(deal.review_deadline)}</span></p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan - Data Finansial, Aksi, Timestamps (1/3 lebar) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Finansial & Pihak Card */}
          <div className="bg-white p-6 border-4 border-[var(--color-primary)] shadow-[4px_4px_0px_0px_var(--color-primary)]">
            <h3 className="text-xl font-bold border-b-2 border-dashed border-[var(--color-primary)] pb-2 mb-4 uppercase">Finansial & Pihak</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300">
                <p className="text-sm text-gray-600 uppercase">Creator Earns</p>
                <p className="text-xl font-extrabold text-green-600 flex items-center gap-1"><DollarSign className="w-4 h-4" />{formatIDR(deal.amount)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 uppercase">Total Deposit (Est.)</p>
                <p className="text-lg font-extrabold text-[var(--color-primary)] flex items-center gap-1"><Zap className="w-4 h-4 text-[var(--color-secondary)]" />{formatIDR(totalDeposit)}</p>
              </div>
              <div className="pt-4 border-t border-dashed border-gray-300 mt-4">
                <p className="text-xs text-gray-500 uppercase">Brand Wallet</p>
                <p className="text-sm font-medium break-all">{deal.brand.substring(0, 10)}...{deal.brand.substring(deal.brand.length - 8)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Creator Wallet</p>
                <p className="text-sm font-medium break-all">{deal.creator.substring(0, 10)}...{deal.creator.substring(deal.creator.length - 8)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons Card */}
          <div className="bg-[var(--color-neutral)] p-6 border-4 border-[var(--color-primary)] shadow-[4px_4px_0px_0px_var(--color-primary)]">
            <h3 className="text-xl font-bold border-b-2 border-dashed border-[var(--color-primary)] pb-2 mb-4 uppercase">Aksi Deal</h3>
            <ActionButtons deal={deal} onInitiateFunding={isBrand ? handleInitiateFunding : undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
