import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 60 * 1000,       // 1 minuto baseline
      gcTime: 10 * 60 * 1000,     // 10 minutos — mantém cache por mais tempo
    },
  },
})
