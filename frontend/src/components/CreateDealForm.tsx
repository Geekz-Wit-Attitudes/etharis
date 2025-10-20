'use client'

import { useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { formatIDR } from '@/lib/utils'
import { useCreateDealMutation } from '@/hooks/useDeal' 
import { CreateDealFormInput, FundingInitiationResponse } from '@/lib/deal/types' 
import { initiateDealFunding } from '@/lib/deal/services'

interface CreateDealFormProps {
  onDealCreated: (data: FundingInitiationResponse) => void;
}

export function CreateDealForm({onDealCreated}: CreateDealFormProps) {
  const [formData, setFormData] = useState<CreateDealFormInput>({
    creatorEmail: '',
    amount: '',
    platform: 'Instagram',
    deliverable: '',
    deadline: '',
  })
  const [briefFile, setBriefFile] = useState<File | null>(null)
  
  const createDealMutation = useCreateDealMutation({
    onSuccess: async (dealData) => {
        console.log('Deal created successfully. Deal ID:', dealData.dealId);

        try {
            // totalDeposit harus ada di dealData 
            const fundingResponse = await initiateDealFunding(dealData.dealId, dealData.totalDeposit);
            
            onDealCreated(fundingResponse);

        } catch (fundingError) {
            console.error('Failed to initiate funding:', fundingError);
            // Menggunakan styling error Neo-Brutalism
            console.error(`Deal created (ID: ${dealData.dealId}), but failed to get payment link: ${fundingError instanceof Error ? fundingError.message : 'Unknown error'}`);
        }
    },
    onError: (error) => {
      // Menggunakan styling error Neo-Brutalism
      console.error(`Gagal membuat deal: ${error.message}`);
    }
  });

  const isLoading = createDealMutation.isPending;

  const feePercentageDisplay = 0.025; // Mengganti 2% menjadi 2.5% agar akurat dengan industri
  const amountNumber = Number(formData.amount) || 0;
  const totalDeposit = amountNumber * (1 + feePercentageDisplay);
  const feeAmount = totalDeposit - amountNumber;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        // NOTE: Menggunakan console.warn/error daripada alert()
        console.warn('Ukuran file melebihi batas 5MB.');
        setBriefFile(null);
        return
      }
      setBriefFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    createDealMutation.mutate({ formData, briefFile });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Summary Block - Border tebal, latar belakang netral */}
      <div className="p-4 border-2 border-[var(--color-primary)] bg-secondary rounded-none">
        <p className="font-extrabold text-[var(--color-primary)] mb-2 tracking-wide">TRANSACTION SUMMARY:</p>
        <div className='flex justify-between text-sm text-[var(--color-primary)]/80 font-sans'>
            <span>CREATOR RECEIVES:</span>
            <span className='font-extrabold'>{formatIDR(amountNumber)}</span>
        </div>
        <div className='flex justify-between text-sm text-[var(--color-primary)]/80 font-sans'>
            <span>PLATFORM FEE (2.5%):</span>
            <span className='font-extrabold'>{formatIDR(feeAmount)}</span>
        </div>
        <div className="h-0.5 bg-[var(--color-primary)] my-2"></div>
        <div className='flex justify-between text-lg font-extrabold text-[var(--color-primary)] pt-1'>
            <span>TOTAL DEPOSIT:</span>
            <span className='text-primary'>{formatIDR(totalDeposit)}</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-[var(--color-primary)] mb-2 tracking-wide">
          CREATOR EMAIL
        </label>
        <input
          type="email"
          placeholder="CREATOR@EXAMPLE.COM"
          value={formData.creatorEmail}
          onChange={(e) => setFormData({ ...formData, creatorEmail: e.target.value })}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--color-primary)] mb-2 tracking-wide">
          AMOUNT (IDR)
        </label>
        <input
          type="number"
          placeholder="500000"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--color-primary)] mb-2 tracking-wide">
          PLATFORM
        </label>
        <select
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value as CreateDealFormInput['platform'] })}
          className="input"
        >
          <option>Instagram</option>
          <option>YouTube</option>
          <option>TikTok</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--color-primary)] mb-2 tracking-wide">
          DELIVERABLE DESCRIPTION
        </label>
        <textarea
          placeholder="E.G., 1 FEED POST, 3 STORIES, AND A LINK IN BIO FOR 7 DAYS"
          value={formData.deliverable}
          onChange={(e) => setFormData({ ...formData, deliverable: e.target.value })}
          className="input"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--color-primary)] mb-2 tracking-wide">
          DEADLINE
        </label>
        <input
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--color-primary)] mb-2 tracking-wide">
          UPLOAD BRIEF (PDF/DOC)
        </label>
        {!briefFile ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-4 border-[var(--color-primary)] border-dashed rounded-none cursor-pointer bg-[var(--color-light)] hover:bg-[var(--color-neutral)] transition-colors">
            <Upload className="w-8 h-8 text-[var(--color-primary)] mb-2" />
            <span className="text-sm font-extrabold text-[var(--color-primary)] tracking-wide">CLICK TO UPLOAD FILE</span>
            <span className="text-xs text-[var(--color-primary)]/70 mt-1 font-sans">PDF, DOC, DOCX (MAX 5MB)</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between bg-neutral p-3 rounded-none border-2 border-[var(--color-primary)] shadow-[2px_2px_0px_0px_var(--color-primary)]">
            <span className="text-sm text-[var(--color-primary)] font-extrabold">{briefFile.name.toUpperCase()}</span>
            {/* Tombol Hapus dengan border tegas */}
            <button
              type="button"
              onClick={() => setBriefFile(null)}
              className="bg-red-700 hover:bg-red-600 transition-colors border-2 border-[var(--color-primary)] p-1 shadow-[1px_1px_0px_0px_var(--color-primary)]"
            >
              <X className="w-4 h-4 text-[var(--color-light)]" />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2 text-xl mt-8"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {isLoading ? 'CREATING DEAL...' : 'PAY & CREATE DEAL'}
      </button>
      
      {createDealMutation.isError && (
        <p className="text-sm text-red-700 mt-2 p-2 border-2 border-red-700 bg-red-100 rounded-none font-sans font-extrabold shadow-[2px_2px_0px_0px_#B91C1C]">
            ERROR: {createDealMutation.error.message.toUpperCase()}
        </p>
      )}
    </form>
  )
}
