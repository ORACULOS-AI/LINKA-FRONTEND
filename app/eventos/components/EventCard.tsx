import { Event, EventListItem, EventStatusColors, EventCategoriaLabels, EventStatusLabels, formatEventDateRange, getVacanciesText, canParticipate } from '@/lib/types/eventTypes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, MapPin, Users, Video, Tag } from 'lucide-react'
import Image from 'next/image'

interface EventCardProps {
  event: Event | EventListItem
  onParticipate?: () => void
  onViewDetails?: () => void
  showActions?: boolean
}

export function EventCard({ event, onParticipate, onViewDetails, showActions = true }: EventCardProps) {
  const isOnline = event.is_online
  const canJoin = canParticipate(event)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagem de Capa */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
        {event.imagem_capa ? (
          <Image
            src={event.imagem_capa}
            alt={event.titulo}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Calendar className="w-16 h-16 text-primary/30" />
          </div>
        )}

        {/* Status Badge */}
        <Badge className={`absolute top-2 right-2 ${EventStatusColors[event.status]}`}>
          {EventStatusLabels[event.status]}
        </Badge>

        {/* Categoria Badge */}
        <Badge variant="secondary" className="absolute top-2 left-2">
          {EventCategoriaLabels[event.categoria]}
        </Badge>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <h3 className="font-semibold text-lg line-clamp-2">{event.titulo}</h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground line-clamp-2">{event.descricao}</p>

        {/* Metadados */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {/* Data */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatEventDateRange(event.data_inicio, event.data_fim)}</span>
          </div>

          {/* Local */}
          <div className="flex items-center gap-2">
            {isOnline ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            <span>{isOnline ? 'Evento Online' : event.local}</span>
          </div>

          {/* Participantes */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>
              {event.total_participantes} participantes
              {event.capacidade_maxima && ` / ${event.capacidade_maxima}`}
            </span>
          </div>

          {/* Vagas */}
          {event.capacidade_maxima && (
            <div className="flex items-center gap-2">
              <span className="font-medium">{getVacanciesText(event)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Ações */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onViewDetails}
            >
              Ver Detalhes
            </Button>
            {canJoin && (
              <Button
                className="flex-1"
                onClick={onParticipate}
              >
                Inscrever-se
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
