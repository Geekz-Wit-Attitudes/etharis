import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { CreateDealFormInput, DealCreationResponse } from '@/lib/deal/types';
import { 
  getPresignedUploadUrl, 
  uploadFileToPresignedUrl, 
  createDeal 
} from '@/lib/deal/services';

// Catatan: Asumsi Brand ID diperoleh dari hook autentikasi seperti useAuth()

interface DealCreationVariables {
  formData: CreateDealFormInput;
  briefFile: File | null;
}

/**
 * Hook untuk Mutasi: Membuat Deal secara atomik, menangani alur upload file S3 dan API Deal.
 */
export function useCreateDealMutation(
  options?: UseMutationOptions<DealCreationResponse, Error, DealCreationVariables>
) {
  // --- Data Konfigurasi (Asumsi diambil dari Global State atau Config) ---
  const brandId = 'brand-user-id-from-auth-state'; 
  const feePercentage = 0.02; 

  return useMutation<DealCreationResponse, Error, DealCreationVariables>({
    mutationFn: async ({ formData, briefFile }) => {
      if (!brandId) {
        throw new Error("Pengguna (Brand) belum terautentikasi.");
      }
      
      const amountNumber = Number(formData.amount) || 0;
      if (amountNumber <= 0) {
        throw new Error("Jumlah deal harus lebih besar dari nol.");
      }

      // Hitung total deposit
      const totalDeposit = amountNumber * (1 + feePercentage);
      let briefUrl: string | undefined = undefined;

      // --- Alur Upload Brief (Jika File Ada) ---
      if (briefFile) {
        // 1. Dapatkan Presigned URL dari Backend
        const signedData = await getPresignedUploadUrl(brandId, briefFile);
        briefUrl = signedData.file_url; // Dapatkan URL yang akan disimpan

        // 2. Upload file ke S3/Minio menggunakan Presigned URL
        await uploadFileToPresignedUrl(signedData.upload_url, briefFile);
      }

      // --- Panggil API Create Deal (Langkah 3) ---
      const payload = {
        ...formData,
        brandId,
        totalDeposit,
        briefUrl, // Masukkan URL file yang sudah di-upload
      };

      return createDeal(payload);
    },
    
    onSuccess: (data, variables, result, context) => {
      // Invalidate queries atau lakukan redirect di sini
      console.log('Deal creation successful:', data);
      options?.onSuccess?.(data, variables, result, context);
    },
    
    onError: (error, variables, result, context) => {
      console.error('Deal creation failed:', error);
      options?.onError?.(error, variables, result, context);
    },
    
    ...options,
  });
}