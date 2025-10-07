'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface TimerCountdownProps {
  expiresAt: string
  onExpire?: () => void
}

export function TimerCountdown({ expiresAt, onExpire }: TimerCountdownProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const distance = expiry - now

      if (distance < 0) {
        setTimeLeft('Expired')
        clearInterval(timer)
        onExpire?.()
        return
      }

      const hours = Math.floor(distance / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpire])

  return (
    <div className="flex items-center gap-2 text-orange-400">
      <Clock className="w-5 h-5" />
      <span className="font-mono text-lg">{timeLeft}</span>
    </div>
  )
}
