'use client'

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
} from 'react'
import { useNotificationsApi } from '@/lib/api/notifications'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { useAuth } from './AuthContext'

interface NotificationsContextType {
  hasUnread: boolean
  unreadCount: number
  notifications: unknown[]
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<unknown[], Error>>
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined)

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const { useGetNotifications } = useNotificationsApi()
  const { data: notifications = [], refetch } = useGetNotifications()

  // Derived state — calculado no render, sem useState/useEffect
  const memoizedNotifications = isAuthenticated ? notifications : []

  const unreadCount = useMemo(() => {
    if (!isAuthenticated) return 0
    return memoizedNotifications.filter(
      (notification: Record<string, unknown>) => !notification.lida,
    ).length
  }, [memoizedNotifications, isAuthenticated])

  const hasUnread = unreadCount > 0

  const throttledRefetch = useCallback(
    async (options?: RefetchOptions) => {
      if (!isAuthenticated) return
      await refetch(options)
    },
    [refetch, isAuthenticated],
  )

  // Polling agora é feito via refetchInterval no useGetNotifications (30s)
  // Sem setInterval manual — TanStack Query cuida do lifecycle

  const value = useMemo(() => ({
    hasUnread,
    unreadCount,
    notifications: memoizedNotifications,
    refetch: throttledRefetch,
  }), [hasUnread, unreadCount, memoizedNotifications, throttledRefetch])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider',
    )
  }
  return context
}
