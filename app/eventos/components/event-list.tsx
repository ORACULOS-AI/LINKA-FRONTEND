'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Event } from '../../../lib/types/event'

interface EventListProps {
  searchTerm: string
  status: string
  sortOrder: 'asc' | 'desc'
  events: Event[]
  isLoading: boolean
}

export default function EventList({
  searchTerm,
  status,
  sortOrder,
  events,
  isLoading,
}: EventListProps) {
  const filteredEvents = useMemo(() => {
    let filtered = [...events]

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Aplicar filtro de status
    if (status !== 'todos') {
      filtered = filtered.filter((event) => event.status === status)
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      const dateA = new Date(a.data).getTime()
      const dateB = new Date(b.data).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

    return filtered
  }, [events, searchTerm, status, sortOrder])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum evento encontrado
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredEvents.map((event) => (
        <Card key={event.uid}>
          <CardContent className="p-4">
            <h3 className="font-semibold">{event.nome}</h3>
            <p className="text-sm text-muted-foreground">{event.descricao}</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span>{new Date(event.data).toLocaleDateString()}</span>
              <span>•</span>
              <span>{event.local}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 