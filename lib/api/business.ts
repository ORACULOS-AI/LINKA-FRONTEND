import { api } from './client'
import type { ApiResp } from './feed'

export type NegocioStatus = 'pendente' | 'aprovado' | 'recusado'

export type Negocio = {
  id: string
  nome: string
  email: string
  uid_admin: string | null
  telefone: string
  tipo_negocio: string
  descricao: string
  area_atuacao: string
  estagio: string
  categoria: string
  palavras_chave?: string[]
  status: NegocioStatus
  visivel?: boolean
  claimed?: boolean
  foto_perfil?: string | null
  foto_capa?: string | null
  website?: string | null
  midias_sociais?: Record<string, string> | null
  cnpj?: string | null
  razao_social?: string | null
  campus?: string | null
  endereco?: string | null
  data_fundacao?: string | null
  metricas?: Record<string, unknown> | null
  descricao_problema?: string | null
  solucao_proposta?: string | null
  likes_count?: number
  followers_count?: number
  data_cadastro?: string
  created_at: string
  updated_at: string
}

export type NegocioCreate = {
  nome: string
  descricao: string
  categoria: string
  imagens?: string[]
  documentos?: string[]
}

export type NegocioUpdate = Partial<NegocioCreate> & { status?: NegocioStatus }

export type Member = {
  uid: string
  nome: string
  foto_perfil?: string | null
  tipo_usuario?: string
  papel?: string
}

export type PaginatedNegocios = {
  items: Negocio[]
  next_cursor: string | null
  has_more: boolean
}

// GET /api/v1/business/me
export async function getMyBusinesses(): Promise<Negocio[]> {
  const { data } = await api.get<ApiResp<Negocio[]>>('/api/v1/business/me')
  return data.data
}

// GET /api/v1/business/
// Backend (business.py:60) suporta: categoria, tipo_negocio, status (alias).
export async function listBusinesses(params?: {
  limit?: number
  offset?: number
  categoria?: string
  tipo_negocio?: string
  status?: NegocioStatus
}): Promise<PaginatedNegocios> {
  const { data } = await api.get<PaginatedNegocios>('/api/v1/business/', { params })
  return data
}

// GET /api/v1/business/showcase
export async function getBusinessShowcase(params?: { limit?: number; offset?: number }): Promise<PaginatedNegocios> {
  const { data } = await api.get<PaginatedNegocios>('/api/v1/business/showcase', { params })
  return data
}

// GET /api/v1/business/{id}
export async function getBusiness(id: string): Promise<Negocio> {
  const { data } = await api.get<ApiResp<Negocio>>(`/api/v1/business/${id}`)
  return data.data
}

// POST /api/v1/business/
export async function createBusiness(payload: NegocioCreate): Promise<Negocio> {
  const { data } = await api.post<ApiResp<Negocio>>('/api/v1/business/', payload)
  return data.data
}

// PUT /api/v1/business/{id}
export async function updateBusiness(id: string, payload: NegocioUpdate): Promise<Negocio> {
  const { data } = await api.put<ApiResp<Negocio>>(`/api/v1/business/${id}`, payload)
  return data.data
}

// DELETE /api/v1/business/{id}
export async function deleteBusiness(id: string): Promise<void> {
  await api.delete(`/api/v1/business/${id}`)
}

// PUT /api/v1/business/{id}/fotos  — multipart/form-data
export async function updateBusinessFotos(id: string, fotoPerfil?: File, fotoCapa?: File): Promise<{ foto_perfil?: string; foto_capa?: string }> {
  const form = new FormData()
  if (fotoPerfil) form.append('foto_perfil', fotoPerfil)
  if (fotoCapa) form.append('foto_capa', fotoCapa)
  const { data } = await api.put<ApiResp<{ foto_perfil?: string; foto_capa?: string }>>(
    `/api/v1/business/${id}/fotos`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}

// GET /api/v1/business/user/{user_id}
export async function getUserBusinesses(userId: string): Promise<Negocio[]> {
  const { data } = await api.get<ApiResp<Negocio[]>>(`/api/v1/business/user/${userId}`)
  return data.data
}

// --- Members ---

// GET /api/v1/business/{id}/members
export async function getBusinessMembers(id: string): Promise<Member[]> {
  const { data } = await api.get<ApiResp<Member[]>>(`/api/v1/business/${id}/members`)
  return data.data
}

// POST /api/v1/business/{id}/members
export async function addBusinessMember(id: string, memberUid: string, papel?: string): Promise<Negocio> {
  const { data } = await api.post<ApiResp<Negocio>>(`/api/v1/business/${id}/members`, { member_uid: memberUid, papel })
  return data.data
}

// DELETE /api/v1/business/{id}/members/{member_uid}
export async function removeBusinessMember(id: string, memberUid: string): Promise<void> {
  await api.delete(`/api/v1/business/${id}/members/${memberUid}`)
}

// PUT /api/v1/business/{id}/members/{member_uid}
export async function updateBusinessMemberRole(id: string, memberUid: string, papel: string): Promise<void> {
  await api.put(`/api/v1/business/${id}/members/${memberUid}`, { papel })
}

// --- Interactions (grafo polimórfico) ---
// As rotas legadas /business/{id}/like e /comment foram REMOVIDAS do backend.
// Usar o grafo polimórfico: /like/negocio/{id} e /comments/negocio/{id}.

// POST /api/v1/like/negocio/{id}
export async function likeBusiness(id: string): Promise<void> {
  await api.post(`/api/v1/like/negocio/${id}`)
}

// DELETE /api/v1/like/negocio/{id}
export async function unlikeBusiness(id: string): Promise<void> {
  await api.delete(`/api/v1/like/negocio/${id}`)
}

// POST /api/v1/comments/negocio/{id}
export async function commentOnBusiness(id: string, conteudo: string): Promise<void> {
  await api.post(`/api/v1/comments/negocio/${id}`, { conteudo })
}

// DELETE /api/v1/comments/{comment_id}
export async function deleteBusinessComment(_id: string, commentId: string): Promise<void> {
  await api.delete(`/api/v1/comments/${commentId}`)
}

// PATCH /api/v1/business/{id}/cover-url
export async function updateBusinessCoverUrl(id: string, foto_capa: string): Promise<void> {
  await api.patch(`/api/v1/business/${id}/cover-url`, { foto_capa })
}

// --- Admin ---

// PUT /api/v1/business/{id}/approve
export async function approveBusiness(id: string): Promise<Negocio> {
  const { data } = await api.put<ApiResp<Negocio>>(`/api/v1/business/${id}/approve`)
  return data.data
}

// PUT /api/v1/business/{id}/reject
export async function rejectBusiness(id: string): Promise<Negocio> {
  const { data } = await api.put<ApiResp<Negocio>>(`/api/v1/business/${id}/reject`)
  return data.data
}

// PUT /api/v1/business/admin/{id}/visibility  (sub-router admin montado em /business/admin)
export async function setBusinessVisibility(id: string, visivel: boolean): Promise<Negocio> {
  const { data } = await api.put<ApiResp<Negocio>>(`/api/v1/business/admin/${id}/visibility`, { visivel })
  return data.data
}
