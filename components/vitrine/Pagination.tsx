'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Paginação client-side sobre a lista já carregada/filtrada.
 *
 * As vitrines carregam o dataset completo (necessário para filtros/facetas com
 * contagem precisa) via cursor-walk; a paginação aqui é só de exibição.
 * `resetKey` deve refletir o estado de filtros/busca/ordenação: quando muda,
 * a página volta para 1.
 */
export function usePagedList<T>(items: T[], resetKey: string, pageSize = 24) {
  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [resetKey])

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize)

  return { pageItems, page: safePage, setPage, totalPages, total, pageSize }
}

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push('…')
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
}

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const go = (p: number) => {
    onPage(p)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 24, flexWrap: 'wrap' }}>
      <button className="btn btn-tertiary btn-sm" disabled={page <= 1} onClick={() => go(page - 1)}>
        <ChevronLeft size={14} /> Anterior
      </button>
      {pageNumbers(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} style={{ padding: '0 6px', color: 'var(--color-fg-4)' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className="btn btn-sm"
            style={{
              minWidth: 36,
              background: p === page ? 'var(--color-ink)' : '#fff',
              color: p === page ? '#fff' : 'var(--color-fg-1)',
              border: '1px solid var(--color-border-strong)',
            }}
          >
            {p}
          </button>
        ),
      )}
      <button className="btn btn-tertiary btn-sm" disabled={page >= totalPages} onClick={() => go(page + 1)}>
        Próxima <ChevronRight size={14} />
      </button>
    </div>
  )
}
