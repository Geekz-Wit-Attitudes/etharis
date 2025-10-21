'use client'
import Link from 'next/link'
import Image from 'next/image' // Import Image untuk placeholder gambar
import { Handshake, Clock, Zap, TrendingUp, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import InfoCard from '@/components/InfoCard'

export default function Home() {
    const router = useRouter();

    const handleLaunchApp = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[var(--color-light)]">
            <Navbar />

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-32">
                {/* Blok visual untuk icon/hero utama (Anda bisa membuat satu gambar halftone besar di sini) */}
                <div className="w-full max-w-xs mx-auto mb-10 h-64 border-4 border-[var(--color-primary)] bg-[var(--color-secondary)] flex items-center justify-center">
                    <Image
                        src="/lock.png" 
                        alt="ETHARIS Lock"
                        width={300}
                        height={300}
                        className="p-5 object-contain"
                    />
                </div>

                <div className="text-center max-w-5xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--color-primary)] mb-6 tracking-tighter leading-none">
                        LOCK THE FUNDS.
                        <br />
                        <span className="text-[var(--color-secondary)] border-secondary px-2 border-b-8">GUARANTEE THE RESULTS.</span>
                    </h1>
                    <p className="text-2xl text-[var(--color-primary)]/80 max-w-4xl mx-auto leading-normal font-sans pt-2">
                        Stop the Ghosting. Start the Guarantee. The smart contract-powered escrow solution built for Indonesian Micro-Sponsorships.
                    </p>
                    <div className="flex justify-center space-x-4 mt-12">
                        {/* Tombol Utama - Solid, Neo-Brutalism */}
                        <button onClick={handleLaunchApp} className="btn-primary text-xl">
                            LAUNCH APP
                        </button>
                        {/* Tombol Sekunder - Ghost, Neo-Brutalism */}
                        <a href="#how-it-works" className="btn-secondary text-xl">
                            HOW IT WORKS
                        </a>
                    </div>
                </div>
            </header>

            {/* How It Works Section */}
            <section id="how-it-works" className="bg-[var(--color-neutral)] py-24 border-y-4 border-[var(--color-primary)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-extrabold text-center text-[var(--color-primary)] mb-16 tracking-tight border-b-4 border-[var(--color-primary)] inline-block pb-1">
                        HOW ETHARIS GUARANTEES TRUST
                    </h2>

                    {/* Grid Info Cards */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <InfoCard
                            title="Brand Deposit First"
                            description="The sponsor deposits the agreed amount. Funds are instantly converted into IDRX Stablecoin and secured in a smart contract. This guarantees payment before any work begins, eliminating the risk of 'ghosting.'"
                            iconSrc="/shield.png" // Placeholder 1: koin/dana halftone
                            accentColor="var(--color-secondary)"
                        />
                        <InfoCard
                            title="Automated Verification"
                            description="The creator delivers content and submits the link. Our Verifier Engine automatically checks the social media API to ensure the content is Live and was Posted On-Time based on the contract deadline."
                            iconSrc="/automate.png" // Placeholder 2: otomatisasi/gear halftone
                            accentColor="var(--color-secondary)"
                        />
                        <InfoCard
                            title="72-Hour Payment Guarantee"
                            description="The Brand enters a 72-hour review period. If the Brand approves, or takes no action after 72 hours, the payment is automatically released from the smart contract. Creator is paid in 3 days, not 3 months."
                            iconSrc="/fastmoney.png" // Placeholder 3: jam/fastmoney halftone
                            accentColor="var(--color-secondary)"
                        />
                        <InfoCard
                            title="Fair Dispute Resolution"
                            description="In case of disagreement, the Creator is empowered with the final decision on compromise (80% partial) or rejection (100% refund to Brand, Creator keeps content license). This unique mechanism prevents Brand bullying."
                            iconSrc="/handshake.png" // Placeholder 3: jam/fastmoney halftone
                            accentColor="var(--color-secondary)"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section - Blok Kontras Keras */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                {/* Blok CTA yang Sangat Kontras dengan Border Tebal */}
                <div className="p-10 border-4 border-[var(--color-primary)] bg-[var(--color-secondary)] text-center max-w-4xl mx-auto shadow-[12px_12px_0px_0px_var(--color-primary)]">
                    <h2 className="text-4xl font-extrabold text-[var(--color-primary)] mb-4 tracking-tight">
                        READY TO MAKE YOUR DEALS SECURE?
                    </h2>
                    <p className="text-[var(--color-primary)]/90 text-xl mb-8 font-sans max-w-lg mx-auto">
                        Join the growing ecosystem of Indonesian creators and businesses trusting the code, not the promise.
                    </p>
                    {/* Tombol CTA Utama (Inverted Primary/Secondary for Max Contrast) */}
                    <button onClick={handleLaunchApp} className="btn-secondary bg-[var(--color-primary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)] border-[var(--color-primary)] text-xl">
                        GET STARTED - IT'S FREE TO JOIN
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t-4 border-[var(--color-primary)] bg-[var(--color-neutral)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--color-primary)]/80 font-mono">
                    &copy; 2025 ETHARIS. TRUSTLESS DEALS, GUARANTEED RESULTS.
                </div>
            </footer>
        </div>
    )
}
