"use client"

import { useEffect, useRef } from "react"
import { useNotificationsApi } from "@/lib/api/notifications"
import { useNotifications } from "@/lib/context/NotificationContext"
import { useCrossPageActions } from "./useCrossPageActions"

/**
 * Hook to show real-time toast notifications
 * Monitors new notifications and displays toasts for important events
 */
export function useRealtimeToasts() {
  const { useGetNotifications } = useNotificationsApi()
  const { data: notifications } = useGetNotifications()
  const { showToast } = useNotifications()
  const { viewProfile, viewBusiness, viewInitiative, viewMeeting } = useCrossPageActions()

  // Track previously seen notification IDs to detect new ones
  const previousNotificationIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      return
    }

    // Get current notification IDs
    const currentIds = new Set(notifications.map((n) => n.uid))

    // Find new notifications that weren't in the previous set
    const newNotifications = notifications.filter(
      (n) => !previousNotificationIds.current.has(n.uid) && !n.lida
    )

    // Update the reference for next comparison
    previousNotificationIds.current = currentIds

    // Show toasts for new notifications
    newNotifications.forEach((notif) => {
      // Skip if notification is already read
      if (notif.lida) return

      // Determine toast type and action based on notification type
      let toastType: "success" | "error" | "info" | "warning" = "info"
      let action: { label: string; onClick: () => void } | undefined

      switch (notif.tipo) {
        case "SOLICITACAO_CONEXAO":
          toastType = "info"
          action = {
            label: "Ver Perfil",
            onClick: () => {
              if (notif.metadata?.user_id && notif.metadata?.user_type) {
                viewProfile(notif.metadata.user_id, notif.metadata.user_type)
              }
            },
          }
          break

        case "CONEXAO_ACEITA":
          toastType = "success"
          action = {
            label: "Ver Perfil",
            onClick: () => {
              if (notif.metadata?.user_id && notif.metadata?.user_type) {
                viewProfile(notif.metadata.user_id, notif.metadata.user_type)
              }
            },
          }
          break

        case "CONEXAO_RECUSADA":
          toastType = "warning"
          break

        case "CONVITE_NEGOCIO":
          toastType = "info"
          action = {
            label: "Ver Negócio",
            onClick: () => {
              if (notif.metadata?.negocio_id) {
                viewBusiness(notif.metadata.negocio_id)
              }
            },
          }
          break

        case "NEGOCIO_APROVADO":
          toastType = "success"
          action = {
            label: "Ver Negócio",
            onClick: () => {
              if (notif.metadata?.negocio_id) {
                viewBusiness(notif.metadata.negocio_id)
              }
            },
          }
          break

        case "NEGOCIO_RECUSADO":
          toastType = "warning"
          break

        case "CONVITE_INICIATIVA":
          toastType = "info"
          action = {
            label: "Ver Iniciativa",
            onClick: () => {
              if (notif.metadata?.iniciativa_id) {
                viewInitiative(notif.metadata.iniciativa_id)
              }
            },
          }
          break

        case "INICIATIVA_APROVADA":
          toastType = "success"
          action = {
            label: "Ver Iniciativa",
            onClick: () => {
              if (notif.metadata?.iniciativa_id) {
                viewInitiative(notif.metadata.iniciativa_id)
              }
            },
          }
          break

        case "INICIATIVA_RECUSADA":
          toastType = "warning"
          break

        case "REUNIAO_AGENDADA":
          toastType = "info"
          action = {
            label: "Ver Reunião",
            onClick: () => {
              if (notif.metadata?.reuniao_id) {
                viewMeeting(notif.metadata.reuniao_id, notif.metadata?.data)
              }
            },
          }
          break

        case "NOVA_MENSAGEM":
          toastType = "info"
          action = {
            label: "Ver Conversa",
            onClick: () => {
              // Chat overlay will be opened via cross-page actions
            },
          }
          break

        default:
          toastType = "info"
      }

      // Show the toast
      showToast({
        id: notif.uid,
        title: notif.titulo,
        description: notif.mensagem,
        type: toastType,
        action,
      })
    })
  }, [notifications, showToast, viewProfile, viewBusiness, viewInitiative, viewMeeting])
}
