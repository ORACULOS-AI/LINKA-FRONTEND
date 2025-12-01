import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import {
  ClaimTokenVerifyResponse,
  ClaimSuccessResponse,
  ClaimErrorResponse,
} from '@/lib/types/claimTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

// API Response Wrapper
interface APIResponse<T> {
  status: 'success' | 'error'
  message?: string
  data?: T
}

/**
 * Verificar token de reivindicação (público - sem autenticação)
 * @param token - Token UUID recebido por email
 */
export const verifyClaimToken = async (token: string): Promise<ClaimTokenVerifyResponse> => {
  const response = await axios.get<APIResponse<ClaimTokenVerifyResponse>>(
    `${API_BASE_URL}/claim/verify/${token}`
  )

  if (response.data.status === 'error') {
    throw new Error(response.data.message || 'Erro ao verificar token')
  }

  return response.data.data!
}

/**
 * Reivindicar recurso (autenticado)
 * @param token - Token UUID recebido por email
 * @param accessToken - JWT access token do usuário logado
 */
export const claimResource = async (
  token: string,
  accessToken: string
): Promise<ClaimSuccessResponse> => {
  const response = await axios.post<APIResponse<ClaimSuccessResponse>>(
    `${API_BASE_URL}/claim/claim/${token}`,
    {}, // Body vazio
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (response.data.status === 'error') {
    throw new Error(response.data.message || 'Erro ao reivindicar recurso')
  }

  return response.data.data!
}

/**
 * Hook para verificar token de reivindicação (React Query)
 */
export const useVerifyClaimToken = (token: string | null) => {
  return useQuery({
    queryKey: ['claim', 'verify', token],
    queryFn: () => verifyClaimToken(token!),
    enabled: !!token, // Só executar se token existir
    retry: false, // Não retentar em caso de erro
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para reivindicar recurso (React Query Mutation)
 */
export const useClaimResource = () => {
  return useMutation({
    mutationFn: ({ token, accessToken }: { token: string; accessToken: string }) =>
      claimResource(token, accessToken),
  })
}

/**
 * Hook de API para sistema de claim
 */
export const useClaimApi = () => {
  return {
    useVerifyClaimToken,
    useClaimResource,
  }
}
