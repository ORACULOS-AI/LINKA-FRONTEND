import { api } from './client'
import type { EnumValue, TenantConfig } from './config'

type Envelope<T> = { data: T }

export type AdminEnumGroup = {
  enum_key: string
  values: EnumValue[]
}

export async function listAdminEnums(): Promise<AdminEnumGroup[]> {
  const { data } = await api.get<Envelope<AdminEnumGroup[]>>('/api/v1/admin/enums')
  return data.data ?? []
}

export async function createEnumValue(
  enumKey: string,
  value: string,
  payload: { label: string; order?: number; active?: boolean; metadata?: Record<string, unknown> },
): Promise<void> {
  await api.post(`/api/v1/admin/enums/${enumKey}/values/${value}`, payload)
}

export async function updateEnumValue(
  enumKey: string,
  value: string,
  payload: Partial<{ label: string; order: number; active: boolean; metadata: Record<string, unknown> }>,
): Promise<void> {
  await api.put(`/api/v1/admin/enums/${enumKey}/values/${value}`, payload)
}

export async function deleteEnumValue(enumKey: string, value: string): Promise<void> {
  await api.delete(`/api/v1/admin/enums/${enumKey}/values/${value}`)
}

// GET /api/v1/tenant-config — router `tenant` (público, lê do header X-Tenant ou 'default')
export async function getTenantConfig(): Promise<TenantConfig> {
  const { data } = await api.get<Envelope<TenantConfig>>('/api/v1/tenant-config')
  return data.data
}

// TODO(B-FE6): backend ainda não expõe escrita de tenant-config (router `tenant` é GET-only).
// Mantido no namespace canônico /tenant-config para quando o PUT admin existir; até lá
// a chamada falha graciosamente (toastApiError na página admin).
export async function updateTenantConfig(
  payload: Partial<TenantConfig>,
): Promise<TenantConfig> {
  const { data } = await api.put<Envelope<TenantConfig>>('/api/v1/tenant-config', payload)
  return data.data
}

// --- Claim tokens (email-based attribution) ---

export type ClaimTokenAdmin = {
  token: string
  email: string
  resource_type: string
  resource_id: string
  resource_name: string | null
  created_at: string
  expires_at: string
  claimed: boolean
  claimed_at?: string | null
}

export type ClaimTokenCreate = {
  resource_type: 'laboratorio' | 'negocio'
  resource_id: string
  resource_name: string
  email: string
  expires_in_days?: number
}

export async function createClaimToken(payload: ClaimTokenCreate): Promise<ClaimTokenAdmin> {
  const { data } = await api.post<Envelope<ClaimTokenAdmin>>('/api/v1/admin/claim-tokens/', payload)
  return data.data
}

export async function listClaimTokens(params?: {
  status?: 'ativo' | 'usado' | 'expirado'
  limit?: number
}): Promise<{ items: ClaimTokenAdmin[]; next_cursor?: string | null; has_more?: boolean }> {
  const { data } = await api.get<{ items: ClaimTokenAdmin[]; next_cursor?: string | null; has_more?: boolean }>(
    '/api/v1/admin/claim-tokens/',
    { params },
  )
  return data
}

export async function deleteClaimToken(token: string): Promise<void> {
  await api.delete(`/api/v1/admin/claim-tokens/${token}`)
}

// --- Audit log ---

export type AuditLogEntry = {
  id: string
  actor_uid: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export async function listAuditLog(params?: {
  actor?: string
  resource_type?: string
  resource_id?: string
  action?: string
  limit?: number
  before_id?: string
}): Promise<AuditLogEntry[]> {
  const { data } = await api.get<Envelope<AuditLogEntry[]>>('/api/v1/audit-log', { params })
  return data.data ?? []
}
