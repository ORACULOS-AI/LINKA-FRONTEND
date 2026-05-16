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

export async function getTenantConfig(): Promise<TenantConfig> {
  const { data } = await api.get<Envelope<TenantConfig>>('/api/v1/admin/tenant')
  return data.data
}

export async function updateTenantConfig(
  payload: Partial<TenantConfig>,
): Promise<TenantConfig> {
  const { data } = await api.put<Envelope<TenantConfig>>('/api/v1/admin/tenant', payload)
  return data.data
}
