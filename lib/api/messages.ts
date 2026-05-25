import { api } from './client'
import type { ApiResp } from './feed'

export type Message = {
  id: string
  thread_id: string
  remetente_id: string
  conteudo: string
  created_at: string
  updated_at: string
}

export type Thread = {
  id: string
  participantes: string[]
  last_message?: string | null
  last_message_at?: string | null
  created_at: string
  updated_at: string
}

export type ThreadCreate = {
  participantes: string[]
  mensagem_inicial: string
}

export type MessageCreate = {
  conteudo: string
}

export type PaginatedThreads = {
  items: Thread[]
  next_cursor: string | null
  has_more: boolean
}

export type PaginatedMessages = {
  items: Message[]
  next_cursor: string | null
  has_more: boolean
}

// POST /api/v1/messages/threads
export async function createThread(payload: ThreadCreate): Promise<Thread> {
  const { data } = await api.post<ApiResp<Thread>>('/api/v1/messages/threads', payload)
  return data.data
}

// GET /api/v1/messages/threads
export async function listThreads(params?: { limit?: number; cursor?: string }): Promise<PaginatedThreads> {
  const { data } = await api.get<PaginatedThreads>('/api/v1/messages/threads', { params })
  return data
}

// POST /api/v1/messages/threads/{thread_id}/messages
export async function sendMessage(threadId: string, payload: MessageCreate): Promise<Message> {
  const { data } = await api.post<ApiResp<Message>>(`/api/v1/messages/threads/${threadId}/messages`, payload)
  return data.data
}

// GET /api/v1/messages/threads/{thread_id}/messages
export async function listMessages(threadId: string, params?: { limit?: number; cursor?: string }): Promise<PaginatedMessages> {
  const { data } = await api.get<PaginatedMessages>(`/api/v1/messages/threads/${threadId}/messages`, { params })
  return data
}

// POST /api/v1/messages/threads/{thread_id}/read — message_id é obrigatório (400 sem)
export async function markThreadRead(threadId: string, messageId: string): Promise<void> {
  await api.post(`/api/v1/messages/threads/${threadId}/read`, { message_id: messageId })
}

// POST /api/v1/messages/threads/{thread_id}/start-meeting
export async function startMeetingFromThread(threadId: string): Promise<unknown> {
  const { data } = await api.post<ApiResp<unknown>>(`/api/v1/messages/threads/${threadId}/start-meeting`)
  return data.data
}
