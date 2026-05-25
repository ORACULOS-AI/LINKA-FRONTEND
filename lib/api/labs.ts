import { api } from './client'
import type { ApiResp } from './feed'

export type TipoLaboratorio = string
export type StatusLaboratorio = string

export type LabSummary = {
  uid: string
  nome: string
  unidade: string
  responsavel: string
  tipo: TipoLaboratorio
  status: StatusLaboratorio
  campus?: string | null
  areas_pesquisa: string[]
  created_at: string
  uid_admin?: string | null
  claimed?: boolean
}

export type Lab = LabSummary & {
  subunidade?: string | null
  telefone: string
  email: string
  visivel: boolean
  pesquisadores?: string[]
  [key: string]: unknown
}

export type LabStats = {
  total_laboratorios: number
  por_tipo: Record<string, number>
  por_status: Record<string, number>
  por_unidade: Record<string, number>
  por_campus: Record<string, number>
}

export type LabCreate = {
  nome: string
  unidade: string
  responsavel: string
  telefone: string
  email: string
  tipo: TipoLaboratorio
  areas_pesquisa: string[]
  subunidade?: string | null
  campus?: string | null
  visivel?: boolean
  [key: string]: unknown
}

export type LabUpdate = Partial<LabCreate>

export type PaginatedLabs = {
  items: LabSummary[]
  next_cursor: string | null
  has_more: boolean
}

export type LabFilters = {
  unidade?: string
  campus?: string
  tipo?: TipoLaboratorio
  status?: StatusLaboratorio
  area_pesquisa?: string
  responsavel?: string
  visivel?: boolean
  limit?: number
  offset?: number
}

// GET /api/v1/laboratorios/
export async function listLabs(filters?: LabFilters): Promise<PaginatedLabs> {
  const { data } = await api.get<PaginatedLabs>('/api/v1/laboratorios/', { params: filters })
  return data
}

// GET /api/v1/laboratorios/stats
export async function getLabStats(): Promise<LabStats> {
  const { data } = await api.get<ApiResp<LabStats>>('/api/v1/laboratorios/stats')
  return data.data
}

// GET /api/v1/laboratorios/me
export async function getMyLabs(): Promise<LabSummary[]> {
  const { data } = await api.get<ApiResp<LabSummary[]>>('/api/v1/laboratorios/me')
  return data.data
}

// GET /api/v1/laboratorios/user/{uid} — labs administrados por um usuário (perfil de terceiros)
export async function getLabsByUser(uid: string): Promise<LabSummary[]> {
  const { data } = await api.get<ApiResp<LabSummary[]>>(`/api/v1/laboratorios/user/${uid}`)
  return data.data
}

// POST /api/v1/laboratorios/
export async function createLab(payload: LabCreate): Promise<Lab> {
  const { data } = await api.post<ApiResp<Lab>>('/api/v1/laboratorios/', payload)
  return data.data
}

// GET /api/v1/laboratorios/{uid}
export async function getLab(uid: string): Promise<Lab> {
  const { data } = await api.get<ApiResp<Lab>>(`/api/v1/laboratorios/${uid}`)
  return data.data
}

// PUT /api/v1/laboratorios/{uid}
export async function updateLab(uid: string, payload: LabUpdate): Promise<Lab> {
  const { data } = await api.put<ApiResp<Lab>>(`/api/v1/laboratorios/${uid}`, payload)
  return data.data
}

// DELETE /api/v1/laboratorios/{uid}
export async function deleteLab(uid: string): Promise<void> {
  await api.delete(`/api/v1/laboratorios/${uid}`)
}

// PUT /api/v1/laboratorios/{uid}/fotos  — multipart/form-data
export async function updateLabFotos(uid: string, fotoPerfil?: File, fotoCapa?: File): Promise<{ foto_perfil?: string; foto_capa?: string }> {
  const form = new FormData()
  if (fotoPerfil) form.append('foto_perfil', fotoPerfil)
  if (fotoCapa) form.append('foto_capa', fotoCapa)
  const { data } = await api.put<ApiResp<{ foto_perfil?: string; foto_capa?: string }>>(
    `/api/v1/laboratorios/${uid}/fotos`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}

// POST /api/v1/laboratorios/{uid}/pesquisadores/{pesquisador_uid}
export async function addLabResearcher(uid: string, pesquisadorUid: string): Promise<Lab> {
  const { data } = await api.post<ApiResp<Lab>>(`/api/v1/laboratorios/${uid}/pesquisadores/${pesquisadorUid}`)
  return data.data
}

// DELETE /api/v1/laboratorios/{uid}/pesquisadores/{pesquisador_uid}
export async function removeLabResearcher(uid: string, pesquisadorUid: string): Promise<Lab> {
  const { data } = await api.delete<ApiResp<Lab>>(`/api/v1/laboratorios/${uid}/pesquisadores/${pesquisadorUid}`)
  return data.data
}

// --- Admin ---

// PUT /api/v1/laboratorios/{uid}/approve  (admin)
export async function approveLab(uid: string): Promise<Lab> {
  const { data } = await api.put<ApiResp<Lab>>(`/api/v1/laboratorios/${uid}/approve`)
  return data.data
}

// PUT /api/v1/laboratorios/{uid}/reject  (admin)
export async function rejectLab(uid: string): Promise<Lab> {
  const { data } = await api.put<ApiResp<Lab>>(`/api/v1/laboratorios/${uid}/reject`)
  return data.data
}

// PATCH /api/v1/laboratorios/{uid}/cover-url
export async function updateLabCoverUrl(uid: string, foto_capa: string): Promise<void> {
  await api.patch(`/api/v1/laboratorios/${uid}/cover-url`, { foto_capa })
}

// Claims → ver lib/api/claims.ts
