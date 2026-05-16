import { api } from './client'
import type { ApiResp } from './feed'

export type SearchHit = {
  id: string
  tipo: string
  titulo?: string | null
  nome?: string | null
  descricao?: string | null
  [key: string]: unknown
}

export type AutocompleteHit = {
  id: string
  tipo: string
  label: string
  sublabel?: string | null
}

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

// GET /api/v1/search
export async function search(filters: SearchFilters): Promise<SearchHit[]> {
  const { data } = await api.get<ApiResp<SearchHit[]>>('/api/v1/search', { params: filters })
  return data.data
}

// GET /api/v1/search/autocomplete
export async function autocomplete(q: string, limit = 10): Promise<AutocompleteHit[]> {
  const { data } = await api.get<ApiResp<AutocompleteHit[]>>('/api/v1/search/autocomplete', {
    params: { q, limit },
  })
  return data.data
}
