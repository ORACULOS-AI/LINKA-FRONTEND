'use client';

import { useState, useCallback } from 'react'
import { useAuthApi, getAccessToken } from '../api/auth'
import { useAuth } from '../context/AuthContext'

interface ApiOptions extends RequestInit {
  requireAuth?: boolean
}

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { logout } = useAuth()
  const { useRefreshToken } = useAuthApi()
  const refreshTokenMutation = useRefreshToken()

  const fetchWithToken = useCallback(
    async (url: string, options: ApiOptions = {}) => {
      setIsLoading(true)
      setError(null)

      const { requireAuth = true, ...fetchOptions } = options

      try {
        let accessToken = getAccessToken()

        if (requireAuth && !accessToken) {
          throw new Error('No access token available')
        }

        const headers = new Headers(fetchOptions.headers)

        // Sempre enviar o token se ele existir, independente de requireAuth
        // Isso permite que usuários autenticados acessem recursos restritos
        // enquanto usuários não autenticados ainda podem acessar recursos públicos
        if (accessToken) {
          headers.set('Authorization', `Bearer ${accessToken}`)
        }

        const response = await fetch(url, { ...fetchOptions, headers })

        if (response.status === 401 && requireAuth) {
          // Token might be expired, try to refresh
          try {
            await refreshTokenMutation.mutateAsync()
            accessToken = getAccessToken()
            if (!accessToken) {
              throw new Error('Failed to refresh token')
            }
            headers.set('Authorization', `Bearer ${accessToken}`)
            const newResponse = await fetch(url, { ...fetchOptions, headers })
            if (!newResponse.ok) {
              throw new Error('Failed to fetch after token refresh')
            }
            return newResponse
          } catch (refreshError) {
            await logout()
            throw new Error('Session expired. Please log in again.')
          }
        }

        if (!response.ok) {
          throw new Error('API request failed')
        }

        return response
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('An unknown error occurred'),
        )
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [logout, refreshTokenMutation],
  )

  return { fetchWithToken, isLoading, error }
}
