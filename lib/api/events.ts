import { api } from './client'
import type { ApiResp } from './feed'

export type EventStatus =
  | 'rascunho' | 'pendente_aprovacao' | 'ativo' | 'cancelado' | 'concluido'

export type EventCategoria =
  | 'workshop' | 'palestra' | 'conferencia' | 'hackathon'
  | 'networking' | 'curso' | 'seminario' | 'mesa_redonda' | 'outro'

export type ParticipanteStatus =
  | 'inscrito' | 'confirmado' | 'check_in' | 'presente' | 'ausente' | 'cancelado'

export type Event = {
  uid: string
  titulo: string
  descricao: string
  data_inicio: string
  data_fim: string
  local: string
  categoria: EventCategoria
  status: EventStatus
  uid_owner: string
  business_id?: string | null
  iniciativa_id?: string | null
  capacidade_maxima?: number | null
  total_participantes: number
  total_presentes: number
  total_certificados: number
  is_online: boolean
  link_online?: string | null
  logo_url?: string | null
  imagem_capa?: string | null
  fotos: string[]
  tags: string[]
  requisitos?: string | null
  carga_horaria?: number | null
  created_at: string
  updated_at: string
}

export type EventSummary = Pick<
  Event,
  | 'uid' | 'titulo' | 'descricao' | 'data_inicio' | 'data_fim' | 'local'
  | 'categoria' | 'status' | 'uid_owner' | 'total_participantes'
  | 'capacidade_maxima' | 'is_online' | 'logo_url' | 'imagem_capa' | 'tags' | 'created_at'
>

export type Participante = {
  uid: string
  event_id: string
  uid_usuario: string
  nome: string
  email: string
  status: ParticipanteStatus
  data_inscricao?: string | null
  data_check_in?: string | null
  data_presenca_validada?: string | null
  certificado_url?: string | null
  created_at: string
  updated_at: string
}

export type EventStats = {
  total_inscritos: number
  total_confirmados: number
  total_check_ins: number
  total_presentes: number
  total_ausentes: number
  total_cancelados: number
  total_certificados_emitidos: number
  taxa_presenca: number
  taxa_conversao: number
}

export type EventCreate = {
  titulo: string
  descricao: string
  data_inicio: string
  data_fim: string
  local: string
  categoria: EventCategoria
  business_id?: string | null
  iniciativa_id?: string | null
  capacidade_maxima?: number | null
  is_online?: boolean
  link_online?: string | null
  logo_url?: string | null
  imagem_capa?: string | null
  fotos?: string[]
  tags?: string[]
  requisitos?: string | null
  carga_horaria?: number | null
  status?: EventStatus
}

export type EventUpdate = Partial<EventCreate>

export type EventFilters = {
  status?: EventStatus
  categoria?: EventCategoria
  business_id?: string
  iniciativa_id?: string
  q?: string
  is_online?: boolean
  limit?: number
  offset?: number
}

export type PaginatedEvents = {
  items: EventSummary[]
  next_cursor: string | null
  has_more: boolean
}

// POST /api/v1/events/
export async function createEvent(payload: EventCreate): Promise<Event> {
  const { data } = await api.post<ApiResp<Event>>('/api/v1/events/', payload)
  return data.data
}

// GET /api/v1/events/
export async function listEvents(filters?: EventFilters): Promise<PaginatedEvents> {
  const { data } = await api.get<PaginatedEvents>('/api/v1/events/', { params: filters })
  return data
}

// GET /api/v1/events/me
export async function getMyEvents(): Promise<Event[]> {
  const { data } = await api.get<ApiResp<Event[]>>('/api/v1/events/me')
  return data.data
}

// GET /api/v1/events/participating
export async function getParticipatingEvents(): Promise<Participante[]> {
  const { data } = await api.get<ApiResp<Participante[]>>('/api/v1/events/participating')
  return data.data
}

// GET /api/v1/events/business/{business_id}
export async function getEventsByBusiness(businessId: string): Promise<EventSummary[]> {
  const { data } = await api.get<ApiResp<EventSummary[]>>(`/api/v1/events/business/${businessId}`)
  return data.data
}

// GET /api/v1/events/initiative/{iniciativa_id}
export async function getEventsByInitiative(iniciativaId: string): Promise<EventSummary[]> {
  const { data } = await api.get<ApiResp<EventSummary[]>>(`/api/v1/events/initiative/${iniciativaId}`)
  return data.data
}

