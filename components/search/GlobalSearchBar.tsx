'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  User as UserIcon,
  FlaskConical,
  Briefcase,
  Lightbulb,
  Calendar,
} from 'lucide-react'
import { autocomplete, type AutocompleteHit } from '@/lib/api/search'
import { cn } from '@/lib/utils'

const TIPO_META: Record<string, { Icon: typeof UserIcon; hrefBase: string }> = {
  user: { Icon: UserIcon, hrefBase: '/perfil' },
  laboratorio: { Icon: FlaskConical, hrefBase: '/vitrine/laboratorios' },
  negocio: { Icon: Briefcase, hrefBase: '/vitrine/negocios' },
  iniciativa: { Icon: Lightbulb, hrefBase: '/vitrine/projetos' },
  evento: { Icon: Calendar, hrefBase: '/vitrine/eventos' },
}

export function GlobalSearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const ac = useQuery({
    queryKey: ['global-autocomplete', q],
    queryFn: () => autocomplete(q, 8),
    enabled: q.length >= 2,
    staleTime: 30_000,
  })

  // Fecha ao clicar fora
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-3)]" />
      <input
        type="search"
        placeholder="Buscar pessoas, labs, projetos, eventos…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => q.length >= 2 && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && q.trim()) {
            router.push(`/busca?q=${encodeURIComponent(q)}`)
            setOpen(false)
          }
          if (e.key === 'Escape') setOpen(false)
        }}
        className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
      />

      {open && q.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-80 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          {ac.isLoading ? (
            <p className="p-3 text-sm text-[var(--color-fg-3)]">Buscando…</p>
          ) : (ac.data ?? []).length === 0 ? (
            <p className="p-3 text-sm text-[var(--color-fg-3)]">Nada encontrado.</p>
          ) : (
            <ul>
              {(ac.data ?? []).map((hit: AutocompleteHit) => {
                const meta = TIPO_META[hit.tipo] ?? TIPO_META.user!
                const Icon = meta.Icon
                return (
                  <li key={`${hit.tipo}:${hit.id}`}>
                    <Link
                      href={`${meta.hrefBase}/${hit.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-2)]"
                    >
                      <Icon className="h-4 w-4 text-[var(--color-fg-3)]" />
                      <span className="min-w-0 truncate">
                        <span className="font-medium">{hit.label}</span>
                        {hit.sublabel && (
                          <span className="ml-2 text-xs text-[var(--color-fg-3)]">{hit.sublabel}</span>
                        )}
                      </span>
                    </Link>
                  </li>
                )
              })}
              <li className="border-t border-[var(--color-border)]">
                <button
                  onClick={() => {
                    router.push(`/busca?q=${encodeURIComponent(q)}`)
                    setOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-[var(--color-blue)] hover:bg-[var(--color-surface-2)]"
                >
                  Ver todos os resultados para “{q}”
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
