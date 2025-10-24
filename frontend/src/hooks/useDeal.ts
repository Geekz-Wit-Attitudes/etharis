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
  acceptDeal,
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
import { useEtharisStore } from '@/lib/store';

const DEAL_QUERY_KEY = 'deals';

/**
 * Interface untuk variabel mutasi Create Deal (menggabungkan form data dan file).
 */
interface DealCreationVariables {
  formData: CreateDealFormInput;
  briefFile: File | null;
}

export function useCreateDealMutation(
  options?: UseMutationOptions<CreateDealApiSuccessResponse, Error, DealCreationVariables>
) {
  const queryClient = useQueryClient();
  const { user } = useEtharisStore();
  
  return useMutation<CreateDealApiSuccessResponse, Error, DealCreationVariables>({
    mutationFn: async ({ formData, briefFile }) => {
      if (!user?.id) {
        throw new Error("Pengguna belum terautentikasi.");
      }
      
      const amountNumber = Number(formData.amount) || 0;
      if (amountNumber <= 0) {
        throw new Error("Jumlah deal harus lebih besar dari nol.");
      }

      let briefHash: string = '';
      let briefUrl: string = '';

      if (briefFile) {
        briefHash = await generateSha256Hash(briefFile);
        
        const {data} = await getPresignedUploadUrl(briefFile.type, briefHash);
        briefUrl = data.file_url; 

        await uploadFileToPresignedUrl(data.upload_url, briefFile);
      }
      
      const deadlineTimestamp = dateStringToUnixTimestamp(formData.deadline);
      
      const createPayload = {
        email: formData.creatorEmail,
        amount: amountNumber,
        deadline: deadlineTimestamp,
        brief_hash: briefHash, 
      };
      
      const createResponse: CreateDealApiSuccessResponse = await createDeal(createPayload);
      
      return {...createResponse, totalDeposit: amountNumber};
    },
    
    onSuccess: (data, variables, result, context) => {
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] }); 
      options?.onSuccess?.(data, variables, result, context);
    },
    
    ...options,
  });
}

export function useFundDealMutation(options?: UseMutationOptions<TransactionResponse, Error, FundingInitiationResponse>) {
  const queryClient = useQueryClient();
  
  return useMutation<TransactionResponse, Error, FundingInitiationResponse>({
      mutationFn: async (fundingData) => {
          const { deal_id, totalDeposit } = fundingData;

          const roundedDeposit = Math.round(totalDeposit)

          const mintResult = await mockMintIDRX({amount: roundedDeposit});

          console.log(mintResult);
          
          
          if (mintResult.data.status !== "MINTED_SUCCESS") {
              throw new Error("Minting IDRX gagal."); 
          }
          
          const fundPayload = { deal_id: deal_id, amount: roundedDeposit };
          return fundExistingDeal(fundPayload);
      },
      
      onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['balance'] }); 
          queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] }); 
          queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.transaction_hash] });
      },
      
      ...options,
  });
}

export function useAcceptDealMutation (options?: UseMutationOptions<TransactionResponse, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, string>({
    mutationFn: (dealId) => acceptDeal(dealId),
    onSuccess: (data) => {
      toast.success(`Deal disetujui! Transaksi Hash: ${data.transaction_hash}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.transaction_hash] });
    },
    ...options,
  });
}

export function useApproveDealMutation(options?: UseMutationOptions<TransactionResponse, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, string>({
    mutationFn: (dealId) => approveDeal(dealId),
    onSuccess: (data) => {
      toast.success(`Deal disetujui! Transaksi Hash: ${data.transaction_hash}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.transaction_hash] });
    },
    ...options,
  });
}

export function useSubmitContentMutation(options?: UseMutationOptions<TransactionResponse, Error, SubmitContentPayload>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, SubmitContentPayload>({
    mutationFn: (payload) => submitContent(payload),
    onSuccess: (data) => {
      toast.success(`Konten berhasil diserahkan! Transaksi Hash: ${data.transaction_hash}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.transaction_hash] });
    },
    ...options,
  });
}

export function useInitiateDisputeMutation(options?: UseMutationOptions<TransactionResponse, Error, InitiateDisputePayload>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, InitiateDisputePayload>({
    mutationFn: (payload) => initiateDispute(payload),
    onSuccess: (data) => {
      toast.success(`Sengketa berhasil diinisiasi! Transaksi Hash: ${data.transaction_hash}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.transaction_hash] });
    },
    ...options,
  });
}

export function useResolveDisputeMutation(options?: UseMutationOptions<TransactionResponse, Error, ResolveDisputePayload>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, ResolveDisputePayload>({
    mutationFn: (payload) => resolveDispute(payload),
    onSuccess: (data) => {
      toast.success(`Sengketa diselesaikan! Transaksi Hash: ${data.transaction_hash}. Status: ${data.status}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.transaction_hash] });
    },
    ...options,
  });
}

export function useCancelDealMutation(options?: UseMutationOptions<TransactionResponse, Error, string>) {
  const queryClient = useQueryClient();
  return useMutation<TransactionResponse, Error, string>({
    mutationFn: (dealId) => cancelDeal(dealId),
    onSuccess: (data) => {
      toast.success(`Deal dibatalkan. Transaksi Hash: ${data.transaction_hash}`);
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEAL_QUERY_KEY, data.transaction_hash] });
    },
    ...options,
  });
}

export function useDealsQuery(options?: UseQueryOptions<DealResponse[], Error>) {
  const { isAuthenticated } = useEtharisStore();
  
  return useQuery<DealResponse[], Error>({
    queryKey: [DEAL_QUERY_KEY],
    queryFn: getDeals,
    enabled: isAuthenticated, // Hanya aktif jika user terautentikasi
    staleTime: 1000 * 60, // 1 menit
    ...options,
  });
}

export function useDealQuery(dealId: string, options?: UseQueryOptions<DealResponse, Error>) {
  const { isAuthenticated } = useEtharisStore();
  
  return useQuery<DealResponse, Error>({
    queryKey: [DEAL_QUERY_KEY, dealId],
    queryFn: () => getDealById(dealId),
    enabled: isAuthenticated && !!dealId, // Hanya aktif jika user terautentikasi dan dealId ada
    staleTime: 1000 * 30, // 30 detik
    ...options,
  });
}