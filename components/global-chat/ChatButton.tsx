"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ChatButtonProps {
  onClick: () => void
  unreadCount?: number
  isOpen?: boolean
}

export function ChatButton({ onClick, unreadCount = 0, isOpen = false }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={`
        fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg
        transition-all duration-300 hover:scale-110
        ${isOpen
          ? "bg-purple-700 hover:bg-purple-800"
          : "bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/50"
        }
        z-50
      `}
      aria-label="Abrir chat"
    >
      <div className="relative">
        <MessageCircle className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 min-w-5 px-1 flex items-center justify-center text-xs font-bold bg-red-500 border-2 border-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  )
}
