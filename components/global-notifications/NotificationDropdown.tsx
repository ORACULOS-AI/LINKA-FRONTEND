"use client"

import { useMemo, useState } from "react"
import { CheckCheck, Loader2, Trash2, Check, X, Eye, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationsApi } from "@/lib/api/notifications"
import { useCrossPageActions } from "@/lib/hooks/useCrossPageActions"
import { useConnectionRequests } from "@/lib/api/connections"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { isToday, isYesterday, isThisWeek } from "date-fns"

const INITIAL_DISPLAY_COUNT = 10

export function NotificationDropdown() {
  const {
    useGetNotifications,
    useMarkAsRead,
    useMarkAllAsRead,
    useDeleteNotification,
  } = useNotificationsApi()

  const { data: notifications, isLoading } = useGetNotifications()
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const deleteNotificationMutation = useDeleteNotification()

  const { useUpdateRequest } = useConnectionRequests()
  const updateConnectionMutation = useUpdateRequest()

  const {
    viewProfile,
    viewBusiness,
    viewInitiative,
    viewMeeting,
  } = useCrossPageActions()

  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT)

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    if (!notifications) return { hoje: [], ontem: [], semana: [], antigas: [] }

    const groups = {
      hoje: [] as typeof notifications,
      ontem: [] as typeof notifications,
      semana: [] as typeof notifications,
      antigas: [] as typeof notifications,
    }

    notifications.forEach((notif) => {
      const date = new Date(notif.created_at)
      if (isToday(date)) {
        groups.hoje.push(notif)
      } else if (isYesterday(date)) {
        groups.ontem.push(notif)
      } else if (isThisWeek(date)) {
        groups.semana.push(notif)
      } else {
        groups.antigas.push(notif)
      }
    })

    return groups
  }, [notifications])

  const unreadCount = notifications?.filter((n) => !n.lida).length || 0

  // Get visible notifications (with load more)
  const visibleNotifications = useMemo(() => {
    const allNotifs = [
      ...groupedNotifications.hoje,
      ...groupedNotifications.ontem,
      ...groupedNotifications.semana,
      ...groupedNotifications.antigas,
    ]
    return allNotifs.slice(0, displayCount)
  }, [groupedNotifications, displayCount])

  const hasMore = (notifications?.length || 0) > displayCount

  // Handle notification click
  const handleNotificationClick = async (notif: any) => {
    // Mark as read
    if (!notif.lida) {
      await markAsReadMutation.mutateAsync(notif.uid)
    }

    // Navigate based on type
    switch (notif.tipo) {
      case "CONEXAO_ACEITA":
      case "CONEXAO_RECUSADA":
        if (notif.metadata?.user_id && notif.metadata?.user_type) {
          viewProfile(notif.metadata.user_id, notif.metadata.user_type)
        }
        break
      case "CONVITE_NEGOCIO":
      case "NEGOCIO_APROVADO":
      case "NEGOCIO_RECUSADO":
        if (notif.metadata?.negocio_id) {
          viewBusiness(notif.metadata.negocio_id)
        }
        break
      case "CONVITE_INICIATIVA":
      case "INICIATIVA_APROVADA":
      case "INICIATIVA_RECUSADA":
        if (notif.metadata?.iniciativa_id) {
          viewInitiative(notif.metadata.iniciativa_id)
        }
        break
      case "REUNIAO_AGENDADA":
        if (notif.metadata?.reuniao_id) {
          viewMeeting(notif.metadata.reuniao_id, notif.metadata?.data)
        }
        break
    }
  }

  // Handle delete
  const handleDelete = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation()
    if (!notifId || notifId === 'undefined') return
    await deleteNotificationMutation.mutateAsync(notifId)
  }

  // Handle accept connection
  const handleAcceptConnection = async (e: React.MouseEvent, notif: any) => {
    e.stopPropagation()
    if (notif.metadata?.user_id) {
      await updateConnectionMutation.mutateAsync({
        userId: notif.metadata.user_id,
        status: 'accepted' as any
      })
      await deleteNotificationMutation.mutateAsync(notif.uid)
    }
  }

  // Handle reject connection
  const handleRejectConnection = async (e: React.MouseEvent, notif: any) => {
    e.stopPropagation()
    if (notif.metadata?.user_id) {
      await updateConnectionMutation.mutateAsync({
        userId: notif.metadata.user_id,
        status: 'rejected' as any
      })
      await deleteNotificationMutation.mutateAsync(notif.uid)
    }
  }

  // Render notification item with quick actions
  const renderNotification = (notif: any) => (
    <div
      onClick={() => handleNotificationClick(notif)}
      className={`
        p-4 hover:bg-purple-50 cursor-pointer transition-colors border-l-4
        ${notif.lida ? "border-transparent bg-gray-50/50" : "border-purple-600 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notif.lida ? "text-gray-700" : "font-semibold text-gray-900"}`}>
            {notif.titulo}
          </p>
          {notif.mensagem && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {notif.mensagem}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(new Date(notif.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>

          {/* Quick Actions */}
          {notif.tipo === "SOLICITACAO_CONEXAO" && !notif.lida && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={(e) => handleAcceptConnection(e, notif)}
                className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs"
                disabled={updateConnectionMutation.isPending}
              >
                <Check className="h-3 w-3 mr-1" />
                Aceitar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => handleRejectConnection(e, notif)}
                className="h-7 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                disabled={updateConnectionMutation.isPending}
              >
                <X className="h-3 w-3 mr-1" />
                Recusar
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 hover:bg-red-50 hover:text-red-600"
          onClick={(e) => handleDelete(e, notif.uid)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        {unreadCount > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
          </p>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
            <p className="text-sm text-gray-500">Carregando notificações...</p>
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Bell className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-700">
              Nenhuma notificação
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Você está em dia!
            </p>
          </div>
        ) : (
          <div>
            {visibleNotifications.map((notif) => (
              <div key={notif.uid}>
                {renderNotification(notif)}
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setDisplayCount(prev => prev + 10)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Carregar mais ({notifications.length - displayCount} restantes)
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
