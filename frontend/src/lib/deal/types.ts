// File: lib/deal/types.ts

// Status Deal sesuai Smart Contract (dari mapping backend)
export type DealStatus =
    | 'CREATED' // Deal dibuat, menunggu pendanaan
    | 'PENDING_FUNDING' // (Sama seperti CREATED, status di DB)
    | 'ACTIVE' // Deal didanai, siap dikerjakan
    | 'PENDING_REVIEW' // Creator submit, Brand memiliki 72 jam review
    | 'IN_DISPUTE' // Dispute diinisiasi oleh Brand
    | 'RESOLVED_PAID' // Dispute selesai, dibayar 80% (Creator win 80/20)
    | 'COMPLETED' // Deal selesai, dibayar 100%
    | 'CANCELLED' // Dibatalkan sebelum FUNDING (hanya brand/creator)
    | 'REFUNDED'; // Dana dikembalikan ke Brand (misal, auto-refund atau resolve 0/100)

export type DealPlatform = 'Instagram' | 'YouTube' | 'TikTok';

export interface MintIDRXRequest {
    amount: number; // Jumlah Rupiah yang akan di-mint (misal: 50000)
}

// Response dari Minting IDRX (Success/Fail notification di frontend)
export interface MintResponse {
    success: boolean;
    tx_hash: string;
    message: string;
}

// Response umum untuk transaksi (write) ke Kontrak
export interface TransactionResponse {
    tx_hash: string;
    status: DealStatus;
}
export interface CreateDealApiSuccessResponse extends TransactionResponse {
    deal_id: string;
}

// Response dari inisiasi pendanaan
export interface FundingInitiationResponse {
    deal_id: string;
    totalDeposit: number;
    paymentLinkUrl: string;
}

// Input data mentah dari form (strings)
export interface CreateDealFormInput {
    creatorEmail: string;
    amount: string; // Rupiah amount (string)
    platform: DealPlatform;
    deliverable: string;
    deadline: string; // ISO string atau datetime-local string
}

// Payload yang dikirim ke API /deals/create
export interface CreateDealPayload {
    email: string; // Email Creator
    amount: number; // Jumlah Rupiah mentah (tanpa fee)
    deadline: number; // Unix timestamp in seconds
    brief_hash: string; // SHA256 Hash dari file brief (HEX string)
}

// Payload untuk FundDeal (untuk konfirmasi setelah pembayaran IDRX)
export interface FundDealPayload {
    deal_id: string;
}

// Payload untuk Submit Content
export interface SubmitContentPayload {
    deal_id: string;
    content_url: string;
}

// Payload untuk Initiate Dispute
export interface InitiateDisputePayload {
    deal_id: string;
    reason: string;
}

// Payload untuk Resolve Dispute
export interface ResolveDisputePayload {
    deal_id: string;
    accept8020: boolean; // TRUE: Creator menerima 80% kompromi. FALSE: Creator menolak (100% refund).
}

// --- RESPONSES API ---

// Response dari API /deals/upload-brief
export interface UploadBriefResponse {
    upload_url: string; // Presigned PUT URL ke S3/Minio
    file_url: string; // URL permanen file (untuk brief_url di DealResponse)
}

// Response umum untuk transaksi (write) ke Kontrak
export interface TransactionResponse {
    tx_hash: string; // Hash transaksi blockchain
    status: DealStatus; // Status Deal yang baru
}

// Response spesifik setelah createDeal
export interface CreateDealApiSuccessResponse extends TransactionResponse {
    deal_id: string; // ID Deal yang baru dibuat (cuid)
}

// Response dari inisiasi pendanaan (mocking IDRX link)
export interface FundingInitiationResponse {
    deal_id: string;
    totalDeposit: number; // Total deposit yang harus dibayar (termasuk fee)
    paymentLinkUrl: string; // URL link pembayaran IDRX
}

// Response Deal lengkap dari API /deals/:id atau /deals/list
export interface DealResponse {
    deal_id: string;
    brand: string; // Wallet address Brand
    creator: string; // Wallet address Creator
    amount: number; // Jumlah yang diterima Creator (tanpa fee)
    // Catatan: totalDeposit harus dihitung di FE/BE. Disini saya hanya memuat data kontrak.
    deadline: number; // Unix timestamp
    status: DealStatus;
    brief_hash: string;

    // Detail opsional
    content_url: string | null;
    review_deadline: number | null; // Unix timestamp, 72 jam setelah submit
    funded_at: number | null; // Unix timestamp
    submitted_at: number | null; // Unix timestamp
}