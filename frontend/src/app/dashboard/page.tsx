'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import { DealCard } from '@/components/DealCard'
import { useDealStore } from '@/lib/store'
import Link from 'next/link'
import { Plus, Shield } from 'lucide-react'

export default function Dashboard() {
  const deals = useDealStore((state) => state.deals)

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">Etharis</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm mb-1">Saldo Anda</p>
        <p className="text-3xl font-bold ">Rp 1.250.000</p>
      </div>
      <div className="flex gap-2">
        <button className="btn-primary">Top Up</button>
        <Link href="/profile" className="btn-secondary">
          Profil
        </Link>
      </div>
    </div>
  </div>
</div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              My Deals
            </h1>
            <p className="">
              Manage your sponsorship contracts
            </p>
          </div>
          <Link href={"/dashboard/deals/new"} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Deal
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-sm mb-1">Total Deals</p>
            <p className="text-2xl font-bold">{deals.length}</p>
          </div>
          <div className="card">
            <p className="text-sm mb-1">Active</p>
            <p className="text-2xl font-bold text-blue-500">
              {deals.filter((d) => d.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-500">
              {deals.filter((d) => d.status === 'PAID').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm mb-1">Disputed</p>
            <p className="text-2xl font-bold text-red-500">
              {deals.filter((d) => d.status === 'DISPUTED').length}
            </p>
          </div>
        </div>

        {/* Deals List */}
        {deals.length === 0 ? (
          <div className="card text-center py-12">
            <Shield className="w-16 h-16  mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No Deals Yet
            </h3>
            <p className="mb-6">
              Create your first sponsorship deal to get started
            </p>
            <Link href="/dashboard/deals/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Deal
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                id={deal.id}
                contractId={deal.contractId}
                creator={deal.creator}
                amount={deal.amount}
                platform={deal.platform}
                status={deal.status}
                deadline={deal.deadline}
                role="brand"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

