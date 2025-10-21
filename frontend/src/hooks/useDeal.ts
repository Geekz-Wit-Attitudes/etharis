// File: src/hooks/useDeal.ts

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseMutationOptions, 
  UseQueryOptions 
} from '@tanstack/react-query';
import { 
  createDeal, 
  getDeals, 
  getDealById, 
  initiateDealFunding,
  approveDeal,
  submitContent,
  initiateDispute,
  resolveDispute,
  cancelDeal,
  uploadFileToPresignedUrl,
  getPresignedUploadUrl,
  mockMintIDRX,
  fundExistingDeal,
} from '@/lib/deal/services';

import { 
  CreateDealFormInput, 
  DealResponse, 
  SubmitContentPayload,
  InitiateDisputePayload,
  ResolveDisputePayload,
  CreateDealApiSuccessResponse,
  TransactionResponse,
  FundingInitiationResponse
} from '@/lib/deal/types';

import { 
  generateSha256Hash, 
  dateStringToUnixTimestamp 
} from '@/lib/utils';

import toast from 'react-hot-toast';

// Asumsi Hook Autentikasi untuk mendapatkan User Info
// import { useAuth } from '@/hooks/useAuth'; 

// --- DUMMY AUTH HOOK DAN CONSTANTS (Gantikan dengan implementasi nyata Anda) ---
const useAuth = () => ({ isAuthenticated: true, userId: 'brand-user-id-123', userRole: 'BRAND' }); 
const PLATFORM_FEE_BPS = 200; // 2.00%
// -----------------------------------------------------------------------------

const DEAL_QUERY_KEY = 'deals';

/**
 * Interface untuk variabel mutasi Create Deal (menggabungkan form data dan file).
 */
interface DealCreationVariables {
  formData: CreateDealFormInput;
  briefFile: File | null;
}

// =================================================================================
// 1. MUTATIONS (WRITE OPERATIONS)
// =================================================================================

/**
 * Hook untuk Mutasi: Membuat Deal secara atomik, menangani alur upload file S3 dan API Deal.
 * Mutasi ini menghasilkan Deal ID dan Payment Link.
 */
export function useCreateDealMutation(
  options?: UseMutationOptions<CreateDealApiSuccessResponse, Error, DealCreationVariables>
) {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation<CreateDealApiSuccessResponse, Error, DealCreationVariables>({
    mutationFn: async ({ formData, briefFile }) => {
      if (!userId) {
        throw new Error("Pengguna belum terautentikasi.");
      }
      
      const amountNumber = Number(formData.amount) || 0;
      if (amountNumber <= 0) {
        throw new Error("Jumlah deal harus lebih besar dari nol.");
      }

      let briefHash: string = '';
      let briefUrl: string = '';

      // --- LANGKAH 1: Upload Brief (Jika File Ada) ---
      if (briefFile) {
        // 1a. Hitung SHA256 Hash lokal
        briefHash = await generateSha256Hash(briefFile);
        
        // 1b. Dapatkan Presigned URL dari Backend
        const {data} = await getPresignedUploadUrl(briefFile.type);
        briefUrl = data.file_url; 

        // 1c. Upload file ke S3/Minio
        await uploadFileToPresignedUrl(data.upload_url, briefFile);
      }
      
      // --- LANGKAH 2: Panggil API Create Deal ---
      const deadlineTimestamp = dateStringToUnixTimestamp(formData.deadline);
      
      const createPayload = {
        email: formData.creatorEmail,
        amount: amountNumber,
        deadline: deadlineTimestamp,
        brief_hash: briefHash, 
        // Backend harus mengambil user ID Brand dari token/context
      };
      
      const createResponse: CreateDealApiSuccessResponse = await createDeal(createPayload);
      
      // --- LANGKAH 3: Inisiasi Pendanaan (Get Payment Link) ---
      // Kita hitung totalDeposit di FE berdasarkan nominal dan fee (2.00%)
      // const totalDeposit = amountNumber * (1 + PLATFORM_FEE_BPS / 10000);

      // // Panggil service untuk mendapatkan payment link
      // const fundingResponse = await initiateDealFunding(createResponse.deal_id, totalDeposit);

      return createResponse;
    },
    
    onSuccess: (data, variables, result, context) => {
      // Invalidate deal list setelah berhasil membuat deal
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] }); 
      options?.onSuccess?.(data, variables, result, context);
    },
    
    ...options,
  });
}

/**
 * HOOK UPDATED: Konfirmasi pendanaan setelah pembayaran eksternal (MOCK MINT -> FUND)
 * Alur: [MOCK MINT IDRX] -> [API FUND DEAL]
 */
