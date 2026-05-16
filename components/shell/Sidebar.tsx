'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Store,
  MessageCircle,
  Video,
  Bell,
  Search,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/stores/auth'

type NavItem = { href: string; label: string; icon: LucideIcon; match?: string[] }

const primary: NavItem[] = [
  { href: '/feed', label: 'Feed', icon: Home, match: ['/feed', '/inicio'] },
  { href: '/vitrine', label: 'Vitrine', icon: Store, match: ['/vitrine', '/negocios', '/laboratorios', '/eventos', '/iniciativas', '/projetos'] },
  { href: '/conexoes', label: 'Conexões', icon: Users },
  { href: '/mensagens', label: 'Mensagens', icon: MessageCircle },
  { href: '/reunioes', label: 'Reuniões', icon: Video },
  { href: '/notifs', label: 'Notificações', icon: Bell, match: ['/notifs', '/notificacoes'] },
  { href: '/busca', label: 'Busca', icon: Search },
]

const secondary: NavItem[] = [
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

const adminItem: NavItem = { href: '/admin', label: 'Admin', icon: ShieldCheck }

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false
  const targets = item.match ?? [item.href]
  return targets.some((t) => pathname === t || pathname.startsWith(`${t}/`))
}

export function Sidebar() {
  const pathname = usePathname()
  const isAdmin = useAuth((s) => Boolean(s.me?.is_admin))

  const items = [...primary, ...secondary, ...(isAdmin ? [adminItem] : [])]

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-border lg:block">
      <nav className="flex h-full flex-col gap-1 p-4">
        {items.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                active ? 'bg-ink text-paper' : 'text-ink hover:bg-surface-2',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
