'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { Store, Briefcase, FlaskConical, Calendar, Lightbulb } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const VITRINE_LINKS = [
  { href: '/negocios',     label: 'Negócios',     icon: Briefcase },
  { href: '/laboratorios', label: 'Laboratórios', icon: FlaskConical },
  { href: '/eventos',      label: 'Eventos',       icon: Calendar },
  { href: '/iniciativas',  label: 'Iniciativas',   icon: Lightbulb },
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
        <div className="absolute left-1/2 top-full z-40 w-48 -translate-x-1/2 rounded-lg border border-border bg-surface shadow-lg">
          {VITRINE_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm text-fg-2 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-surface-2 hover:text-fg-1',
                (pathname === href || pathname.startsWith(`${href}/`)) && 'bg-mint-15 font-semibold text-fg-1',
              )}
            >
              <Icon size={16} aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
