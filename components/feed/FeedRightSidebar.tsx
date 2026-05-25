'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Calendar, UserPlus, Search } from 'lucide-react'
import { fetchShowcaseEventos } from '@/lib/api/showcase'
import { getSuggestions, sendConnectionRequest } from '@/lib/api/connections'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000))
}

export function FeedRightSidebar() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const { data: eventos = [] } = useQuery({
    queryKey: ['showcase', 'eventos', 3],
    queryFn: async () => {
      const list = await fetchShowcaseEventos(3)
      return Array.isArray(list) ? list : []
    },
    staleTime: 5 * 60_000,
  })

  const { data: sugestoes = [] } = useQuery({
    queryKey: ['connections', 'suggestions'],
    queryFn: async () => {
      const list = await getSuggestions(3)
      return Array.isArray(list) ? list : []
    },
    staleTime: 2 * 60_000,
  })

  return (
    <aside
      className="col feed-col-right"
      style={{ gap: 16, position: 'sticky', top: 'calc(var(--nav-height-top) + 16px)', maxHeight: 'calc(100vh - var(--nav-height-top) - 32px)', overflowY: 'auto' }}
    >
      <form
        className="relative flex"
        onSubmit={(e) => {
          e.preventDefault()
          const q = search.trim()
          if (q) router.push(`/busca?q=${encodeURIComponent(q)}`)
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3 pointer-events-none" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar pessoas, iniciativas, laboratórios…"
          className="h-[40px] w-full rounded-full border border-border bg-surface-2 pl-9 pr-4 text-sm text-fg-1 placeholder:text-fg-4 transition-colors hover:border-border-strong hover:bg-[#efeff2] focus:border-border-strong focus:bg-surface focus:outline-none"
        />
      </form>
      <div className="card">
        <div className="card-body">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="eyebrow">Eventos próximos</div>
            <Link href="/eventos" style={{ fontSize: 12, color: 'var(--color-fg-3)' }}>Agenda →</Link>
          </div>
          {eventos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-fg-3)', marginTop: 10 }}>Nenhum evento próximo.</p>
          ) : (
            <div className="col" style={{ gap: 12, marginTop: 10 }}>
              {eventos.map((ev) => {
                const days = daysUntil(ev.data_inicio)
                const dateStr = new Date(ev.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                return (
                  <Link key={ev.uid} href={`/eventos/${ev.uid}`} className="row" style={{ gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--color-orange-15)', color: '#8c5500', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                      <Calendar size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.titulo}</div>
                      <div className="muted" style={{ marginTop: 2 }}>{dateStr}{days > 0 ? ` · em ${days} dias` : ' · hoje'}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="eyebrow">Quem conhecer</div>
            <Link href="/conexoes/sugestoes" style={{ fontSize: 12, color: 'var(--color-fg-3)' }}>Ver todas →</Link>
          </div>
          {sugestoes.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-fg-3)', marginTop: 10 }}>Sem sugestões no momento.</p>
          ) : (
            <div className="col" style={{ gap: 0, borderTop: '1px solid var(--color-border)', marginTop: 10 }}>
              {sugestoes.map((s) => (
                <SuggestionRow key={s.uid} user={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

function SuggestionRow({
  user,
}: {
  user: { uid: string; nome: string; foto_url?: string | null; tipo_usuario?: string; campus?: string | null }
}) {
  const [requested, setRequested] = useState(false)

  async function handleConnect() {
    try {
      await sendConnectionRequest(user.uid)
      setRequested(true)
      toast.success('Solicitação enviada')
    } catch {
      toast.error('Não foi possível enviar solicitação')
    }
  }

  const initials = user.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="row" style={{ gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <Link href={`/perfil/${user.uid}`} style={{ flex: 'none' }}>
        <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: 'var(--color-purple)', color: '#fff' }}>
          {initials}
        </div>
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={`/perfil/${user.uid}`} style={{ display: 'block', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.nome}
        </Link>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.tipo_usuario?.replace('_', ' ')}{user.campus ? ` · ${user.campus}` : ''}
        </div>
      </div>
      <button
        className={cn('btn-icon', requested && 'opacity-50')}
        disabled={requested}
        onClick={handleConnect}
        title={requested ? 'Solicitação enviada' : `Conectar com ${user.nome}`}
      >
        <UserPlus size={14} />
      </button>
    </div>
  )
}
