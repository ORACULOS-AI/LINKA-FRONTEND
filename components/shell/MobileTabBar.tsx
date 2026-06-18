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
import { VITRINE_LINKS, VITRINE_MATCH } from './vitrineLinks'

type Tab = { href: string; label: string; icon: LucideIcon; match?: string[] }

const FEED_TAB: Tab = { href: '/feed', label: 'Feed', icon: Home, match: ['/feed', '/inicio'] }
const VITRINE_TAB: Tab = { href: '/negocios', label: 'Vitrine', icon: Store, match: VITRINE_MATCH }
const RIGHT_TABS: Tab[] = [
  { href: '/mensagens', label: 'Mensagens', icon: MessageCircle },
  { href: '/perfil', label: 'Perfil', icon: User },
]

function isActive(pathname: string | null, tab: Tab): boolean {
  if (!pathname) return false
  const targets = tab.match ?? [tab.href]
  return targets.some((t) => pathname === t || pathname.startsWith(`${t}/`))
}

type SheetKind = 'none' | 'create' | 'vitrine'

export function MobileTabBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [sheet, setSheet] = useState<SheetKind>('none')

  const go = (href: string) => {
    setSheet('none')
    router.push(href)
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex min-h-[var(--nav-height-bottom)] items-stretch border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden">
        <TabLink tab={FEED_TAB} active={isActive(pathname, FEED_TAB)} />

        <TabButton
          tab={VITRINE_TAB}
          active={isActive(pathname, VITRINE_TAB)}
          onClick={() => setSheet('vitrine')}
        />

        <button
          type="button"
          aria-label="Criar"
          onClick={() => setSheet('create')}
          className="relative flex flex-1 items-center justify-center"
        >
          <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-md">
            <Plus className="h-6 w-6" aria-hidden />
          </span>
        </button>

        {RIGHT_TABS.map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab)} />
        ))}
      </nav>

      {sheet === 'create' && (
        <ActionSheet title="Criar" items={CREATE_ACTIONS} onClose={() => setSheet('none')} onGo={go} />
      )}
      {sheet === 'vitrine' && (
        <ActionSheet title="Vitrine" items={VITRINE_ACTIONS} onClose={() => setSheet('none')} onGo={go} />
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

function TabButton({ tab, active, onClick }: { tab: Tab; active: boolean; onClick: () => void }) {
  const Icon = tab.icon
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      aria-haspopup="dialog"
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors duration-150',
        active ? 'text-fg-1' : 'text-fg-3',
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {tab.label}
    </button>
  )
}

type SheetItem = {
  label: string
  icon: LucideIcon
  href?: string
  desc?: string
  disabled?: boolean
  external?: boolean
}

const CREATE_ACTIONS: SheetItem[] = [
  { label: 'Publicar', icon: PenSquare, href: '/feed?compor=1', desc: 'Compartilhe uma atualização' },
  { label: 'Criar projeto', icon: Lightbulb, href: '/vitrine/projetos/novo', desc: 'Abra um novo projeto' },
  { label: 'Criar evento', icon: Calendar, href: '/vitrine/eventos/novo', desc: 'Organize um encontro' },
  { label: 'Iniciar conversa', icon: Send, href: '/mensagens?novo=1', desc: 'Mensagem direta a um contato mútuo' },
  { label: 'Reuniões', icon: Video, href: '/reunioes', desc: 'Entrar ou criar uma reunião de vídeo' },
]

const VITRINE_ACTIONS: SheetItem[] = VITRINE_LINKS.map((l) => (
  l.disabled
    ? { label: l.label, icon: l.icon, disabled: true }
    : { label: l.label, icon: l.icon, href: l.href, external: l.external }
))

function ActionSheet({
  title,
  items,
  onClose,
  onGo,
}: {
  title: string
  items: SheetItem[]
  onClose: () => void
  onGo: (href: string) => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 flex items-end bg-ink/60 lg:hidden"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-lg bg-surface p-4 pb-[calc(env(safe-area-inset-bottom)+2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-fg-4" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
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
          {items.map((a) => (
            <li key={a.href ?? a.label}>
              <button
                type="button"
                disabled={a.disabled}
                onClick={() => {
                  if (!a.href || a.disabled) return
                  if (a.external) {
                    setTimeout(() => window.open(a.href, '_blank', 'noopener,noreferrer'), 0)
                    onClose()
                    return
                  }
                  onGo(a.href)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-surface-2',
                  a.disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-2 text-fg-1">
                  <a.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex flex-col">
                  <span className="font-medium">{a.label}</span>
                  {a.desc && <span className="text-xs text-fg-3">{a.desc}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
