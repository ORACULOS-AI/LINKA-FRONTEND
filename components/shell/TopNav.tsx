'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Bell, MessageCircle, Search } from 'lucide-react'
import { useAuth } from '@/lib/stores/auth'

export function TopNav() {
  const me = useAuth((s) => s.me)

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-paper/70 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-content items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/selinka/logo-selinka.png"
            alt="Linka"
            width={96}
            height={28}
            priority
          />
        </Link>

        <div className="hidden flex-1 max-w-md md:flex">
          <label className="relative flex w-full items-center">
            <Search
              className="absolute left-3 h-4 w-4 text-ink/50"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar pessoas, iniciativas, laboratórios…"
              className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm placeholder:text-ink/40 focus:border-ink/30 focus:outline-none"
            />
          </label>
        </div>

        <nav className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mensagens"
            className="rounded-md p-2 hover:bg-surface-2"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Notificações"
            className="rounded-md p-2 hover:bg-surface-2"
          >
            <Bell className="h-5 w-5" />
          </button>
          {me ? (
            <div
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-mint/20 font-display text-sm font-semibold"
              aria-label={`Perfil de ${me.nome}`}
            >
              {me.nome.slice(0, 1).toUpperCase()}
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
