'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import { DealCard } from '@/components/DealCard'
import { useDealStore } from '@/lib/store'
import Link from 'next/link'
import { Shield, Inbox } from 'lucide-react'

export default function CreatorDashboard() {
  const { address, isConnected } = useAccount()
  const deals = useDealStore((state) => state.deals)

  // Filter deals where current user is the creator
  const myDeals = deals.filter((d) => d.creator.toLowerCase() === address?.toLowerCase())

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your deals
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
              <span className="text-2xl font-bold text-white">SponsorFi</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Creator Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your sponsorship deals
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-gray-400 text-sm mb-1">Total Deals</p>
            <p className="text-2xl font-bold text-white">{myDeals.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-blue-500">
              {myDeals.filter((d) => d.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-green-500">
              ${myDeals
                .filter((d) => d.status === 'PAID')
                .reduce((sum, d) => sum + parseFloat(d.amount), 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-sm mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-purple-500">
              {myDeals.length > 0
                ? Math.round((myDeals.filter((d) => d.status === 'PAID').length / myDeals.length) * 100)
                : 0}%
            </p>
          </div>
        </div>

        {/* Deals List */}
        {myDeals.length === 0 ? (
          <div className="card text-center py-12">
            <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Deals Yet
            </h3>
            <p className="text-gray-400 mb-6">
              You don't have any active sponsorship deals yet.
              <br />
              Brands will invite you directly to SponsorFi deals.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDeals.map((deal) => (
              <DealCard
                key={deal.id}
                id={deal.id}
                contractId={deal.contractId}
                creator={deal.brand}
                amount={deal.amount}
                platform={deal.platform}
                status={deal.status}
                deadline={deal.deadline}
                role="creator"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
