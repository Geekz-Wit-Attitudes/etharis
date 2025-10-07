import { create } from 'zustand'

interface Deal {
  id: string
  contractId: string
  brand: string
  creator: string
  amount: string
  platform: string
  deliverable: string
  deadline: string
  status: 'PENDING' | 'ACTIVE' | 'PENDING_REVIEW' | 'DISPUTED' | 'PAID' | 'FAILED'
  finalContentUrl?: string
  createdAt: string
}

interface DealStore {
  deals: Deal[]
  addDeal: (deal: Deal) => void
  updateDeal: (id: string, updates: Partial<Deal>) => void
  getDeal: (id: string) => Deal | undefined
}

export const useDealStore = create<DealStore>((set, get) => ({
  deals: [],
  addDeal: (deal) => set((state) => ({ deals: [...state.deals, deal] })),
  updateDeal: (id, updates) =>
    set((state) => ({
      deals: state.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  getDeal: (id) => get().deals.find((d) => d.id === id),
}))
