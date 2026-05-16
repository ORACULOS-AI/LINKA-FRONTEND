import { create } from 'zustand'
import type { AppConfig, EnumValue } from '@/lib/api/config'

type ConfigState = {
  config: AppConfig | null
  loaded: boolean
  setConfig: (cfg: AppConfig) => void
  reset: () => void
  getEnum: (key: string) => EnumValue[]
  getEnumLabel: (key: string, value: string | null | undefined) => string | undefined
  getFeature: (key: string) => boolean
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  loaded: false,
  setConfig: (cfg) => set({ config: cfg, loaded: true }),
  reset: () => set({ config: null, loaded: false }),
  getEnum: (key) => {
    const cfg = get().config
    if (!cfg) return []
    return (cfg.enums[key] ?? []).filter((v) => v.active)
  },
  getEnumLabel: (key, value) => {
    if (value == null) return undefined
    const cfg = get().config
    if (!cfg) return undefined
    return cfg.enums[key]?.find((v) => v.value === value)?.label
  },
  getFeature: (key) => {
    const features = get().config?.tenant.features
    if (!features) return true
    return features[key] !== false
  },
}))
