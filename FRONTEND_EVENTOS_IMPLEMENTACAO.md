# Guia Completo de Implementação - Frontend de Eventos

## 📋 Status da Implementação

✅ **CONCLUÍDO**:
- Tipos TypeScript completos (`lib/types/eventTypes.ts`)
- Enums, interfaces e helpers

🔄 **EM ANDAMENTO** (este documento):
- Mapeamento completo da API
- Componentes refatorados
- Páginas atualizadas

---

## 🗺️ MAPA DE ENDPOINTS - Backend → Frontend

### 1. GERENCIAMENTO DE EVENTOS

| Endpoint Backend | Hook Frontend | Descrição |
|-----------------|---------------|-----------|
| `POST /events/` | `useCreateEvent()` | Criar evento |
| `GET /events/` | `useListEvents(filters)` | Listar com filtros |
| `GET /events/search` | `useSearchEvents(params)` | **NOVO** - Busca avançada |
| `GET /events/me` | `useGetUserEvents()` | Eventos do usuário |
| `GET /events/participating` | `useGetParticipatingEvents()` | **NOVO** - Eventos participando |
| `GET /events/business/{id}` | `useGetBusinessEvents(id)` | **NOVO** - Eventos do negócio |
| `GET /events/initiative/{id}` | `useGetInitiativeEvents(id)` | Eventos da iniciativa |
| `GET /events/{id}` | `useGetEventById(id)` | Detalhes do evento |
| `PUT /events/{id}` | `useUpdateEvent()` | Atualizar evento |
| `DELETE /events/{id}` | `useDeleteEvent()` | Deletar evento |

### 2. CONTROLE DE STATUS

| Endpoint Backend | Hook Frontend | Descrição |
|-----------------|---------------|-----------|
| `POST /events/{id}/publish` | `usePublishEvent()` | **NOVO** - Publicar rascunho |
| `POST /events/{id}/cancel` | `useCancelEvent()` | **NOVO** - Cancelar evento |
| `POST /events/{id}/conclude` | `useConcludeEvent()` | **NOVO** - Concluir evento |

### 3. PARTICIPAÇÃO

| Endpoint Backend | Hook Frontend | Descrição |
|-----------------|---------------|-----------|
| `POST /events/{id}/participar` | `useParticipar()` | Inscrever-se |
| `DELETE /events/{id}/participar` | `useCancelarParticipacao()` | **NOVO** - Cancelar inscrição |
| `GET /events/{id}/participantes` | `useGetParticipantes(id)` | **NOVO** - Listar participantes |
| `POST /events/{id}/check-in` | `useCheckIn()` | **NOVO** - Fazer check-in |

### 4. GESTÃO DE PRESENÇA (Organizador)

| Endpoint Backend | Hook Frontend | Descrição |
|-----------------|---------------|-----------|
| `POST /events/{id}/validar-presenca` | `useValidarPresenca()` | Validar individual |
| `POST /events/{id}/validar-presencas-lote` | `useValidarPresencasLote()` | **NOVO** - Validar em lote |

### 5. ESTATÍSTICAS E CERTIFICADOS

| Endpoint Backend | Hook Frontend | Descrição |
|-----------------|---------------|-----------|
| `GET /events/{id}/stats` | `useGetEventStats(id)` | **NOVO** - Estatísticas |
| `GET /events/{id}/certificado` | `useGetCertificado()` | Obter certificado |
| `POST /events/{id}/gerar-certificados-lote` | `useGerarCertificadosLote()` | **NOVO** - Gerar em lote |

---

