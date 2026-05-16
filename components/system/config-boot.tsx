'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchConfig } from '@/lib/api/config'
import { useConfigStore } from '@/lib/stores/config'
import { applyTenantTheme } from '@/lib/theme/apply'

export function ConfigBoot() {
  const setConfig = useConfigStore((s) => s.setConfig)

  const { data } = useQuery({
    queryKey: ['config'],
    queryFn: fetchConfig,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
  })

  useEffect(() => {
    if (!data) return
    setConfig(data)
    applyTenantTheme(data.tenant)
  }, [data, setConfig])

  return null
}
