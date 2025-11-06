import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatIDR(amount: number | string | undefined): string {
    if (typeof amount === "string") amount = Number(amount);

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
}

// Untuk input yang hanya menerima angka dan menghapus semua non-digit
export function cleanNumberInput(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/**
 * Menghitung SHA-256 hash dari objek File.
 * Digunakan untuk menghasilkan brief_hash yang diperlukan oleh smart contract.
 */
export async function generateSha256Hash(file: File): Promise<string> {
  if (typeof window === 'undefined') {
      // Fallback or error for SSR
      return ''; 
  }
  
  // Membaca file sebagai ArrayBuffer
  const buffer = await file.arrayBuffer();
  
  // Menghitung hash menggunakan Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  
  // Mengkonversi ArrayBuffer ke string heksadesimal
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
* Mengkonversi string tanggal (e.g., dari input datetime-local) ke Unix Timestamp dalam detik.
*/
export function dateStringToUnixTimestamp(dateString: string): number {
  if (!dateString) return 0;
  // Date.parse mengembalikan milidetik, dibagi 1000 untuk mendapatkan detik
  return Math.floor(new Date(dateString).getTime() / 1000);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTimestamp = (ts: number | null) => {
  if (!ts || ts === 0) return 'N/A';
  return new Date(ts * 1000).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};