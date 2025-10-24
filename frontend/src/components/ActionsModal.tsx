// File: src/components/ActionModals.tsx (NEW)

'use client';

import { useState } from 'react';
import { Loader2, Send, X, AlertTriangle, Handshake } from 'lucide-react';
import { 
  useSubmitContentMutation, 
  useInitiateDisputeMutation, 
  useResolveDisputeMutation 
} from '@/hooks/useDeal';
import toast from 'react-hot-toast';

interface BaseModalProps {
  dealId: string;
  closeModal: () => void;
  redirect: () => void;
}

const ModalWrapper = ({ title, children, closeModal }: { title: string; children: React.ReactNode; closeModal: () => void; }) => (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
    <div className="bg-white shadow-2xl max-w-md w-full p-6 border-4 border-primary border-dashed text-[var(--color-primary)]">
      <div className="flex justify-between items-start border-b pb-3 mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={closeModal} className="text-gray-500 hover:text-gray-900 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export function SubmitContentModal({ dealId, closeModal, redirect }: BaseModalProps) {
  const [contentUrl, setContentUrl] = useState('');
  const mutation = useSubmitContentMutation({
    onSuccess: () => {
      toast.success('Konten berhasil disubmit! Menunggu review Brand.');
      closeModal();
      redirect()
    },
    onError: (err) => {
      toast.error(`Gagal submit: ${err.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl) return;
    mutation.mutate({ deal_id: dealId, content_url: contentUrl });
  };

  return (
    <ModalWrapper title="Submit Konten Deal" closeModal={closeModal}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">Masukkan URL konten yang sudah live.</p>
        <div>
          <label className="block text-sm font-medium mb-1">Content Live URL</label>
          <input
            type="url"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            className="input w-full"
            placeholder="https://instagram.com/p/..."
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending || !contentUrl}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <Send className="w-4 h-4" /> {mutation.isPending ? 'Mengirim...' : 'Submit Final Konten'}
        </button>
      </form>
    </ModalWrapper>
  );
}

export function InitiateDisputeModal({ dealId, closeModal, redirect }: BaseModalProps) {
  const [reason, setReason] = useState('');
  const mutation = useInitiateDisputeMutation({
    onSuccess: () => {
      toast.success('Sengketa diinisiasi. Creator akan mendapatkan notifikasi untuk merespons.');
      closeModal();
      redirect()
    },
    onError: (err) => {
      toast.error(`Gagal inisiasi sengketa: ${err.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    mutation.mutate({ deal_id: dealId, reason });
  };

  return (
    <ModalWrapper title="Inisiasi Sengketa" closeModal={closeModal}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-red-600 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1" />
            Dana akan terkunci, dan Creator memiliki hak jawab final.
        </p>
        <div>
          <label className="block text-sm font-medium mb-1">Alasan Sengketa</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input w-full"
            rows={4}
            placeholder="Konten tidak sesuai brief, deadline terlampaui, dll."
            required
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending || !reason}
          className="btn-danger w-full flex items-center justify-center gap-2"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <Handshake className="w-4 h-4" /> {mutation.isPending ? 'Mengunci Dana...' : 'Inisiasi Sengketa'}
        </button>
      </form>
    </ModalWrapper>
  );
}

export function ResolveDisputeModal({ dealId, closeModal, redirect }: BaseModalProps) {
  const mutation = useResolveDisputeMutation({
    onSuccess: (data) => {
      toast.success(`Sengketa diselesaikan. Status: ${data.status}. Dana sedang diproses.`);
      closeModal();
      redirect()
    },
    onError: (err) => {
      toast.error(`Gagal menyelesaikan sengketa: ${err.message}`);
    }
  });

  const handleResolve = (is_accept_dispute: boolean) => {
    mutation.mutate({ deal_id: dealId, is_accept_dispute });
  };

  return (
    <ModalWrapper title="Tanggapi Sengketa" closeModal={closeModal}>
      <div className="space-y-4">
        <p className="text-lg font-bold text-center">Pilihan Resolusi Anda (Creator)</p>
        <p className="text-sm text-gray-600">
          Pilih salah satu opsi untuk mengakhiri sengketa yang diinisiasi Brand:
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleResolve(true)}
            disabled={mutation.isPending}
            className="w-full btn-success text-left transition-colors disabled:opacity-50"
          >
            <Handshake className="w-5 h-5 inline mr-2" />
            <span className="font-bold">Opsi 1: Terima Kompromi (50% Bayaran)</span>
            <p className="text-xs mt-1">Anda menerima 50% pembayaran parsial.</p>
          </button>

          <button
            onClick={() => handleResolve(false)}
            disabled={mutation.isPending}
            className="w-full btn-danger text-left transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 inline mr-2" />
            <span className="font-bold">Opsi 2: Tolak Klaim (100% Refund ke Brand)</span>
            <p className="text-xs mt-1">Dana dikembalikan 100% ke Brand, namun Anda mempertahankan lisensi konten.</p>
          </button>
        </div>

        {mutation.isPending && <div className="text-center text-blue-500"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Memproses Resolusi...</div>}
      </div>
    </ModalWrapper>
  );
}