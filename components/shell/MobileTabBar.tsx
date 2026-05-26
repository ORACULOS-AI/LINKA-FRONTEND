'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Home,
  Store,
  Plus,
  MessageCircle,
  User,
  PenSquare,
  Lightbulb,
  Calendar,
  Send,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = { href: string; label: string; icon: LucideIcon; match?: string[] }

const tabs: Tab[] = [
  { href: '/feed', label: 'Feed', icon: Home, match: ['/feed', '/inicio'] },
  { href: '/negocios', label: 'Vitrine', icon: Store, match: ['/vitrine', '/negocios', '/laboratorios', '/eventos', '/iniciativas', '/projetos'] },
  // FAB ocupa o slot do meio
  { href: '/mensagens', label: 'Mensagens', icon: MessageCircle },
  { href: '/perfil', label: 'Perfil', icon: User },
]

function isActive(pathname: string | null, tab: Tab): boolean {
  if (!pathname) return false
  const targets = tab.match ?? [tab.href]
  return targets.some((t) => pathname === t || pathname.startsWith(`${t}/`))
}

export function MobileTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)

  const go = (href: string) => {
    setSheetOpen(false)
    router.push(href)
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[var(--nav-height-bottom)] items-stretch border-t border-border bg-bg lg:hidden">
        {tabs.slice(0, 2).map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab)} />
        ))}

        <button
          type="button"
          aria-label="Criar"
          onClick={() => setSheetOpen(true)}
          className="relative flex flex-1 items-center justify-center"
        >
          <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-md">
            <Plus className="h-6 w-6" aria-hidden />
          </span>
        </button>

        {tabs.slice(2).map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab)} />
        ))}
      </nav>

      {sheetOpen && (
        <ActionSheet onClose={() => setSheetOpen(false)} onGo={go} />
      )}
    </>
  )
}

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon
  return (
    <Link
      href={tab.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors duration-150',
        active ? 'text-fg-1' : 'text-fg-3',
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {tab.label}
    </Link>
  )
}

type Action = { label: string; icon: LucideIcon; href: string; desc: string }

const ACTIONS: Action[] = [
  { label: 'Publicar', icon: PenSquare, href: '/feed?compor=1', desc: 'Compartilhe uma atualização' },
  { label: 'Criar projeto', icon: Lightbulb, href: '/vitrine/projetos/novo', desc: 'Abra um novo projeto' },
  { label: 'Criar evento', icon: Calendar, href: '/vitrine/eventos/novo', desc: 'Organize um encontro' },
  { label: 'Iniciar conversa', icon: Send, href: '/mensagens?novo=1', desc: 'Mensagem direta a um contato mútuo' },
  { label: 'Reuniões', icon: Video, href: '/reunioes', desc: 'Entrar ou criar uma reunião de vídeo' },
]

function ActionSheet({ onClose, onGo }: { onClose: () => void; onGo: (href: string) => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ações rápidas"
      className="fixed inset-0 z-40 flex items-end bg-ink/60 lg:hidden"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-lg bg-surface p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-fg-4" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Criar</h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-full p-1.5 text-fg-3 hover:bg-surface-2"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <ul className="grid grid-cols-1 gap-1">
          {ACTIONS.map((a) => (
            <li key={a.href}>
              <button
                type="button"
                onClick={() => onGo(a.href)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-surface-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-2 text-fg-1">
                  <a.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex flex-col">
                  <span className="font-medium">{a.label}</span>
                  <span className="text-xs text-fg-3">{a.desc}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
