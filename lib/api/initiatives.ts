import { api } from './client'
import type { ApiResp } from './feed'

export type StatusIniciativa =
  | 'PENDENTE' | 'ATIVA' | 'PAUSADA' | 'CONCLUIDA' | 'CANCELADA' | 'RECUSADA'

export type TipoIniciativa =
  | 'PESQUISA' | 'INOVACAO' | 'EMPREENDEDORISMO' | 'EXTENSAO'
  | 'DESENVOLVIMENTO' | 'CONSULTORIA' | 'OUTROS'

export type NivelMaturidade =
  | 'CONCEITO' | 'PROTOTIPO' | 'DEMONSTRACAO' | 'COMERCIALIZACAO'

export type PapelIniciativa =
  | 'COORDENADOR' | 'MEMBRO' | 'COLABORADOR' | 'CONSULTOR'

export type StatusVinculo = 'PENDENTE' | 'ACEITO' | 'RECUSADO'

export type ParticipanteIniciativa = {
  uid: string
  papel: PapelIniciativa
  status_vinculo: StatusVinculo
  data_inicio: string
  data_fim?: string | null
  dedicacao_horas?: number | null
  data_ultima_atualizacao: string
}

export type Iniciativa = {
  uid: string
  uid_owner: string
  titulo: string
  descricao: string
  status: StatusIniciativa
  tipo: TipoIniciativa
  visivel: boolean
  data_inicio: string
  data_fim?: string | null
  host_type: 'user' | 'negocio' | 'laboratorio'
  host_id: string
  nivel_maturidade: NivelMaturidade
  areas_conhecimento: string[]
  tecnologias_utilizadas: string[]
  ods_relacionados: string[]
  impacto_esperado?: string | null
  metricas_sucesso: string[]
  publico_alvo?: string | null
  orcamento_previsto?: number | null
  moeda: string
  fonte_financiamento?: string | null
  tem_propriedade_intelectual: boolean
  tipo_propriedade?: string | null
  aceita_colaboradores: boolean
  colaboracao_internacional: boolean
  laboratorios: string[]
  palavras_chave: string[]
  recursos_necessarios?: string | null
  resultados_esperados?: string | null
  participantes: ParticipanteIniciativa[]
  seguidores: string[]
  favoritos: string[]
  created_at: string
  updated_at: string
}

export type IniciativaCreate = {
  titulo: string
  descricao: string
  tipo: TipoIniciativa
  host_type: 'user' | 'negocio' | 'laboratorio'
  host_id: string
  data_inicio: string
  data_fim?: string | null
  nivel_maturidade?: NivelMaturidade
  areas_conhecimento?: string[]
  tecnologias_utilizadas?: string[]
  ods_relacionados?: string[]
  impacto_esperado?: string | null
  metricas_sucesso?: string[]
  publico_alvo?: string | null
  orcamento_previsto?: number | null
  moeda?: string
  fonte_financiamento?: string | null
  tem_propriedade_intelectual?: boolean
  tipo_propriedade?: string | null
  aceita_colaboradores?: boolean
  colaboracao_internacional?: boolean
  laboratorios?: string[]
  palavras_chave?: string[]
  recursos_necessarios?: string | null
  resultados_esperados?: string | null
}

export type IniciativaUpdate = Partial<IniciativaCreate> & { status?: StatusIniciativa; visivel?: boolean }

export type PaginatedIniciativas = {
  items: Iniciativa[]
  next_cursor: string | null
  has_more: boolean
}

// GET /api/v1/initiatives/me
export async function getMyInitiatives(): Promise<Iniciativa[]> {
  const { data } = await api.get<ApiResp<Iniciativa[]>>('/api/v1/initiatives/me')
  return data.data
}

// GET /api/v1/initiatives/
export async function listInitiatives(params?: { limit?: number; offset?: number }): Promise<PaginatedIniciativas> {
  const { data } = await api.get<PaginatedIniciativas>('/api/v1/initiatives/', { params })
  return data
}

// GET /api/v1/initiatives/admin  (admin only — pending approval queue)
export async function listAdminInitiatives(): Promise<Iniciativa[]> {
  const { data } = await api.get<ApiResp<Iniciativa[]>>('/api/v1/initiatives/admin')
  return data.data
}

