"use client"

import { useMemo } from "react"
import { CheckCheck, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useNotificationsApi } from "@/lib/api/notifications"
import { useCrossPageActions } from "@/lib/hooks/useCrossPageActions"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { isToday, isYesterday, isThisWeek } from "date-fns"

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

  const {
    viewProfile,
    viewBusiness,
    viewInitiative,
    viewMeeting,
  } = useCrossPageActions()

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
    if (!notifId || notifId === 'undefined') {
      console.error('Invalid notification ID:', notifId)
      return
    }
    await deleteNotificationMutation.mutateAsync(notifId)
  }

  // Render notification item
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

  // Render group
  const renderGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null

    return (
      <div>
        <div className="px-4 py-2 bg-gray-100">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {title}
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {items.map((notif) => (
            <div key={notif.uid}>
              {renderNotification(notif)}
            </div>
          ))}
        </div>
      </div>
    )
  }

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
            {renderGroup("Hoje", groupedNotifications.hoje)}
            {renderGroup("Ontem", groupedNotifications.ontem)}
            {renderGroup("Esta Semana", groupedNotifications.semana)}
            {renderGroup("Anteriores", groupedNotifications.antigas)}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
