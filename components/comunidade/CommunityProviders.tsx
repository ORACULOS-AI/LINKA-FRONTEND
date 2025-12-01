"use client"

import { ChatOverlayProvider } from "@/lib/context/ChatOverlayContext"
import { NotificationProvider } from "@/lib/context/NotificationContext"
import { ChatOverlay } from "@/components/global-chat/ChatOverlay"
import { RealtimeToastListener } from "./RealtimeToastListener"

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
 * - ChatOverlay: Componente flutuante de chat (sempre renderizado)
 * - RealtimeToastListener: Monitora notificações e exibe toasts em tempo real
 */
export function CommunityProviders({ children }: CommunityProvidersProps) {
  return (
    <ChatOverlayProvider>
      <NotificationProvider>
        {children}
        {/* Chat Overlay - Rendered globally, controlled by context */}
        <ChatOverlay />
        {/* Real-time Toast Listener - Monitors notifications and shows toasts */}
        <RealtimeToastListener />
      </NotificationProvider>
    </ChatOverlayProvider>
  )
}
