// File: src/components/ActionButtons.tsx (UPDATED)

'use client';

import { useState } from 'react';
import { Loader2, Send, CheckCircle, XCircle, Handshake, Shield, AlertTriangle, DollarSign, Check } from 'lucide-react'; // <-- ADDED DollarSign
import { DealResponse, DealStatus } from '@/lib/deal/types';
import {
  useApproveDealMutation,
  useCancelDealMutation,
  useAcceptDealMutation
} from '@/hooks/useDeal';

import { SubmitContentModal, InitiateDisputeModal, ResolveDisputeModal } from './ActionsModal';
import { useEtharisStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';

interface ActionButtonsProps {
  deal: DealResponse;
  onInitiateFunding?: (deal: DealResponse) => void;
}

interface ModalState {
  isOpen: boolean;
  type: 'submit' | 'dispute' | 'resolve' | null;
}

export function ActionButtons({ deal, onInitiateFunding }: ActionButtonsProps) {
  const router = useRouter()
  const path = usePathname()
  const { user } = useEtharisStore();

  const userRole = user?.role
  const userAddress = user?.wallet.address
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null });

  const redirectLink = () => isCreator
    ? path === "/creator"
      ?  window.location.href = "/creator"
      :  window.location.href = "/creator"
    : path === "/dashboard"
      ?  window.location.href = "/dashboard"
      :  window.location.href = "/dashboard"

  const approveMutation = useApproveDealMutation({
    onSuccess: () => {
      redirectLink()
    }
  });
  const cancelMutation = useCancelDealMutation({
    onSuccess: () => {
      redirectLink()
    }
  });

  const { mutate: acceptMutate, isPending: isAcceptPending } = useAcceptDealMutation({
    onSuccess: () => {
      redirectLink()
    }
  });

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isAcceptPending) return;
    acceptMutate(deal.deal_id);
  };

  const isBrand = userRole === 'brand';
  const isCreator = userRole === 'creator';
  const isOwner = isBrand && deal.brand.toLowerCase() === userAddress?.toLowerCase();
  const isCreatorParticipant = isCreator && deal.creator.toLowerCase() === userAddress?.toLowerCase();

  const dealStatus = deal.status

  if (!isOwner && !isCreatorParticipant) {
    return null;
  }

  const closeModal = () => setModal({ isOpen: false, type: null });

  const renderBrandActions = () => {
    switch (dealStatus) {
      case 'PENDING':
        if (deal.funded_at) {
          return (
            <p className="text-sm text-gray-500">Menunggu Creator Accept Deal...</p>
          );
        }

        return (
          <div className="flex gap-2">
            {isOwner && onInitiateFunding && (
              <button
                onClick={() => onInitiateFunding(deal)}
                className="btn-primary flex items-center gap-1 text-sm"
              >
                <DollarSign className="w-4 h-4" /> Fund Deal Now
              </button>
            )}
            <button
              onClick={() => cancelMutation.mutate(deal.deal_id)}
              disabled={cancelMutation.isPending}
              className="btn-secondary flex items-center gap-1 text-sm"
            >
              {cancelMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Batalkan Deal
            </button>
          </div>
        );

      case 'ACTIVE':
        return (
          <p className="text-sm text-gray-500">Menunggu Creator Submit Konten...</p>
        );

      case 'PENDING_REVIEW':
        const reviewDeadlineDate = deal.review_deadline ? new Date(deal.review_deadline * 1000) : null;
        const isPastDeadline = reviewDeadlineDate ? reviewDeadlineDate.getTime() < Date.now() : false;

        return (
          <div className="flex flex-col gap-2 justify-end">
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

      case 'DISPUTED':
        return (
          <p className="text-sm text-red-500 font-medium">Menunggu Respon Resolusi Creator...</p>
        );

      default:
        return null;
    }
  };

  const renderCreatorActions = () => {
    switch (dealStatus) {
      case 'PENDING':
        if (deal.funded_at) {
          return (<div className="">
            <button
              onClick={handleAccept}
              disabled={isAcceptPending}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              {isAcceptPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isAcceptPending ? 'Accepting...' : 'Accept Deal & Start Work'}
            </button>
            <p className='text-xs text-center text-red-700/80 mt-3 font-semibold'>*Action required: Deal has been funded.</p>
          </div>)
        }

        return (
          <p className="text-sm text-yellow-600">Menunggu Deposit Brand (Status: {dealStatus})</p>
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
          <p className="text-sm text-grey-600">Menunggu Review Brand</p>
        );

      case 'DISPUTED':
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
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        {isOwner ? renderBrandActions() : isCreatorParticipant ? renderCreatorActions() : null}
      </div>
      
      {modal.isOpen && modal.type === 'submit' && <SubmitContentModal dealId={deal.deal_id} closeModal={closeModal} redirect={redirectLink} />}
      {modal.isOpen && modal.type === 'dispute' && <InitiateDisputeModal dealId={deal.deal_id} closeModal={closeModal} redirect={redirectLink} />}
      {modal.isOpen && modal.type === 'resolve' && <ResolveDisputeModal dealId={deal.deal_id} closeModal={closeModal} redirect={redirectLink} />}
    </>
  );
}