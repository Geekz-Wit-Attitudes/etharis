// File: src/app/dashboard/deals/[id]/page.tsx (UPDATED)

'use client';

import { useParams } from 'next/navigation';
import { Loader2, Clock, User, DollarSign, FileText, Send, XCircle, AlertTriangle } from 'lucide-react';
import { useDealQuery } from '@/hooks/useDeal';
import { ActionButtons } from '@/components/ActionsButton'; // <-- CORRECTED IMPORT
import { TimerCountdown } from '@/components/TimerCountdown'; 
import { getSecureDownloadUrl, initiateDealFunding } from '@/lib/deal/services'; // <-- NEW IMPORT initiateDealFunding
import { useEtharisStore } from '@/lib/store';
import { useState } from 'react'; // <-- NEW IMPORT
import { FundingInitiationResponse, DealResponse } from '@/lib/deal/types'; // <-- NEW IMPORT
import { DealFundingModal } from '@/components/DealFundingModal'; // <-- NEW IMPORT
import toast from 'react-hot-toast';

// Asumsi formatIDR dan formatTimestamp exist
const formatIDR = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
const formatTimestamp = (ts: number | null) => {
    if (!ts || ts === 0) return 'N/A'; // Ditambah 'N/A' untuk kejelasan
    return new Date(ts * 1000).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function DealDetailPage() {
  const params = useParams();
  const dealId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { user } = useEtharisStore();
  const userRole = user?.role;
  const { data: deal, isLoading, isError, error } = useDealQuery(dealId as string);

  // State untuk mengontrol modal funding
  const [fundingData, setFundingData] = useState<FundingInitiationResponse | null>(null); // <-- NEW STATE

  const totalDeposit = deal ? deal.amount * (1 + 0.02) : 0; 

  // Handler untuk Funding (dipanggil dari ActionButtons)
  const handleInitiateFunding = async (dealToFund: DealResponse) => {
      try {
          // Panggil service untuk mendapatkan payment link (mocking)
          const response = await initiateDealFunding(dealToFund.deal_id, dealToFund.amount);
          setFundingData(response); // Tampilkan modal
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
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3"/> Loading Deal Details...
      </div>
    );
  }

  if (isError || !deal) {
    return (
      <div className="text-center py-20 text-red-600 border border-red-300 rounded-lg p-4 mx-auto max-w-xl">
        <XCircle className="w-8 h-8 mx-auto mb-3"/> 
        Error: Deal not found or access denied. {error?.message}
      </div>
    );
  }
  
  // Logic untuk Review Countdown
  const isBrand = userRole === 'brand';
  // Menggunakan status yang benar: CONTENT_SUBMITTED (bukan PENDING_REVIEW)
  const showReviewCountdown = deal.status === 'PENDING_REVIEW' && deal.review_deadline && isBrand; 
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


  return (
    <div className="container mx-auto py-8 px-4">
        {/* MODAL FUNDING DARI CALLBACK */}
        {fundingData && <DealFundingModal fundingData={fundingData} onClose={handleCloseFunding} />}

      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-4">Detail Deal #{deal.deal_id.substring(0, 8)}</h1>
      
      {/* Status Card & Countdown */}
      <div className={`p-6 rounded-xl shadow-lg mb-8 border-l-8 ${
        deal.status === 'COMPLETED' || deal.status === 'RESOLVED_PAID' ? 'bg-green-50 border-green-500' :
        deal.status === 'ACTIVE' || deal.status === 'PENDING_REVIEW' ? 'bg-blue-50 border-blue-500' :
        deal.status === 'IN_DISPUTE' ? 'bg-red-50 border-red-500' :
        'bg-yellow-50 border-yellow-500'
      }`}>
        <p className="text-sm font-medium text-gray-600">Current Status</p>
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-extrabold text-[var(--color-primary)]">
                {deal.status.replace('_', ' ')}
            </h2>
            {showReviewCountdown && (
                <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 uppercase flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1 text-red-500"/> Review Countdown
                    </p>
                    <TimerCountdown expiresAt={deadlineTimestamp.toString()} />
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri - Detail Utama */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-primary p-6 space-y-4">
            <h3 className="text-xl font-bold border-b pb-2 mb-4">Informasi Kontrak</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* PLATFORM dan DELIVERABLE dikembalikan ke tampilan */}
              {/* <div>
                <p className="text-sm text-gray-500">Platform</p>
                <p className="font-semibold">{deal.platform}</p>
              </div> */}
              <div>
                <p className="text-sm text-gray-500">Deadline Konten</p>
                <p className="font-semibold flex items-center gap-1"><Clock className="w-4 h-4"/>{formatTimestamp(deal.deadline)}</p>
              </div>
            </div>

            {/* <div>
              <p className="text-sm text-gray-500">Deliverable</p>
              <p className="font-semibold">{deal.deliverable}</p>
            </div> */}
          </div>

          {/* Konten Submitted, Brief Download... (tetap sama) */}
          {deal.content_url && (
            <div className="card-primary p-6 space-y-3 bg-blue-50">
              <h3 className="text-xl font-bold border-b border-blue-200 pb-2 flex items-center gap-2">
                <Send className="w-5 h-5"/> Konten Creator
              </h3>
              <p className="text-sm text-gray-600">URL yang diserahkan Creator:</p>
              <a 
                href={deal.content_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 break-all hover:underline font-medium"
              >
                {deal.content_url}
              </a>
            </div>
          )}

          {/* Brief Download */}
          <div className="card-primary p-6 space-y-3">
            <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5"/> Dokumen Brief
            </h3>
            <button 
                onClick={handleDownloadBrief} 
                className="btn-secondary-normal flex items-center gap-2"
                disabled={!deal.brief_hash}
            >
                Download Brief ({deal.brief_hash ? deal.brief_hash.substring(0, 8) : 'N/A'}...)
            </button>
          </div>
        </div>

        {/* Kolom Kanan - Data Finansial & Aksi */}
        <div className="lg:col-span-1 space-y-6">
            <div className="card-primary p-6">
                <h3 className="text-xl font-bold border-b pb-2 mb-4">Finansial & Pihak</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Creator Earns</p>
                        <p className="text-lg font-extrabold text-green-600">{formatIDR(deal.amount)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500">Total Deposit (Est.)</p>
                        <p className="text-lg font-extrabold text-yellow-600">{formatIDR(totalDeposit)}</p>
                    </div>
                    <div className="pt-2 border-t mt-2">
                        <p className="text-xs text-gray-500">Brand Wallet</p>
                        <p className="text-sm font-medium break-all">{deal.brand.substring(0, 10)}...{deal.brand.substring(deal.brand.length - 8)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Creator Wallet</p>
                        <p className="text-sm font-medium break-all">{deal.creator.substring(0, 10)}...{deal.creator.substring(deal.creator.length - 8)}</p>
                    </div>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="card-primary p-6">
                <h3 className="text-xl font-bold border-b pb-2 mb-4">Aksi Deal</h3>
                {/* Mempassing handler untuk Funding */}
                <ActionButtons deal={deal} onInitiateFunding={isBrand ? handleInitiateFunding : undefined} />
            </div>

            {/* Timestamps */}
            <div className="card-primary p-6 text-sm text-gray-600">
                <h3 className="text-xl font-bold border-b pb-2 mb-4">Riwayat Waktu</h3>
                <div className="space-y-2">
                    <p>Didanai: {formatTimestamp(deal.funded_at)}</p>
                    <p>Diserahkan: {formatTimestamp(deal.submitted_at)}</p>
                    <p>Review Selesai: {formatTimestamp(deal.review_deadline)}</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}