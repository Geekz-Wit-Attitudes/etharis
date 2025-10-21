// File: lib/deal/services.ts

import { api } from '@/lib/api';
import { 
  CreateDealPayload, 
  TransactionResponse, 
  UploadBriefResponse, 
  FundingInitiationResponse, 
  FundDealPayload,
  CreateDealApiSuccessResponse,
  DealResponse,
  SubmitContentPayload,
  InitiateDisputePayload,
  ResolveDisputePayload,
  MintResponse
} from './types';

const API_BASE_URL = '/deal'; 
// Asumsi FEE_PERCENTAGE diambil dari konfigurasi global atau endpoint /contract/platform-fee
const PLATFORM_FEE_BPS = 200; // 2.00% fee (200 basis points)

/**
 * Helper: Upload file langsung ke S3/Minio menggunakan Presigned URL (PUT request).
 */
export async function uploadFileToPresignedUrl(url: string, file: File): Promise<void> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`[S3/Minio] Upload gagal: Status ${response.status}`);
  }
}

// --- WRITE OPERATIONS ---

/**
 * Mendapatkan Presigned URL untuk mengunggah Brief. Endpoint: POST /deals/upload-brief
 */
export const getPresignedUploadUrl = async (contentType: string): Promise<{data: UploadBriefResponse}> => {
    // Backend membutuhkan content_type
    const response = await api.post(`${API_BASE_URL}/upload-brief`, { 
        content_type: contentType 
    });
    return response.data;
};

/**
 * Service: Mocks the successful Minting of IDRX tokens to the Brand's wallet.
 * @returns MintResponse (Simulasi sukses)
 */
export const mockMintIDRX = async (dealId: string, amount: number): Promise<MintResponse> => {
  console.log(`[MOCK] Simulating IDRX Minting senilai ${amount} untuk Deal ID: ${dealId}`);
  
  // Simulate SC transaction delay
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  return {
      success: true,
      tx_hash: `0xMINTING_MOCK_TX_${Date.now()}`,
      message: `IDRX senilai ${amount} berhasil diminting ke Brand Wallet.`,
  };
};


/**
* Service: Konfirmasi pendanaan. Endpoint: POST /deals/fund
* Dipanggil setelah MOCK MINT IDRX.
*/
export const fundExistingDeal = async (payload: FundDealPayload): Promise<TransactionResponse> => {
  // Panggilan API backend yang sebenarnya untuk memicu transaksi fundDeal
  const response = await api.post(`${API_BASE_URL}/fund`, payload);
  return response.data;
};

/**
 * Membuat Deal baru di Smart Contract. Endpoint: POST /deals/create
 */
export const createDeal = async (payload: CreateDealPayload): Promise<CreateDealApiSuccessResponse> => {
    const response = await api.post(`${API_BASE_URL}/create`, payload);
    return response.data; 
};

/**
 * Menginisiasi pendanaan Deal (Mocking IDRX Payment Link).
 */
export const initiateDealFunding = async (dealId: string, amount: number): Promise<FundingInitiationResponse> => {
    const totalDeposit = amount * (1 + PLATFORM_FEE_BPS / 10000); // Hitung total deposit berdasarkan fee

    // MOCKING API RESPONSE DARI IDRX LINK - Gantikan dengan panggilan API /deals/fund jika backend siap
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // Payload untuk fundDeal
    // const payload: FundDealPayload = { deal_id: dealId };
    // const fundResponse = await api.post(`${API_BASE_URL}/fund`, payload);
    
    return {
        deal_id: dealId,
        totalDeposit: totalDeposit,
        paymentLinkUrl: `https://idrx-payment.com/checkout?deal=${dealId}&amount=${totalDeposit}`, 
    };
};

/**
 * Menyetujui Deal dan melepaskan dana. Endpoint: POST /deals/approve
 */
export const approveDeal = async (dealId: string): Promise<TransactionResponse> => {
    const response = await api.post(`${API_BASE_URL}/approve`, { deal_id: dealId });
    return response.data;
}

/**
 * Creator mengirimkan URL konten. Endpoint: POST /deals/submit-content
 */
export const submitContent = async (payload: SubmitContentPayload): Promise<TransactionResponse> => {
    const response = await api.post(`${API_BASE_URL}/submit-content`, payload);
    return response.data;
}

/**
 * Brand menginisiasi sengketa. Endpoint: POST /deals/dispute/initiate
 */
export const initiateDispute = async (payload: InitiateDisputePayload): Promise<TransactionResponse> => {
    const response = await api.post(`${API_BASE_URL}/dispute/initiate`, payload);
    return response.data;
}

/**
 * Creator merespons sengketa. Endpoint: POST /deals/dispute/resolve
 */
export const resolveDispute = async (payload: ResolveDisputePayload): Promise<TransactionResponse> => {
    const response = await api.post(`${API_BASE_URL}/dispute/resolve`, payload);
    return response.data;
}

/**
 * Membatalkan Deal (jika status memungkinkan). Endpoint: POST /deals/cancel
 */
export const cancelDeal = async (dealId: string): Promise<TransactionResponse> => {
    const response = await api.post(`${API_BASE_URL}/cancel`, { deal_id: dealId });
    return response.data;
}


// --- READ OPERATIONS ---

/**
 * Mendapatkan daftar Deal untuk user yang terautentikasi (Brand atau Creator). Endpoint: GET /deals/list
 */
export const getDeals = async (): Promise<DealResponse[]> => {
    const response = await api.get(`${API_BASE_URL}/list`);
    // Backend mengembalikan { data: DealResponse[] }
    // Perlu pemetaan tambahan untuk menghitung totalDeposit di frontend jika data BE kurang
    return response.data;
};

/**
 * Mendapatkan detail Deal spesifik. Endpoint: GET /deals/:id
 */
export const getDealById = async (dealId: string): Promise<DealResponse> => {
    const response = await api.get(`${API_BASE_URL}/${dealId}`);
    return response.data;
};

/**
 * Mendapatkan URL download brief yang aman. Endpoint: GET /deals/brief/:id/download
 */
export const getSecureDownloadUrl = async (briefId: string): Promise<string> => {
    const response = await api.get(`${API_BASE_URL}/brief/${briefId}/download`);
    // Backend mengembalikan URL yang ditandatangani
    return response.data;
};