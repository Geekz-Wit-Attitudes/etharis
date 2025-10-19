// File: src/app/dashboard/deals/new/page.tsx

'use client'

import { useState } from 'react'
import { CreateDealForm } from '@/components/CreateDealForm'
import { DealFundingModal } from '@/components/DealFundingModal'
import { FundingInitiationResponse } from '@/lib/deal/types'

export default function NewDealPage() {
  // State untuk melacak data pembayaran yang diterima setelah Deal dibuat.
  const [fundingData, setFundingData] = useState<FundingInitiationResponse | null>(null);

  // Fungsi yang dipanggil oleh CreateDealForm setelah deal berhasil dibuat dan pendanaan diinisiasi.
  const handleDealCreated = (data: FundingInitiationResponse) => {
    setFundingData(data);
  };
  
  // Fungsi untuk menutup modal (mengasumsikan pembayaran sudah dilakukan atau dibatalkan)
  const handleCloseFunding = () => {
    setFundingData(null);
    // Logika tambahan: Redirect ke dashboard utama atau halaman deal yang baru dibuat
    // window.location.href = '/dashboard/deals';
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">Create New Deal & Fund Escrow</h1>
      
      {!fundingData ? (
        <CreateDealForm onDealCreated={handleDealCreated} />
      ) : (
        <DealFundingModal fundingData={fundingData} onClose={handleCloseFunding} />
      )}
    </div>
  )
}