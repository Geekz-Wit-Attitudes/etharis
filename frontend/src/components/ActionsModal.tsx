// File: src/components/ActionModals.tsx (NEW)

'use client';

import { useState } from 'react';
import { Loader2, Send, X, AlertTriangle, Handshake } from 'lucide-react';
import { 
  useSubmitContentMutation, 
  useInitiateDisputeMutation, 
  useResolveDisputeMutation 
} from '@/hooks/useDeal';

interface BaseModalProps {
  dealId: string;
  closeModal: () => void;
}

// Helper untuk tampilan modal
const ModalWrapper = ({ title, children, closeModal }: { title: string; children: React.ReactNode; closeModal: () => void; }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-[var(--color-primary)]">
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

// A. Modal Submit Content (Creator)
export function SubmitContentModal({ dealId, closeModal }: BaseModalProps) {
  const [contentUrl, setContentUrl] = useState('');
  const mutation = useSubmitContentMutation({
    onSuccess: () => {
      alert('Konten berhasil disubmit! Menunggu review Brand.');
      closeModal();
    },
    onError: (err) => {
      alert(`Gagal submit: ${err.message}`);
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

// B. Modal Initiate Dispute (Brand)
export function InitiateDisputeModal({ dealId, closeModal }: BaseModalProps) {
  const [reason, setReason] = useState('');
  const mutation = useInitiateDisputeMutation({
    onSuccess: () => {
      alert('Sengketa diinisiasi. Creator akan mendapatkan notifikasi untuk merespons.');
      closeModal();
    },
    onError: (err) => {
      alert(`Gagal inisiasi sengketa: ${err.message}`);
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

// C. Modal Resolve Dispute (Creator)
export function ResolveDisputeModal({ dealId, closeModal }: BaseModalProps) {
  const mutation = useResolveDisputeMutation({
    onSuccess: (data) => {
      alert(`Sengketa diselesaikan. Status: ${data.status}. Dana sedang diproses.`);
      closeModal();
    },
    onError: (err) => {
      alert(`Gagal menyelesaikan sengketa: ${err.message}`);
    }
  });

  const handleResolve = (accept8020: boolean) => {
    mutation.mutate({ deal_id: dealId, accept8020 });
  };

  return (
    <ModalWrapper title="Tanggapi Sengketa" closeModal={closeModal}>
      <div className="space-y-4">
        <p className="text-lg font-bold text-center">Pilihan Resolusi Anda (Creator)</p>
        <p className="text-sm text-gray-600">
          Pilih salah satu opsi untuk mengakhiri sengketa yang diinisiasi Brand:
        </p>

        <div className="space-y-3">
          {/* Opsi 1: Terima Kompromi (80%) */}
          <button
            onClick={() => handleResolve(true)}
            disabled={mutation.isPending}
            className="w-full p-4 border-2 border-green-500 rounded-lg bg-green-50 text-left hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <Handshake className="w-5 h-5 inline mr-2 text-green-700" />
            <span className="font-bold text-green-700">Opsi 1: Terima Kompromi (80% Bayaran)</span>
            <p className="text-xs text-gray-600 mt-1">Anda menerima 80% pembayaran parsial.</p>
          </button>

          {/* Opsi 2: Tolak Klaim Brand (100% Refund) */}
          <button
            onClick={() => handleResolve(false)}
            disabled={mutation.isPending}
            className="w-full p-4 border-2 border-red-500 rounded-lg bg-red-50 text-left hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 inline mr-2 text-red-700" />
            <span className="font-bold text-red-700">Opsi 2: Tolak Klaim (100% Refund ke Brand)</span>
            <p className="text-xs text-gray-600 mt-1">Dana dikembalikan 100% ke Brand, namun Anda mempertahankan lisensi konten.</p>
          </button>
        </div>

        {mutation.isPending && <div className="text-center text-blue-500"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Memproses Resolusi...</div>}
      </div>
    </ModalWrapper>
  );
}