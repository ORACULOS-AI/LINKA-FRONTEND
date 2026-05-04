'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEventApi } from '@/lib/api/event'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, MapPin, Users, Video, Tag, ArrowLeft, Share2, Clock } from 'lucide-react'
import Image from 'next/image'
import { EventStatusColors, EventStatusLabels, EventCategoriaLabels, formatEventDateRange, getVacanciesText, canParticipate } from '@/lib/types/eventTypes'

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const { useGetEventById, useParticipar, useCancelarParticipacao } = useEventApi()
  const { data: event, isLoading } = useGetEventById(eventId)
  const participarMutation = useParticipar()
  const cancelarMutation = useCancelarParticipacao()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Evento não encontrado</h2>
          <Button onClick={() => router.push('/eventos')}>
            Voltar para eventos
          </Button>
        </div>
      </div>
    )
  }

  const canJoin = canParticipate(event)
  const isOnline = event.is_online

  const handleParticipate = () => {
    participarMutation.mutate(eventId)
  }

  const handleCancelParticipation = () => {
    cancelarMutation.mutate(eventId)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.titulo,
        text: event.descricao,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      {/* Hero Image */}
      <Card className="overflow-hidden mb-6">
        <div className="relative h-96 bg-gradient-to-br from-primary/20 to-primary/5">
          {event.imagem_capa ? (
            <Image
              src={event.imagem_capa}
              alt={event.titulo}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Calendar className="w-32 h-32 text-primary/30" />
            </div>
          )}
          
          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={EventStatusColors[event.status]}>
              {EventStatusLabels[event.status]}
            </Badge>
            <Badge variant="secondary">
              {EventCategoriaLabels[event.categoria]}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Description */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{event.titulo}</h1>
            <p className="text-lg text-muted-foreground">{event.descricao}</p>
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Detalhes do Evento</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-1 text-primary" />
                <div>
                  <p className="font-medium">Data e Hora</p>
                  <p className="text-muted-foreground">
                    {formatEventDateRange(event.data_inicio, event.data_fim)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {isOnline ? <Video className="w-5 h-5 mt-1 text-primary" /> : <MapPin className="w-5 h-5 mt-1 text-primary" />}
                <div>
                  <p className="font-medium">Local</p>
                  <p className="text-muted-foreground">
                    {isOnline ? 'Evento Online' : event.local}
                  </p>
                  {isOnline && event.link_online && (
                    <a href={event.link_online} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Acessar link do evento
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 mt-1 text-primary" />
                <div>
                  <p className="font-medium">Participantes</p>
                  <p className="text-muted-foreground">
                    {event.total_participantes} inscritos
                    {event.capacidade_maxima && ` de ${event.capacidade_maxima}`}
                  </p>
                  {event.capacidade_maxima && (
                    <p className="text-sm text-muted-foreground">{getVacanciesText(event)}</p>
                  )}
                </div>
              </div>

              {event.carga_horaria && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-1 text-primary" />
                  <div>
                    <p className="font-medium">Carga Horária</p>
                    <p className="text-muted-foreground">{event.carga_horaria} horas</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          {event.requisitos && (
            <>
              <Separator />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Requisitos</h2>
                <p className="text-muted-foreground whitespace-pre-line">{event.requisitos}</p>
              </div>
            </>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action Card */}
          <Card className="p-6 sticky top-4">
            <div className="space-y-4">
              {canJoin ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleParticipate}
                  disabled={participarMutation.isPending}
                >
                  {participarMutation.isPending ? 'Inscrevendo...' : 'Inscrever-se'}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={handleCancelParticipation}
                  disabled={cancelarMutation.isPending}
                >
                  {cancelarMutation.isPending ? 'Cancelando...' : 'Cancelar Inscrição'}
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>

              <Separator />

              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inscritos</span>
                  <span className="font-medium">{event.total_participantes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Presentes</span>
                  <span className="font-medium">{event.total_presentes}</span>
                </div>
                {event.total_certificados > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Certificados</span>
                    <span className="font-medium">{event.total_certificados}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
