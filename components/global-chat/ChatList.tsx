"use client"

import { useState, useEffect } from "react"
import { X, Search, Loader2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useMessagesApi, type Thread } from "@/lib/api/messages"
import { useAllUsers } from "@/hooks/allUsers"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ChatListProps {
  onClose: () => void
  onSelectThread: (threadId: string, userId: string) => void
  focusUserId?: string | null // Auto-open thread with this user
}

export function ChatList({ onClose, onSelectThread, focusUserId }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { useThreads } = useMessagesApi()
  const { data: users } = useAllUsers()

  const {
    data: threadsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useThreads()

  const threads = threadsData?.pages.flatMap((page) => page.threads) || []

  // Auto-open thread with focusUserId when available
  useEffect(() => {
    if (focusUserId && threads.length > 0 && !isLoading) {
      const currentUserId = localStorage.getItem("userUid")
      const targetThread = threads.find((thread) =>
        thread.participantes.includes(focusUserId) &&
        thread.participantes.includes(currentUserId || "")
      )

      if (targetThread) {
        // Auto-select the thread
        onSelectThread(targetThread.id, focusUserId)
      }
    }
  }, [focusUserId, threads, isLoading, onSelectThread])

  // Get user info for a participant ID
  const getUserInfo = (userId: string) => {
    const user = users?.find((u) => u.uid === userId)
    return {
      name: user?.nome || "Usuário",
      initials: user?.nome
        ? user.nome
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U",
    }
  }

  // Filter threads by search query
  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery) return true
    const otherParticipant = thread.participantes.find(
      (p) => p !== localStorage.getItem("userUid")
    )
    if (!otherParticipant) return false
    const userInfo = getUserInfo(otherParticipant)
    return userInfo.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ""
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return ""
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-l-2xl shadow-2xl border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Conversas</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Thread List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
            <p className="text-sm text-gray-500">Carregando conversas...</p>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-700">
              {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery
                ? "Tente outro termo de busca"
                : "Inicie uma conversa na página Rede"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredThreads.map((thread) => {
              const currentUserId = localStorage.getItem("userUid")
              const otherParticipant = thread.participantes.find(
                (p) => p !== currentUserId
              )
              if (!otherParticipant) return null

              const userInfo = getUserInfo(otherParticipant)

              return (
                <button
                  key={thread.id}
                  onClick={() => onSelectThread(thread.id, otherParticipant)}
                  className="w-full p-4 hover:bg-purple-50 transition-colors text-left flex items-start gap-3"
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-purple-600 text-white text-sm">
                      {userInfo.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 truncate">
                        {userInfo.name}
                      </span>
                      {thread.last_message_at && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTimestamp(thread.last_message_at)}
                        </span>
                      )}
                    </div>
                    {thread.last_message && (
                      <p className="text-sm text-gray-600 truncate">
                        {thread.last_message}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}

            {/* Load More */}
            {hasNextPage && (
              <div className="p-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  className="w-full"
                >
                  Carregar mais
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
