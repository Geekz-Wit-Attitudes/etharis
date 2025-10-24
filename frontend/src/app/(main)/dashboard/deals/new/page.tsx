'use client'

import { useState } from 'react'
import { CreateDealForm } from '@/components/CreateDealForm'
import { DealFundingModal } from '@/components/DealFundingModal'
import { FundingInitiationResponse } from '@/lib/deal/types'
import { VerificationGate } from '@/components/VerificationGate'
import { useRouter } from 'next/navigation'
import { useEtharisStore } from '@/lib/store'

export default function NewDealPage() {
  const router = useRouter()
  const {user} = useEtharisStore()
  const [fundingData, setFundingData] = useState<FundingInitiationResponse | null>(null);

  const handleDealCreated = (data: FundingInitiationResponse) => {
    setFundingData(data);
  };
  
  const handleCloseFunding = () => {
    setFundingData(null);
    // window.location.href = '/dashboard/deals';
  }

  const handleNavigateDashboard = () => {
    if (user?.role === "brand") {
       window.location.href = "/dashboard"
    } else if (user?.role === "creator") {
       window.location.href = "/creator"
    }
  }

  return (
    <VerificationGate featureTitle='Create new deal'>
      <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-6">Create New Deal & Fund Escrow</h1>
        <CreateDealForm onDealCreated={handleDealCreated} />
        {fundingData && <DealFundingModal fundingData={fundingData} onClose={handleCloseFunding} onNavigate={handleNavigateDashboard} />}
    </div>
    </VerificationGate>
  )
}