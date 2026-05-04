import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/lib/hooks/useApi'
import { toast } from '@/hooks/use-toast'

// Tipos (simplificados; se desejar, mova para lib/types/meetingTypes.ts)
export type MeetingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'completed'

export interface MeetingBase {
  scheduled_start: string // ISO
  scheduled_end: string // ISO
  location_link?: string | null
}

export interface MeetingCreate extends MeetingBase {
  participant_id: string
  message?: string
}

export interface MeetingUpdate {
  status?: MeetingStatus
  scheduled_start?: string
  scheduled_end?: string
  location_link?: string | null
}

export interface InstantMeetingCreate {
  participant_id: string
  duration_minutes?: number
  location_link?: string | null
}

export interface WebRTCTokenResponse {
  token: string
  url: string
}

export interface Meeting extends MeetingBase {
  id: string
  creator_id: string
  participant_id: string
  status: MeetingStatus
  created_at: string
  updated_at: string
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export const useMeetingApi = () => {
  const { fetchWithToken } = useApi()
  const queryClient = useQueryClient()

  /* ----------------------------- CRUD functions ---------------------------- */

  const createMeeting = async (payload: MeetingCreate): Promise<Meeting> => {
    const response = await fetchWithToken(`${API_BASE_URL}/meetings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || 'Erro ao agendar reunião')
    return data.data as Meeting
  }

  const listMeetings = async (
    status?: MeetingStatus,
  ): Promise<Meeting[]> => {
    let url = `${API_BASE_URL}/meetings/`
    if (status) {
      url += `?status=${encodeURIComponent(status)}`
    }
    const response = await fetchWithToken(url)
    const data = await response.json()
    return data.data.meetings as Meeting[]
  }

  const getMeetingById = async (id: string): Promise<Meeting> => {
    const response = await fetchWithToken(`${API_BASE_URL}/meetings/${id}`)
    const data = await response.json()
    return data.data as Meeting
  }

  const updateMeeting = async ({
    id,
    update,
  }: {
    id: string
    update: MeetingUpdate
  }): Promise<Meeting> => {
    const response = await fetchWithToken(`${API_BASE_URL}/meetings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || 'Erro ao atualizar reunião')
    return data.data as Meeting
  }

  const createInstantMeeting = async (
    payload: InstantMeetingCreate,
  ): Promise<Meeting> => {
    const response = await fetchWithToken(`${API_BASE_URL}/meetings/instant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || 'Erro ao iniciar reunião')
    return data.data as Meeting
  }

  const getWebRTCToken = async (meetingId: string): Promise<WebRTCTokenResponse> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/webrtc/meetings/${meetingId}/token`,
      {
        method: 'POST',
      },
    )
    const data = await response.json()
    if (!response.ok) throw new Error(data.detail || 'Erro ao obter token WebRTC')
    return data.data as WebRTCTokenResponse
  }

  /* ------------------------------ React Hooks ------------------------------ */

  const useCreateMeeting = () =>
    useMutation({
      mutationFn: createMeeting,
      onSuccess: () => {
        toast({
          title: 'Solicitação enviada',
          description: 'O convite de reunião foi enviado.',
        })
        queryClient.invalidateQueries({ queryKey: ['meetings'] })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error.message || 'Não foi possível agendar a reunião.',
          variant: 'destructive',
        })
      },
    })

  const useListMeetings = (status?: MeetingStatus) =>
    useQuery({
      queryKey: ['meetings', status],
      queryFn: () => listMeetings(status),
    })

  const useGetMeeting = (id: string) =>
    useQuery({
      queryKey: ['meeting', id],
      queryFn: () => getMeetingById(id),
    })

  const useUpdateMeeting = () =>
    useMutation({
      mutationFn: updateMeeting,
      onSuccess: (_data, variables) => {
        toast({ title: 'Reunião atualizada' })
        queryClient.invalidateQueries({ queryKey: ['meeting', variables.id] })
        queryClient.invalidateQueries({ queryKey: ['meetings'] })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error.message || 'Falha ao atualizar a reunião.',
          variant: 'destructive',
        })
      },
    })

  const useCreateInstantMeeting = () =>
    useMutation({
      mutationFn: createInstantMeeting,
      onSuccess: () => {
        toast({ title: 'Reunião iniciada' })
        queryClient.invalidateQueries({ queryKey: ['meetings'] })
      },
      onError: (error: any) => {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      },
    })

  return {
    createMeeting,
    listMeetings,
    getMeetingById,
    updateMeeting,
    createInstantMeeting,
    getWebRTCToken,
    /* hooks */
    useCreateMeeting,
    useListMeetings,
    useGetMeeting,
    useUpdateMeeting,
    useCreateInstantMeeting,
  }
} 