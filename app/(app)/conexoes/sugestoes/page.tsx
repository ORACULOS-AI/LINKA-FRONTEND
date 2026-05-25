'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, UserPlus, ArrowLeft } from 'lucide-react'
import { getSuggestions, type SuggestedUser } from '@/lib/api/connections'
import { FollowButton } from '@/components/social/FollowButton'
import { cn } from '@/lib/utils'

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function PersonAvatar({ nome, foto, size = 64 }: { nome: string; foto?: string | null; size?: number }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt={nome}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--color-purple)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: `700 ${Math.round(size * 0.36)}px var(--font-display)`,
    }}>
      {getInitials(nome)}
    </div>
  )
}

function SuggCard({ s }: { s: SuggestedUser }) {
  return (
    <div className="sugg">
      <PersonAvatar nome={s.nome} foto={s.foto_url} size={64} />
      <div className="nm">{s.nome}</div>
      <div className="sub">{s.tipo_usuario ?? 'Membro'}{s.campus ? ` · ${s.campus}` : ''}</div>
      {s.mutual_count !== undefined && s.mutual_count > 0 && (
        <div className="why">
          <Sparkles size={11} style={{ marginRight: 4, verticalAlign: '-2px', color: 'var(--color-purple)' }} />
          {s.mutual_count} conexão{s.mutual_count !== 1 ? 'ões' : ''} em comum
        </div>
      )}
      <div className="row" style={{ marginTop: 'auto' }}>
        <FollowButton type="user" id={s.uid} size="sm" className="flex-1" />
      </div>
    </div>
  )
}

function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sugg skeleton-card">
          <div className="skeleton-circle" style={{ width: 64, height: 64 }} />
          <div className="skeleton-line" style={{ width: '70%', height: 14, marginTop: 10 }} />
          <div className="skeleton-line" style={{ width: '50%', height: 12, marginTop: 6 }} />
          <div className="skeleton-line" style={{ width: '100%', height: 32, marginTop: 16, borderRadius: 'var(--radius-md)' }} />
        </div>
      ))}
    </div>
  )
}

export default function SugestoesPage() {
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => getSuggestions(20),
  })

  return (
    <div className="page page-narrow fade-in">
      <div className="page-header">
        <div>
          <Link href="/conexoes" className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }}>
            <ArrowLeft size={14} />Voltar para conexões
          </Link>
          <h1>Sugestões para você</h1>
          <div className="sub">
            Geradas a partir das suas conexões, áreas de pesquisa, campus e atividades recentes na plataforma.
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCards />
      ) : suggestions.length === 0 ? (
        <div className="empty">
          <Sparkles size={32} style={{ color: 'var(--color-fg-3)', marginBottom: 8 }} />
          <div className="eyebrow">SUGESTÕES</div>
          <h3>Sem sugestões no momento</h3>
          <p>Complete seu perfil para receber sugestões personalizadas.</p>
        </div>
      ) : (
        <div className="grid-3">
          {suggestions.map((s: SuggestedUser) => (
            <SuggCard key={s.uid} s={s} />
          ))}
        </div>
      )}
    </div>
  )
}
