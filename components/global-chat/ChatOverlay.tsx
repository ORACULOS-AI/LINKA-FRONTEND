"use client"

import { useChatOverlay } from "@/lib/context/ChatOverlayContext"
import { ChatButton } from "./ChatButton"
import { ChatList } from "./ChatList"
import { ChatConversation } from "./ChatConversation"
import { useMessagesApi } from "@/lib/api/messages"
import { motion, AnimatePresence } from "framer-motion"

export function ChatOverlay() {
  const {
    state,
    isOpen,
    currentThreadId,
    currentUserId,
    openChat,
    closeChat,
    showList,
    openConversation,
    goBackToList,
  } = useChatOverlay()

  const { useThreads } = useMessagesApi()
  const { data: threadsData } = useThreads()

  // Calculate unread count (simplified - would need backend support for real count)
  const unreadCount = 0 // TODO: Implement unread count from backend

  // Handle button click
  const handleButtonClick = () => {
    if (isOpen) {
      closeChat()
    } else {
      openChat()
    }
  }

  // Handle thread selection
  const handleSelectThread = (threadId: string, userId: string) => {
    openConversation(threadId, userId)
  }

  return (
    <>
      {/* Floating Button - Always visible */}
      <ChatButton
        onClick={handleButtonClick}
        unreadCount={unreadCount}
        isOpen={isOpen}
      />

      {/* Chat Window - Conditionally rendered based on state */}
      <AnimatePresence>
        {state === "list" && (
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] z-50"
          >
            <ChatList
              onClose={closeChat}
              onSelectThread={handleSelectThread}
              focusUserId={currentUserId}
            />
          </motion.div>
        )}

        {state === "conversation" && currentThreadId && currentUserId && (
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 w-[450px] h-[600px] z-50"
          >
            <ChatConversation
              threadId={currentThreadId}
              userId={currentUserId}
              onBack={goBackToList}
              onClose={closeChat}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
