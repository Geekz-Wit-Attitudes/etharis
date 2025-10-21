// File: src/app/page.tsx (UPDATED: Finarkein Layout + Neo-Brutalism Style)

'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Handshake, Clock, Zap, TrendingUp, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'

// --- HELPER COMPONENT UNTUK BLOK BERSLANG-SELING ---
interface AlternatingBlockProps {
    title: string;
    description: string;
    imagePath: string;
    // True: Image di Kiri, Text di Kanan. False: Image di Kanan, Text di Kiri.
    reverse?: boolean;
}

const AlternatingInfoBlock = ({ title, description, imagePath, reverse = false }: AlternatingBlockProps) => {
    // Tentukan urutan grid
    const orderClasses = reverse ? 'md:order-2' : 'md:order-1';
    const textOrderClasses = reverse ? 'md:order-1' : 'md:order-2';

    return (
        // Container dengan border tebal
        <div className={`grid md:grid-cols-2 gap-8 items-center py-16 px-6 lg:px-12 my-6 bg-white/20 border-4 border-dotted border-[var(--color-primary)]/50 shadow-[8px_8px_0px_0px_var(--color-)]`}>

            {/* Kolom Kiri: Gambar (Berselang-seling) */}
            <div className={`flex justify-center ${orderClasses}`}>
                <div className="w-full max-w-xs h-64 flex items-center justify-center border-4 border-[var(--color-primary)] bg-[var(--color-secondary)] shadow-[4px_4px_0px_0px_var(--color-primary)]">
                    <Image
                        src={imagePath}
                        alt={title}
                        width={200}
                        height={200}
                        className="p-5 object-contain"
                    />
                </div>
            </div>

            {/* Kolom Kanan: Deskripsi */}
            <div className={`space-y-4 ${textOrderClasses} text-left text-[var(--color-primary)]`}>
                <h3 className="text-3xl font-extrabold uppercase border-b-4 border-[var(--color-secondary)] inline-block pb-1">
                    {title}
                </h3>
                <p className="text-xl text-[var(--color-primary)]/90 leading-relaxed font-semibold">
                    {description}
                </p>
                {/* Garis pemisah yang tebal untuk gaya brutalism */}
                <div className="h-1 w-16 bg-[var(--color-secondary)] mt-4"></div>
            </div>
        </div>
    );
};
// -----------------------------------------------------------------------


