import { useMemo } from 'react'
import { useConfigStore } from '@/lib/stores/config'
import type { EnumValue } from '@/lib/api/config'

export function useEnum(key: string): EnumValue[] {
  const raw = useConfigStore((s) => s.config?.enums[key] ?? null)
  return useMemo(() => (raw ?? []).filter((v) => v.active), [raw])
}

export function useEnumLabel(key: string, value: string | null | undefined): string | undefined {
  return useConfigStore((s) => s.getEnumLabel(key, value))
}

export function useFeature(key: string): boolean {
  return useConfigStore((s) => s.getFeature(key))
}
