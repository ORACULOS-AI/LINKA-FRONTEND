'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MessageCircle, MoreHorizontal, Check, X, UserPlus } from 'lucide-react'
import {
  getMyConnections, getConnectionRequests,
  acceptConnectionRequest, rejectConnectionRequest, cancelConnectionRequest,
  type ConnectionUser,
} from '@/lib/api/connections'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Tab = 'conectados' | 'recebidas' | 'enviadas'

type Request = {
  connection_id: string
  user: { uid: string; nome: string; foto_perfil?: string | null; tipo_usuario?: string }
  mutual_count?: number
  mensagem?: string
  created_at?: string
}

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function ConexoesPage() {
  const [tab, setTab] = useState<Tab>('conectados')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: connections = [] } = useQuery({
    queryKey: ['connections', 'mine'],
    queryFn: getMyConnections,
  })
  const { data: received = [] } = useQuery({
    queryKey: ['connections', 'requests', 'received'],
    queryFn: () => getConnectionRequests('received'),
  })
  const { data: sent = [] } = useQuery({
    queryKey: ['connections', 'requests', 'sent'],
    queryFn: () => getConnectionRequests('sent'),
  })

  const acceptMut = useMutation({
    mutationFn: (id: string) => acceptConnectionRequest(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['connections'] }); toast.success('Conexão aceita!') },
    onError: () => toast.error('Erro ao aceitar'),
  })
  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectConnectionRequest(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['connections'] }); toast.success('Solicitação recusada') },
    onError: () => toast.error('Erro ao recusar'),
  })
  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelConnectionRequest(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['connections'] }); toast.success('Solicitação cancelada') },
    onError: () => toast.error('Erro ao cancelar'),
  })

  const filteredConnections = connections.filter((c: ConnectionUser) =>
    !search || c.nome.toLowerCase().includes(search.toLowerCase())
  )

  const receivedList = received as Request[]
  const sentList = sent as Request[]

  return (
    <div className="page page-narrow fade-in">
      <div className="page-header">
        <div>
          <h1>Conexões</h1>
          <div className="sub">
            {connections.length} conexões ativas, {receivedList.length} solicitações recebidas e {sentList.length} pendentes.
          </div>
        </div>
        <Link href="/conexoes/sugestoes" className="btn btn-primary btn-sm">
          <UserPlus size={14} />Encontrar pessoas
        </Link>
      </div>

      <div className="tabs-bar">
        {([
          { id: 'conectados' as Tab, label: `Conectados · ${connections.length}` },
          { id: 'recebidas'  as Tab, label: `Solicitações recebidas · ${receivedList.length}` },
          { id: 'enviadas'   as Tab, label: `Solicitações enviadas · ${sentList.length}` },
        ]).map(t => (
          <button key={t.id} className={cn('tab', tab === t.id && 'active')} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─ conectados ─ */}
      {tab === 'conectados' && (
        <>
          <div className="row" style={{ gap: 8, marginBottom: 16 }}>
            <div className="input-affix" style={{ flex: 1 }}>
              <Search size={14} className="ix" />
              <input className="input" placeholder="Filtrar suas conexões…" style={{ paddingLeft: 38 }} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select" style={{ width: 'auto' }}>
              <option>Mais recentes</option>
              <option>A → Z</option>
              <option>Por campus</option>
            </select>
          </div>
          {filteredConnections.length === 0 ? (
            <div className="empty">
              <h3>Sem conexões ainda</h3>
              <p>Explore sugestões para conectar com pesquisadores e parceiros.</p>
              <Link href="/conexoes/sugestoes" className="btn btn-primary"><UserPlus size={14} />Ver sugestões</Link>
            </div>
          ) : (
            <div className="col" style={{ gap: 12 }}>
              {filteredConnections.map((c: ConnectionUser) => (
                <div key={c.uid} className="person-row">
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none' }}>
                    {getInitials(c.nome)}
                  </div>
                  <div className="body">
                    <div className="nm">{c.nome}</div>
                    <div className="sub">{c.tipo_usuario ?? 'Membro'}</div>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <Link href={`/mensagens?to=${c.uid}`} className="btn btn-tertiary btn-sm">
                      <MessageCircle size={13} />Mensagem
                    </Link>
                    <button className="btn-icon"><MoreHorizontal size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─ recebidas ─ */}
      {tab === 'recebidas' && (
        <div className="col" style={{ gap: 12 }}>
          {receivedList.length === 0 ? (
            <div className="empty"><h3>Nenhuma solicitação recebida</h3></div>
          ) : receivedList.map(r => (
            <div key={r.connection_id} className="person-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className="row" style={{ gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none' }}>
                  {getInitials(r.user.nome)}
                </div>
                <div className="body">
                  <div className="nm">{r.user.nome}</div>
                  <div className="sub">{r.user.tipo_usuario ?? 'Membro'}</div>
                  {r.mutual_count !== undefined && <div className="meta">{r.mutual_count} conexões em comum</div>}
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn btn-tertiary btn-sm" onClick={() => rejectMut.mutate(r.connection_id)}>
                    <X size={13} />Recusar
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => acceptMut.mutate(r.connection_id)}>
                    <Check size={13} />Aceitar
                  </button>
                </div>
              </div>
              {r.mensagem && (
                <div style={{ marginLeft: 66, marginTop: 12, padding: 12, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', fontSize: 13.5, color: 'var(--color-fg-2)', fontStyle: 'italic' }}>
                  &ldquo;{r.mensagem}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─ enviadas ─ */}
      {tab === 'enviadas' && (
        <div className="col" style={{ gap: 12 }}>
          {sentList.length === 0 ? (
            <div className="empty"><h3>Nenhuma solicitação enviada</h3></div>
          ) : sentList.map(r => (
            <div key={r.connection_id} className="person-row">
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none' }}>
                {getInitials(r.user.nome)}
              </div>
              <div className="body">
                <div className="nm">{r.user.nome}</div>
                <div className="sub">{r.user.tipo_usuario ?? 'Membro'}</div>
                <div className="meta" style={{ color: 'var(--color-fg-3)', fontSize: 12 }}>Pendente</div>
              </div>
              <button className="btn btn-tertiary btn-sm" onClick={() => cancelMut.mutate(r.connection_id)}>
                Cancelar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
