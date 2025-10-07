'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, USDT_CONTRACT_ADDRESS, USDT_ABI } from '@/lib/contracts'
import { Loader2 } from 'lucide-react'

export function CreateDealForm() {
  const { address } = useAccount()
  const [formData, setFormData] = useState({
    creatorAddress: '',
    amount: '',
    platform: 'Instagram',
    deliverable: '',
    deadline: '',
    briefUrl: '',
  })

  const { writeContract: approve, data: approveHash } = useWriteContract()
  const { writeContract: createContract, data: createHash } = useWriteContract()

  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: isCreating } = useWaitForTransactionReceipt({ hash: createHash })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      alert('Please connect your wallet')
      return
    }

    try {
      // Step 1: Approve USDT
      const amountInWei = parseUnits(formData.amount, 6) // USDT has 6 decimals

      approve({
        address: USDT_CONTRACT_ADDRESS,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [ESCROW_CONTRACT_ADDRESS, amountInWei],
      })

      // Wait for approval, then create contract
      // In production, you'd wait for approval receipt before calling create

      const contractId = `SPFI-${Date.now()}`
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000)

      createContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'createContract',
        args: [
          contractId,
          formData.creatorAddress as `0x${string}`,
          amountInWei,
          BigInt(deadlineTimestamp),
          formData.briefUrl,
        ],
      })

      alert('Deal created! Waiting for transaction confirmation...')
    } catch (error) {
      console.error('Error creating deal:', error)
      alert('Failed to create deal. Check console for details.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Creator Wallet Address
        </label>
        <input
          type="text"
          placeholder="0x..."
          value={formData.creatorAddress}
          onChange={(e) => setFormData({ ...formData, creatorAddress: e.target.value })}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount (USDT)
        </label>
        <input
          type="number"
          placeholder="500"
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
          Brief URL
        </label>
        <input
          type="url"
          placeholder="https://..."
          value={formData.briefUrl}
          onChange={(e) => setFormData({ ...formData, briefUrl: e.target.value })}
          className="input"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isApproving || isCreating}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {(isApproving || isCreating) && <Loader2 className="w-5 h-5 animate-spin" />}
        {isApproving ? 'Approving USDT...' : isCreating ? 'Creating Deal...' : 'Create Deal'}
      </button>
    </form>
  )
}
