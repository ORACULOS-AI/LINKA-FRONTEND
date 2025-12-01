"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useChatOverlay } from "../context/ChatOverlayContext"
import { useNotifications } from "../context/NotificationContext"

export interface ShareableContent {
  type: "evento" | "negocio" | "iniciativa" | "laboratorio"
  id: string
  title: string
  url: string
}

/**
 * Hook que fornece ações integradas entre diferentes páginas da seção Comunidade
 * Permite mensagens, agendamentos e navegação contextualizados
 */
export function useCrossPageActions() {
  const router = useRouter()
  const { openChat } = useChatOverlay()
  const { showToast } = useNotifications()

  /**
   * Abre o chat overlay com um usuário específico
   * Usado em: Rede, Perfil, Notificações
   */
  const messageUser = useCallback(
    (userId: string, threadId?: string) => {
      openChat(userId, threadId)
    },
    [openChat]
  )

  /**
   * Navega para a página de reuniões com modal de agendamento aberto
   * e usuário pré-selecionado (via query params)
   * Usado em: Rede, Conversas, Perfil
   */
  const scheduleMeeting = useCallback(
    (userId: string, userName?: string) => {
      router.push(`/reunioes?schedule=true&userId=${userId}${userName ? `&userName=${encodeURIComponent(userName)}` : ""}`)
    },
    [router]
  )

  /**
   * Navega para o perfil de um usuário
   * Usado em: Rede, Conversas, Notificações
   */
  const viewProfile = useCallback(
    (userId: string, userType: string) => {
      router.push(`/perfil?id=${userId}&type=${userType}`)
    },
    [router]
  )

  /**
   * Compartilha conteúdo no chat
   * Abre o chat overlay em modo "lista" e copia link para clipboard
   * Usado em: Eventos, Negócios, Iniciativas, Laboratórios
   */
  const shareInChat = useCallback(
    (content: ShareableContent) => {
      // Copy link to clipboard
      const fullUrl = `${window.location.origin}${content.url}`
      navigator.clipboard.writeText(fullUrl)

      // Show toast
      showToast({
        id: `share-${content.id}`,
        title: "Link copiado!",
        description: `Compartilhe "${content.title}" em uma conversa`,
        type: "success",
      })

      // Open chat list so user can select conversation
      openChat()
    },
    [openChat, showToast]
  )

  /**
   * Navega para a página de eventos
   * Usado em: Notificações, Dashboard
   */
  const viewEvent = useCallback(
    (eventId: string) => {
      router.push(`/eventos/${eventId}`)
    },
    [router]
  )

  /**
   * Navega para a página de negócios
   * Usado em: Notificações, Dashboard
   */
  const viewBusiness = useCallback(
    (businessId: string) => {
      router.push(`/negocios/${businessId}`)
    },
    [router]
  )

  /**
   * Navega para a página de iniciativas
   * Usado em: Notificações, Dashboard
   */
  const viewInitiative = useCallback(
    (initiativeId: string) => {
      router.push(`/iniciativas/${initiativeId}`)
    },
    [router]
  )

  /**
   * Navega para reuniões filtrando por data específica
   * Usado em: Notificações de reunião agendada
   */
  const viewMeeting = useCallback(
    (meetingId: string, date?: string) => {
      const url = date ? `/reunioes?date=${date}&meeting=${meetingId}` : `/reunioes?meeting=${meetingId}`
      router.push(url)
    },
    [router]
  )

  return {
    // Messaging
    messageUser,

    // Scheduling
    scheduleMeeting,

    // Navigation
    viewProfile,
    viewEvent,
    viewBusiness,
    viewInitiative,
    viewMeeting,

    // Sharing
    shareInChat,
  }
}
