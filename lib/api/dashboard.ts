import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { api } from '@/lib/api'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublicDashboardData {
  comunidade: {
    total_usuarios: number
    total_conexoes: number
    total_eventos_realizados: number
  }
  destaques: {
    proximos_eventos: Array<{
      uid: string
      titulo: string
      data_inicio: string
      local: string
      categoria: string
      is_online: boolean
    }>
    negocios_destaque: Array<{
      id: string
      nome: string
      categoria: string
      area_atuacao: string
      estagio: string
      foto_perfil: string | null
      palavras_chave: string[]
    }>
    laboratorios_destaque: Array<{
      uid: string
      nome: string
      tipo: string
      unidade: string
      campus: string
      areas_pesquisa: string[]
    }>
    iniciativas_abertas: Array<{
      uid: string
      titulo: string
      tipo: string
      descricao: string
      palavras_chave: string[]
    }>
  }
  numeros: {
    total_negocios: number
    total_laboratorios: number
    total_iniciativas: number
    total_eventos: number
  }
}

export interface HomeDashboardData {
  usuario: {
    nome: string
    tipo: string
    foto_url: string | null
    campus: string
  }
  minha_rede: {
    total_conexoes: number
    solicitacoes_pendentes: number
    conexoes_recentes: Array<{
      uid: string
      nome: string
      foto_url: string | null
    }>
  }
  meus_recursos: {
    negocios: number
    iniciativas: number
    eventos_inscritos: number
  }
  proximos_eventos: Array<{
    uid: string
    titulo: string
    data_inicio: string
    local: string
    categoria: string
    is_online: boolean
  }>
  atalhos: Array<{
    label: string
    rota: string
    icone: string
  }>
  notificacoes_nao_lidas: number
  sugestoes: {
    pessoas: Array<unknown>
    iniciativas: Array<{
      uid: string
      titulo: string
      tipo: string
      descricao: string
      palavras_chave: string[]
    }>
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetches the public dashboard data without any authentication token.
 * Uses a plain axios instance to avoid the auth interceptor on `api`.
 */
export function usePublicDashboard() {
  return useQuery<PublicDashboardData>({
    queryKey: ['dashboard', 'public'],
    queryFn: async () => {
      const response = await axios.get<{ data: PublicDashboardData }>(
        `${API_BASE_URL}/dashboard/public`,
      )
      return response.data.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Fetches the authenticated home dashboard data.
 * Uses the shared `api` instance which auto-attaches the auth token.
 */
export function useHomeDashboard() {
  return useQuery<HomeDashboardData>({
    queryKey: ['dashboard', 'home'],
    queryFn: async () => {
      const response = await api.get<{ data: HomeDashboardData }>(
        '/dashboard/home',
      )
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
