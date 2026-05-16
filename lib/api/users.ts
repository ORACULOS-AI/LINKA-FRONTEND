import { api } from './client'
import type { ApiResp } from './feed'

export type UserTipo = 'pesquisador' | 'estudante' | 'tecnico_admin' | 'externo'

export type UserProfile = {
  uid: string
  nome: string
  email: string
  tipo_usuario: UserTipo
  campus?: string | null
  /** Backend field name */
  foto_perfil?: string | null
  /** Alias kept for backward compat in components */
  foto_url?: string | null
  is_verified?: boolean
  is_admin?: boolean
  onboarding_complete?: boolean
  bio?: string | null
  telefone?: string | null
  // pesquisador
  lattes?: string | null
  siape?: string | null
  palavras_chave?: string[] | null
  redes_sociais?: Record<string, string> | null
  // estudante
  curso?: string | null
  matricula?: string | null
  // técnico
  setor?: string | null
  cargo?: string | null
  telefone_ramal?: string | null
  // externo
  empresa?: string | null
  cnpj?: string | null
}

export async function fetchUser(uid: string): Promise<UserProfile> {
  const { data } = await api.get<ApiResp<UserProfile>>(`/api/v1/users/${uid}`)
  return data.data
}

export async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await api.get<ApiResp<UserProfile>>('/api/v1/users/me')
  return data.data
}

export async function updateMyProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
  const { data } = await api.put<ApiResp<UserProfile>>('/api/v1/users/', { user: patch })
  return data.data
}

// POST /api/v1/users/profile-image  — multipart/form-data
export async function uploadProfileImage(file: File): Promise<{ foto_perfil: string }> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<ApiResp<{ foto_perfil: string }>>(
    '/api/v1/users/profile-image',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.data
}

// DELETE /api/v1/users/profile-image
export async function deleteProfileImage(): Promise<void> {
  await api.delete('/api/v1/users/profile-image')
}

// POST /api/v1/users/change-password
export async function changePassword(senhaAtual: string, novaSenha: string): Promise<void> {
  await api.post('/api/v1/users/change-password', { senha_atual: senhaAtual, nova_senha: novaSenha })
}

// GET /api/v1/users/{uid}/followers
export async function getUserFollowers(uid: string): Promise<UserProfile[]> {
  const { data } = await api.get<ApiResp<UserProfile[]>>(`/api/v1/users/${uid}/followers`)
  return data.data
}

// GET /api/v1/users/{uid}/following
export async function getUserFollowing(uid: string): Promise<UserProfile[]> {
  const { data } = await api.get<ApiResp<UserProfile[]>>(`/api/v1/users/${uid}/following`)
  return data.data
}

export const TIPO_LABEL: Record<UserTipo, string> = {
  pesquisador: 'Pesquisador(a)',
  estudante: 'Estudante',
  tecnico_admin: 'Técnico(a) administrativo(a)',
  externo: 'Externo',
}
