'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Lightbulb, Calendar, Image as ImageIcon, ArrowDownUp,
} from 'lucide-react'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { FeedTimeline } from '@/components/feed/FeedTimeline'
import { PostComposer } from '@/components/feed/PostComposer'
import { FeedShell } from '@/components/feed/FeedShell'
import { FeedLeftSidebar } from '@/components/feed/FeedLeftSidebar'
import { FeedRightSidebar } from '@/components/feed/FeedRightSidebar'
import type { TipoPost } from '@/lib/api/feed'
import { cn } from '@/lib/utils'

// Mapeia o filtro do feed → contexto (tipo) de post no backend.
const FILTER_TO_TIPO: Record<string, TipoPost | undefined> = {
  all: undefined,
  projetos: 'PROJETO',
  negocios: 'NEGOCIO',
  labs: 'LABORATORIO',
  eventos: 'EVENTO',
}

type ComposerKind = 'projeto' | 'negocio' | 'laboratorio' | 'evento'
const COMPOSER_KINDS: ComposerKind[] = ['projeto', 'negocio', 'laboratorio', 'evento']

function FeedInner() {
  const me = useAuth((s) => s.me)
  const params = useSearchParams()
  const router = useRouter()
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerInitialKind, setComposerInitialKind] = useState<ComposerKind | undefined>(undefined)
  const [filter, setFilter] = useState('all')
  const [sortRecent, setSortRecent] = useState(true)

  function openComposer(kind?: ComposerKind) {
    setComposerInitialKind(kind)
    setComposerOpen(true)
  }

  // Abre o composer quando navegado com ?compor=1 (ex.: ação "Publicar" do menu mobile).
  // ?tipo= pré-seleciona o tipo de post. Limpa a query depois para não reabrir.
  const wantCompose = params.get('compor') === '1'
  const tipoParam = params.get('tipo')
  useEffect(() => {
    if (!wantCompose) return
    const kind = COMPOSER_KINDS.includes(tipoParam as ComposerKind) ? (tipoParam as ComposerKind) : undefined
    openComposer(kind)
    router.replace('/feed')
  }, [wantCompose, tipoParam, router])

  if (!me) return null

  const firstName = me.nome.split(' ')[0]

  return (
    <FeedShell
      left={<FeedLeftSidebar filter={filter} onFilterChange={setFilter} onCompose={() => openComposer()} />}
      right={<FeedRightSidebar />}
    >
      <div className="compose-card">
        <div className="top">
          <Avatar nome={me.nome} src={me.avatar_url ?? undefined} size={44} />
          <div className="stub" onClick={() => openComposer()}>
            Compartilhe uma novidade, {firstName}…
          </div>
        </div>
        <div className="actions">
          <button className="compose-act" style={{ color: 'var(--color-fg-3)' }} onClick={() => openComposer()}>
            <ImageIcon size={16} /> Foto/Vídeo
          </button>
          <button className="compose-act mint" onClick={() => openComposer('projeto')}>
            <Lightbulb size={16} /> Projeto
          </button>
          <button className="compose-act orange" onClick={() => openComposer('evento')}>
            <Calendar size={16} /> Evento
          </button>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', padding: '8px 4px 0' }}>
        <div className="eyebrow">{sortRecent ? 'Feed mais recentes' : 'Feed relevante'}</div>
        <button
          className={cn('btn btn-ghost btn-sm', sortRecent && 'text-mint')}
          style={{ padding: '4px 8px' }}
          onClick={() => setSortRecent((v) => !v)}
          title={sortRecent ? 'Alternando para relevância' : 'Alternando para mais recentes'}
        >
          <ArrowDownUp size={13} /> {sortRecent ? 'Mais recentes' : 'Relevância'}
        </button>
      </div>

      <FeedTimeline
        tipo={FILTER_TO_TIPO[filter]}
        sortRecent={sortRecent}
        emptyText="Nenhum post ainda. Seja o primeiro a compartilhar!"
      />

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} initialKind={composerInitialKind} />
    </FeedShell>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={null}>
      <FeedInner />
    </Suspense>
  )
}
