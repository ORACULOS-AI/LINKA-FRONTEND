"use client"

import { NetworkCard } from "./network-card"
import { Users, Search, UserX } from "lucide-react"
import type { UserCreateData } from "@/lib/types/userTypes"
import type { ConnectionStatus } from "@/lib/types/connectionTypes"
import { memo } from "react"

interface NetworkListProps {
  users: UserCreateData[]
  connectionStatusMap: Map<string, {
    id: string
    status: ConnectionStatus
    isSentByMe: boolean
  }>
  handleRequestAction: (
    action: "send" | "accept" | "reject" | "cancel" | "remove",
    targetId: string,
    user: UserCreateData,
  ) => void
  setSelectedUser: (user: UserCreateData) => void
  loadingActions: Record<string, boolean>
}

export const NetworkList = memo(function NetworkList({
  users,
  connectionStatusMap,
  handleRequestAction,
  setSelectedUser,
  loadingActions,
}: NetworkListProps) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserX className="h-10 w-10 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhum usuário encontrado</h3>
        <p className="text-gray-600 max-w-md mx-auto">Tente ajustar os filtros de busca ou termos de pesquisa.</p>
      </div>
    )
  }

  const getConnectionStatus = (userId: string): { status: ConnectionStatus | "none"; isSentByMe: boolean } => {
    const connection = connectionStatusMap.get(userId)
    return connection
      ? { status: connection.status, isSentByMe: connection.isSentByMe }
      : { status: "none", isSentByMe: false }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => {
        const { status, isSentByMe } = getConnectionStatus(user.uid)
        return (
          <NetworkCard
            key={user.uid}
            user={user}
            connectionStatus={status}
            handleRequestAction={handleRequestAction}
            onViewProfile={setSelectedUser}
            isLoading={loadingActions[user.uid] || false}
            isSentByMe={isSentByMe}
          />
        )
      })}
    </div>
  )
})
