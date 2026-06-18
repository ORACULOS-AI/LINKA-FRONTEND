import { api } from './client'
import type { ApiResp } from './feed'

export type SearchHit = {
  id: string
  tipo: SearchEntityType
  titulo?: string | null
  nome?: string | null
  descricao?: string | null
  [key: string]: unknown
}

export type AutocompleteHit = {
  id: string
  tipo: SearchEntityType
  label: string
  sublabel?: string | null
}

export type SearchEntityType = 'user' | 'laboratorio' | 'negocio' | 'iniciativa' | 'evento' | 'post'

export type SearchFilters = {
  q: string
  type?: 'user' | 'laboratorio' | 'negocio' | 'iniciativa' | 'evento' | 'all'
  area?: string
  institution?: string
  campus?: string
  verified?: boolean
  limit?: number
  offset?: number
}

export type SearchResult = {
  items: SearchHit[]
  total: number
  next_offset: number | null
  has_more: boolean
}

function normalizeType(raw: unknown): SearchEntityType | null {
  const value = String(raw ?? '').toLowerCase().trim()
  if (['laboratorio', 'laboratório', 'laboratorios', 'laboratórios', 'lab', 'labs'].includes(value)) return 'laboratorio'
  if (['negocio', 'negócio', 'negocios', 'negócios', 'business'].includes(value)) return 'negocio'
  if (['iniciativa', 'iniciativas', 'initiative', 'projeto', 'projetos'].includes(value)) return 'iniciativa'
  if (['evento', 'eventos', 'event'].includes(value)) return 'evento'
  if (['post', 'posts', 'publicacao', 'publicação'].includes(value)) return 'post'
  if (['user', 'usuario', 'usuário', 'pessoa', 'pessoas'].includes(value)) return 'user'
  return null
}

function normalizeHit<T extends Record<string, unknown>>(hit: T): T & { id: string; tipo: SearchEntityType } {
  return {
    ...hit,
    id: String(hit.id ?? hit.uid ?? ''),
    tipo:
      normalizeType(hit.entity_type) ??
      normalizeType(hit.type) ??
      normalizeType(hit.kind) ??
      normalizeType(hit.search_type) ??
      normalizeType(hit.tipo) ??
      'user',
  }
}

// GET /api/v1/search — backend envelopa: { data: { items, total, next_offset, has_more } }
export async function search(filters: SearchFilters): Promise<SearchHit[]> {
  const { data } = await api.get<ApiResp<SearchResult>>('/api/v1/search', { params: filters })
  return (data.data?.items ?? []).map(normalizeHit)
}

// Variante paginada (offset-based) para quando total/has_more forem necessários.
export async function searchPaged(filters: SearchFilters): Promise<SearchResult> {
  const { data } = await api.get<ApiResp<SearchResult>>('/api/v1/search', { params: filters })
  return {
    ...data.data,
    items: (data.data?.items ?? []).map(normalizeHit),
  }
}

// GET /api/v1/search/autocomplete
export async function autocomplete(q: string, limit = 10): Promise<AutocompleteHit[]> {
  const { data } = await api.get<ApiResp<AutocompleteHit[]>>('/api/v1/search/autocomplete', {
    params: { q, limit },
  })
  return (data.data ?? []).map(normalizeHit)
}