## 📄 ARQUIVO COMPLETO: `lib/api/event.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../hooks/useApi'
import {
  Event,
  EventListItem,
  EventCreate,
  EventUpdate,
  EventSearchFilters,
  EventStats,
  Participante,
  ParticipanteStatus,
  BulkPresenceValidation,
  BulkOperationResult,
  CertificateData,
  ApiResponse,
  EventStatus,
  EventCategoria,
} from '../types/eventTypes'
import { toast } from '@/hooks/use-toast'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export function useEventApi() {
  const { fetchWithToken } = useApi()
  const queryClient = useQueryClient()

  // ===== FUNÇÕES DE API =====

  // 1. CRUD BÁSICO
  const createEvent = async (eventData: EventCreate): Promise<Event> => {
    const response = await fetchWithToken(`${API_BASE_URL}/events/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    })
    const data: ApiResponse<Event> = await response.json()
    return data.data
  }

  const getEventById = async (eventId: string): Promise<Event> => {
    const response = await fetchWithToken(`${API_BASE_URL}/events/${eventId}`, {
      requireAuth: false,
    })
    const data: ApiResponse<Event> = await response.json()
    return data.data
  }

  const listEvents = async (
    filters?: Partial<EventSearchFilters>
  ): Promise<EventListItem[]> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.categoria) params.append('categoria', filters.categoria)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())

    const response = await fetchWithToken(
      `${API_BASE_URL}/events/?${params.toString()}`,
      { requireAuth: false }
    )
    const data: ApiResponse<EventListItem[]> = await response.json()
    return data.data
  }

  const searchEvents = async (
    searchParams: EventSearchFilters
  ): Promise<EventListItem[]> => {
    const params = new URLSearchParams()

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.append(key, value.toString())
        }
      }
    })

    const response = await fetchWithToken(
      `${API_BASE_URL}/events/search?${params.toString()}`,
      { requireAuth: false }
    )
    const data: ApiResponse<EventListItem[]> = await response.json()
    return data.data
  }

  const getUserEvents = async (): Promise<Event[]> => {
    const response = await fetchWithToken(`${API_BASE_URL}/events/me`)
    const data: ApiResponse<Event[]> = await response.json()
    return data.data
  }

  const getParticipatingEvents = async (
    participantStatus?: ParticipanteStatus
  ): Promise<Participante[]> => {
    const params = new URLSearchParams()
    if (participantStatus) params.append('participant_status', participantStatus)

    const response = await fetchWithToken(
      `${API_BASE_URL}/events/participating?${params.toString()}`
    )
    const data: ApiResponse<Participante[]> = await response.json()
    return data.data
  }

  const getBusinessEvents = async (businessId: string): Promise<EventListItem[]> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/business/${businessId}`,
      { requireAuth: false }
    )
    const data: ApiResponse<EventListItem[]> = await response.json()
    return data.data
  }

  const getInitiativeEvents = async (initiativeId: string): Promise<EventListItem[]> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/initiative/${initiativeId}`,
      { requireAuth: false }
    )
    const data: ApiResponse<EventListItem[]> = await response.json()
    return data.data
  }

  const updateEvent = async ({
    eventId,
    updateData,
  }: {
    eventId: string
    updateData: EventUpdate
  }): Promise<Event> => {
    const response = await fetchWithToken(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    })
    const data: ApiResponse<Event> = await response.json()
    return data.data
  }

  const deleteEvent = async ({
    eventId,
    hardDelete = false
  }: {
    eventId: string
    hardDelete?: boolean
  }): Promise<void> => {
    const params = new URLSearchParams()
    if (hardDelete) params.append('hard_delete', 'true')

    await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}?${params.toString()}`,
      { method: 'DELETE' }
    )
  }

  // 2. CONTROLE DE STATUS
  const publishEvent = async (eventId: string): Promise<Event> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/publish`,
      { method: 'POST' }
    )
    const data: ApiResponse<Event> = await response.json()
    return data.data
  }

  const cancelEvent = async ({
    eventId,
    reason
  }: {
    eventId: string
    reason?: string
  }): Promise<Event> => {
    const params = new URLSearchParams()
    if (reason) params.append('reason', reason)

    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/cancel?${params.toString()}`,
      { method: 'POST' }
    )
    const data: ApiResponse<Event> = await response.json()
    return data.data
  }

  const concludeEvent = async (eventId: string): Promise<Event> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/conclude`,
      { method: 'POST' }
    )
    const data: ApiResponse<Event> = await response.json()
    return data.data
  }

  // 3. PARTICIPAÇÃO
  const participarEvento = async (eventId: string): Promise<void> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/participar`,
      { method: 'POST' }
    )
    const data: ApiResponse<void> = await response.json()
  }

  const cancelarParticipacao = async (eventId: string): Promise<void> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/participar`,
      { method: 'DELETE' }
    )
    const data: ApiResponse<void> = await response.json()
  }

  const getParticipantes = async ({
    eventId,
    status,
    limit = 100
  }: {
    eventId: string
    status?: ParticipanteStatus
    limit?: number
  }): Promise<Participante[]> => {
    const params = new URLSearchParams()
    if (status) params.append('participant_status', status)
    params.append('limit', limit.toString())

    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/participantes?${params.toString()}`,
      { requireAuth: false }
    )
    const data: ApiResponse<Participante[]> = await response.json()
    return data.data
  }

  const checkIn = async (eventId: string): Promise<void> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/check-in`,
      { method: 'POST' }
    )
    const data: ApiResponse<void> = await response.json()
  }

  // 4. GESTÃO DE PRESENÇA (Organizador)
  const validarPresenca = async ({
    eventId,
    uidUsuario,
    validationStatus
  }: {
    eventId: string
    uidUsuario: string
    validationStatus: ParticipanteStatus
  }): Promise<void> => {
    const params = new URLSearchParams()
    params.append('uid_usuario', uidUsuario)
    params.append('validation_status', validationStatus)

    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/validar-presenca?${params.toString()}`,
      { method: 'POST' }
    )
    const data: ApiResponse<void> = await response.json()
  }

  const validarPresencasLote = async ({
    eventId,
    bulkData
  }: {
    eventId: string
    bulkData: BulkPresenceValidation
  }): Promise<BulkOperationResult> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/validar-presencas-lote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData),
      }
    )
    const data: ApiResponse<BulkOperationResult> = await response.json()
    return data.data
  }

  // 5. ESTATÍSTICAS E CERTIFICADOS
  const getEventStats = async (eventId: string): Promise<EventStats> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/stats`
    )
    const data: ApiResponse<EventStats> = await response.json()
    return data.data
  }

  const getCertificado = async (eventId: string): Promise<CertificateData> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/certificado`
    )
    const data: ApiResponse<CertificateData> = await response.json()
    return data.data
  }

  const gerarCertificadosLote = async (
    eventId: string
  ): Promise<BulkOperationResult> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/gerar-certificados-lote`,
      { method: 'POST' }
    )
    const data: ApiResponse<BulkOperationResult> = await response.json()
    return data.data
  }

  // ===== HOOKS REACT QUERY =====

  // 1. CRUD
  const useCreateEvent = () =>
    useMutation({
      mutationFn: createEvent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['userEvents'] })
        toast({
          title: 'Sucesso!',
          description: 'Evento criado com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao criar evento',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const useGetEventById = (eventId: string, enabled: boolean = true) =>
    useQuery({
      queryKey: ['event', eventId],
      queryFn: () => getEventById(eventId),
      enabled,
      retry: false,
    })

  const useListEvents = (
    filters?: Partial<EventSearchFilters>,
    enabled: boolean = true
  ) =>
    useQuery({
      queryKey: ['events', filters],
      queryFn: () => listEvents(filters),
      enabled,
    })

  const useSearchEvents = (
    searchParams: EventSearchFilters,
    enabled: boolean = true
  ) =>
    useQuery({
      queryKey: ['events', 'search', searchParams],
      queryFn: () => searchEvents(searchParams),
      enabled,
    })

  const useGetUserEvents = (enabled: boolean = true) =>
    useQuery({
      queryKey: ['userEvents'],
      queryFn: getUserEvents,
      enabled,
    })

  const useGetParticipatingEvents = (
    status?: ParticipanteStatus,
    enabled: boolean = true
  ) =>
    useQuery({
      queryKey: ['participatingEvents', status],
      queryFn: () => getParticipatingEvents(status),
      enabled,
    })

  const useGetBusinessEvents = (businessId: string, enabled: boolean = true) =>
    useQuery({
      queryKey: ['businessEvents', businessId],
      queryFn: () => getBusinessEvents(businessId),
      enabled,
    })

  const useGetInitiativeEvents = (initiativeId: string, enabled: boolean = true) =>
    useQuery({
      queryKey: ['initiativeEvents', initiativeId],
      queryFn: () => getInitiativeEvents(initiativeId),
      enabled,
    })

  const useUpdateEvent = () =>
    useMutation({
      mutationFn: updateEvent,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.uid] })
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['userEvents'] })
        toast({
          title: 'Sucesso!',
          description: 'Evento atualizado com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao atualizar evento',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const useDeleteEvent = () =>
    useMutation({
      mutationFn: deleteEvent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['userEvents'] })
        toast({
          title: 'Sucesso!',
          description: 'Evento removido com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao deletar evento',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  // 2. CONTROLE DE STATUS
  const usePublishEvent = () =>
    useMutation({
      mutationFn: publishEvent,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.uid] })
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['userEvents'] })
        toast({
          title: 'Evento Publicado!',
          description: 'O evento agora está ativo e aceitando inscrições',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao publicar evento',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const useCancelEvent = () =>
    useMutation({
      mutationFn: cancelEvent,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.uid] })
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['userEvents'] })
        toast({
          title: 'Evento Cancelado',
          description: 'O evento foi cancelado com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao cancelar evento',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const useConcludeEvent = () =>
    useMutation({
      mutationFn: concludeEvent,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.uid] })
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['userEvents'] })
        toast({
          title: 'Evento Concluído!',
          description: 'Os certificados agora estão disponíveis',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao concluir evento',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  // 3. PARTICIPAÇÃO
  const useParticipar = () =>
    useMutation({
      mutationFn: participarEvento,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['participatingEvents'] })
        queryClient.invalidateQueries({ queryKey: ['events'] })
        toast({
          title: 'Inscrição Confirmada!',
          description: 'Você está inscrito no evento',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao se inscrever',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const useCancelarParticipacao = () =>
    useMutation({
      mutationFn: cancelarParticipacao,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['participatingEvents'] })
        queryClient.invalidateQueries({ queryKey: ['events'] })
        toast({
          title: 'Inscrição Cancelada',
          description: 'Sua inscrição foi cancelada',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao cancelar inscrição',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const useGetParticipantes = (
    eventId: string,
    status?: ParticipanteStatus,
    enabled: boolean = true
  ) =>
    useQuery({
      queryKey: ['eventParticipants', eventId, status],
      queryFn: () => getParticipantes({ eventId, status }),
      enabled,
    })

  const useCheckIn = () =>
    useMutation({
      mutationFn: checkIn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['participatingEvents'] })
        toast({
          title: 'Check-in Realizado!',
          description: 'Seu check-in foi confirmado',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro no check-in',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  // 4. GESTÃO DE PRESENÇA
  const useValidarPresenca = () =>
    useMutation({
      mutationFn: validarPresenca,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['eventParticipants'] })
        queryClient.invalidateQueries({ queryKey: ['eventStats'] })
        toast({
          title: 'Presença Validada!',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao validar presença',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const useValidarPresencasLote = () =>
    useMutation({
      mutationFn: validarPresencasLote,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['eventParticipants'] })
        queryClient.invalidateQueries({ queryKey: ['eventStats'] })
        toast({
          title: 'Validação Concluída!',
          description: `${data.success_count} presenças validadas`,
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro na validação em lote',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  // 5. ESTATÍSTICAS E CERTIFICADOS
  const useGetEventStats = (eventId: string, enabled: boolean = true) =>
    useQuery({
      queryKey: ['eventStats', eventId],
      queryFn: () => getEventStats(eventId),
      enabled,
    })

  const useGetCertificado = () =>
    useMutation({
      mutationFn: getCertificado,
      onSuccess: (data) => {
        // Abrir certificado em nova aba
        window.open(data.certificado_url, '_blank')
        toast({
          title: 'Certificado Gerado!',
          description: 'O certificado foi aberto em uma nova aba',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao gerar certificado',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const useGerarCertificadosLote = () =>
    useMutation({
      mutationFn: gerarCertificadosLote,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['eventParticipants'] })
        queryClient.invalidateQueries({ queryKey: ['eventStats'] })
        toast({
          title: 'Certificados Gerados!',
          description: `${data.success_count} certificados foram gerados`,
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao gerar certificados',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  // RETORNAR TODOS OS HOOKS
  return {
    // CRUD
    useCreateEvent,
    useGetEventById,
    useListEvents,
    useSearchEvents,
    useGetUserEvents,
    useGetParticipatingEvents,
    useGetBusinessEvents,
    useGetInitiativeEvents,
    useUpdateEvent,
    useDeleteEvent,

    // Status
    usePublishEvent,
    useCancelEvent,
    useConcludeEvent,

    // Participação
    useParticipar,
    useCancelarParticipacao,
    useGetParticipantes,
    useCheckIn,

    // Gestão de Presença
    useValidarPresenca,
    useValidarPresencasLote,

    // Estatísticas e Certificados
    useGetEventStats,
    useGetCertificado,
    useGerarCertificadosLote,
  }
}
```

