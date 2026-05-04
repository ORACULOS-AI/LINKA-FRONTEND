import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface User {
  uid: string
  nome: string
  email: string
  tipo_usuario: string
}

export const useUsers = (searchTerm: string) => {
  return useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return []
      const response = await api.get(`/users/search?q=${searchTerm}`)
      return response.data
    },
    enabled: !!searchTerm,
  })
} 