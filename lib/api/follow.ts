import { api } from './client'

export type FollowTargetType = 'user' | 'negocio' | 'laboratorio' | 'iniciativa' | 'evento'

export type FollowUser = {
  uid: string
  nome: string
  foto_perfil?: string | null
  tipo_usuario?: string
}

type Envelope<T> = { data: T }

const base = (type: FollowTargetType, id: string) => `/api/v1/follow/${type}/${id}`

export async function follow(type: FollowTargetType, id: string): Promise<void> {
  await api.post(base(type, id))
}

export async function unfollow(type: FollowTargetType, id: string): Promise<void> {
  await api.delete(base(type, id))
}

export async function isFollowing(type: FollowTargetType, id: string): Promise<boolean> {
  const { data } = await api.get<Envelope<{ following: boolean } | { is_following: boolean }>>(
    `${base(type, id)}/is-following`,
  )
  const payload = data.data as { following?: boolean; is_following?: boolean }
  return Boolean(payload.following ?? payload.is_following)
}

export async function getFollowersCount(type: FollowTargetType, id: string): Promise<number> {
  const { data } = await api.get<Envelope<{ followers_count: number } | { count: number }>>(
    `${base(type, id)}/count`,
  )
  const payload = data.data as { followers_count?: number; count?: number }
  return payload.followers_count ?? payload.count ?? 0
}

export async function listFollowers(
  type: FollowTargetType,
  id: string,
): Promise<FollowUser[]> {
  const { data } = await api.get<Envelope<FollowUser[]>>(`${base(type, id)}/followers`)
  return data.data ?? []
}

export type FollowedItem = {
  target_type: FollowTargetType
  target_id: string
  created_at: string
}

export async function listMyFollowing(): Promise<FollowedItem[]> {
  const { data } = await api.get<Envelope<FollowedItem[]>>('/api/v1/follow/me/following')
  return data.data ?? []
}

export async function getMutualUids(userUid: string): Promise<string[]> {
  const { data } = await api.get<Envelope<{ mutual_uids: string[] }>>(
    `/api/v1/follow/mutual/${userUid}`,
  )
  return data.data?.mutual_uids ?? []
}

export async function isMutual(userUid: string): Promise<boolean> {
  const { data } = await api.get<Envelope<{ mutual: boolean }>>(
    `/api/v1/follow/is-mutual/${userUid}`,
  )
  return Boolean(data.data?.mutual)
}
