"use client"

import { usePathname } from "next/navigation"
import { NotificationProvider } from "@/lib/context/NotificationContext"
import { ChatOverlayProvider } from "@/lib/context/ChatOverlayContext"
import { RealtimeToastListener } from "./RealtimeToastListener"
import { ChatOverlay } from "../global-chat/ChatOverlay"
import { useAuth } from "@/lib/context/AuthContext"

interface CommunityProvidersProps {
  children: React.ReactNode
}

export function CommunityProviders({ children }: CommunityProvidersProps) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const showChat = isAuthenticated && (pathname === '/' || pathname?.startsWith("/dashboard"))

  return (
    <ChatOverlayProvider>
      <NotificationProvider>
        {children}
        {showChat && <ChatOverlay />}
        <RealtimeToastListener />
      </NotificationProvider>
    </ChatOverlayProvider>
  )
}
