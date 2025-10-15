'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import { CreateDealForm } from '@/components/CreateDealForm'
import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'

export default function NewDeal() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to create a deal
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">Etharis</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create New Deal
          </h1>
          <p className="text-gray-400">
            Set up a sponsorship contract with a creator
          </p>
        </div>

        <div className="card">
          <CreateDealForm />
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2">
            How it works:
          </h3>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>You deposit USDT into the smart contract</li>
            <li>Creator accepts the deal and starts working</li>
            <li>Creator submits content link when done</li>
            <li>System verifies automatically (live, on-time)</li>
            <li>You have 72 hours to review</li>
            <li>If no dispute, payment auto-releases to creator</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
