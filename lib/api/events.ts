'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../hooks/useApi'
import type { Event, EventStatus } from '@/lib/types/event'
import { toast } from '@/hooks/use-toast'
import { config } from '@/config'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

/**
 * Hook para gerenciar eventos
 */
export const useEventsApi = () => {
  const { fetchWithToken } = useApi()
  const queryClient = useQueryClient()

  const createEvent = async (
    eventData: Omit<Event, 'id' | 'uid_admin'>,
  ): Promise<Event> => {
    const response = await fetchWithToken(`${API_BASE_URL}/events/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
    const data = await response.json()
    return data.data
  }

  const getEventById = async (eventId: string): Promise<Event> => {
    const response = await fetchWithToken(`${API_BASE_URL}/events/${eventId}`, {
      requireAuth: false,
    })
    const data = await response.json()
    return data.data
  }

  const listEvents = async (status?: EventStatus): Promise<Event[]> => {
    let url = `${API_BASE_URL}/events/`
    if (status) {
      url += `?stts=${encodeURIComponent(status)}`
    }
    
    const response = await fetchWithToken(url, {
      requireAuth: false,
    })
    const data = await response.json()
    return data.data
  }

  const getUserEvents = async (): Promise<Event[]> => {
    const response = await fetchWithToken(`${API_BASE_URL}/events/me`, {
      requireAuth: true,
    })
    const data = await response.json()
    return data.data
  }

  const updateEvent = async ({
    eventId,
    updateData,
  }: {
    eventId: string
    updateData: Partial<Event>
  }): Promise<Event> => {
    const response = await fetchWithToken(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
    const data = await response.json()
    return data.data
  }

  const deleteEvent = async (eventId: string): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    })
  }

  const updateEventStatus = async (
    eventId: string,
    status: EventStatus,
  ): Promise<Event> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/${eventId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      },
    )
    const data = await response.json()
    return data.data
  }

  const getEventsByAdmin = async (): Promise<Event[]> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/events/admin/dashboard`,
      {
        requireAuth: true,
      },
    )
    const data = await response.json()
    return data.data
  }

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
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useGetEventById = (eventId: string) =>
    useQuery({
      queryKey: ['event', eventId],
      queryFn: () => getEventById(eventId),
      retry: false,
    })

  const useListEvents = (status?: EventStatus, enabled: boolean = true) =>
    useQuery({
      queryKey: ['events', status],
      queryFn: () => listEvents(status),
      enabled,
      retry: false,
    })

  const useGetUserEvents = (enabled: boolean = true) =>
    useQuery({
      queryKey: ['userEvents'],
      queryFn: getUserEvents,
      enabled,
      retry: false,
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
          description: error.message || 'Tente novamente mais tarde',
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
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao deletar evento',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useUpdateEventStatus = () =>
    useMutation({
      mutationFn: ({
        eventId,
        status,
      }: {
        eventId: string
        status: EventStatus
      }) => updateEventStatus(eventId, status),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['event', data.uid] })
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['userEvents'] })
        toast({
          title: 'Sucesso!',
          description: 'Status do evento atualizado com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao atualizar status do evento',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useGetEventsByAdmin = () =>
    useQuery({
      queryKey: ['events-admin'],
      queryFn: getEventsByAdmin,
      retry: false,
    })

  return {
    useCreateEvent,
    useGetEventById,
    useListEvents,
    useGetUserEvents,
    useUpdateEvent,
    useDeleteEvent,
    useUpdateEventStatus,
    useGetEventsByAdmin,
  }
}
