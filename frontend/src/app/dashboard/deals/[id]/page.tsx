'use client'

import { useParams } from 'next/navigation'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState } from 'react'
import { ConnectButton } from '@/components/ConnectButton'
import { TimerCountdown } from '@/components/TimerCountdown'
import Link from 'next/link'
import { Shield, ArrowLeft, ExternalLink, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '@/lib/contracts'
import { useDealStore } from '@/lib/store'

export default function DealDetail() {
  const params = useParams()
  const { address, isConnected } = useAccount()
  const deal = useDealStore((state) => state.getDeal(params.id as string))

  const [disputeReason, setDisputeReason] = useState('')
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [contentUrl, setContentUrl] = useState('')

  const { writeContract: submitDispute, data: disputeHash } = useWriteContract()
  const { writeContract: resolveDispute, data: resolveHash } = useWriteContract()
  const { writeContract: releaseFund, data: releaseHash } = useWriteContract()

  const { isLoading: isDisputing } = useWaitForTransactionReceipt({ hash: disputeHash })
  const { isLoading: isResolving } = useWaitForTransactionReceipt({ hash: resolveHash })
  const { isLoading: isReleasing } = useWaitForTransactionReceipt({ hash: releaseHash })

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <ConnectButton />
        </div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Deal Not Found
          </h2>
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const handleDispute = () => {
    if (!disputeReason.trim()) {
      alert('Please provide a reason for dispute')
      return
    }

    submitDispute({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_ABI,
      functionName: 'initDispute',
      args: [deal.contractId, disputeReason],
    })

    setShowDisputeModal(false)
  }

  const handleResolve = (accept8020: boolean) => {
    resolveDispute({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_ABI,
      functionName: 'resolveDispute',
      args: [deal.contractId, accept8020],
    })
  }

  const handleRelease = () => {
    releaseFund({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_ABI,
      functionName: 'releaseFund',
      args: [deal.contractId],
    })
  }

  const isBrand = address?.toLowerCase() === deal.brand.toLowerCase()
  const isCreator = address?.toLowerCase() === deal.creator.toLowerCase()

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">SponsorFi</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {deal.contractId}
            </h1>
            <p className="text-gray-400">
              {isBrand ? 'Brand View' : isCreator ? 'Creator View' : 'External View'}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              deal.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
              deal.status === 'DISPUTED' ? 'bg-red-500/20 text-red-400' :
              deal.status === 'PENDING_REVIEW' ? 'bg-orange-500/20 text-orange-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {deal.status === 'PAID' && <CheckCircle className="w-5 h-5" />}
              {deal.status === 'DISPUTED' && <AlertCircle className="w-5 h-5" />}
              {deal.status === 'PENDING_REVIEW' && <Clock className="w-5 h-5" />}
              <span className="font-semibold">{deal.status}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Deal Info */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">
              Deal Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-semibold">${deal.amount} USDT</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Platform</span>
                <span className="text-white">{deal.platform}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Brand</span>
                <span className="text-white font-mono text-sm">
                  {deal.brand.slice(0, 6)}...{deal.brand.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Creator</span>
                <span className="text-white font-mono text-sm">
                  {deal.creator.slice(0, 6)}...{deal.creator.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Deadline</span>
                <span className="text-white">
                  {new Date(deal.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Deliverable */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">
              Deliverable
            </h2>
            <p className="text-gray-300 mb-4">{deal.deliverable}</p>

            {deal.finalContentUrl && (
              <a
                href={deal.finalContentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                View Content
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Timer (if PENDING_REVIEW) */}
        {deal.status === 'PENDING_REVIEW' && (
          <div className="card mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Review Timer
                </h3>
                <p className="text-gray-400 text-sm">
                  {isBrand ? 'Time left to dispute' : 'Payment auto-releases in'}
                </p>
              </div>
              <TimerCountdown
                expiresAt={new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()}
              />
            </div>
          </div>
        )}

        {/* Actions - Brand */}
        {isBrand && deal.status === 'PENDING_REVIEW' && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Actions
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleRelease}
                disabled={isReleasing}
                className="btn-primary flex items-center gap-2"
              >
                {isReleasing && <Loader2 className="w-4 h-4 animate-spin" />}
                Approve & Release Now
              </button>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Dispute
              </button>
            </div>
          </div>
        )}

        {/* Actions - Creator (Submit Content) */}
        {isCreator && deal.status === 'ACTIVE' && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Submit Your Content
            </h3>
            <div className="space-y-4">
              <input
                type="url"
                placeholder="<https://instagram.com/p/>..."
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                className="input"
              />
              <button
                onClick={() => {
                  // In production, this would call API to verify
                  alert('Content submitted! Verification in progress...')
                }}
                className="btn-primary"
              >
                Submit for Verification
              </button>
            </div>
          </div>
        )}

        {/* Actions - Creator (Dispute Resolution) */}
        {isCreator && deal.status === 'DISPUTED' && (
          <div className="card mt-6 border-red-500/20">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Dispute Initiated
                </h3>
                <p className="text-gray-400 text-sm">
                  Brand has disputed this deliverable. Choose your response:
                </p>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm">
                <span className="text-gray-400">Reason:</span> {disputeReason || 'No reason provided'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handleResolve(true)}
                disabled={isResolving}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isResolving && <Loader2 className="w-4 h-4 animate-spin" />}
                Accept 80/20 Split
              </button>
              <button
                onClick={() => handleResolve(false)}
                disabled={isResolving}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isResolving && <Loader2 className="w-4 h-4 animate-spin" />}
                Reject (0/100 to Brand)
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              <p><strong>Accept 80/20:</strong> You receive 80% (${(parseFloat(deal.amount) * 0.8).toFixed(2)}), Brand gets 20% refund</p>
              <p><strong>Reject:</strong> You receive $0, Brand gets full refund. Brand cannot use your content.</p>
            </div>
          </div>
        )}

        {/* Paid Status */}
        {deal.status === 'PAID' && (
          <div className="card mt-6 border-green-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Payment Completed
                </h3>
                <p className="text-gray-400 text-sm">
                  This deal has been successfully completed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Dispute Deliverable
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Please provide a specific reason for disputing this deliverable.
            </p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="e.g., Product placement not clear, Caption missing brand mention..."
              className="input mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={handleDispute}
                disabled={isDisputing}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isDisputing && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Dispute
              </button>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
