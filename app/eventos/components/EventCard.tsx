"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Calendar, MapPin, Users, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/lib/types/event"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useChatOverlay } from "@/lib/context/ChatOverlayContext"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const { openChat } = useChatOverlay()
  const router = useRouter()

  // Status badge configuration
  const statusConfig = {
    ATIVO: {
      label: "Ativo",
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    PAUSADO: {
      label: "Pausado",
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    CONCLUIDO: {
      label: "Concluído",
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    CANCELADO: {
      label: "Cancelado",
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  }

  const status = statusConfig[event.status]

  // Format date
  const eventDate = format(new Date(event.data_evento || event.data), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  const eventTime = format(new Date(event.data_evento || event.data), "HH:mm", {
    locale: ptBR,
  })

  // Handle RSVP
  const handleRSVP = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement RSVP API call when backend is ready
    toast({
      title: "Confirmação enviada!",
      description: "Você confirmou presença neste evento.",
    })
  }

  // Handle share in chat
  const handleShareInChat = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Copy event link to clipboard
    const eventUrl = `${window.location.origin}/eventos/${event.uid}`
    navigator.clipboard.writeText(eventUrl)

    // Open chat overlay
    openChat()

    toast({
      title: "Link copiado!",
      description: "O link do evento foi copiado. Abra uma conversa para compartilhar.",
    })
  }

  // Handle card click - navigate to event details
  const handleCardClick = () => {
    router.push(`/eventos/${event.uid}`)
  }

  // Default placeholder image if no foto_url
  const imageUrl = (event as any).foto_url || "/placeholder-event.jpg"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="cursor-pointer"
    >
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
        {/* Image Cover */}
        <div className="relative h-48 w-full bg-gradient-to-br from-purple-100 via-violet-100 to-purple-50">
          <Image
            src={imageUrl}
            alt={event.nome}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to gradient background if image fails
              e.currentTarget.style.display = "none"
            }}
          />

          {/* Status Badge Overlay */}
          <div className="absolute top-3 right-3">
            <Badge className={cn(
              "font-semibold shadow-md",
              status.textColor,
              status.bgColor,
              status.borderColor,
              "border"
            )}>
              <div className={cn("w-2 h-2 rounded-full mr-2", status.color)} />
              {status.label}
            </Badge>
          </div>

          {/* Gradient Overlay at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
            {event.nome}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {event.descricao}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span className="font-medium">{eventDate}</span>
              <span className="text-gray-400">•</span>
              <span>{eventTime}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span className="truncate">{event.localizacao || event.local}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleRSVP}
              disabled={event.status !== "ATIVO"}
              className={cn(
                "flex-1 transition-all duration-200",
                event.status === "ATIVO"
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmar Presença
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleShareInChat}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