---

## 🎨 COMPONENTES A CRIAR/ATUALIZAR

### 1. EventCard (Refatorado)
**Localização**: `app/eventos/components/EventCard.tsx`

```typescript
import { Event, EventListItem, EventStatusColors, EventCategoriaLabels, formatEventDateRange, getVacanciesText, canParticipate } from '@/lib/types/eventTypes'
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
```

### 2. EventFilters (Componentizado)
**Localização**: `app/eventos/components/EventFilters.tsx`

```typescript
'use client'

import { EventStatus, EventCategoria, EventStatusLabels, EventCategoriaLabels, EventFiltersState, initialEventFilters } from '@/lib/types/eventTypes'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Search, X, Filter } from 'lucide-react'

interface EventFiltersProps {
  filters: EventFiltersState
  onFiltersChange: (filters: EventFiltersState) => void
  onReset?: () => void
}

export function EventFilters({ filters, onFiltersChange, onReset }: EventFiltersProps) {
  const updateFilter = <K extends keyof EventFiltersState>(
    key: K,
    value: EventFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = () => {
    return JSON.stringify(filters) !== JSON.stringify(initialEventFilters)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* Busca Textual */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar eventos por título ou descrição..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status */}
        <div>
          <Label>Status</Label>
          <Select
            value={filters.selectedStatus}
            onValueChange={(value) => updateFilter('selectedStatus', value as EventStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.values(EventStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {EventStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div>
          <Label>Categoria</Label>
          <Select
            value={filters.selectedCategoria}
            onValueChange={(value) => updateFilter('selectedCategoria', value as EventCategoria | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.values(EventCategoria).map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {EventCategoriaLabels[categoria]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ordenação */}
        <div>
          <Label>Ordenar por</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data_inicio">Data do Evento</SelectItem>
              <SelectItem value="created_at">Data de Criação</SelectItem>
              <SelectItem value="titulo">Título</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Switches */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="online"
            checked={filters.isOnlineOnly}
            onCheckedChange={(checked) => updateFilter('isOnlineOnly', checked)}
          />
          <Label htmlFor="online">Apenas eventos online</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="vagas"
            checked={filters.onlyWithVacancies}
            onCheckedChange={(checked) => updateFilter('onlyWithVacancies', checked)}
          />
          <Label htmlFor="vagas">Apenas com vagas</Label>
        </div>
      </div>

      {/* Botão Limpar */}
      {hasActiveFilters() && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFiltersChange(initialEventFilters)}
          className="w-full md:w-auto"
        >
          <X className="w-4 h-4 mr-2" />
          Limpar Filtros
        </Button>
      )}
    </div>
  )
}
```

