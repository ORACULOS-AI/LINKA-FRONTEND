import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, MailOpen, Trash2, Clock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Notification, NotificationType } from '@/lib/types/notificationTypes'

interface NotificationCardProps {
  notification: Notification
  index: number
  isClickableNotification: (tipo: NotificationType) => boolean
  handleNotificationClick: (notification: Notification) => void
  handleMarkAsRead: (id: string) => void
  setDeleteModalData: (data: { isOpen: boolean; notificationId: string }) => void
  setAcceptModalData: (data: {
    isOpen: boolean
    notificationId: string
    initiativeId: string
    businessId?: string
    type: NotificationType
  }) => void
  setRejectModalData: (data: {
    isOpen: boolean
    notificationId: string
    initiativeId: string
    businessId?: string
    userId: string
    type: NotificationType
  }) => void
}

export const NotificationCard = ({
  notification,
  index,
  isClickableNotification,
  handleNotificationClick,
  handleMarkAsRead,
  setDeleteModalData,
  setAcceptModalData,
  setRejectModalData
}: NotificationCardProps) => {
  const isInvite = notification.tipo === NotificationType.CONVITE_INICIATIVA || notification.tipo === NotificationType.CONVITE_NEGOCIO

  return (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card
        className={`${
          notification.lida 
            ? 'bg-gray-50 border-gray-200' 
            : 'bg-white border-purple-200 shadow-lg'
        } transition-all duration-300 hover:shadow-xl relative overflow-hidden`}
      >
        {/* Decorative element for unread notifications */}
        {!notification.lida && (
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-600 to-violet-600" />
        )}

        {isInvite ? (
          // Layout para convites
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                    {notification.titulo}
                    </h3>
                    {!notification.lida && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Nova
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {format(
                      new Date(notification.created_at),
                      "d 'de' MMMM 'às' HH:mm",
                      {
                        locale: ptBR,
                      },
                    )}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {notification.mensagem}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  {!notification.lida ? (
                    <>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => {
                            if (notification.tipo === NotificationType.CONVITE_INICIATIVA) {
                              setAcceptModalData({
                                isOpen: true,
                                notificationId: notification.id,
                                initiativeId: notification.data?.initiative_id,
                                type: NotificationType.CONVITE_INICIATIVA,
                              });
                            } else if (notification.tipo === NotificationType.CONVITE_NEGOCIO) {
                              setAcceptModalData({
                                isOpen: true,
                                notificationId: notification.id,
                                initiativeId: '',
                                businessId: notification.data?.business_id,
                                type: NotificationType.CONVITE_NEGOCIO,
                              });
                            }
                          }}
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/25 hover:shadow-lg transition-all duration-300 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aceitar
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => {
                            if (notification.tipo === NotificationType.CONVITE_INICIATIVA) {
                              setRejectModalData({
                                isOpen: true,
                                notificationId: notification.id,
                                initiativeId: notification.data?.initiative_id,
                                userId: notification.user_id,
                                type: NotificationType.CONVITE_INICIATIVA,
                              });
                            } else if (notification.tipo === NotificationType.CONVITE_NEGOCIO) {
                              setRejectModalData({
                                isOpen: true,
                                notificationId: notification.id,
                                initiativeId: '',
                                businessId: notification.data?.business_id,
                                userId: notification.user_id,
                                type: NotificationType.CONVITE_NEGOCIO,
                              });
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Recusar
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">
                      {notification.tipo_resposta === 'ACEITO'
                        ? 'Convite aceito'
                        : 'Convite recusado'}
                      </span>
                    </div>
                  )}
                </div>
                
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() =>
                        setDeleteModalData({
                          isOpen: true,
                          notificationId: notification.id,
                        })
                      }
                      variant="ghost"
                      size="sm"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
              </div>
            </div>
          </div>
        ) : (
          // Layout para notificações regulares
          <div 
            className={`p-6 ${
              isClickableNotification(notification.tipo)
                ? 'cursor-pointer hover:bg-purple-100 active:bg-purple-200 transition-all duration-300' 
                : ''
            }`}
            onClick={() => {
              if (isClickableNotification(notification.tipo)) {
                handleNotificationClick(notification);
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {notification.titulo}
                  </h3>
                  {!notification.lida && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      Nova
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-3">
                    {format(
                      new Date(notification.created_at),
                      "d 'de' MMMM 'às' HH:mm",
                      {
                        locale: ptBR,
                      },
                    )}
                  </p>
                <p className="text-gray-700 leading-relaxed">
                    {notification.mensagem}
                  </p>
                </div>
              
              <div className="flex items-center gap-2 ml-4">
                {!notification.lida && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      variant="ghost"
                        size="sm"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300 h-8 w-8 p-0"
                      >
                      <MailOpen className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModalData({
                          isOpen: true,
                          notificationId: notification.id,
                        });
                      }}
                      variant="ghost"
                      size="sm"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
} 