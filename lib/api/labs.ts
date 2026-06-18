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
  descricao?: string | null
  equipamentos?: string[]
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
  visivel?: boolean
  limit?: number
  /** Paginação é cursor-based no backend (CursorParams). `next_cursor` da página anterior. */
  cursor?: string
}

// GET /api/v1/laboratorios/
export async function listLabs(filters?: LabFilters): Promise<PaginatedLabs> {
  const { data } = await api.get<PaginatedLabs>('/api/v1/laboratorios/', { params: filters })
  return data
}

/**
 * Busca TODOS os laboratórios caminhando pelo cursor até `has_more` ser falso.
 * A vitrine faz busca/facetas/ordenação no client, então precisa do conjunto
 * completo (+300 labs) — o limite fixo anterior (48) escondia a maioria.
 * Paginação é cursor-based no backend (CursorParams: limit ≤ 100 + cursor).
 * `maxPages` é uma trava de segurança contra loops em caso de cursor inconsistente.
 */
export async function listAllLabs(
  filters?: Omit<LabFilters, 'limit' | 'cursor'>,
  pageSize = 100,
  maxPages = 100,
): Promise<LabSummary[]> {
  const all: LabSummary[] = []
  let cursor: string | undefined
  for (let i = 0; i < maxPages; i++) {
    const page = await listLabs({ ...filters, limit: pageSize, cursor })
    all.push(...page.items)
    if (!page.has_more || !page.next_cursor || page.items.length === 0) break
    cursor = page.next_cursor
  }
  return all
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

// --- Publish / Unpublish (owner toggle após aprovação) ---

// POST /api/v1/laboratorios/{uid}/publish
export async function publishLab(uid: string): Promise<Lab> {
  const { data } = await api.post<ApiResp<Lab>>(`/api/v1/laboratorios/${uid}/publish`)
  return data.data
}

// POST /api/v1/laboratorios/{uid}/unpublish
export async function unpublishLab(uid: string): Promise<Lab> {
  const { data } = await api.post<ApiResp<Lab>>(`/api/v1/laboratorios/${uid}/unpublish`)
  return data.data
}

// Claims → ver lib/api/claims.ts