---

## 📄 ESTRUTURA DE PÁGINAS

### 1. Página Pública `/app/eventos/page.tsx`

```typescript
'use client'

import { useState, useMemo } from 'react'
import { useEventApi } from '@/lib/api/event'
import { EventFilters } from './components/EventFilters'
import { EventCard } from './components/EventCard'
import { EventFiltersState, initialEventFilters, EventSearchFilters } from '@/lib/types/eventTypes'
import { useRouter } from 'next/navigation'

export default function EventosPage() {
  const router = useRouter()
  const { useSearchEvents, useParticipar } = useEventApi()
  const [filters, setFilters] = useState<EventFiltersState>(initialEventFilters)

  // Construir parâmetros de busca
  const searchParams = useMemo<EventSearchFilters>(() => ({
    q: filters.searchQuery || undefined,
    status: filters.selectedStatus !== 'all' ? filters.selectedStatus : undefined,
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
```

---

## ✅ PRÓXIMOS PASSOS

1. **Copiar** o código completo de `lib/api/event.ts` do documento acima
2. **Criar** os componentes `EventCard.tsx` e `EventFilters.tsx`
3. **Atualizar** as páginas:
   - `/app/eventos/page.tsx` - Página pública
   - `/app/meus-eventos/page.tsx` - Gestão do usuário
   - `/app/administrativo/eventos/page.tsx` - Admin
4. **Criar** página de detalhes: `/app/eventos/[id]/page.tsx`
5. **Criar** modal de criação/edição
6. **Criar** componentes de gestão de participantes

---

**Status**: 🎯 Documentação completa criada com código pronto para uso!
