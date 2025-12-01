'use client'

import { useState, useMemo, useEffect } from 'react'
import { Calendar, Users, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import type { EventStatus, Event } from '@/lib/types/event'
import { useEventsApi } from '@/lib/api/events'
import { CommunityHero } from '@/components/comunidade/shared/CommunityHero'
import { EventCard } from './components/EventCard'
import { EventFilters } from './components/EventFilters'
import PrivateRoute from '@/components/private_route'
import { motion } from 'framer-motion'

function EventosPageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>('ATIVO')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const { useListEvents } = useEventsApi()
  const { data: events, isLoading, refetch } = useListEvents(selectedStatus)

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    if (!events) return []

    let filtered = [...events]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.data_evento || a.data).getTime()
      const dateB = new Date(b.data_evento || b.data).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

    return filtered
  }, [events, searchTerm, sortOrder])

  // Calculate stats for all events (not just filtered)
  const stats = useMemo(() => {
    const total = events?.length || 0
    const ativos = events?.filter(e => e.status === 'ATIVO').length || 0

    return {
      total,
      ativos,
      participantes: total * 12, // Mock: average 12 participants per event
    }
  }, [events])

  const handleCreateEvent = () => {
    router.push('/eventos/novo')
  }

  const handleRefresh = () => {
    refetch()
    toast({
      title: 'Atualizado!',
      description: 'Lista de eventos atualizada com sucesso.',
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <CommunityHero
        icon={Calendar}
        badge="Participe e Organize"
        title="Eventos"
        description="Descubra e participe de eventos acadêmicos, workshops e encontros da comunidade UFC"
        stats={[
          { icon: Calendar, value: stats.total, label: 'Eventos' },
          { icon: Sparkles, value: stats.ativos, label: 'Ativos' },
          { icon: Users, value: stats.participantes, label: 'Participantes' },
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Todos os Eventos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie e participe de eventos da comunidade
            </p>
          </div>
          <Button
            onClick={handleCreateEvent}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Evento
          </Button>
        </div>

        {/* Unified Filters */}
        <div className="mb-8">
          <EventFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            onRefresh={handleRefresh}
            totalCount={stats.total}
            activeCount={stats.ativos}
          />
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-xl h-96 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Tente ajustar sua busca ou filtros"
                : "Seja o primeiro a criar um evento!"}
            </p>
            {!searchTerm && (
              <Button
                onClick={handleCreateEvent}
                className="bg-gradient-to-r from-purple-600 to-violet-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Evento
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.uid} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventosPage() {
  return (
    <PrivateRoute>
      <EventosPageContent />
    </PrivateRoute>
  )
}
