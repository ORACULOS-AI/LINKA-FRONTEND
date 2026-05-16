import { api } from './client'
import type { ApiResp } from './feed'

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected'

export type ConnectionBetween = {
  status: ConnectionStatus
  connection_id?: string | null
}

export type FollowCounts = {
  followers: number
  following: number
}

export type ConnectionUser = {
  uid: string
  nome: string
  foto_url?: string | null
  tipo_usuario?: string
}

export async function getConnectionBetween(otherUid: string): Promise<ConnectionBetween> {
  const { data } = await api.get<ApiResp<ConnectionBetween>>(
    `/api/v1/connections/between/${otherUid}`
  )
  return data.data
}

export async function sendConnectionRequest(toUid: string): Promise<void> {
  await api.post('/api/v1/connections/request', { target_id: toUid })
}

export async function cancelConnectionRequest(connectionId: string): Promise<void> {
  await api.delete(`/api/v1/connections/request/${connectionId}`)
}

export async function acceptConnectionRequest(connectionId: string): Promise<void> {
  await api.put(`/api/v1/connections/request/${connectionId}/accept`)
}

export async function rejectConnectionRequest(connectionId: string): Promise<void> {
  await api.put(`/api/v1/connections/request/${connectionId}/reject`)
}

export async function getFollowCounts(uid: string): Promise<FollowCounts> {
  const { data } = await api.get<ApiResp<FollowCounts>>(`/api/v1/users/${uid}/follow-counts`)
  return data.data
}

export async function isFollowing(uid: string): Promise<boolean> {
  const { data } = await api.get<ApiResp<{ is_following: boolean }>>(
    `/api/v1/users/${uid}/is-following`
  )
  return data.data.is_following
}

export async function followUser(uid: string): Promise<void> {
  await api.post(`/api/v1/users/${uid}/follow`)
}

export async function unfollowUser(uid: string): Promise<void> {
  await api.delete(`/api/v1/users/${uid}/follow`)
}

type ConnectionsResp = { connections: Array<{ connection_id: string; user: { uid: string; nome: string; foto_perfil?: string | null; tipo_usuario?: string } }> }

export async function getMyConnections(): Promise<ConnectionUser[]> {
  const { data } = await api.get<ApiResp<ConnectionsResp>>('/api/v1/connections/connections')
  const list = (data.data as unknown as ConnectionsResp)?.connections ?? []
  return list.map((c) => ({
    uid: c.user.uid,
    nome: c.user.nome,
    foto_url: c.user.foto_perfil,
    tipo_usuario: c.user.tipo_usuario,
  }))
}

export async function getUserConnections(uid: string): Promise<ConnectionUser[]> {
  const { data } = await api.get<ApiResp<ConnectionsResp>>(
    `/api/v1/connections/users/${uid}/connections`
  )
  const list = (data.data as unknown as ConnectionsResp)?.connections ?? []
  return list.map((c) => ({
    uid: c.user.uid,
    nome: c.user.nome,
    foto_url: c.user.foto_perfil,
    tipo_usuario: c.user.tipo_usuario,
  }))
}

export type SuggestedUser = {
  uid: string
  nome: string
  foto_url?: string | null
  tipo_usuario?: string
  campus?: string | null
  mutual_count?: number
}

type SuggestionsResp = { suggestions: Array<{ user: { uid: string; nome: string; foto_perfil?: string | null; tipo_usuario?: string; campus?: string | null }; score: number; motivo: string }> }

export async function getSuggestions(limit = 5): Promise<SuggestedUser[]> {
  const { data } = await api.get<ApiResp<SuggestionsResp>>('/api/v1/connections/suggestions', {
    params: { limit },
  })
  const list = (data.data as unknown as SuggestionsResp)?.suggestions ?? []
  return list.map((s) => ({
    uid: s.user.uid,
    nome: s.user.nome,
    foto_url: s.user.foto_perfil,
    tipo_usuario: s.user.tipo_usuario,
    campus: s.user.campus,
  }))
}

// GET /api/v1/connections/requests/{request_type}  — sent | received | all
export async function getConnectionRequests(type: 'sent' | 'received' | 'all' = 'received'): Promise<unknown[]> {
  const { data } = await api.get<ApiResp<unknown[]>>(`/api/v1/connections/requests/${type}`)
  return data.data
}

export async function getMyConnectionCount(): Promise<number> {
  const list = await getMyConnections()
  return list?.length ?? 0
}
