import Link from 'next/link'
import { ConnectButton } from '@/components/ConnectButton'
import { Shield, Clock, CheckCircle, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">SponsorFi</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Stop Getting Ghosted.
            <br />
            <span className="text-blue-500">Get Paid in 72 Hours.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Escrow untuk sponsorship influencer yang fair, transparan, dan otomatis.
            Dana dikunci di blockchain sampai konten verified.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
              Launch App
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-3">
              How It Works
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="how-it-works" className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Brand Deposit First
            </h3>
            <p className="text-gray-400">
              Dana dikunci di smart contract. Brand tidak bisa cancel sepihak.
              Creator yakin akan dibayar.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Auto Verification
            </h3>
            <p className="text-gray-400">
              System cek otomatis: konten live? on-time? Brand punya 72 jam untuk review.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              72-Hour Guarantee
            </h3>
            <p className="text-gray-400">
              Jika brand happy atau tidak action, payment otomatis released. No delay.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="card max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start?
            </h2>
            <p className="text-gray-400 mb-6">
              Platform fee hanya 3% per transaksi. No monthly subscription.
            </p>
            <ConnectButton isDisplay />
          </div>
        </div>
      </div>
    </div>
  )
}
