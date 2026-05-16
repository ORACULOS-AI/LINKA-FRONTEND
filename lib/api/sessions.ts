import { api } from './client'
import type { ApiResp } from './feed'

export type UserSession = {
  id: string
  user_uid: string
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
  revoked_at?: string | null
}

// GET /api/v1/users/me/sessions
export async function getMySessions(): Promise<UserSession[]> {
  const { data } = await api.get<ApiResp<UserSession[]>>('/api/v1/users/me/sessions')
  return data.data
}

// DELETE /api/v1/users/me/sessions/{session_id}
export async function revokeSession(sessionId: string): Promise<void> {
  await api.delete(`/api/v1/users/me/sessions/${sessionId}`)
}

// DELETE /api/v1/users/me/sessions  — revoga todas exceto a atual
export async function revokeAllSessions(): Promise<void> {
  await api.delete('/api/v1/users/me/sessions')
}
