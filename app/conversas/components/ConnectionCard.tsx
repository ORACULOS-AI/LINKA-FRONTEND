"use client"

import Image from "next/image"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ConnectionCardProps {
  user: any
  onStartConversation: (user: any) => void
}

export function ConnectionCard({ user, onStartConversation }: ConnectionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {user.foto_url || user.profile_image_url ? (
              <div className="relative h-full w-full rounded-full overflow-hidden">
                <Image
                  src={user.foto_url || user.profile_image_url}
                  alt={`Foto de ${user.nome}`}
                  fill
                  sizes="40px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <AvatarFallback className="bg-purple-100 text-purple-600 text-sm sm:text-base">
                {user.nome.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{user.nome}</p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          <Button
            size="sm"
            onClick={() => onStartConversation(user)}
            className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Conversar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