export function useFundDealMutation(options?: UseMutationOptions<TransactionResponse, Error, FundingInitiationResponse>) {
  const queryClient = useQueryClient();
  
  return useMutation<TransactionResponse, Error, FundingInitiationResponse>({
      // Menerima FundingInitiationResponse yang berisi deal_id dan totalDeposit
      mutationFn: async (fundingData) => {
          const { deal_id, totalDeposit } = fundingData;

          console.log(fundingData);
          

          // 1. MOCK MINT IDRX: Simulasikan Minting/Top Up (Selalu sukses)
          const mintResult = await mockMintIDRX({amount: totalDeposit});
          
          if (!mintResult.success) {
              // Walaupun ini mock, kita tetap menjaga fail safe
              throw new Error(mintResult.message || "Minting IDRX gagal."); 
          }
          
          console.log(`[MINT SUCCESS] Deal ID: ${deal_id} has been credited (Mock Tx: ${mintResult.tx_hash}).`);
          
          // 2. FUND API: Panggil Backend untuk konfirmasi pendanaan Deal
          const fundPayload = { deal_id: deal_id };
          return fundExistingDeal(fundPayload);
      },
      
      onSuccess: (data) => {
          // Invalidate queries untuk me-refresh daftar deal dan detail deal
          queryClient.invalidateQueries({ queryKey: ['balance'] }); 
          queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] }); 
          queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.tx_hash] });
      },
      
      ...options,
  });
}

/**
 * Hook untuk Aksi: Menyetujui Deal (Brand)
 */
export function useApproveDealMutation(options?: UseMutationOptions<TransactionResponse, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, string>({
    mutationFn: (dealId) => approveDeal(dealId),
    onSuccess: (data) => {
      toast.success(`Deal disetujui! Transaksi Hash: ${data.tx_hash}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.tx_hash] });
    },
    ...options,
  });
}

/**
 * Hook untuk Aksi: Creator Submit Konten
 */
export function useSubmitContentMutation(options?: UseMutationOptions<TransactionResponse, Error, SubmitContentPayload>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, SubmitContentPayload>({
    mutationFn: (payload) => submitContent(payload),
    onSuccess: (data) => {
      toast.success(`Konten berhasil diserahkan! Transaksi Hash: ${data.tx_hash}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.tx_hash] });
    },
    ...options,
  });
}

/**
 * Hook untuk Aksi: Brand Menginisiasi Sengketa
 */
export function useInitiateDisputeMutation(options?: UseMutationOptions<TransactionResponse, Error, InitiateDisputePayload>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, InitiateDisputePayload>({
    mutationFn: (payload) => initiateDispute(payload),
    onSuccess: (data) => {
      toast.success(`Sengketa berhasil diinisiasi! Transaksi Hash: ${data.tx_hash}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.tx_hash] });
    },
    ...options,
  });
}

/**
 * Hook untuk Aksi: Creator Merespons Resolusi Sengketa
 */
export function useResolveDisputeMutation(options?: UseMutationOptions<TransactionResponse, Error, ResolveDisputePayload>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, ResolveDisputePayload>({
    mutationFn: (payload) => resolveDispute(payload),
    onSuccess: (data) => {
      toast.success(`Sengketa diselesaikan! Transaksi Hash: ${data.tx_hash}. Status: ${data.status}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.tx_hash] });
    },
    ...options,
  });
}

/**
 * Hook untuk Aksi: Membatalkan Deal (Sebelum Funding)
 */
export function useCancelDealMutation(options?: UseMutationOptions<TransactionResponse, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, string>({
    mutationFn: (dealId) => cancelDeal(dealId),
    onSuccess: (data) => {
      toast.success(`Deal dibatalkan. Transaksi Hash: ${data.tx_hash}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.tx_hash] });
    },
    ...options,
  });
}

// =================================================================================
// 2. QUERIES (READ OPERATIONS)
// =================================================================================

/**
 * Hook Query: Mendapatkan daftar Deal untuk user yang terautentikasi (Brand atau Creator).
 */
export function useDealsQuery(options?: UseQueryOptions<DealResponse[], Error>) {
  const { isAuthenticated } = useAuth();
  
  return useQuery<DealResponse[], Error>({
    queryKey: [DEAL_QUERY_KEY],
    queryFn: getDeals,
    enabled: isAuthenticated, // Hanya aktif jika user terautentikasi
    staleTime: 1000 * 60, // 1 menit
    ...options,
  });
}

/**
 * Hook Query: Mendapatkan detail Deal spesifik berdasarkan ID.
 */
export function useDealQuery(dealId: string, options?: UseQueryOptions<DealResponse, Error>) {
  const { isAuthenticated } = useAuth();
  
  return useQuery<DealResponse, Error>({
    queryKey: [DEAL_QUERY_KEY, dealId],
    queryFn: () => getDealById(dealId),
    enabled: isAuthenticated && !!dealId, // Hanya aktif jika user terautentikasi dan dealId ada
    staleTime: 1000 * 30, // 30 detik
    ...options,
  });
}