// GET /api/v1/events/{id}
export async function getEvent(id: string): Promise<Event> {
  const { data } = await api.get<ApiResp<Event>>(`/api/v1/events/${id}`)
  return data.data
}

// PUT /api/v1/events/{id}
export async function updateEvent(id: string, payload: EventUpdate): Promise<Event> {
  const { data } = await api.put<ApiResp<Event>>(`/api/v1/events/${id}`, payload)
  return data.data
}

// DELETE /api/v1/events/{id}
export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/api/v1/events/${id}`)
}

// POST /api/v1/events/{id}/publish
export async function publishEvent(id: string): Promise<Event> {
  const { data } = await api.post<ApiResp<Event>>(`/api/v1/events/${id}/publish`)
  return data.data
}

// POST /api/v1/events/{id}/cancel
export async function cancelEvent(id: string): Promise<Event> {
  const { data } = await api.post<ApiResp<Event>>(`/api/v1/events/${id}/cancel`)
  return data.data
}

// POST /api/v1/events/{id}/conclude
export async function concludeEvent(id: string): Promise<Event> {
  const { data } = await api.post<ApiResp<Event>>(`/api/v1/events/${id}/conclude`)
  return data.data
}

// POST /api/v1/events/{id}/approve  (admin)
export async function approveEvent(id: string): Promise<Event> {
  const { data } = await api.post<ApiResp<Event>>(`/api/v1/events/${id}/approve`)
  return data.data
}

// POST /api/v1/events/{id}/reject  (admin)
export async function rejectEvent(id: string): Promise<Event> {
  const { data } = await api.post<ApiResp<Event>>(`/api/v1/events/${id}/reject`)
  return data.data
}

// POST /api/v1/events/{id}/participar
export async function joinEvent(id: string): Promise<Participante> {
  const { data } = await api.post<ApiResp<Participante>>(`/api/v1/events/${id}/participar`)
  return data.data
}

// DELETE /api/v1/events/{id}/participar
export async function leaveEvent(id: string): Promise<void> {
  await api.delete(`/api/v1/events/${id}/participar`)
}

// GET /api/v1/events/{id}/participantes
export async function getEventParticipants(id: string): Promise<Participante[]> {
  const { data } = await api.get<ApiResp<Participante[]>>(`/api/v1/events/${id}/participantes`)
  return data.data
}

// POST /api/v1/events/{id}/check-in
export async function checkInEvent(id: string): Promise<Participante> {
  const { data } = await api.post<ApiResp<Participante>>(`/api/v1/events/${id}/check-in`)
  return data.data
}

// GET /api/v1/events/{id}/qr
export async function getEventQrCode(id: string): Promise<unknown> {
  const { data } = await api.get<ApiResp<unknown>>(`/api/v1/events/${id}/qr`)
  return data.data
}

// GET /api/v1/events/{id}/stats
export async function getEventStats(id: string): Promise<EventStats> {
  const { data } = await api.get<ApiResp<EventStats>>(`/api/v1/events/${id}/stats`)
  return data.data
}

// GET /api/v1/events/{id}/certificado
export async function getEventCertificate(id: string): Promise<unknown> {
  const { data } = await api.get<ApiResp<unknown>>(`/api/v1/events/${id}/certificado`)
  return data.data
}

// POST /api/v1/events/{id}/validar-presenca
export async function validatePresence(id: string, participanteUid: string): Promise<Participante> {
  const { data } = await api.post<ApiResp<Participante>>(`/api/v1/events/${id}/validar-presenca`, { uid_usuario: participanteUid })
  return data.data
}

// POST /api/v1/events/{id}/validar-presencas-lote
export async function validatePresenceBulk(id: string, participantes: string[], status: ParticipanteStatus): Promise<Participante[]> {
  const { data } = await api.post<ApiResp<Participante[]>>(`/api/v1/events/${id}/validar-presencas-lote`, { participantes, status })
  return data.data
}

// POST /api/v1/events/{id}/gerar-certificados-lote  (admin)
export async function generateCertificatesBulk(id: string): Promise<void> {
  await api.post(`/api/v1/events/${id}/gerar-certificados-lote`)
}
