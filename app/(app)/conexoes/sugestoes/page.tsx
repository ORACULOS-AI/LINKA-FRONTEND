'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles, UserPlus, X } from 'lucide-react'
import { getSuggestions, sendConnectionRequest, type SuggestedUser } from '@/lib/api/connections'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const FILTROS = ['Todos', 'Mesmo campus', 'Áreas próximas', 'Co-autores Lattes']

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function SuggCard({ s, onIgnore }: { s: SuggestedUser; onIgnore: (uid: string) => void }) {
  const [requested, setRequested] = useState(false)
  const connect = async () => {
    try {
      await sendConnectionRequest(s.uid)
      setRequested(true)
      toast.success('Solicitação enviada!')
    } catch { toast.error('Erro ao enviar solicitação') }
  }
  return (
    <div className="sugg">
      <div className="av">{getInitials(s.nome)}</div>
      <div className="nm">{s.nome}</div>
      <div className="sub">{s.tipo_usuario ?? 'Membro'}{s.campus ? ` · ${s.campus}` : ''}</div>
      {s.mutual_count !== undefined && s.mutual_count > 0 && (
        <div className="why">
          <Sparkles size={11} style={{ marginRight: 4, verticalAlign: '-2px', color: 'var(--color-purple)' }} />
          {s.mutual_count} conexão{s.mutual_count !== 1 ? 'ões' : ''} em comum
        </div>
      )}
      <div className="row">
        <button className="btn btn-tertiary btn-sm" style={{ flex: 1 }} onClick={() => onIgnore(s.uid)}>
          <X size={13} />Ignorar
        </button>
        {requested ? (
          <span className="btn btn-tertiary btn-sm" style={{ flex: 1, opacity: 0.5 }}>Solicitado</span>
        ) : (
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={connect}>
            <UserPlus size={13} />Conectar
          </button>
        )}
      </div>
    </div>
  )
}

export default function SugestoesPage() {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [ignored, setIgnored] = useState<string[]>([])

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => getSuggestions(20),
  })

  const visible = suggestions.filter((s: SuggestedUser) => !ignored.includes(s.uid))

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Sugestões para você</h1>
          <div className="sub">Geradas a partir das suas conexões, áreas de pesquisa, campus e atividades recentes na plataforma.</div>
        </div>
        <button className="btn btn-tertiary btn-sm">Ajustar critérios</button>
      </div>

      {/* Filter chips */}
      <div className="row" style={{ marginBottom: 24, gap: 8, flexWrap: 'wrap' }}>
        {FILTROS.map(f => (
          <span
            key={f}
            className={cn('chip', activeFilter === f && 'active')}
            style={{ padding: '6px 12px', borderRadius: 9999, font: '500 12.5px var(--font-body)', cursor: 'pointer' }}
            onClick={() => setActiveFilter(f)}
          >
            {f}{f === 'Todos' ? ` · ${visible.length}` : ''}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="empty"><p>Carregando sugestões…</p></div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <h3>Sem sugestões no momento</h3>
          <p>Complete seu perfil para receber sugestões personalizadas.</p>
        </div>
      ) : (
        <div className="grid-3">
          {visible.map((s: SuggestedUser) => (
            <SuggCard key={s.uid} s={s} onIgnore={uid => setIgnored(prev => [...prev, uid])} />
          ))}
        </div>
      )}
    </div>
  )
}
