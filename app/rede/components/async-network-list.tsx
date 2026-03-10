"use client"

import { useMemo, useState, useCallback } from "react"
import { NetworkList } from "./network-list"
import { SkeletonCard } from "./skeleton-card"
import { useAllUsers } from "@/hooks/allUsers"
import { useConnectionRequests } from "@/lib/api/connections"
import type { UserCreateData } from "@/lib/types/userTypes"
import { ConnectionStatus, RequestType } from "@/lib/types/connectionTypes"
import { Loader2 } from "lucide-react"

interface AsyncNetworkListProps {
  searchQuery: string
  roleFilter: string
  setSelectedUser: (user: UserCreateData) => void
  displayMode: "all" | "connected" | "pending"
}

export function AsyncNetworkList({ searchQuery, roleFilter, setSelectedUser, displayMode }: AsyncNetworkListProps) {
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useAllUsers()
  const {
    useGetRequests,
    useCreateRequest,
    useUpdateRequest,
    useCancelRequest,
    useRemoveConnection,
    useGetUserConnections,
  } = useConnectionRequests()

  const { data: sentRequests, isLoading: isLoadingSent } = useGetRequests(RequestType.SENT)
  const { data: receivedRequests, isLoading: isLoadingReceived } = useGetRequests(RequestType.RECEIVED)
  const { data: userConnections, isLoading: isLoadingConnections } = useGetUserConnections()

  const createRequestMutation = useCreateRequest()
  const updateRequestMutation = useUpdateRequest()
  const cancelRequestMutation = useCancelRequest()
  const removeConnectionMutation = useRemoveConnection()

  const [currentUserId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem("userUid")
  })
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})

  const isLoading = isLoadingUsers || isLoadingSent || isLoadingReceived || isLoadingConnections

  // Memoizar mapeamento de conexões para melhor performance
  const connections = useMemo(() => {
    if (!sentRequests || !receivedRequests || !userConnections) return []

    const connectionMap = new Map()

    // Mapear conexões aceitas (maior prioridade)
    userConnections.forEach((id) => {
      connectionMap.set(id, {
        id,
        status: ConnectionStatus.ACCEPTED,
        isSentByMe: false,
      })
    })

    // Adicionar solicitações pendentes apenas se não houver conexão aceita
    sentRequests
      .filter((req) => req.status === ConnectionStatus.PENDING)
      .forEach((req) => {
        if (!connectionMap.has(req.target_id)) {
          connectionMap.set(req.target_id, {
            id: req.target_id,
            status: ConnectionStatus.PENDING,
            isSentByMe: true,
          })
        }
      })

    receivedRequests
      .filter((req) => req.status === ConnectionStatus.PENDING)
      .forEach((req) => {
        if (!connectionMap.has(req.requester_id)) {
          connectionMap.set(req.requester_id, {
            id: req.requester_id,
            status: ConnectionStatus.PENDING,
            isSentByMe: false,
          })
        }
      })

    return Array.from(connectionMap.values())
  }, [sentRequests, receivedRequests, userConnections])

  // Memoizar usuários filtrados para melhor performance
  const filteredUsers = useMemo(() => {
    if (!users || !currentUserId) return []

    // Filtrar usuário atual
    let userList = users.filter((user) => user.uid !== currentUserId)

    // Aplicar filtros de busca e role
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      userList = userList.filter((user) =>
        user.nome.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.cidade && user.cidade.toLowerCase().includes(query))
      )
    }

    if (roleFilter !== "all") {
      userList = userList.filter((user) => user.tipo_usuario === roleFilter)
    }

    // Filtrar por modo de exibição
    if (displayMode === "connected") {
      const connectedIds = connections
        .filter((conn) => conn.status === ConnectionStatus.ACCEPTED)
        .map((conn) => conn.id)
      userList = userList.filter((user) => connectedIds.includes(user.uid))
    } else if (displayMode === "pending") {
      const pendingIds = connections
        .filter((conn) => conn.status === ConnectionStatus.PENDING)
        .map((conn) => conn.id)
      userList = userList.filter((user) => pendingIds.includes(user.uid))
    }

    return userList
  }, [users, currentUserId, searchQuery, roleFilter, connections, displayMode])

  // Memoizar mapeamento de status de conexão
  const connectionStatusMap = useMemo(() => {
    const statusMap = new Map()
    connections.forEach((conn) => {
      statusMap.set(conn.id, conn)
    })
    return statusMap
  }, [connections])

  // Callback otimizado para ações de conexão
  const handleRequestAction = useCallback(
    async (action: "send" | "accept" | "reject" | "cancel" | "remove", targetId: string, user: UserCreateData) => {
      setLoadingActions((prev) => ({ ...prev, [targetId]: true }))

      try {
        switch (action) {
          case "send":
            await createRequestMutation.mutateAsync(targetId)
            break
          case "accept":
            // Use targetId (requester_id) directly for updateRequest
            await updateRequestMutation.mutateAsync({
              userId: targetId,
              status: ConnectionStatus.ACCEPTED,
            })
            break
          case "reject":
            // Use targetId (requester_id) directly for updateRequest
            await updateRequestMutation.mutateAsync({
              userId: targetId,
              status: ConnectionStatus.REJECTED,
            })
            break
          case "cancel":
            // Use targetId directly for cancelRequest (the target of the sent request)
            await cancelRequestMutation.mutateAsync(targetId)
            break
          case "remove":
            // Pass both userId and userType for removeConnection
            await removeConnectionMutation.mutateAsync({
              userId: targetId,
              userType: user.tipo_usuario,
            })
            break
        }
      } catch {
        // Error handled by mutation
      } finally {
        setLoadingActions((prev) => ({ ...prev, [targetId]: false }))
      }
    },
    [
      createRequestMutation,
      updateRequestMutation,
      cancelRequestMutation,
      removeConnectionMutation,
      receivedRequests,
      sentRequests,
    ]
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (usersError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-4">
          <Loader2 className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Erro ao carregar usuários</p>
          <p className="text-sm text-gray-500">Tente novamente mais tarde</p>
        </div>
      </div>
    )
  }

  return (
    <NetworkList
      users={filteredUsers}
      connectionStatusMap={connectionStatusMap}
      handleRequestAction={handleRequestAction}
      setSelectedUser={setSelectedUser}
      loadingActions={loadingActions}
    />
  )
}
