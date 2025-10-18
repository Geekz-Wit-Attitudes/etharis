'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { formatIDR } from '@/lib/utils' // Import new formatter

interface DealCardProps {
  id: string
  contractId: string
  creator: string
  amount: string
  platform: string
  status: string
  deadline: string
  role: 'brand' | 'creator'
}

const statusConfig = {
  PENDING: { icon: Clock, color: 'text-yellow-600', label: 'Pending' },
  ACTIVE: { icon: Clock, color: 'text-blue-600', label: 'Active' },
  PENDING_REVIEW: { icon: Clock, color: 'text-orange-600', label: 'Review' },
  DISPUTED: { icon: AlertCircle, color: 'text-red-600', label: 'Disputed' },
  PAID: { icon: CheckCircle, color: 'text-green-600', label: 'Paid' },
  FAILED: { icon: XCircle, color: 'text-gray-600', label: 'Failed' },
}

export function DealCard({ id, contractId, creator, amount, platform, status, deadline, role }: DealCardProps) {
  const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock
  const statusColor = statusConfig[status as keyof typeof statusConfig]?.color || 'text-gray-600'
  const statusLabel = statusConfig[status as keyof typeof statusConfig]?.label || status

  return (
    <Link href={`/dashboard/deals/${id}`}>
      {/* Use card-neutral for the new style, hover effect uses primary color */}
      <div className="card-neutral hover:shadow-2xl transition-all duration-300 cursor-pointer border-[var(--color-primary)]/20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-1">
              {contractId}
            </h3>
            {/* Display partner name or deal ID based on role */}
            <p className="text-[var(--color-primary)]/70 text-sm">
              {role === 'brand' ? `@${creator}` : `Deal #${contractId}`}
            </p>
          </div>
          <div className={`flex items-center gap-2 ${statusColor} bg-[var(--color-secondary)]/30 px-3 py-1 rounded-full`}>
            <StatusIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{statusLabel}</span>
          </div>
        </div>

        <div className="space-y-3 mb-4 border-t border-b border-[var(--color-primary)]/10 py-3">
          <div className="flex justify-between text-base">
            <span className="text-[var(--color-primary)]/70">Amount</span>
            {/* Use IDR formatter for better representation */}
            <span className="font-semibold text-lg text-[var(--color-primary)]">
              {formatIDR(amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-primary)]/70">Platform</span>
            <span className="text-[var(--color-primary)]">{platform}</span>
          </div>
        </div>

        <div className="pt-4">
          <span className="text-[var(--color-primary)] font-semibold text-sm hover:text-[var(--color-secondary)]/90 transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}