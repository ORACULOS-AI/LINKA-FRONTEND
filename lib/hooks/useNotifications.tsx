import { useNotificationsApi } from '@/lib/api/notifications'

export function useNotifications() {
  const { useGetNotifications } = useNotificationsApi()
  const { data: notifications = [] } = useGetNotifications()

  const unreadCount = notifications.filter(
    (notification) => !notification.lida,
  ).length
  const hasUnread = unreadCount > 0

  return {
    unreadCount,
    hasUnread,
    notifications,
  }
}
