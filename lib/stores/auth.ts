import { create } from 'zustand'
import type { Me } from '@/lib/api/client'

type AuthState = {
  me: Me | null
  setMe: (me: Me | null) => void
  reset: () => void
}

export const useAuth = create<AuthState>((set) => ({
  me: null,
  setMe: (me) => set({ me }),
  reset: () => set({ me: null }),
}))
