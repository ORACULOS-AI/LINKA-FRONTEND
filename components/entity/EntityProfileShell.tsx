'use client'

import { type ReactNode, useState, type CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AccentColor = 'mint' | 'blue' | 'purple' | 'orange'

const ACCENT_BG: Record<AccentColor, CSSProperties> = {
  purple: {
    backgroundColor: 'var(--color-purple)',
    backgroundImage: "url('/selinka/pattern-mint-on-purple.png')",
  },
  blue: {
    backgroundColor: 'var(--color-blue)',
    backgroundImage: "url('/selinka/pattern-orange-on-blue.png')",
  },
  mint: {
    backgroundColor: 'var(--color-mint)',
    backgroundImage: "url('/selinka/pattern-blue-on-mint.png')",
  },
  orange: {
    backgroundColor: 'var(--color-orange)',
    backgroundImage: "url('/selinka/pattern-white-on-orange.png')",
  },
}

const ACCENT_VAR: Record<AccentColor, string> = {
  mint: 'var(--color-mint)',
  blue: 'var(--color-blue)',
  purple: 'var(--color-purple)',
  orange: 'var(--color-orange)',
}

export type ProfileTab = {
  id: string
  label: string
  content: ReactNode
  count?: number
}

export type ProfileStat = { label: string; value: ReactNode }

export type ProfileMeta = {
  icon?: LucideIcon
  label?: string
  value: ReactNode
  href?: string
}

type Props = {
  /** Imagem de capa (URL). Se ausente, usa o pattern animado da accentColor. */
  coverImage?: string | null
  /** Imagem do avatar (URL). Se ausente, mostra as iniciais. */
  avatarImage?: string | null
  /** Iniciais para fallback do avatar. */
  initials: string
  /** Cor de acento — define pattern de capa, cor do avatar fallback e ear bar. */
  accentColor: AccentColor
  title: string
  subtitle?: ReactNode
  /** Badges/decorations renderizados ao lado do título (BadgeCheck, etc). */
  titleBadges?: ReactNode
  /** Linha de metadados (campus, email, lattes, siape, etc). */
  metadata?: ProfileMeta[]
  /** Pill mútuo / pendente / órfão / outras. */
  statusPill?: ReactNode
  /** CTAs do header (Follow, Like, Mensagem, Compartilhar). */
  actions?: ReactNode
  stats: ProfileStat[]
  tabs: ProfileTab[]
  defaultTab?: string
  /** Conteúdo opcional ao lado direito (aside). Se ausente, conteúdo ocupa largura inteira. */
  aside?: ReactNode
}

export function EntityProfileShell({
  coverImage,
  avatarImage,
  initials,
  accentColor,
  title,
  subtitle,
  titleBadges,
  metadata,
  statusPill,
  actions,
  stats,
  tabs,
  defaultTab,
  aside,
}: Props) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '')
  const current = tabs.find((t) => t.id === active) ?? tabs[0]
  const accentStyle = ACCENT_VAR[accentColor]

  const coverStyle: CSSProperties = coverImage
    ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : ACCENT_BG[accentColor]

  const avatarStyle: CSSProperties = avatarImage
    ? { background: `url(${avatarImage}) center/cover`, color: '#fff' }
    : { background: accentStyle, color: '#fff' }

  return (
    <div className="page fade-in">
      <div className="profile-cover" style={coverStyle} />

      <div className="profile-meta">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div className="av-lg" style={avatarStyle}>
            {!avatarImage && initials}
          </div>
        </div>

        <div className="head-row">
          <div style={{ minWidth: 0 }}>
            <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {title}
              {titleBadges}
            </h1>
            {subtitle && <div className="sub">{subtitle}</div>}
            {metadata && metadata.length > 0 && (
              <div
                className="row"
                style={{ gap: 12, marginTop: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-fg-3)' }}
              >
                {metadata.map((m, i) => {
                  const Icon = m.icon
                  const content = (
                    <span className="row" style={{ gap: 4 }}>
                      {Icon && <Icon size={14} />}
                      {m.label ? `${m.label} ${m.value}` : m.value}
                    </span>
                  )
                  return m.href ? (
                    <a key={i} href={m.href} target="_blank" rel="noopener" style={{ color: 'inherit' }}>
                      {content}
                    </a>
                  ) : (
                    <span key={i}>{content}</span>
                  )
                })}
              </div>
            )}
            {statusPill && <div style={{ marginTop: 8 }}>{statusPill}</div>}
          </div>

          {actions && (
            <div className="actions" style={{ gap: 8 }}>
              {actions}
            </div>
          )}
        </div>

        {stats.length > 0 && (
          <div className="stats">
            {stats.map((s, i) => (
              <div key={i} className="stat">
                <div className="n">{s.value}</div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--color-border)', margin: '18px 0 0' }} />
        <div className="tabs-bar" style={{ borderBottom: 0, margin: 0 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cn('tab', active === t.id && 'active')}
              onClick={() => setActive(t.id)}
            >
              {t.label}
              {typeof t.count === 'number' && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    color: 'var(--color-fg-3)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }} className={aside ? 'grid-feed' : undefined}>
        <div className="col" style={{ gap: 14 }}>
          {current?.content}
        </div>
        {aside && <aside className="col" style={{ gap: 16 }}>{aside}</aside>}
      </div>
    </div>
  )
}
