'use client'

import { useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { formatIDR } from '@/lib/utils'

export function CreateDealForm() {
  const [formData, setFormData] = useState({
    creatorEmail: '',
    amount: '', // Stored as plain number string (Rupiah)
    platform: 'Instagram',
    deliverable: '',
    deadline: '',
  })
  const [briefFile, setBriefFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const feePercentage = 0.02; // 6% fee (adjusted for profitability)
  const amountNumber = Number(formData.amount) || 0;
  const totalDeposit = amountNumber * (1 + feePercentage);
  const feeAmount = totalDeposit - amountNumber;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setBriefFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('creatorEmail', formData.creatorEmail)
      // Send total Rupiah amount
      formDataToSend.append('amount', formData.amount) 
      formDataToSend.append('platform', formData.platform)
      formDataToSend.append('deliverable', formData.deliverable)
      formDataToSend.append('deadline', formData.deadline)
      if (briefFile) formDataToSend.append('brief', briefFile)

      // TODO: Call API /api/deals/create
      // This API call must handle the custodial payment and smart contract funding
      
      console.log('Creating deal...')
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      alert('Deal successfully created and funded! Creator is notified.')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create deal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[var(--color-neutral)] p-4 rounded-lg text-sm border border-[var(--color-primary)]/10">
        <p className="font-semibold text-[var(--color-primary)]">Transaction Summary:</p>
        <p className="text-[var(--color-primary)]/80">Creator Receives: **{formatIDR(amountNumber)}**</p>
        <p className="text-[var(--color-primary)]/80">Platform Fee (6%): **{formatIDR(feeAmount)}**</p>
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
          onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
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
    </form>
  )
}