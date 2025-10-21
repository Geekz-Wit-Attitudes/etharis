// File: src/components/DealFundingModal.tsx (FINAL VERSION)

'use client'

import { X, ExternalLink, CreditCard, Loader2 } from 'lucide-react'
import { FundingInitiationResponse } from '@/lib/deal/types'
import { useFundDealMutation } from '@/hooks/useDeal'; // <-- HOOK BARU

// Helper formatIDR mock
const formatIDR = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);


interface DealFundingModalProps {
  fundingData: FundingInitiationResponse;
  onClose: () => void;
}

export function DealFundingModal({ fundingData, onClose }: DealFundingModalProps) {
  const { totalDeposit, paymentLinkUrl } = fundingData;
  
  // Inisiasi Mutasi Fund Deal yang sudah dimodifikasi (termasuk mock minting)
  const fundMutation = useFundDealMutation({
      onSuccess: () => {
          // Tutup modal setelah funding dikonfirmasi
          alert('Konfirmasi pembayaran berhasil! Deal Anda sekarang ACTIVE.');
          onClose(); 
      },
      onError: (error) => {
          // Tampilkan error jika proses konfirmasi di backend gagal
          alert(`Gagal mengkonfirmasi pendanaan: ${error.message}.`);
      }
  });

  const handleConfirmPaid = () => {
      // Tombol ini sekarang memicu alur Mint (Mock) -> Fund API
      // Kita langsung panggil mutasi dengan data yang dibutuhkan (deal_id dan totalDeposit)
      fundMutation.mutate(fundingData);
  };

  const isLoading = fundMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-[var(--color-primary)]">
        
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6"/> 
            Complete Deal Funding (IDRX)
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors" disabled={isLoading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-lg font-semibold text-gray-800">
            Deal berhasil dibuat! Mohon selesaikan deposit ke escrow:
          </p>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-400">
            <p className="text-sm font-medium text-blue-800">Jumlah Deposit Total (IDR)</p>
            <p className="text-3xl font-extrabold text-blue-600">{formatIDR(totalDeposit)}</p>
          </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Langkah 1: Bayar melalui tautan IDRX. Langkah 2: Klik **Sudah Bayar** di bawah untuk konfirmasi ke sistem escrow.
              </p>
              <a
                href={paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
              >
                Bayar via IDRX Payment Link
                <ExternalLink className="w-5 h-5" />
              </a>
              <button 
                onClick={handleConfirmPaid} // Memanggil handler mutasi MINT -> FUND
                className="btn-secondary w-full text-md flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {/* Text tombol mencerminkan alur Mocking/Prototyping */}
                {isLoading ? 'Mengkonfirmasi Fund Deal...' : 'Sudah Bayar (Konfirmasi Funding ke Escrow)'}
              </button>
            </div>
            
          {fundMutation.isError && (
              <p className="text-sm text-red-500 text-center mt-2">Error Konfirmasi: {fundMutation.error.message}</p>
          )}

          <p className="text-xs text-center text-gray-500 pt-2">
            Deal hanya akan berstatus Active setelah dana dikonfirmasi masuk ke escrow.
          </p>
        </div>
      </div>
    </div>
  )
}