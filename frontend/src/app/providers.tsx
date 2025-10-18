// src/app/providers.tsx

'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
// import { AuthProvider } from '@/lib/auth-context'; // Hapus AuthProvider lama
import { Toaster } from 'react-hot-toast'; 
// Zustand tidak perlu import di sini karena sudah di-wrap oleh persist() dan digunakan oleh hooks

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Tidak perlu AuthProvider, karena Zustand store menangani state global. */}
      {/* Pastikan useEtharisStore digunakan di semua komponen yang memerlukan state user. */}
      {children} 
      <Toaster position="top-right" reverseOrder={false} />
    </QueryClientProvider>
  );
}