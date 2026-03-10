import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../hooks/useApi'
import {
  ConnectionRequest,
  RequestType,
  ConnectionStatus,
} from '../types/connectionTypes'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export function useConnectionRequests() {
  const queryClient = useQueryClient()
  const { fetchWithToken } = useApi()

  const getRequests = async (
    requestType: RequestType,
    status?: ConnectionStatus,
  ): Promise<ConnectionRequest[]> => {
    let url = `${API_BASE_URL}/connections/requests/${requestType}`
    if (status) {
      url += `?status=${status}`
    }
    const response = await fetchWithToken(url)
    const data = await response.json()
    return data.data
  }

  const createRequest = async (
    targetId: string,
  ): Promise<ConnectionRequest> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/connections/request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target_id: targetId }),
      },
    )
    return await response.json()
  }

  const updateRequest = async ({
    userId,
    status,
  }: {
    userId: string
    status: ConnectionStatus
  }): Promise<ConnectionRequest> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/connections/request/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      },
    )
    return await response.json()
  }

  const cancelRequest = async (userId: string): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/connections/request/${userId}`, {
      method: 'DELETE',
    })
  }

  const getUserConnections = async (): Promise<string[]> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/connections/connections`,
    )
    const data = await response.json()
    return data.data.connections
  }

  const removeConnection = async ({
    userId,
    userType,
  }: {
    userId: string
    userType: string
  }): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/connections/${userType}/${userId}`, {
      method: 'DELETE',
    })
  }

  // Nova função para verificar o status de conexão entre o usuário atual e outro usuário
  const getConnectionStatus = async (userId: string): Promise<{ status: ConnectionStatus | 'none', isSentByMe: boolean }> => {
    try {
      // Primeiro verificar se já estão conectados
      const connectionsResponse = await fetchWithToken(
        `${API_BASE_URL}/connections/connections`,
      )
      const connectionsData = await connectionsResponse.json()
      const connections = connectionsData.data.connections || []

      // Verificar se o usuário está na lista de conexões
      if (connections.includes(userId)) {
        return { status: ConnectionStatus.ACCEPTED, isSentByMe: false }
      }

      // Buscar solicitações enviadas pendentes
      const sentResponse = await fetchWithToken(
        `${API_BASE_URL}/connections/requests/${RequestType.SENT}?status=${ConnectionStatus.PENDING}`,
      )
      const sentData = await sentResponse.json()
      const sentRequests = sentData.data || []

      // Verificar se existe uma solicitação enviada pendente
      const sentPending = sentRequests.find(
        (req: ConnectionRequest) => req.target_id === userId,
      )

      if (sentPending) {
        return { status: ConnectionStatus.PENDING, isSentByMe: true }
      }

      // Buscar solicitações recebidas pendentes
      const receivedResponse = await fetchWithToken(
        `${API_BASE_URL}/connections/requests/${RequestType.RECEIVED}?status=${ConnectionStatus.PENDING}`,
      )
      const receivedData = await receivedResponse.json()
      const receivedRequests = receivedData.data || []

      // Verificar se existe uma solicitação recebida pendente
      const receivedPending = receivedRequests.find(
        (req: ConnectionRequest) => req.requester_id === userId,
      )

      if (receivedPending) {
        return { status: ConnectionStatus.PENDING, isSentByMe: false }
      }

      return { status: 'none', isSentByMe: false }
    } catch {
      return { status: 'none', isSentByMe: false }
    }
  }

  const useGetRequests = (
    requestType: RequestType,
    status?: ConnectionStatus,
  ) =>
    useQuery({
      queryKey: ['connectionRequests', requestType, status],
      queryFn: () => getRequests(requestType, status),
    })

  const useCreateRequest = () =>
    useMutation({
      mutationFn: createRequest,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['connectionRequests'] })
        queryClient.invalidateQueries({ queryKey: ['connectionStatus'] })
        queryClient.invalidateQueries({ queryKey: ['userConnections'] })
      },
    })

  const useUpdateRequest = () =>
    useMutation({
      mutationFn: updateRequest,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['connectionRequests'] })
        queryClient.invalidateQueries({ queryKey: ['userConnections'] })
        queryClient.invalidateQueries({ queryKey: ['connectionStatus'] })
      },
    })

  const useCancelRequest = () =>
    useMutation({
      mutationFn: cancelRequest,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['connectionRequests'] })
        queryClient.invalidateQueries({ queryKey: ['connectionStatus'] })
        queryClient.invalidateQueries({ queryKey: ['userConnections'] })
      },
    })

  const useGetUserConnections = () =>
    useQuery({
      queryKey: ['userConnections'],
      queryFn: getUserConnections,
    })

  const useRemoveConnection = () =>
    useMutation({
      mutationFn: removeConnection,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userConnections'] })
        queryClient.invalidateQueries({ queryKey: ['connectionStatus'] })
        queryClient.invalidateQueries({ queryKey: ['connectionRequests'] })
      },
    })

  // Hook para verificar o status de conexão
  const useGetConnectionStatus = (userId: string, options = {}) =>
    useQuery({
      queryKey: ['connectionStatus', userId],
      queryFn: () => getConnectionStatus(userId),
      ...options,
    })

  return {
    useGetRequests,
    useCreateRequest,
    useUpdateRequest,
    useCancelRequest,
    useGetUserConnections,
    useRemoveConnection,
    useGetConnectionStatus,
  }
}

// Exportar uma função para uso direto em componentes
export function useConnectionApi() {
  return useConnectionRequests()
}
