"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type ChatOverlayState = "minimized" | "list" | "conversation"

interface ChatOverlayContextType {
  // State
  state: ChatOverlayState
  isOpen: boolean
  currentThreadId: string | null
  currentUserId: string | null

  // Actions
  openChat: (userId?: string, threadId?: string) => void
  closeChat: () => void
  minimizeChat: () => void
  showList: () => void
  openConversation: (threadId: string, userId?: string) => void
  goBackToList: () => void
}

const ChatOverlayContext = createContext<ChatOverlayContextType | undefined>(undefined)

export function ChatOverlayProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatOverlayState>("minimized")
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const isOpen = state !== "minimized"

  // Open chat - can optionally pass userId to start new conversation
  const openChat = useCallback((userId?: string, threadId?: string) => {
    if (threadId) {
      setCurrentThreadId(threadId)
      setCurrentUserId(userId || null)
      setState("conversation")
    } else if (userId) {
      // When only userId is provided (no thread), open the list
      // This prevents flickering as ChatConversation requires a valid threadId
      setCurrentUserId(userId)
      setCurrentThreadId(null)
      setState("list")
    } else {
      setState("list")
    }
  }, [])

  // Close chat completely (minimize)
  const closeChat = useCallback(() => {
    setState("minimized")
    // Don't clear threadId/userId - maintain state for when reopened
  }, [])

  // Minimize chat (same as close for now)
  const minimizeChat = useCallback(() => {
    setState("minimized")
  }, [])

  // Show list of conversations
  const showList = useCallback(() => {
    setState("list")
    setCurrentThreadId(null)
    setCurrentUserId(null)
  }, [])

  // Open specific conversation
  const openConversation = useCallback((threadId: string, userId?: string) => {
    setCurrentThreadId(threadId)
    setCurrentUserId(userId || null)
    setState("conversation")
  }, [])

  // Go back from conversation to list
  const goBackToList = useCallback(() => {
    setState("list")
    setCurrentThreadId(null)
    setCurrentUserId(null)
  }, [])

  const value: ChatOverlayContextType = {
    state,
    isOpen,
    currentThreadId,
    currentUserId,
    openChat,
    closeChat,
    minimizeChat,
    showList,
    openConversation,
    goBackToList,
  }

  return (
    <ChatOverlayContext.Provider value={value}>
      {children}
    </ChatOverlayContext.Provider>
  )
}

// Hook to use chat overlay context
export function useChatOverlay() {
  const context = useContext(ChatOverlayContext)
  if (context === undefined) {
    throw new Error("useChatOverlay must be used within a ChatOverlayProvider")
  }
  return context
}
