import { api } from './client'
import type { ApiResp } from './feed'

// GET /api/v1/presence/online — lista de UIDs online
export async function getOnlineUsers(): Promise<string[]> {
  const { data } = await api.get<ApiResp<string[]>>('/api/v1/presence/online')
  return data.data
}

// GET /api/v1/presence — mapa uid -> online para lista de UIDs
export async function getPresenceMap(uids: string[]): Promise<Record<string, boolean>> {
  const { data } = await api.get<ApiResp<Record<string, boolean>>>('/api/v1/presence', {
    params: { uids: uids.join(',') },
  })
  return data.data
}

// GET /api/v1/presence/{uid}
export async function getUserPresence(uid: string): Promise<{ online: boolean; last_seen?: string | null }> {
  const { data } = await api.get<ApiResp<{ online: boolean; last_seen?: string | null }>>(`/api/v1/presence/${uid}`)
  return data.data
}
