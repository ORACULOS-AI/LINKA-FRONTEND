'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Home, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/stores/auth'
import { fetchUnreadCount } from '@/lib/api/notifications'
import { NotifPanel } from '@/components/notifs/NotifPanel'
import { VitrineDropdown } from '@/components/shell/VitrineDropdown'
import { SettingsDropdown } from '@/components/shell/SettingsDropdown'
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; icon: React.ReactNode; match?: string[] }

const NAV_ITEMS: NavItem[] = [
  { href: '/feed',     label: 'Feed',     icon: <Home size={20} />, match: ['/feed', '/inicio'] },
  { href: '/conexoes', label: 'Conexões', icon: <Users size={20} /> },
]

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const targets = item.match ?? [item.href]
  const active = targets.some((t) => pathname === t || pathname.startsWith(`${t}/`))
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn('nav-item', active && 'nav-item--active')}
    >
      {item.icon}
      <span className="nav-label">{item.label}</span>
    </Link>
  )
}

export function TopNav() {
  const me = useAuth((s) => s.me)
  const [notifOpen, setNotifOpen] = useState(false)

  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
    enabled: !!me,
  })

  return (
    /* bg-surface = branco no light, surface-dark no dark — igual aos cards */
    <header className="sticky top-0 z-30 h-[var(--nav-height-top)] border-b border-border bg-surface">
      {/* mesmo max-width e padding horizontal que .page para alinhar com o grid do feed */}
      <div className="flex h-full w-full items-center gap-4 px-6 lg:px-[48px]" style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Logo + search */}
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/selinka/logo-selinka-black.png"
              alt="SeLinka"
              width={96}
              height={28}
              priority
              className="dark:hidden"
            />
            <Image
              src="/selinka/logo-selinka-white.png"
              alt="SeLinka"
              width={96}
              height={28}
              priority
              className="hidden dark:block"
            />
          </Link>
        </div>

        {/* Global search */}
        <div className="hidden flex-1 max-w-md md:block">
          <GlobalSearchBar />
        </div>

        {/* Center nav */}
        <nav className="hidden items-center justify-center gap-0 lg:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          <VitrineDropdown />
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-0">
          {/* Notificações — sem label */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notificações"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((v) => !v)}
              className={cn('nav-item', notifOpen && 'nav-item--active')}
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute right-2 top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-purple px-0.5 text-[10px] font-semibold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
            {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
          </div>

          {/* Settings / Eu */}
          <SettingsDropdown />

          {/* Avatar */}
          {me ? (
            <Link
              href={`/perfil/${me.id}`}
              className="avatar-ring ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint/20 font-display text-sm font-semibold"
              aria-label={`Perfil de ${me.nome}`}
            >
              {me.nome.slice(0, 1).toUpperCase()}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}
