'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Clock, AlertCircle, CheckCircle, Upload, X, Loader2, FileText, Download } from 'lucide-react'
import { formatIDR } from '@/lib/utils'

// --- Mock Data Imports (replace with actual fetch/store later) ---
const mockDealDetail = {
    id: 'ETHR-001',
    contractId: 'ETHR-001',
    brand: '0xBrandWalletMock', // Mock Brand Address (Current User)
    creator: '0xCreatorWalletMock', // Mock Creator Address
    currentUserAddress: '0xBrandWalletMock', // Mock Current Logged-in User (Change this to test Creator role)
    amount: '500000', // Amount Creator receives (500K IDR)
    platform: 'Instagram',
    deliverable: '1 Feed Post + 3 Stories on Instagram, must include brand hashtag #EtharisSafe',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
    status: 'PENDING_REVIEW' as 'PENDING' | 'ACTIVE' | 'PENDING_REVIEW' | 'DISPUTED' | 'PAID' | 'FAILED',
    briefHash: 'QmHashMockForBrief',
    contentUrl: '', // Updated by Creator
    reviewDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours from now
    disputeReason: 'Product placement was not clear in the main image as required by the brief.',
    finalDecision: 'PENDING', // Used in DISPUTED state
};

// Mock Component: TimerCountdown (Assuming it exists and works)
const TimerCountdown = ({ expiresAt }: { expiresAt: string }) => (
    <div className="flex items-center gap-2 text-orange-600 font-bold">
        <Clock className="w-5 h-5" />
        <span className="text-xl">47h 35m 12s Remaining</span>
    </div>
);


