import { api } from './client'

export type LikeTargetType =
  | 'user'
  | 'negocio'
  | 'laboratorio'
  | 'iniciativa'
  | 'evento'
  | 'post'

type Envelope<T> = { data: T }

const base = (type: LikeTargetType, id: string) => `/api/v1/like/${type}/${id}`

export async function like(type: LikeTargetType, id: string): Promise<void> {
  await api.post(base(type, id))
}

export async function unlike(type: LikeTargetType, id: string): Promise<void> {
  await api.delete(base(type, id))
}

export async function hasLiked(type: LikeTargetType, id: string): Promise<boolean> {
  const { data } = await api.get<Envelope<{ liked: boolean }>>(`${base(type, id)}/has`)
  return Boolean(data.data?.liked)
}

export async function getLikesCount(type: LikeTargetType, id: string): Promise<number> {
  const { data } = await api.get<Envelope<{ likes_count: number } | { count: number }>>(
    `${base(type, id)}/count`,
  )
  const payload = data.data as { likes_count?: number; count?: number }
  return payload.likes_count ?? payload.count ?? 0
}

export type Liker = {
  uid: string
  nome: string
  foto_perfil?: string | null
}

export async function listLikers(type: LikeTargetType, id: string): Promise<Liker[]> {
  const { data } = await api.get<Envelope<Liker[]>>(`${base(type, id)}/likers`)
  return data.data ?? []
}