export default function Home() {
    const router = useRouter();

    const handleLaunchApp = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[var(--color-light)]">
            <Navbar />

            {/* Hero Section (Tetap sama) */}
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-32">
                <div className="w-full max-w-32 mx-auto mb-10 h-32 border-4 border-[var(--color-primary)] bg-[var(--color-secondary)] flex items-center justify-center">
                    <Image
                        src="/lock.png"
                        alt="ETHARIS Lock"
                        width={300}
                        height={300}
                        className="p-1 object-contain"
                    />
                </div>
                <div className="text-center max-w-5xl mx-auto">
                    <h1 className="text-6xl md:text-7xl font-extrabold text-[var(--color-primary)] mb-6 leading-tight tracking-tighter">
                        LOCK THE FUNDS.
                        <br />
                        <span className="text-[var(--color-secondary)] bg-[var(--color-primary)]">GUARANTEE THE RESULTS</span>
                    </h1>
                    <p className="text-2xl text-[var(--color-primary)] font-extrabold max-w-4xl mx-auto leading-normal pt-6">
                        STOP THE GHOSTING. START THE GUARANTEE.
                    </p>
                    <p className="text-xl text-[var(--color-primary)]/80 max-w-4xl mx-auto leading-normal pt-2">
                        The smart contract-powered escrow solution built for Indonesian Micro-Sponsorships.
                    </p>
                    <div className="flex justify-center space-x-6 mt-10">
                        <button onClick={handleLaunchApp} className="btn-primary text-xl shadow-[4px_4px_0px_0px_var(--color-primary)] hover:shadow-[6px_6px_0px_0px_var(--color-secondary)]">
                            LAUNCH APP
                        </button>
                        <a href="#how-it-works" className="btn-secondary text-xl shadow-[4px_4px_0px_0px_var(--color-primary)] hover:shadow-[6px_6px_0px_0px_var(--color-secondary)]">
                            HOW IT WORKS
                        </a>
                    </div>
                </div>
            </header>

            {/* How It Works Section - UPDATED TO ALTERNATING LAYOUT */}
            <section id="how-it-works" className="bg-[var(--color-neutral)] py-16 border-y-4 border-[var(--color-primary)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-extrabold text-[var(--color-primary)] mb-10 tracking-tight inline-block pb-1 uppercase border-b-4 border-[var(--color-primary)]">
                        HOW ETHARIS GUARANTEES TRUST
                    </h2>

                    {/* Blok 1: Deposit (Image Kiri) */}
                    <AlternatingInfoBlock
                        title="1. BRAND DEPOSIT FIRST"
                        description="The sponsor deposits the agreed amount. Funds are instantly converted into IDRX Stablecoin and secured in a smart contract. This guarantees payment before any work begins, eliminating the risk of 'ghosting.'"
                        imagePath="/shield.png" // Menggunakan fastmoney.png untuk Deposit
                        reverse={false}
                    />

                    {/* Blok 2: Verification (Image Kanan) */}
                    <AlternatingInfoBlock
                        title="2. AUTOMATED VERIFICATION"
                        description="The creator delivers content and submits the link. Our Verifier Engine automatically checks the social media API to ensure the content is Live and was Posted On-Time based on the contract deadline."
                        imagePath="/fastmoney.png" // Menggunakan automate.png
                        reverse={true} // Image di Kanan
                    />

                    {/* Blok 3: Guarantee (Image Kiri) */}
                    <AlternatingInfoBlock
                        title="3. 72-HOUR PAYMENT GUARANTEE"
                        description="The Brand enters a 72-hour review period. If the Brand approves, or takes no action after 72 hours, the payment is automatically released from the smart contract. Creator is paid in 3 days, not 3 months."
                        imagePath="/automate.png" // Asumsi ada /clock.png atau pakai fastmoney lagi
                        reverse={false}
                    />

                    {/* Blok 4: Dispute (Image Kanan) */}
                    <AlternatingInfoBlock
                        title="4. FAIR DISPUTE RESOLUTION"
                        description="In case of disagreement, the Creator is empowered with the final decision on compromise (80% partial) or rejection (100% refund to Brand, Creator keeps content license). This unique mechanism prevents Brand bullying."
                        imagePath="/handshake.png" // Menggunakan handshake.png
                        reverse={true} // Image di Kanan
                    />

                </div>
            </section>

            {/* CTA Section (Tetap sama) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="p-12 border-4 border-[var(--color-primary)] bg-[var(--color-secondary)] text-center max-w-4xl mx-auto shadow-[12px_12px_0px_0px_var(--color-primary)]">
                    <h2 className="text-4xl font-extrabold text-[var(--color-primary)] mb-4 tracking-tight uppercase">
                        READY TO MAKE YOUR DEALS SECURE?
                    </h2>
                    <p className="text-[var(--color-primary)]/90 text-xl mb-8 font-sans max-w-lg mx-auto">
                        Join the growing ecosystem of Indonesian creators and businesses trusting the code, not the promise.
                    </p>
                    <button onClick={handleLaunchApp} className="btn-primary text-xl border-4 border-[var(--color-primary)] bg-white text-[var(--color-primary)] hover:shadow-none  hover:bg-[var(--color-primary)] hover:text-secondary shadow-[6px_6px_0px_0px_var(--color-primary)]">
                        GET STARTED - IT'S FREE TO JOIN
                    </button>
                </div>
            </section>

            {/* Footer (Tetap sama) */}
            <footer className="py-8 border-t-4 border-[var(--color-primary)] bg-[var(--color-light)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--color-primary)]/80 font-mono">
                    &copy; 2025 ETHARIS. TRUSTLESS DEALS, GUARANTEED RESULTS.
                </div>
            </footer>
        </div>
    )
}