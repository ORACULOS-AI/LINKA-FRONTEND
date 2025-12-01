'use client'

import { useState, useMemo } from 'react'
import { Bell, Info, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useNotificationsApi } from '@/lib/api/notifications'
import { useCrossPageActions } from '@/lib/hooks/useCrossPageActions'
import { CommunityHero } from '@/components/comunidade/shared/CommunityHero'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import PrivateRoute from '@/components/private_route'
import { LoadingState } from './components/LoadingState'
import { cn } from '@/lib/utils'

/**
 * Notificações Page - Simplified Full-Screen View
 *
 * Purpose: Complete notification history for power users
 * Features: Full list view, mark all as read, quick actions
 *
 * Note: For quick access, use the notification bell (top-right corner)
 */
export default function NotificacoesPage() {
  const [filterUnread, setFilterUnread] = useState(false)
  const { useGetNotifications, useMarkAllAsRead, useDeleteNotification } = useNotificationsApi()
  const { viewProfile, viewBusiness, viewInitiative } = useCrossPageActions()

  const { data: notificationsData = [], isLoading } = useGetNotifications()
  const markAllAsReadMutation = useMarkAllAsRead()
  const deleteNotificationMutation = useDeleteNotification()

  // Sort and filter
  const notifications = useMemo(() => {
    let filtered = [...notificationsData].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    if (filterUnread) {
      filtered = filtered.filter((n) => !n.lida)
    }
    return filtered
  }, [notificationsData, filterUnread])

  const unreadCount = notificationsData.filter((n) => !n.lida).length

  // Handle notification click
  const handleClick = async (notif: any) => {
    switch (notif.tipo) {
      case 'CONEXAO_ACEITA':
      case 'CONEXAO_RECUSADA':
        if (notif.metadata?.user_id) {
          viewProfile(notif.metadata.user_id, notif.metadata.user_type)
        }
        break
      case 'NEGOCIO_APROVADO':
      case 'NEGOCIO_RECUSADO':
        if (notif.metadata?.negocio_id) {
          viewBusiness(notif.metadata.negocio_id)
        }
        break
      case 'INICIATIVA_APROVADA':
      case 'INICIATIVA_RECUSADA':
        if (notif.metadata?.iniciativa_id) {
          viewInitiative(notif.metadata.iniciativa_id)
        }
        break
    }
  }

  if (isLoading) return <LoadingState />

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-white">
        <CommunityHero
          icon={Bell}
          badge="Histórico Completo"
          title="Todas as Notificações"
          stats={[
            { icon: Bell, value: notifications.length, label: 'Total' },
            { icon: Info, value: unreadCount, label: 'Não lidas' },
          ]}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Info Alert */}
          <Alert className="mb-6 border-purple-200 bg-purple-50">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-900">
              <strong>Dica:</strong> Use o sino no canto superior direito para ver notificações rapidamente.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-6">
            <Button
              variant={filterUnread ? 'default' : 'outline'}
              onClick={() => setFilterUnread(!filterUnread)}
              className={filterUnread ? 'bg-purple-600 text-white' : ''}
            >
              {filterUnread ? 'Mostrar Todas' : 'Apenas Não Lidas'}
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={() => markAllAsReadMutation.mutate()}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </Button>
            )}
          </motion.div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-12 bg-gray-50 rounded-xl">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">
                {filterUnread ? 'Nenhuma não lida' : 'Nenhuma notificação'}
              </h3>
              <p className="text-sm text-gray-600">Você está em dia!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.uid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleClick(notif)}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all',
                    notif.lida
                      ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      : 'bg-white border-purple-200 hover:bg-purple-50'
                  )}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className={cn('text-sm', notif.lida ? 'text-gray-700' : 'font-semibold text-gray-900')}>
                        {notif.titulo}
                      </p>
                      {notif.mensagem && (
                        <p className="text-xs text-gray-600 mt-1">{notif.mensagem}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 hover:bg-red-50 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotificationMutation.mutate(notif.uid)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PrivateRoute>
  )
}
