'use client'

import { type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, FlaskConical, Lightbulb, Calendar, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const VITRINE_TABS = [
  { href: '/vitrines/laboratorios', label: 'Laboratórios', Icon: FlaskConical },
  { href: '/vitrines/negocios',     label: 'Negócios',     Icon: Briefcase },
  { href: '/vitrines/projetos',     label: 'Projetos',     Icon: Lightbulb },
  { href: '/vitrines/eventos',      label: 'Eventos',      Icon: Calendar },
]

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''

  return (
    <div className="landing fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="landing-nav">
        <Link href="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Image src="/selinka/logo-selinka.png" alt="SeLinka" width={120} height={24} priority style={{ height: 24, width: 'auto' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span className="nm">SeLinka</span>
            <span className="sub">UFC · 2026</span>
          </div>
        </Link>
        <div className="row" style={{ gap: 8 }}>
          <Link href="/entrar" className="btn btn-ghost btn-sm">Entrar</Link>
          <Link href="/entrar?mode=cadastro" className="btn btn-primary btn-sm btn-pill">Criar conta</Link>
        </div>
      </header>

      {/* Sub-nav das vitrines públicas */}
      <nav style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="row" style={{ gap: 4, overflowX: 'auto' }}>
            {VITRINE_TABS.map(({ href, label, Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className="row"
                  style={{
                    gap: 6, padding: '14px 14px', fontSize: 14, fontWeight: active ? 600 : 500, whiteSpace: 'nowrap',
                    color: active ? 'var(--color-ink)' : 'var(--color-fg-2)',
                    borderBottom: active ? '2px solid var(--color-ink)' : '2px solid transparent',
                  }}
                >
                  <Icon size={15} /> {label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <main style={{ flex: 1 }}>{children}</main>

      {/* CTA fixo: a vitrine é pública, mas abrir cada item exige cadastro */}
      <div
        className="row between"
        style={{
          position: 'sticky', bottom: 0, zIndex: 20, gap: 16, flexWrap: 'wrap',
          padding: '14px 24px', background: 'var(--color-ink)', color: 'var(--color-on-dark-1, #fff)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ fontSize: 14 }}>
          Explore livremente as vitrines da UFC. <b>Crie uma conta</b> para abrir cada perfil, ver contatos e conectar-se.
        </span>
        <Link href="/entrar?mode=cadastro" className="btn btn-primary btn-sm btn-pill" style={{ flex: 'none' }}>
          Criar conta gratuita <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
