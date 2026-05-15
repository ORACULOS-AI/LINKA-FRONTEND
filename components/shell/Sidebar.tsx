'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Lightbulb,
  Briefcase,
  FlaskConical,
  Calendar,
  MessageCircle,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/inicio', label: 'Início', icon: Home },
  { href: '/conexoes', label: 'Conexões', icon: Users },
  { href: '/iniciativas', label: 'Iniciativas', icon: Lightbulb },
  { href: '/negocios', label: 'Negócios', icon: Briefcase },
  { href: '/laboratorios', label: 'Laboratórios', icon: FlaskConical },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/mensagens', label: 'Mensagens', icon: MessageCircle },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-border lg:block">
      <nav className="flex h-full flex-col gap-1 p-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-ink text-paper'
                  : 'text-ink hover:bg-surface-2',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
