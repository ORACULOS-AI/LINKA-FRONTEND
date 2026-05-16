import { api } from './client'
import type { ApiResp } from './feed'

export type UserPreferences = {
  notificacoes_email?: boolean
  notificacoes_push?: boolean
  idioma?: string
  tema?: string
  [key: string]: unknown
}

// GET /api/v1/users/me/preferences
export async function getMyPreferences(): Promise<UserPreferences> {
  const { data } = await api.get<ApiResp<UserPreferences>>('/api/v1/users/me/preferences')
  return data.data
}

// PATCH /api/v1/users/me/preferences
export async function updateMyPreferences(patch: Partial<UserPreferences>): Promise<UserPreferences> {
  const { data } = await api.patch<ApiResp<UserPreferences>>('/api/v1/users/me/preferences', patch)
  return data.data
}
