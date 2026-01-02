'use client'

import { useState, useMemo } from 'react'
import { useEventApi } from '@/lib/api/event'
import { EventFilters } from './components/EventFilters'
import { EventCard } from './components/EventCard'
import { EventFiltersState, initialEventFilters, EventSearchFilters, EventStatus } from '@/lib/types/eventTypes'
import { useRouter } from 'next/navigation'

export default function EventosPage() {
  const router = useRouter()
  const { useSearchEvents, useParticipar } = useEventApi()
  const [filters, setFilters] = useState<EventFiltersState>(initialEventFilters)

  // Construir parâmetros de busca
  const searchParams = useMemo<EventSearchFilters>(() => ({
    q: filters.searchQuery || undefined,
    status: filters.selectedStatus !== 'all' ? filters.selectedStatus as EventStatus : undefined,
    categoria: filters.selectedCategoria !== 'all' ? filters.selectedCategoria : undefined,
    is_online: filters.isOnlineOnly || undefined,
    apenas_com_vagas: filters.onlyWithVacancies || undefined,
    tags: filters.selectedTags.length > 0 ? filters.selectedTags : undefined,
    limit: 50,
    offset: 0,
  }), [filters])

  const { data: eventos = [], isLoading } = useSearchEvents(searchParams)
  const participarMutation = useParticipar()

  const handleParticipate = (eventId: string) => {
    participarMutation.mutate(eventId)
  }

  const handleViewDetails = (eventId: string) => {
    router.push(`/eventos/${eventId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Eventos</h1>
        <p className="text-muted-foreground">
          Descubra e participe de eventos acadêmicos e profissionais
        </p>
      </div>

      {/* Filtros */}
      <EventFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Grid de Eventos */}
      <div className="mt-8">
        {isLoading ? (
          <div>Carregando...</div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum evento encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <EventCard
                key={evento.uid}
                event={evento}
                onParticipate={() => handleParticipate(evento.uid)}
                onViewDetails={() => handleViewDetails(evento.uid)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
