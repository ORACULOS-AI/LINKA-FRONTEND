import { api } from './client'
import type { ApiResp } from './feed'

export type MeetingStatus =
  | 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'

export type Meeting = {
  id: string
  creator_id: string
  participant_id: string
  status: MeetingStatus
  scheduled_start: string
  scheduled_end: string
  location_link?: string | null
  created_at: string
  updated_at: string
}

export type MeetingCreate = {
  participant_id: string
  scheduled_start: string
  scheduled_end: string
  location_link?: string | null
  message?: string | null
}

export type InstantMeetingCreate = {
  participant_id: string
  duration_minutes?: number
  location_link?: string | null
}

export type MeetingUpdate = {
  status?: MeetingStatus
  scheduled_start?: string
  scheduled_end?: string
  location_link?: string | null
}

export type PaginatedMeetings = {
  items: Meeting[]
  next_cursor: string | null
  has_more: boolean
}

// POST /api/v1/meetings/
export async function createMeeting(payload: MeetingCreate): Promise<Meeting> {
  const { data } = await api.post<ApiResp<Meeting>>('/api/v1/meetings/', payload)
  return data.data
}

// POST /api/v1/meetings/instant
export async function createInstantMeeting(payload: InstantMeetingCreate): Promise<Meeting> {
  const { data } = await api.post<ApiResp<Meeting>>('/api/v1/meetings/instant', payload)
  return data.data
}

// GET /api/v1/meetings/
export async function listMeetings(params?: { limit?: number; cursor?: string }): Promise<PaginatedMeetings> {
  const { data } = await api.get<PaginatedMeetings>('/api/v1/meetings/', { params })
  return data
}

// GET /api/v1/meetings/{id}
export async function getMeeting(id: string): Promise<Meeting> {
  const { data } = await api.get<ApiResp<Meeting>>(`/api/v1/meetings/${id}`)
  return data.data
}

// PATCH /api/v1/meetings/{id}
export async function updateMeeting(id: string, payload: MeetingUpdate): Promise<Meeting> {
  const { data } = await api.patch<ApiResp<Meeting>>(`/api/v1/meetings/${id}`, payload)
  return data.data
}

// POST /api/v1/webrtc/meetings/{id}/token
export async function getMeetingToken(id: string): Promise<{ token: string }> {
  const { data } = await api.post<ApiResp<{ token: string }>>(`/api/v1/webrtc/meetings/${id}/token`)
  return data.data
}
