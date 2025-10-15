'use client'

import { useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'

export function CreateDealForm() {
  const [formData, setFormData] = useState({
    creatorEmail: '',
    amount: '',
    platform: 'Instagram',
    deliverable: '',
    deadline: '',
  })
  const [briefFile, setBriefFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('platform', formData.platform)
      formDataToSend.append('deliverable', formData.deliverable)
      formDataToSend.append('deadline', formData.deadline)
      if (briefFile) formDataToSend.append('brief', briefFile)

      // TODO: Call API /api/deals/create
      console.log('Creating deal...')
      alert('Deal berhasil dibuat!')
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal membuat deal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Creator
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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Jumlah (IDRX)
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
        <label className="block text-sm font-medium text-gray-300 mb-2">
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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Deliverable
        </label>
        <textarea
          placeholder="1 Feed Post + 3 Stories"
          value={formData.deliverable}
          onChange={(e) => setFormData({ ...formData, deliverable: e.target.value })}
          className="input"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Brief (PDF/DOC)
        </label>
        {!briefFile ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
            <Upload className="w-8 h-8 text-gray-500 mb-2" />
            <span className="text-sm text-gray-400">Klik untuk upload file</span>
            <span className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
            <span className="text-sm text-white">{briefFile.name}</span>
            <button
              type="button"
              onClick={() => setBriefFile(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {isLoading ? 'Membuat Deal...' : 'Buat Deal'}
      </button>
    </form>
  )
}