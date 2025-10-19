'use client'

import { useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { formatIDR } from '@/lib/utils'
import { useCreateDealMutation } from '@/hooks/useDeal' // Import hook Tanstack Query
import { CreateDealFormInput, FundingInitiationResponse } from '@/lib/deal/types' // Import tipe data
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
  
  // Custom Hook useCreateDealMutation tetap digunakan
  const createDealMutation = useCreateDealMutation({
    onSuccess: async (dealData) => {
        // Setelah Deal berhasil dibuat di backend (Langkah 1)
        console.log('Deal created successfully. Deal ID:', dealData.dealId);

        // --- Langkah 2: Panggil Service untuk Initiate Funding (Mendapatkan IDRX Link) ---
        try {
            // totalDeposit harus ada di dealData (asumsi dari update types)
            const fundingResponse = await initiateDealFunding(dealData.dealId, dealData.totalDeposit);
            
            // Pindah flow ke tampilan pembayaran/modal
            onDealCreated(fundingResponse);

        } catch (fundingError) {
            console.error('Failed to initiate funding:', fundingError);
            alert(`Deal created (ID: ${dealData.dealId}), but failed to get payment link: ${fundingError instanceof Error ? fundingError.message : 'Unknown error'}`);
        }
    },
    onError: (error) => {
      alert(`Gagal membuat deal: ${error.message}`);
    }
  });

  const isLoading = createDealMutation.isPending;

  const feePercentageDisplay = 0.02;
  const amountNumber = Number(formData.amount) || 0;
  const totalDeposit = amountNumber * (1 + feePercentageDisplay);
  const feeAmount = totalDeposit - amountNumber;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file melebihi batas 5MB.');
        setBriefFile(null);
        return
      }
      setBriefFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Panggil mutate function dari Tanstack Query.
    createDealMutation.mutate({ formData, briefFile });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[var(--color-neutral)] p-4 rounded-lg text-sm border border-[var(--color-primary)]/10">
        <p className="font-semibold text-[var(--color-primary)]">Transaction Summary:</p>
        <p className="text-[var(--color-primary)]/80">Creator Receives: **{formatIDR(amountNumber)}**</p>
        <p className="text-[var(--color-primary)]/80">Platform Fee (2.5%): **{formatIDR(feeAmount)}**</p>
        <p className="font-bold text-lg text-[var(--color-primary)] mt-1">Total Deposit: **{formatIDR(totalDeposit)}**</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
          Creator Email
        </label>
        <input
          type="email"
          placeholder="creator@example.com"
          value={formData.creatorEmail}
          onChange={(e) => setFormData({ ...formData, creatorEmail: e.target.value })}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
          Amount (IDR)
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
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
          Platform
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
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
          Deliverable Description
        </label>
        <textarea
          placeholder="e.g., 1 Feed Post, 3 Stories, and a link in bio for 7 days"
          value={formData.deliverable}
          onChange={(e) => setFormData({ ...formData, deliverable: e.target.value })}
          className="input"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
          Deadline
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
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">
          Upload Brief (PDF/DOC)
        </label>
        {!briefFile ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[var(--color-primary)]/30 border-dashed rounded-lg cursor-pointer hover:border-[var(--color-primary)]/60 transition-colors">
            <Upload className="w-8 h-8 text-[var(--color-primary)]/50 mb-2" />
            <span className="text-sm text-[var(--color-primary)]/70">Click to upload file</span>
            <span className="text-xs text-[var(--color-primary)]/50 mt-1">PDF, DOC, DOCX (Max 5MB)</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between bg-[var(--color-neutral)] p-3 rounded-lg border border-[var(--color-primary)]/10">
            <span className="text-sm text-[var(--color-primary)]">{briefFile.name}</span>
            <button
              type="button"
              onClick={() => setBriefFile(null)}
              className="text-red-700 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2 text-xl"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {isLoading ? 'Creating Deal...' : 'Pay & Create Deal'}
      </button>
      
      {/* Menampilkan pesan error dari Tanstack Query jika terjadi kegagalan */}
      {createDealMutation.isError && (
        <p className="text-sm text-red-500 mt-2">Error: {createDealMutation.error.message}</p>
      )}
    </form>
  )
}