export default function DealDetailPage() {
    const [deal, setDeal] = useState(mockDealDetail);
    const [isLoading, setIsLoading] = useState(false);
    const [disputeInput, setDisputeInput] = useState('');
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [contentUrl, setContentUrl] = useState('');
    
    // Determine the role based on the current user's mock address
    const isBrand = deal.currentUserAddress.toLowerCase() === deal.brand.toLowerCase();
    const isCreator = deal.currentUserAddress.toLowerCase() === deal.creator.toLowerCase();
    const roleLabel = isBrand ? 'Brand View' : (isCreator ? 'Creator View' : 'External View');

    const amountNum = Number(deal.amount);
    const fee = amountNum * 0.06; // Mock 6% fee for simplicity of display

    // --- MOCK ACTION HANDLERS ---
    const handleAction = async (action: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        switch (action) {
            case 'FUND':
                setDeal(d => ({ ...d, status: 'ACTIVE' as 'ACTIVE' }));
                alert('Deal successfully funded! Creator is notified.');
                break;
            case 'SUBMIT':
                setDeal(d => ({ ...d, status: 'PENDING_REVIEW' as 'PENDING_REVIEW', contentUrl: contentUrl, reviewDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() }));
                alert('Content submitted! Verification in progress.');
                break;
            case 'APPROVE':
                setDeal(d => ({ ...d, status: 'PAID' as 'PAID' }));
                alert('Payment instantly approved and released!');
                break;
            case 'ACCEPT_80':
                setDeal(d => ({ ...d, status: 'PAID' as 'PAID', finalDecision: '80/20' }));
                alert('Dispute resolved: You received 80% of the payment.');
                break;
            case 'REJECT_100':
                setDeal(d => ({ ...d, status: 'FAILED' as 'FAILED', finalDecision: '0/100' }));
                alert('Dispute resolved: Brand fully refunded. Content license voided.');
                break;
            default:
                break;
        }
        setIsLoading(false);
    };

    const handleDispute = async () => {
        if (!disputeInput) return alert('Dispute reason is required.');
        setShowDisputeModal(false);
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setDeal(d => ({ ...d, status: 'DISPUTED' as 'DISPUTED', disputeReason: disputeInput }));
        alert('Dispute successfully initiated. Creator has been notified.');
        setIsLoading(false);
    };

    const getStatusStyle = () => {
        switch (deal.status) {
            case 'PAID': return 'bg-green-100 text-green-700 border-green-300';
            case 'DISPUTED': return 'bg-red-100 text-red-700 border-red-300';
            case 'PENDING_REVIEW': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'ACTIVE': return 'bg-blue-100 text-blue-700 border-blue-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };


    return (
        <div className="min-h-screen bg-[var(--color-light)]">

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] transition-colors mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Header & Status */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">{deal.contractId}</h1>
                        <p className="text-[var(--color-primary)]/70 text-sm">{roleLabel}</p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold border ${getStatusStyle()}`}>
                        {deal.status === 'PAID' && <CheckCircle className="w-5 h-5" />}
                        {deal.status === 'DISPUTED' && <AlertCircle className="w-5 h-5" />}
                        {deal.status === 'PENDING_REVIEW' && <Clock className="w-5 h-5" />}
                        {deal.status === 'ACTIVE' && <Clock className="w-5 h-5" />}
                        {deal.status}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-3 gap-6">
                    
                    {/* Column 1 & 2: Deal Info & Deliverables */}
                    <div className="md:col-span-2 space-y-6">
                        
                        {/* 1. Deal Details */}
                        <div className="card-neutral">
                            <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-4">Deal Details</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-[var(--color-primary)]/10">
                                    <span className="text-[var(--color-primary)]/70">Amount to Creator</span>
                                    <span className="font-semibold text-[var(--color-primary)]">{formatIDR(deal.amount)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-[var(--color-primary)]/10">
                                    <span className="text-[var(--color-primary)]/70">Platform Fee (6%)</span>
                                    <span className="text-[var(--color-primary)]">{formatIDR(fee)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-[var(--color-primary)]/10">
                                    <span className="text-[var(--color-primary)]/70">Total Value Locked</span>
                                    <span className="font-extrabold text-lg text-[var(--color-primary)]">{formatIDR(amountNum + fee)}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-[var(--color-primary)]/70">Posting Deadline</span>
                                    <span className="text-[var(--color-primary)]">{new Date(deal.deadline).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Deliverables & Brief */}
                        <div className="card-neutral">
                            <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-4">Deliverables & Brief</h2>
                            
                            <p className="text-[var(--color-primary)] text-lg mb-4">{deal.deliverable}</p>

                            <div className="flex items-center justify-between bg-[var(--color-light)] p-3 rounded-lg border border-[var(--color-primary)]/10">
                                <span className="text-[var(--color-primary)]/70 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Contract Brief (PDF)
                                </span>
                                <a href={`/briefs/${deal.briefHash}`} target="_blank" className="text-blue-700 hover:text-blue-500 transition-colors flex items-center gap-1 font-medium">
                                    Download <Download className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Status, Timer, Actions */}
                    <div className="md:col-span-1 space-y-6">
                        
                        {/* Timer/Status Box */}
                        {(deal.status === 'PENDING_REVIEW' || deal.status === 'DISPUTED') && (
                            <div className="card-neutral border-l-4 border-orange-600">
                                <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-3">Review Status</h3>
                                {deal.status === 'PENDING_REVIEW' ? (
                                    <TimerCountdown expiresAt={deal.reviewDeadline} />
                                ) : (
                                    <span className="text-red-700 font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Dispute Initiated</span>
                                )}
                                <p className="text-[var(--color-primary)]/70 text-sm mt-3">
                                    {isBrand ? 'Time remaining to approve or initiate a dispute.' : 'Payment is secured. Waiting for Brand review.'}
                                </p>
                            </div>
                        )}

                        {/* Action Box: PENDING (Brand: Fund) */}
                        {isBrand && deal.status === 'PENDING' && (
                            <div className="card-neutral">
                                <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-4">Fund Deal</h3>
                                <button onClick={() => handleAction('FUND')} disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    Pay & Fund Escrow
                                </button>
                            </div>
                        )}

                        {/* Action Box: ACTIVE (Creator: Submit) */}
                        {isCreator && deal.status === 'ACTIVE' && (
                            <div className="card-neutral">
                                <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-4">Submit Content Link</h3>
                                <input type="url" placeholder="https://instagram.com/p/..." value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className="input mb-3" />
                                <button onClick={() => handleAction('SUBMIT')} disabled={isLoading || !contentUrl} className="btn-primary w-full flex items-center justify-center gap-2">
                                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    Submit for Verification
                                </button>
                                <p className="text-[var(--color-primary)]/70 text-xs mt-2">Submit will trigger automated verification.</p>
                            </div>
                        )}

                        {/* Action Box: PENDING_REVIEW (Brand: Approve/Dispute) */}
                        {isBrand && deal.status === 'PENDING_REVIEW' && (
                            <div className="card-neutral">
                                <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-4">Review & Action</h3>
                                <a href={deal.contentUrl} target="_blank" className="text-[var(--color-secondary)] hover:underline text-sm flex items-center gap-1 mb-4 font-semibold">
                                    View Submitted Content <ExternalLink className="w-4 h-4" />
                                </a>
                                <button onClick={() => handleAction('APPROVE')} disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
                                    {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                                    Approve & Release Now
                                </button>
                                <button onClick={() => setShowDisputeModal(true)} className="btn-secondary w-full flex items-center justify-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Initiate Dispute
                                </button>
                            </div>
                        )}

                        {/* Action Box: DISPUTED (Creator: Resolve) */}
                        {isCreator && deal.status === 'DISPUTED' && (
                            <div className="card-neutral border-l-4 border-red-700">
                                <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-3">Dispute Resolution</h3>
                                <p className="text-red-700 font-semibold mb-2">Brand Claim:</p>
                                <p className="text-[var(--color-primary)]/80 text-sm mb-4 italic">"{deal.disputeReason}"</p>
                                
                                <button onClick={() => handleAction('ACCEPT_80')} disabled={isLoading} className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-full w-full mb-3 text-sm">
                                    {isLoading ? 'Accepting...' : `Accept 80% (${formatIDR(amountNum * 0.8)})`}
                                </button>
                                <button onClick={() => handleAction('REJECT_100')} disabled={isLoading} className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-full w-full text-sm">
                                    {isLoading ? 'Rejecting...' : `Reject (Brand gets 100% Refund)`}
                                </button>
                                <p className="text-[var(--color-primary)]/70 text-xs mt-3">By rejecting, you get $0, but Brand cannot use the content.</p>
                            </div>
                        )}

                        {/* Action Box: PAID/FAILED */}
                        {(deal.status === 'PAID' || deal.status === 'FAILED') && (
                             <div className={`card-neutral border-l-4 ${deal.status === 'PAID' ? 'border-green-600' : 'border-gray-600'}`}>
                                <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-2">{deal.status === 'PAID' ? 'Deal Completed' : 'Deal Cancelled'}</h3>
                                <p className="text-[var(--color-primary)]/70 text-sm">
                                    {deal.status === 'PAID' ? `Final payment released to ${isCreator ? 'your account' : deal.creator}.` : 'Funds were refunded to the Brand.'}
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Dispute Modal */}
            {showDisputeModal && (
                <div className="fixed inset-0 bg-[var(--color-primary)]/90 flex items-center justify-center p-4 z-50">
                    <div className="bg-[var(--color-light)] border border-[var(--color-primary)] rounded-xl max-w-md w-full p-8 shadow-2xl">
                        <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4">Initiate Dispute</h3>
                        <p className="text-[var(--color-primary)]/70 text-sm mb-4">
                            Please provide a specific reason. This will suspend the automatic 72-hour payment release.
                        </p>
                        <textarea
                            value={disputeInput}
                            onChange={(e) => setDisputeInput(e.target.value)}
                            placeholder="e.g., Product placement not clearly visible in the final post."
                            className="input mb-4 h-32"
                            required
                        />
                        <div className="flex gap-3">
                            <button onClick={handleDispute} disabled={isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Submit Dispute
                            </button>
                            <button onClick={() => setShowDisputeModal(false)} className="btn-secondary flex-1">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}