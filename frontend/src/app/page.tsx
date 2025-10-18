'use client'
import Link from 'next/link'
import { ConnectButton } from '@/components/ConnectButton'
import { Handshake, Clock, CheckCircle, Zap, TrendingUp, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Dummy Component Imports for the sake of the page structure (assuming they exist in components/home/)
const DepositInfo = () => (
    <div className="flex flex-col items-start space-y-4">
        <div className="p-4 rounded-full bg-[var(--color-secondary)]/30">
            <DollarSign className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-2xl font-bold">Brand Deposits Funds</h3>
        <p className="text-[var(--color-primary)]/80 text-lg leading-relaxed">
            The sponsor deposits the agreed amount in Rupiah via bank transfer or e-wallet. The funds are instantly converted into 
            **IDRX Stablecoin** and secured in a smart contract. This guarantees payment before any work begins, eliminating the 
            risk of "ghosting."
        </p>
    </div>
);

const AutomateInfo = () => (
    <div className="flex flex-col items-start space-y-4">
        <div className="p-4 rounded-full bg-[var(--color-secondary)]/30">
            <Zap className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-2xl font-bold">Automated Verification</h3>
        <p className="text-[var(--color-primary)]/80 text-lg leading-relaxed">
            The creator delivers the content and submits the live link to the platform. Our Verifier Engine automatically checks the 
            social media API to ensure the content is **Live** and was **Posted On-Time** based on the contract deadline.
        </p>
    </div>
);

const GuaranteeInfo = () => (
    <div className="flex flex-col items-start space-y-4">
        <div className="p-4 rounded-full bg-[var(--color-secondary)]/30">
            <CheckCircle className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-2xl font-bold">72-Hour Payment Guarantee</h3>
        <p className="text-[var(--color-primary)]/80 text-lg leading-relaxed">
            The Brand enters a 72-hour review period. If the Brand approves, or takes no action after 72 hours, the payment is 
            automatically released from the smart contract to the creator's wallet. This ensures the Creator is **paid in 3 days, not 3 months**.
        </p>
    </div>
);


export default function Home() {
    const router = useRouter();

    const handleLaunchApp = () => {
        // In the final product with custodial wallet, this redirects to /auth/login
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <nav className="border-b border-[var(--color-primary)]/10 bg-[var(--color-light)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center gap-3">
                            <Handshake className="w-8 h-8 text-[var(--color-primary)]" />
                            <span className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">ETHARIS</span>
                        </Link>
                        {/* Use dummy ConnectButton location for now, assuming future login/signup */}
                        <div className="hidden sm:block">
                            <button onClick={handleLaunchApp} className="btn-secondary mr-4">
                                Log In
                            </button>
                            <Link href="/auth/signup" className="btn-primary">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
                <div className="text-center max-w-5xl mx-auto">
                    <h1 className="text-7xl md:text-9xl font-extrabold text-[var(--color-primary)] mb-6 tracking-tighter leading-none">
                        Lock the Funds.
                        <br />
                        <span className="text-[var(--color-secondary)]">Guarantee the Results.</span>
                    </h1>
                    <p className="text-2xl text-[var(--color-primary)]/80 mt-10 max-w-4xl mx-auto leading-normal">
                        Stop the Ghosting. Start the Guarantee. The smart contract-powered escrow solution built for Indonesian Micro-Sponsorships.
                    </p>
                    <div className="flex justify-center space-x-4 mt-12">
                        <button onClick={handleLaunchApp} className="btn-primary text-xl">
                            Launch App
                        </button>
                        <a href="#how-it-works" className="btn-secondary text-xl">
                            How It Works
                        </a>
                    </div>
                </div>
            </header>

            {/* How It Works Section */}
            <section id="how-it-works" className="bg-[var(--color-neutral)] py-24 border-t border-[var(--color-primary)]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-extrabold text-center text-[var(--color-primary)] mb-16 tracking-tight">
                        How ETHARIS Guarantees Trust
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-12 text-[var(--color-primary)]/90">
                        <DepositInfo />
                        <AutomateInfo />
                        <GuaranteeInfo />
                    </div>

                    <div className="mt-20 pt-12 border-t border-[var(--color-primary)]/10">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Feature 4 - Fair Dispute */}
                            <div className="flex flex-col space-y-4">
                                <div className="p-4 rounded-full bg-red-500/20">
                                    <Handshake className="w-6 h-6 text-red-700" />
                                </div>
                                <h3 className="text-3xl font-bold">Fair Dispute Resolution</h3>
                                <p className="text-[var(--color-primary)]/80 text-lg leading-relaxed">
                                    In case of disagreement, neither the platform nor the Brand can unilaterally seize the funds. The Creator is empowered with the final decision: accept an 80% partial payment as compromise, or reject the Brand's claim entirely (resulting in a 100% refund to the Brand, but the Creator keeps the content license). This unique mechanism prevents Brand bullying.
                                </p>
                            </div>
                            {/* Feature 5 - Regulatory Compliance */}
                            <div className="flex flex-col space-y-4">
                                <div className="p-4 rounded-full bg-blue-500/20">
                                    <TrendingUp className="w-6 h-6 text-blue-700" />
                                </div>
                                <h3 className="text-3xl font-bold">Regulatory-Ready Infrastructure</h3>
                                <p className="text-[var(--color-primary)]/80 text-lg leading-relaxed">
                                    ETHARIS is designed for compliance. We use a non-custodial smart contract model, meaning we do not hold user funds. This positioning, along with our KYC-Ready architecture and automated tax reporting plan, is built to partner with Indonesian regulators (OJK/DJP) for the future of digital finance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="card-neutral text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl font-extrabold text-[var(--color-primary)] mb-4">
                        Ready to Make Your Deals Secure?
                    </h2>
                    <p className="text-[var(--color-primary)]/80 text-xl mb-8">
                        Join the growing ecosystem of Indonesian creators and businesses trusting the code, not the promise.
                    </p>
                    <button onClick={handleLaunchApp} className="btn-primary text-xl mr-4">
                        Get Started - It's Free to Join
                    </button>
                    <Link href="/auth/login" className="btn-secondary text-xl">
                        Log In
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-[var(--color-primary)]/10 bg-[var(--color-light)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--color-primary)]/70">
                    &copy; 2025 ETHARIS. Trustless Deals, Guaranteed Results.
                </div>
            </footer>
        </div>
    )
}