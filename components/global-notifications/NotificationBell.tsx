"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { NotificationDropdown } from "./NotificationDropdown"
import { useNotifications as useNotificationsContext } from "@/lib/context/NotificationContext"
import { useNotifications as useNotificationsApi } from "@/lib/context/NotificationsContext"

export function NotificationBell() {
  const { unreadCount } = useNotificationsContext()
  const { hasUnread } = useNotificationsApi()

  // Use the hasUnread from NotificationsContext (existing)
  const displayCount = unreadCount || (hasUnread ? 1 : 0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-purple-50 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {displayCount > 0 && (
            <>
              {/* Badge with count */}
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs font-bold bg-red-500 border-2 border-white"
              >
                {displayCount > 99 ? "99+" : displayCount}
              </Badge>
              {/* Pulse animation */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-96 p-0 max-h-[600px] overflow-hidden"
      >
        <NotificationDropdown />
      </PopoverContent>
    </Popover>
  )
}
