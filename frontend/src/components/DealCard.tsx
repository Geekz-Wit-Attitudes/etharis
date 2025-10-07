'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

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
  PENDING: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
  ACTIVE: { icon: Clock, color: 'text-blue-500', label: 'Active' },
  PENDING_REVIEW: { icon: Clock, color: 'text-orange-500', label: 'Review' },
  DISPUTED: { icon: AlertCircle, color: 'text-red-500', label: 'Disputed' },
  PAID: { icon: CheckCircle, color: 'text-green-500', label: 'Paid' },
  FAILED: { icon: XCircle, color: 'text-gray-500', label: 'Failed' },
}

export function DealCard({ id, contractId, creator, amount, platform, status, deadline, role }: DealCardProps) {
  const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock
  const statusColor = statusConfig[status as keyof typeof statusConfig]?.color || 'text-gray-500'
  const statusLabel = statusConfig[status as keyof typeof statusConfig]?.label || status

  return (
    <Link href={`/dashboard/deals/${id}`}>
      <div className="card hover:border-blue-500 transition-colors cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {contractId}
            </h3>
            <p className="text-gray-400 text-sm">
              {role === 'brand' ? `@${creator}` : `Deal #${contractId}`}
            </p>
          </div>
          <div className={`flex items-center gap-2 ${statusColor}`}>
            <StatusIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{statusLabel}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-medium">${amount} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Platform</span>
            <span className="text-white">{platform}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Deadline</span>
            <span className="text-white">
              {formatDistanceToNow(new Date(deadline), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <span className="text-blue-400 text-sm hover:text-blue-300">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}
