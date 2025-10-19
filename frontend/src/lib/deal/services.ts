import { api } from '@/lib/api'; // Asumsi ini diimpor dari file API wrapper Anda
import { CreateDealPayload, DealCreationResponse, FundingInitiationResponse, UploadBriefResponse } from './types';

/**
 * Service Helper: Mengunggah file langsung ke S3/Minio menggunakan Presigned URL.
 * NOTE: Fungsi ini TIDAK menggunakan api.post karena request ditujukan ke URL eksternal S3/Minio,
 * BUKAN ke server backend utama.
 * * @param url Presigned PUT URL.
 * @param file Objek file yang akan diunggah.
 */
export async function uploadFileToPresignedUrl(url: string, file: File): Promise<void> {
  const response = await fetch(url, {
    method: 'PUT',
    body: file,
  });

  if (!response.ok) {
    // Error handling sederhana untuk upload S3
    throw new Error(`[S3/Minio] Upload gagal dengan status: ${response.status} ${response.statusText}`);
  }
}

/**
 * Service: Mendapatkan Presigned URL untuk mengunggah Brief dari server backend.
 * @param userId ID Brand yang membuat deal.
 * @param file Objek file brief.
 * @returns UploadBriefResponse
 */
export const getPresignedUploadUrl = async (userId: string, file: File): Promise<UploadBriefResponse> => {
    // Data yang dikirim ke backend untuk mendapatkan signed URL
    const data = {
        content_type: file.type,
    };
    
    // Menggunakan api.post untuk endpoint deals/upload-brief
    const response = await api.post('/deal/upload-brief', data);
    
    // Asumsi api wrapper mengembalikan { data: T }
    return response.data;
};


/**
 * Service: Membuat Deal (langkah terakhir, termasuk pemicu escrow/pembayaran).
 * @param payload Payload final untuk Deal.
 * @returns DealCreationResponse
 */
export const createDeal = async (payload: CreateDealPayload): Promise<DealCreationResponse> => {
    // Menggunakan api.post untuk endpoint deals/create
    const response = await api.post('/deal/create', payload);
    
    // Asumsi api wrapper mengembalikan { data: T }
    return response.data;
};

/**
 * Service: Memulai proses pendanaan Deal (mendapatkan payment link IDRX).
 * Menggunakan service ini di client side.
 * @param dealId ID Deal yang baru dibuat.
 * @param totalDeposit Jumlah total Rupiah (termasuk fee) yang harus didepositkan.
 * @returns FundingInitiationResponse
 */
export const initiateDealFunding = async (dealId: string, totalDeposit: number): Promise<FundingInitiationResponse> => {
    const payload = {
        dealId: dealId,
        amount: totalDeposit,
        // Assume payment method is fixed to IDRX_LINK
    };
    
    // Asumsi endpoint untuk memulai pembayaran IDRX adalah /deal/fund yang akan menghubungi IDRX API
    // const response = await api.post('/deals/fund', payload);
    // return response.data;

    // --- MOCKING API RESPONSE DARI IDRX LINK ---
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return {
        dealId: dealId,
        totalDeposit: totalDeposit,
        paymentMethod: 'IDRX_LINK',
        // Ini adalah MOCK URL yang akan dibuka pengguna
        paymentLinkUrl: `https://idrx-payment.com/checkout?deal=${dealId}&amount=${totalDeposit}`, 
    };
};