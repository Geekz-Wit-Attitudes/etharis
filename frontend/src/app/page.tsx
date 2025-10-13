import Link from 'next/link'
import { ConnectButton } from '@/components/ConnectButton'
import { Shield, Clock, CheckCircle, Zap } from 'lucide-react'
import Silk from '@/components/Silk'
import Image from 'next/image'
import DepositInfo from '@/components/home/DepositInfo'
import AutomateInfo from '@/components/home/AutomateInfo'
import GuaranteeInfo from '@/components/home/GuaranteeInfo'

export default function Home() {
  return (
    <div className='text-white'>
      <div className='relative min-h-screen'>
        {/* Hero */}
        <div className='absolute z-0 inset-0 flex h-full w-full p-5'>
          <Silk color='#282fbd' />
        </div>
        <div className="absolute z-10 h-full w-full flex items-end">
          <div className="max-w-7xl px-12 py-5">
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-5 ">
                <Shield className="w-8 h-8 " />
                <span className="text-2xl font-bold ">Etharis</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-bold  mb-6 ">
                Stop Getting Ghosted.
                <br />
                Get Paid in 72 Hours.
              </h1>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl font-sans">
                Escrow untuk sponsorship influencer yang fair, transparan, dan otomatis.
                Dana dikunci di blockchain sampai konten verified.
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard" className="btn-white text-lg px-8 py-3 ">
                  Launch App
                </Link>
                <Link href="#how-it-works" className="btn-glassmorphism text-lg px-8 py-3 ">
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='px-10'>
        {/* Features */}
        <div id="how-it-works" className="">
          <h1 className='text-center text-8xl text-primary font-semibold mt-10'>How It Works?</h1>
          <hr className='border-primary mt-10' />
          <DepositInfo />
          <hr className='border-primary mt-10' />
          <AutomateInfo />
          <hr className='border-primary mt-10' />
          <GuaranteeInfo />
          {/* <div className="card text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold  mb-2">
              Auto Verification
            </h3>
            <p className="text-gray-400">
              System cek otomatis: konten live? on-time? Brand punya 72 jam untuk review.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold  mb-2">
              72-Hour Guarantee
            </h3>
            <p className="text-gray-400">
              Jika brand happy atau tidak action, payment otomatis released. No delay.
            </p>
          </div> */}
        </div>

        {/* CTA */}
      </div>
      <div className="mt-10 pt-20 w-full min-h-screen  flex flex-col items-center justify-between bg-primary text-center">
          <div>
            <h2 className="text-5xl font-bold  mb-4">
              Ready to Start with Etharis?
            </h2>
            <p className="text-2xl mb-10">
              Platform fee hanya 3% per transaksi. No monthly subscription.
            </p>
            <Link href="/dashboard" className="btn-white text-lg px-8 py-3">
              Launch App
            </Link>
          <div className='flex items-center justify-center mt-5 mb-20'>
            <Image height={1000} width={1000} src={"/handshake.png"} alt='handshake' className='max-w-2xl' />
          </div>
          </div>
          <footer>© 2025 GeekzWithAttitude | All Rights Reserved</footer>
        </div>
    </div>
  )
}
