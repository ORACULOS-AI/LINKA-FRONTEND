'use client'

import Link from 'next/link'
import Image from 'next/image'
import { EmptyState } from '@/components/primitives'

export type MemberItem = {
  uid: string
  nome: string
  foto_perfil?: string | null
  papel?: string | null
  href?: string | null
}

function initials(nome: string) {
  return nome.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?'
}

export function MemberList({
  items,
  emptyTitle = 'Nenhum membro vinculado',
  emptyDescription,
}: {
  items: MemberItem[]
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((m) => {
        const inner = (
          <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 transition-colors duration-fast ease-standard hover:bg-surface-2">
            {m.foto_perfil ? (
              <Image
                src={m.foto_perfil}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-15 font-display text-sm font-semibold text-purple">
                {initials(m.nome)}
              </span>
            )}
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-fg-1">{m.nome}</span>
              {m.papel && (
                <span className="truncate text-xs uppercase tracking-wide text-fg-3">{m.papel}</span>
              )}
            </span>
          </div>
        )

        return (
          <li key={m.uid}>
            {m.href ? (
              <Link href={m.href} className="block">{inner}</Link>
            ) : (
              inner
            )}
          </li>
        )
      })}
    </ul>
  )
}
