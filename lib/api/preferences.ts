import { api } from './client'
import type { ApiResp } from './feed'

// Campos espelham app/db/models.py::UserPreferences (B-FE4).
export type UserPreferences = {
  notif_types_muted?: string[]
  email_digest_optin?: boolean
  profile_public?: boolean
  searchable?: boolean
  sound_enabled?: boolean
  theme?: 'light' | 'dark' | 'system'
  locale?: string
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