// GET /api/v1/initiatives/business/{business_id}
export async function getInitiativesByBusiness(businessId: string): Promise<Iniciativa[]> {
  const { data } = await api.get<ApiResp<Iniciativa[]>>(`/api/v1/initiatives/business/${businessId}`)
  return data.data
}

// GET /api/v1/initiatives/user/{user_id}
export async function getInitiativesByUser(userId: string): Promise<Iniciativa[]> {
  const { data } = await api.get<ApiResp<Iniciativa[]>>(`/api/v1/initiatives/user/${userId}`)
  return data.data
}

// POST /api/v1/initiatives/
export async function createInitiative(payload: IniciativaCreate): Promise<Iniciativa> {
  const { data } = await api.post<ApiResp<Iniciativa>>('/api/v1/initiatives/', payload)
  return data.data
}

// GET /api/v1/initiatives/{id}
export async function getInitiative(id: string): Promise<Iniciativa> {
  const { data } = await api.get<ApiResp<Iniciativa>>(`/api/v1/initiatives/${id}`)
  return data.data
}

// PUT /api/v1/initiatives/{id}
export async function updateInitiative(id: string, payload: IniciativaUpdate): Promise<Iniciativa> {
  const { data } = await api.put<ApiResp<Iniciativa>>(`/api/v1/initiatives/${id}`, payload)
  return data.data
}

// DELETE /api/v1/initiatives/{id}
export async function deleteInitiative(id: string): Promise<void> {
  await api.delete(`/api/v1/initiatives/${id}`)
}

// POST /api/v1/initiatives/{id}/participantes/{user_uid}
export async function addInitiativeParticipant(id: string, userUid: string): Promise<void> {
  await api.post(`/api/v1/initiatives/${id}/participantes/${userUid}`)
}

// DELETE /api/v1/initiatives/{id}/participantes/{user_uid}
export async function removeInitiativeParticipant(id: string, userUid: string): Promise<void> {
  await api.delete(`/api/v1/initiatives/${id}/participantes/${userUid}`)
}

// --- Interactions (grafo polimórfico) ---
// /initiatives/{id}/follow foi REMOVIDO (SLK-130). Usar /follow/iniciativa/{id}.

// POST /api/v1/follow/iniciativa/{id}
export async function followInitiative(id: string): Promise<void> {
  await api.post(`/api/v1/follow/iniciativa/${id}`)
}

// DELETE /api/v1/follow/iniciativa/{id}
export async function unfollowInitiative(id: string): Promise<void> {
  await api.delete(`/api/v1/follow/iniciativa/${id}`)
}

// --- Participants (invites) ---

// POST /api/v1/initiatives/{id}/invite/{user_id}/{papel}
export async function inviteToInitiative(id: string, userId: string, papel: PapelIniciativa): Promise<void> {
  await api.post(`/api/v1/initiatives/${id}/invite/${userId}/${papel}`)
}

// POST /api/v1/initiatives/{id}/accept-invite
export async function acceptInitiativeInvite(id: string): Promise<void> {
  await api.post(`/api/v1/initiatives/${id}/accept-invite`)
}

// POST /api/v1/initiatives/{id}/reject-invite
export async function rejectInitiativeInvite(id: string): Promise<void> {
  await api.post(`/api/v1/initiatives/${id}/reject-invite`)
}

// POST /api/v1/initiatives/{id}/leave
export async function leaveInitiative(id: string): Promise<void> {
  await api.post(`/api/v1/initiatives/${id}/leave`)
}

// DELETE /api/v1/initiatives/{id}/remove-participant/{user_id}
export async function removeParticipantFromInitiative(id: string, userId: string): Promise<void> {
  await api.delete(`/api/v1/initiatives/${id}/remove-participant/${userId}`)
}

// --- Admin ---

// PUT /api/v1/initiatives/{id}/approve  (admin)
export async function approveInitiative(id: string): Promise<void> {
  await api.put(`/api/v1/initiatives/${id}/approve`)
}

// PUT /api/v1/initiatives/{id}/reject  (admin)
export async function rejectInitiative(id: string): Promise<void> {
  await api.put(`/api/v1/initiatives/${id}/reject`)
}

// PUT /api/v1/initiatives/{id}/status  (admin)
export async function setInitiativeStatus(id: string, status: StatusIniciativa): Promise<void> {
  await api.put(`/api/v1/initiatives/${id}/status`, { status })
}
