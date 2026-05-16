import { api } from './client'

export type EnumValue = {
  value: string
  label: string
  order: number
  active: boolean
  metadata?: Record<string, unknown> | null
}

export type EnumMap = Record<string, EnumValue[]>

export type TenantConfig = {
  id: string
  name: string
  primary_color?: string | null
  secondary_color?: string | null
  accent_color?: string | null
  font_family?: string | null
  logo_url?: string | null
  favicon_url?: string | null
  features?: Record<string, boolean> | null
}

export type AppConfig = {
  tenant: TenantConfig
  enums: EnumMap
}

export async function fetchConfig(): Promise<AppConfig> {
  const { data } = await api.get<AppConfig>('/api/config')
  return data
}
