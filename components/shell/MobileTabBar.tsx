'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Bell, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/inicio', label: 'Início', icon: Home },
  { href: '/conexoes', label: 'Rede', icon: Users },
  { href: '/notificacoes', label: 'Avisos', icon: Bell },
  { href: '/mensagens', label: 'Conversas', icon: MessageCircle },
  { href: '/perfil', label: 'Perfil', icon: User },
]

export function MobileTabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-stretch border-t border-border bg-paper lg:hidden">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname?.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors duration-150',
              active ? 'text-ink' : 'text-ink/55',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
