'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { Store, Briefcase, FlaskConical, Calendar, Lightbulb, Cpu, BookOpen, type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type VitrineLink =
  | { href: string; label: string; icon: LucideIcon; external?: false; disabled?: false }
  | { href: string; label: string; icon: LucideIcon; external: true; disabled?: false }
  | { label: string; icon: LucideIcon; disabled: true }

const VITRINE_LINKS: VitrineLink[] = [
  { href: '/negocios', label: 'Negócios', icon: Briefcase },
  { href: '/laboratorios', label: 'Laboratórios', icon: FlaskConical },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: '/iniciativas', label: 'Iniciativas', icon: Lightbulb },
  { href: 'https://ufcinova.ufc.br/pt/vitrine-tecnologica/', label: 'Vitrine Tecnológica', icon: Cpu, external: true },
  { label: 'Saberes (Em breve)', icon: BookOpen, disabled: true },
]

const VITRINE_MATCH = ['/vitrine', '/negocios', '/laboratorios', '/eventos', '/iniciativas', '/projetos']

export function VitrineDropdown() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const active = VITRINE_MATCH.some((m) => pathname === m || pathname.startsWith(`${m}/`))

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/vitrine"
        aria-current={active ? 'page' : undefined}
        className={cn('nav-item', active && 'nav-item--active')}
      >
        <Store size={20} aria-hidden />
        <span className="nav-label">Vitrine</span>
      </Link>

      {open && (
        <div className="absolute left-1/2 top-full z-40 w-60 -translate-x-1/2 rounded-lg border border-border bg-surface shadow-lg">
          {VITRINE_LINKS.map((item) => {
            const Icon = item.icon
            return item.disabled ? (
              <span
                key={item.label}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 px-4 py-2.5 text-sm text-fg-3 opacity-60 first:rounded-t-lg last:rounded-b-lg"
              >
                <Icon size={16} aria-hidden />
                {item.label}
              </span>
            ) : item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg-2 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-surface-2 hover:text-fg-1"
              >
                <Icon size={16} aria-hidden />
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm text-fg-2 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-surface-2 hover:text-fg-1',
                  (pathname === item.href || pathname.startsWith(`${item.href}/`)) && 'bg-mint-15 font-semibold text-fg-1',
                )}
              >
                <Icon size={16} aria-hidden />
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
