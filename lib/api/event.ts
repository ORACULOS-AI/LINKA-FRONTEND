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

  // 2.1 APROVAÇÃO (ADMIN)
  const approveEvent = async (eventId: string): Promise<Event> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/approve`,
      { method: 'POST' }
    )
    const data: ApiResponse<Event> = await response.json()
    return data.data
  }

  const rejectEvent = async ({
    eventId,
    reason
  }: {
    eventId: string
    reason?: string
  }): Promise<Event> => {
    const params = new URLSearchParams()
    if (reason) params.append('reason', reason)

    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/reject?${params.toString()}`,
      { method: 'POST' }
    )
    const data: ApiResponse<Event> = await response.json()
    return data.data
  }

  // 3. PARTICIPAÇÃO
  const participarEvento = async (eventId: string): Promise<void> => {
    await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/participar`,
      { method: 'POST' }
    )
  }

  const cancelarParticipacao = async (eventId: string): Promise<void> => {
    await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/participar`,
      { method: 'DELETE' }
    )
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
    await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/check-in`,
      { method: 'POST' }
    )
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

    await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/validar-presenca?${params.toString()}`,
      { method: 'POST' }
    )
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

  // 2.1 APROVAÇÃO (ADMIN)
  const useApproveEvent = () =>
    useMutation({
      mutationFn: approveEvent,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.uid] })
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['adminEvents'] })
        toast({
          title: 'Evento Aprovado!',
          description: 'O evento agora está ativo e visível para todos',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao aprovar evento',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const useRejectEvent = () =>
    useMutation({
      mutationFn: rejectEvent,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.uid] })
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['adminEvents'] })
        toast({
          title: 'Evento Rejeitado',
          description: 'O organizador foi notificado e pode corrigir',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao rejeitar evento',
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

    // Aprovação (Admin)
    useApproveEvent,
    useRejectEvent,

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
