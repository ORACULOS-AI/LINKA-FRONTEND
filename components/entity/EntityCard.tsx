'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, BadgeAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EntityKind = 'negocio' | 'laboratorio' | 'projeto' | 'evento'

const KIND_COVER: Record<EntityKind, 'purple' | 'blue' | 'mint' | 'orange'> = {
  negocio: 'purple',
  laboratorio: 'blue',
  projeto: 'mint',
  evento: 'orange',
}

const KIND_LABEL: Record<EntityKind, string> = {
  negocio: 'Negócio',
  laboratorio: 'Laboratório',
  projeto: 'Projeto',
  evento: 'Evento',
}

export type EntityMeta = {
  label: string
  icon?: 'map-pin' | 'calendar' | 'users' | 'lightbulb' | 'flask' | 'briefcase'
}

export type EntityCardProps = {
  id: string
  kind: EntityKind
  href: string
  nome: string
  descricao?: string | null
  categoria?: string | null
  imagem?: string | null
  followers?: number
  meta?: EntityMeta[]
  className?: string
  /** Quando true, mostra CTA "Reivindicar" porque a entidade está órfã (sem dono). */
  orphan?: boolean
}

function initials(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export function EntityCard({
  kind, href, nome, descricao, categoria, imagem, followers, className, orphan, id,
}: EntityCardProps) {
  const router = useRouter()
  const cover = KIND_COVER[kind]

  const coverStyle = imagem
    ? { backgroundImage: `url(${imagem})`, backgroundColor: 'transparent' }
    : undefined

  return (
    <Link href={href} className={cn('vcard', className)}>
      <div className={cn('cover', cover)} style={coverStyle}>
        <span className="badge-tl">{KIND_LABEL[kind]}</span>
        <div className="logo" style={{ color: `var(--color-${cover})` }}>
          {initials(nome)}
        </div>
      </div>
      <div className="body">
        {categoria && <div className="sub" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{categoria}</div>}
        <h3 className="ti">{nome}</h3>
        {descricao && <p className="desc line-clamp-2">{descricao}</p>}
        <div className="footer">
          <div className="stats">
            {typeof followers === 'number' && (
              <span className="row" style={{ gap: 4 }}>
                <Users size={13} />
                <span className="tabular-nums">{followers}</span>
              </span>
            )}
          </div>
          {orphan && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/reivindicar?tipo=${kind}&id=${id}`)
              }}
              className="pill"
              style={{
                background: 'var(--color-orange-15)',
                color: 'var(--color-orange)',
                border: 0,
                cursor: 'pointer',
              }}
            >
              <BadgeAlert size={12} /> Reivindicar
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
