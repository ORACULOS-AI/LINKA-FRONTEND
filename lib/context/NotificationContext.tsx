"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { toast as sonnerToast } from "sonner"

export interface ToastNotification {
  id: string
  title: string
  description?: string
  type?: "success" | "error" | "info" | "warning"
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  // State
  unreadCount: number
  isTabActive: boolean

  // Actions
  setUnreadCount: (count: number) => void
  showToast: (notification: ToastNotification) => void
  dismissToast: (id: string) => void
  setTabActive: (active: boolean) => void

  // Polling control
  getPollingInterval: () => number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTabActive, setIsTabActive] = useState(true)

  // Track tab visibility for smart polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Show toast notification using sonner
  const showToast = useCallback((notification: ToastNotification) => {
    const { title, description, type = "info", action } = notification

    switch (type) {
      case "success":
        sonnerToast.success(title, {
          description,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        })
        break
      case "error":
        sonnerToast.error(title, {
          description,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        })
        break
      case "warning":
        sonnerToast.warning(title, {
          description,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        })
        break
      default:
        sonnerToast.info(title, {
          description,
          action: action ? {
            label: action.label,
            onClick: action.onClick,
          } : undefined,
        })
    }
  }, [])

  // Dismiss specific toast
  const dismissToast = useCallback((id: string) => {
    sonnerToast.dismiss(id)
  }, [])

  // Get polling interval based on tab activity
  const getPollingInterval = useCallback(() => {
    // 5 seconds when active, 30 seconds when idle
    return isTabActive ? 5000 : 30000
  }, [isTabActive])

  const value: NotificationContextType = {
    unreadCount,
    isTabActive,
    setUnreadCount,
    showToast,
    dismissToast,
    setTabActive: setIsTabActive,
    getPollingInterval,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
