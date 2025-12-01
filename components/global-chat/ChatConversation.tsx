"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useMessagesApi, type Message } from "@/lib/api/messages"
import { useAllUsers } from "@/hooks/allUsers"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ChatConversationProps {
  threadId: string
  userId: string
  onBack: () => void
  onClose: () => void
}

export function ChatConversation({
  threadId,
  userId,
  onBack,
  onClose,
}: ChatConversationProps) {
  const [messageText, setMessageText] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentUserId = localStorage.getItem("userUid")

  const { useMessages, useSendMessage } = useMessagesApi()
  const { data: users } = useAllUsers()

  const {
    data: messagesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useMessages(threadId)

  const sendMessageMutation = useSendMessage(threadId)

  const messages = messagesData?.pages.flatMap((page) => page.messages) || []

  // Get user info
  const otherUser = users?.find((u) => u.uid === userId)
  const userInfo = {
    name: otherUser?.nome || "Usuário",
    initials: otherUser?.nome
      ? otherUser.nome
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U",
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim()) return

    const content = messageText.trim()
    setMessageText("")

    try {
      await sendMessageMutation.mutateAsync({ conteudo: content })
    } catch (error) {
      console.error("Error sending message:", error)
      setMessageText(content) // Restore message on error
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-l-2xl shadow-2xl border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-purple-600 text-white text-sm">
            {userInfo.initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {userInfo.name}
          </h3>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-gray-500">Nenhuma mensagem ainda</p>
            <p className="text-xs text-gray-400 mt-1">
              Envie uma mensagem para começar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {hasNextPage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                className="w-full mb-4"
              >
                Carregar mensagens anteriores
              </Button>
            )}

            {messages
              .slice()
              .reverse()
              .map((message: Message) => {
                const isOwnMessage = message.remetente_id === currentUserId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                        max-w-[75%] rounded-2xl px-4 py-2
                        ${
                          isOwnMessage
                            ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }
                      `}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.conteudo}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-purple-200" : "text-gray-500"
                        }`}
                      >
                        {format(new Date(message.created_at), "HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            size="icon"
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg transition-shadow"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
