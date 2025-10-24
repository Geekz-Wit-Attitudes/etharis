

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
  MintResponse,
  MintIDRXRequest
} from './types';

const API_BASE_URL = '/deal'; 

const PLATFORM_FEE_BPS = 250; 

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


/**
 * Mendapatkan Presigned URL untuk mengunggah Brief. Endpoint: POST /deals/upload-brief
 */
export const getPresignedUploadUrl = async (content_type: string, brief_hash: string): Promise<{data: UploadBriefResponse}> => {
    
    const response = await api.post(`${API_BASE_URL}/upload-brief`, { 
        content_type,
        brief_hash
    });
    return response.data;
};

/**
 * Service: Mocks the successful Minting of IDRX tokens to the Brand's wallet.
 * @returns MintResponse (Simulasi sukses)
 */
export const mockMintIDRX = async (payload: MintIDRXRequest): Promise<MintResponse> => {
  const response = await api.post(`${API_BASE_URL}/mint-mock-idrx`, payload);
    return response.data;
};


/**
* Service: Konfirmasi pendanaan. Endpoint: POST /deals/fund
* Dipanggil setelah MOCK MINT IDRX.
*/
export const fundExistingDeal = async (payload: FundDealPayload): Promise<TransactionResponse> => {
  
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

export const acceptDeal = async (dealId: string): Promise<TransactionResponse> => {
    
    const response = await api.post(`${API_BASE_URL}/accept`, {deal_id: dealId}); 
    return response.data; 
}

/**
 * Menginisiasi pendanaan Deal (Mocking IDRX Payment Link).
 */
export const initiateDealFunding = async (dealId: string, amount: number): Promise<FundingInitiationResponse> => {
    const totalDeposit = amount * (1 + PLATFORM_FEE_BPS / 10000); 

    await new Promise(resolve => setTimeout(resolve, 500)); 
    
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

/**
 * Mendapatkan daftar Deal untuk user yang terautentikasi (Brand atau Creator). Endpoint: GET /deals/list
 */
export const getDeals = async (): Promise<DealResponse[]> => {
    const response = await api.get(`${API_BASE_URL}/list`, {params: {limit: 100}});
    
    return response.data.data;
};

/**
 * Mendapatkan detail Deal spesifik. Endpoint: GET /deals/:id
 */
export const getDealById = async (dealId: string): Promise<DealResponse> => {
    const response = await api.get(API_BASE_URL, {params: {id: dealId}});
    return response.data.data;
};

/**
 * Mendapatkan URL download brief yang aman. Endpoint: GET /deals/brief/:id/download
 */
export const getSecureDownloadUrl = async (briefId: string): Promise<string> => {
    const response = await api.get(`${API_BASE_URL}/brief/${briefId}/download`);
    
    return response.data;
};