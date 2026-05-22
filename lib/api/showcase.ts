import { api } from './client'

type PaginatedResp<T> = {
  items: T[]
  next_cursor: string | null
  has_more: boolean
}

export type ShowcaseEvento = {
  uid: string
  titulo: string
  data_inicio: string
  categoria?: string | null
  local?: string | null
  is_online?: boolean
}

export type ShowcaseNegocio = {
  id: string
  nome: string
  descricao?: string | null
  categoria?: string | null
  tipo_negocio?: string | null
  area_atuacao?: string | null
  foto_perfil?: string | null
  foto_capa?: string | null
  website?: string | null
  created_at?: string
}

export type ShowcaseLab = {
  uid: string
  nome: string
  unidade?: string | null
  responsavel?: string | null
  tipo?: string | null
  areas_pesquisa?: string[]
}

export type ShowcaseIniciativa = {
  uid: string
  titulo: string
  tipo?: string | null
  status?: string | null
  nivel_maturidade?: string | null
}

export type ShowcaseHighlights = {
  negocios?: ShowcaseNegocio[]
  laboratorios?: ShowcaseLab[]
  eventos?: ShowcaseEvento[]
  iniciativas?: ShowcaseIniciativa[]
}

// GET /api/v1/showcase/eventos
export async function fetchShowcaseEventos(limit = 3): Promise<ShowcaseEvento[]> {
  const { data } = await api.get<PaginatedResp<ShowcaseEvento>>('/api/v1/showcase/eventos', {
    params: { limit, offset: 0 },
  })
  return data.items ?? []
}

// GET /api/v1/showcase/negocios
export async function fetchShowcaseNegocios(limit = 6): Promise<ShowcaseNegocio[]> {
  const { data } = await api.get<PaginatedResp<ShowcaseNegocio>>('/api/v1/showcase/negocios', {
    params: { limit, offset: 0 },
  })
  return data.items ?? []
}

// GET /api/v1/showcase/laboratorios
export async function fetchShowcaseLabs(limit = 6): Promise<ShowcaseLab[]> {
  const { data } = await api.get<PaginatedResp<ShowcaseLab>>('/api/v1/showcase/laboratorios', {
    params: { limit, offset: 0 },
  })
  return data.items ?? []
}

// GET /api/v1/showcase/iniciativas
export async function fetchShowcaseIniciativas(limit = 6): Promise<ShowcaseIniciativa[]> {
  const { data } = await api.get<PaginatedResp<ShowcaseIniciativa>>('/api/v1/showcase/iniciativas', {
    params: { limit, offset: 0 },
  })
  return data.items ?? []
}

// GET /api/v1/showcase/highlights
export async function fetchShowcaseHighlights(): Promise<ShowcaseHighlights> {
  const { data } = await api.get<{ data: ShowcaseHighlights }>('/api/v1/showcase/highlights')
  return data.data
}
