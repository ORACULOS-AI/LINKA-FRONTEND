import { api } from './client'
import type { ApiResp } from './feed'

export type Notif = {
  id: string
  user_id: string
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  data: Record<string, unknown> | null
  data_leitura?: string | null
  created_at: string
  updated_at?: string
}

export type NotifPage = {
  items: Notif[]
  next_cursor: string | null
  has_more: boolean
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<ApiResp<{ count: number }>>('/api/v1/notifications/unread-count')
  return data.data.count
}

export async function fetchNotifications(params: {
  cursor?: string | null
  limit?: number
  unread_only?: boolean
} = {}): Promise<NotifPage> {
  const { data } = await api.get<NotifPage>('/api/v1/notifications', {
    params: {
      cursor: params.cursor ?? undefined,
      limit: params.limit ?? 50,
      unread_only: params.unread_only ?? false,
    },
  })
  return data
}

export async function markRead(id: string): Promise<void> {
  await api.post(`/api/v1/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  await api.post('/api/v1/notifications/read-all')
}

export async function deleteNotif(id: string): Promise<void> {
  await api.delete(`/api/v1/notifications/${id}`)
}
