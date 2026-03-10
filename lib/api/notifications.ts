import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import type {
  Notification,
  NotificationCreate,
} from '../types/notificationTypes'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export const useNotificationsApi = () => {
  const { fetchWithToken } = useApi()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Listar notificações
  const getNotifications = async (): Promise<Notification[]> => {
    try {
      if (!isAuthenticated) return []
      const response = await fetchWithToken(`${API_BASE_URL}/notifications`, {
        requireAuth: true,
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao buscar notificações')
      }
      return data.data || []
    } catch {
      return []
    }
  }

  const useGetNotifications = () =>
    useQuery({
      queryKey: ['notifications'],
      queryFn: getNotifications,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Implementa backoff exponencial
        // Não tenta mais que 3 vezes
        if (failureCount >= 3) return false

        // Se for erro de rate limit, espera mais tempo
        if (error instanceof Error && error.message.includes('ratelimit')) {
          return true
        }

        return true
      },
      retryDelay: (attemptIndex) =>
        Math.min(
          1000 * 2 ** attemptIndex, // Backoff exponencial: 2s, 4s, 8s...
          30000, // Máximo de 30 segundos
        ),
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchInterval: 30000, // Polling a cada 30s — substitui setInterval manual
    })

  // Criar notificação (geralmente usado internamente pelo backend)
  const createNotification = async (
    notification: NotificationCreate,
  ): Promise<Notification> => {
    const response = await fetchWithToken(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      body: JSON.stringify(notification),
      requireAuth: true,
    })
    const data = await response.json()
    return data.data
  }

  const useCreateNotification = () =>
    useMutation({
      mutationFn: createNotification,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      },
    })

  // Atualizar notificação
  const updateNotification = async (
    notificationId: string,
    update: Partial<Notification>,
  ): Promise<Notification> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/notifications/${notificationId}`,
      {
        method: 'PUT',
        body: JSON.stringify(update),
        requireAuth: true,
      },
    )
    const data = await response.json()
    return data.data
  }

  const useUpdateNotification = () =>
    useMutation({
      mutationFn: ({
        notificationId,
        update,
      }: {
        notificationId: string
        update: Partial<Notification>
      }) => updateNotification(notificationId, update),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      },
    })

  // Deletar notificação
  const deleteNotification = async (notificationId: string): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      requireAuth: true,
    })
  }

  const useDeleteNotification = () =>
    useMutation({
      mutationFn: deleteNotification,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      },
    })

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string): Promise<Notification> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {
        method: 'POST',
        requireAuth: true,
      },
    )
    const data = await response.json()
    return data.data
  }

  const useMarkAsRead = () =>
    useMutation({
      mutationFn: markAsRead,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      },
    })

  // Marcar todas as notificações como lidas
  const markAllAsRead = async (): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/notifications/read-all`, {
      method: 'POST',
      requireAuth: true,
    })
  }

  const useMarkAllAsRead = () =>
    useMutation({
      mutationFn: markAllAsRead,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      },
    })

  return {
    useGetNotifications,
    useCreateNotification,
    useUpdateNotification,
    useDeleteNotification,
    useMarkAsRead,
    useMarkAllAsRead,
  }
}
