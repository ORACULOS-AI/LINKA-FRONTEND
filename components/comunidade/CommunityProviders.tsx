"use client"

import { usePathname } from "next/navigation"
import { NotificationProvider } from "@/lib/context/NotificationContext"
import { ChatOverlayProvider } from "@/lib/context/ChatOverlayContext"
import { RealtimeToastListener } from "./RealtimeToastListener"
import { ChatOverlay } from "../global-chat/ChatOverlay"

interface CommunityProvidersProps {
  children: React.ReactNode
}

/**
 * Wrapper de providers para features globais da seção Comunidade
 * Adicione este componente ao layout principal da aplicação
 *
 * Fornece:
 * - ChatOverlayProvider: Estado global do chat overlay
 * - NotificationProvider: Estado global de notificações
 * - RealtimeToastListener: Monitora notificações e exibe toasts em tempo real
 */
export function CommunityProviders({ children }: CommunityProvidersProps) {
  const pathname = usePathname()
  // Mostra o chat apenas na rota /dashboard e suas sub-rotas
  const showChat = pathname?.startsWith("/dashboard")

  return (
    <ChatOverlayProvider>
      <NotificationProvider>
        {children}
        {showChat && <ChatOverlay />}
        {/* Real-time Toast Listener - Monitors notifications and shows toasts */}
        <RealtimeToastListener />
      </NotificationProvider>
    </ChatOverlayProvider>
  )
}
