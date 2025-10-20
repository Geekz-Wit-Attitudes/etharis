// File: src/components/DealFundingModal.tsx

import { X, ExternalLink, CreditCard } from 'lucide-react'
import { FundingInitiationResponse } from '@/lib/deal/types'
// import { formatIDR } from '@/lib/utils' // Asumsi formatIDR ada

// Helper formatIDR mock
const formatIDR = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);


interface DealFundingModalProps {
  fundingData: FundingInitiationResponse;
  onClose: () => void;
}

export function DealFundingModal({ fundingData, onClose }: DealFundingModalProps) {
  const { totalDeposit, paymentLinkUrl } = fundingData;
  const isLinkPayment = fundingData.paymentMethod === 'IDRX_LINK';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-[var(--color-primary)]">
        
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6"/> 
            Complete Deal Funding (IDRX)
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
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

          {isLinkPayment ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Kami telah menghasilkan tautan pembayaran langsung dari IDRX Stablecoin API. Pembayaran akan otomatis mengunci dana di *Smart Contract Escrow* Anda.
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
                onClick={onClose} 
                className="btn-secondary w-full text-md"
              >
                Sudah Bayar / Kembali ke Dashboard
              </button>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
              <p className="font-bold">Error: Payment Link not generated.</p>
            </div>
          )}

          <p className="text-xs text-center text-gray-500 pt-2">
            Deal hanya akan berstatus Active setelah dana dikonfirmasi masuk ke escrow.
          </p>
        </div>
      </div>
    </div>
  )
}