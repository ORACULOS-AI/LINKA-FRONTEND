"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCrossPageActions } from "@/lib/hooks/useCrossPageActions"

interface ThreadCardProps {
  thread: any
  otherUser: any
  onClick: () => void
}

export function ThreadCard({ thread, otherUser, onClick }: ThreadCardProps) {
  const { scheduleMeeting } = useCrossPageActions()

  const handleScheduleMeeting = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (otherUser?.uid) {
      scheduleMeeting(otherUser.uid, otherUser.nome)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="hover:shadow-md transition-all cursor-pointer border-l-4 border-purple-500"
        onClick={onClick}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              {otherUser?.foto_url || otherUser?.profile_image_url ? (
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <Image
                    src={otherUser.foto_url || otherUser.profile_image_url}
                    alt={`Foto de ${otherUser.nome}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <AvatarFallback className="bg-purple-100 text-purple-600 text-sm sm:text-base">
                  {(otherUser?.nome || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-gray-900 truncate text-sm sm:text-base">
                  {otherUser?.nome || "Usuário"}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {thread.unread_count > 0 && (
                    <Badge className="bg-purple-600 text-white text-xs">{thread.unread_count}</Badge>
                  )}
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(thread.last_message_at || thread.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 truncate mt-1 leading-relaxed">
                {thread.last_message || "Conversa iniciada"}
              </p>
              {/* Quick Actions - Only show if otherUser exists */}
              {otherUser?.uid && (
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleScheduleMeeting}
                    className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors text-xs sm:text-sm"
                  >
                    <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Agendar Reunião
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
