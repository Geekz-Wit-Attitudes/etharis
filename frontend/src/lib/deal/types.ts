export type DealPlatform = 'Instagram' | 'YouTube' | 'TikTok';

// Input data dari form frontend
export interface CreateDealFormInput {
  creatorEmail: string;
  amount: string; // Rupiah amount (string)
  platform: DealPlatform;
  deliverable: string;
  deadline: string;
}

// Payload yang dikirim ke API /api/deals/create
export interface CreateDealPayload extends CreateDealFormInput {
  brandId: string;
  briefUrl?: string; // Final URL dari file brief yang sudah di-upload
  totalDeposit: number; // Jumlah total yang harus didepositkan (termasuk fee)
}


// Response dari API /api/deals/upload-brief
export interface UploadBriefResponse {
  upload_url: string; // URL untuk PUT request (upload ke S3/Minio)
  file_url: string; // URL final yang disimpan di database
}

export interface DealCreationResponse {
    dealId: string;
    totalDeposit: number; // Harus disertakan dari backend/payload
    status: 'PendingPayment' | 'DealCreatedAndFunded';
    paymentLink?: string; 
  }
  
  // New response type for initiating funding
  export interface FundingInitiationResponse {
    dealId: string;
    totalDeposit: number;
    paymentMethod: 'IDRX_LINK' | 'IDRX_VA';
    // URL yang akan dibuka pengguna untuk menyelesaikan pembayaran IDRX
    paymentLinkUrl: string; 
    virtualAccountNumber?: string; 
    bankName?: string;
  }