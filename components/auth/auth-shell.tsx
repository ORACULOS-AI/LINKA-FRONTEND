import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

type Props = {
  title: string
  lead?: string
  backHref?: string
  backLabel?: string
  rightFooter?: ReactNode
  children: ReactNode
}

/* Shell para telas auxiliares de auth (verificar-email, esqueci-senha,
   resetar-senha) — reutiliza o split-screen do protótipo. */
export function AuthShell({
  title,
  lead,
  backHref = '/entrar',
  backLabel = 'Voltar',
  rightFooter,
  children,
}: Props) {
  return (
    <div className="auth fade-in">
      <div className="auth-pattern">
        <div className="brand">
          <Image
            src="/selinka/logo-selinka.png"
            alt="SeLinka"
            width={140}
            height={28}
            priority
            style={{ height: 28, width: 'auto', filter: 'invert(1)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span className="nm">SeLinka</span>
            <span className="sub">UFC · 2026</span>
          </div>
        </div>
        <div className="hero-block">
          <div className="eyebrow">Plataforma de conexão · UFC</div>
          <h1>A rede de inovação da UFC, em um só lugar.</h1>
          <p>Conecte-se ao ecossistema de pesquisa, laboratórios, startups e eventos da Universidade Federal do Ceará.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="row between" style={{ marginBottom: 28 }}>
            <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-fg-2)' }}>
              <ArrowLeft size={14} /> {backLabel}
            </Link>
          </div>
          <h2>{title}</h2>
          {lead ? <p className="lead">{lead}</p> : null}
          {children}
          {rightFooter ? <div className="footer">{rightFooter}</div> : null}
        </div>
      </div>
    </div>
  )
}
