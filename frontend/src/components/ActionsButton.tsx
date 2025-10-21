// File: src/components/ActionButtons.tsx (NEW)

'use client';

import { useState } from 'react';
import { Loader2, Send, CheckCircle, XCircle, Handshake, Shield, AlertTriangle } from 'lucide-react';
import { DealResponse, DealStatus } from '@/lib/deal/types';
import { 
  useApproveDealMutation, 
  useSubmitContentMutation, 
  useInitiateDisputeMutation, 
  useResolveDisputeMutation,
  useCancelDealMutation 
} from '@/hooks/useDeal';

// Import Modals (Harus didefinisikan di ActionModals.tsx)
import { SubmitContentModal, InitiateDisputeModal, ResolveDisputeModal } from './ActionsModal'; 

// --- DUMMY AUTH HOOK (Ganti dengan implementasi nyata Anda) ---
const useAuth = () => ({ isAuthenticated: true, userRole: 'BRAND', userAddress: '0xBrandWalletAddress' }); 
// -----------------------------------------------------------

interface ActionButtonsProps {
  deal: DealResponse;
}

interface ModalState {
  isOpen: boolean;
  type: 'submit' | 'dispute' | 'resolve' | null;
}

export function ActionButtons({ deal }: ActionButtonsProps) {
  const { userRole, userAddress } = useAuth();
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null });

  // Mutations
  const approveMutation = useApproveDealMutation();
  const cancelMutation = useCancelDealMutation();
  
  // Penentuan Peran dan Kepemilikan (Sangat penting)
  const isBrand = userRole === 'BRAND';
  const isCreator = userRole === 'CREATOR';
  // Note: deal.brand dan deal.creator adalah wallet address.
  const isOwner = isBrand && deal.brand.toLowerCase() === userAddress.toLowerCase();
  const isCreatorParticipant = isCreator && deal.creator.toLowerCase() === userAddress.toLowerCase();
  
  if (!isOwner && !isCreatorParticipant) {
    return null; // Hanya tampilkan aksi untuk Brand atau Creator yang terlibat
  }
  
  const closeModal = () => setModal({ isOpen: false, type: null });

  // --- Aksi Brand ---
  const renderBrandActions = () => {
    switch (deal.status) {
      case 'CREATED':
      case 'PENDING_FUNDING':
        return (
          <button 
            onClick={() => cancelMutation.mutate(deal.deal_id)} 
            disabled={cancelMutation.isPending} 
            className="btn-secondary-normal flex items-center gap-1 text-sm" // Mempertahankan styling eksisting
          >
            {cancelMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Batalkan Deal
          </button>
        );

      case 'ACTIVE':
        return (
          <p className="text-sm text-gray-500">Menunggu Creator Submit Konten...</p>
        );

      case 'PENDING_REVIEW':
        // Batas waktu review Brand
        const reviewDeadlineDate = deal.review_deadline ? new Date(deal.review_deadline * 1000) : null;
        const isPastDeadline = reviewDeadlineDate ? reviewDeadlineDate.getTime() < Date.now() : false;

        return (
          <div className="flex gap-2">
            <button 
              onClick={() => approveMutation.mutate(deal.deal_id)} 
              disabled={approveMutation.isPending || isPastDeadline} 
              className="btn-success flex items-center gap-1 text-sm"
            >
              {approveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <CheckCircle className="w-4 h-4" /> Approve & Bayar
            </button>
            <button 
              onClick={() => setModal({ isOpen: true, type: 'dispute' })} 
              className="btn-danger flex items-center gap-1 text-sm"
              disabled={isPastDeadline}
            >
              <XCircle className="w-4 h-4" /> Inisiasi Sengketa
            </button>
            {isPastDeadline && <p className="text-xs text-red-500 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Auto-Release Segera</p>}
          </div>
        );
      
      case 'IN_DISPUTE':
        return (
          <p className="text-sm text-red-500 font-medium">Menunggu Respon Resolusi Creator...</p>
        );

      default:
        return null;
    }
  };

  // --- Aksi Creator ---
  const renderCreatorActions = () => {
    switch (deal.status) {
      case 'CREATED':
      case 'PENDING_FUNDING':
        return (
          <p className="text-sm text-yellow-600">Menunggu Deposit Brand (Status: {deal.status})</p>
        );
        
      case 'ACTIVE':
        return (
          <button 
            onClick={() => setModal({ isOpen: true, type: 'submit' })} 
            className="btn-primary flex items-center gap-1 text-sm"
          >
            <Send className="w-4 h-4" /> Submit Konten
          </button>
        );

      case 'PENDING_REVIEW':
        return (
          <p className="text-sm text-blue-600">Menunggu Review Brand</p>
        );
        
      case 'IN_DISPUTE':
        return (
          <button 
            onClick={() => setModal({ isOpen: true, type: 'resolve' })} 
            className="btn-danger flex items-center gap-1 text-sm"
          >
            <Handshake className="w-4 h-4" /> Tanggapi Sengketa
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Container ini diasumsikan ada di bagian bawah Deal Card/Detail Page */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        {isOwner ? renderBrandActions() : renderCreatorActions()}
      </div>
      
      {/* Modals for Complex Actions */}
      {modal.isOpen && modal.type === 'submit' && <SubmitContentModal dealId={deal.deal_id} closeModal={closeModal} />}
      {modal.isOpen && modal.type === 'dispute' && <InitiateDisputeModal dealId={deal.deal_id} closeModal={closeModal} />}
      {modal.isOpen && modal.type === 'resolve' && <ResolveDisputeModal dealId={deal.deal_id} closeModal={closeModal} />}
    </>
  );
}