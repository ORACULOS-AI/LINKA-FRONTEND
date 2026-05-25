'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Send, Smile, Video, Phone, Info, MoreHorizontal } from 'lucide-react'
import { listThreads, listMessages, sendMessage, markThreadRead, type Message } from '@/lib/api/messages'
import { useAuth } from '@/lib/stores/auth'
import { NewThreadModal } from '@/components/messages/NewThreadModal'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { PresenceDot } from '@/components/social/PresenceDot'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function getInitials(str: string) {
  return str.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatTs(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function MensagensInner() {
  const user = useAuth((s) => s.me)
  const params = useSearchParams()
  const router = useRouter()
  const wantNew = params.get('novo') === '1'
  const target = params.get('para')
  const [modalOpen, setModalOpen] = useState(wantNew)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [searchT, setSearchT] = useState('')
  const [msgInput, setMsgInput] = useState('')
  const [filter, setFilter] = useState<'todas' | 'nao-lidas'>('todas')
  const bodyRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: threadsData, isLoading: threadsLoading } = useQuery({
    queryKey: ['threads'],
    queryFn: () => listThreads({ limit: 50 }),
  })
  const threads = threadsData?.items ?? []

  const { data: msgsData } = useQuery({
    queryKey: ['messages', activeThreadId],
    queryFn: () => listMessages(activeThreadId!, { limit: 60 }),
    enabled: !!activeThreadId,
  })
  const messages = msgsData?.items ?? []

  const sendMut = useMutation({
    mutationFn: (conteudo: string) => sendMessage(activeThreadId!, { conteudo }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', activeThreadId] })
      qc.invalidateQueries({ queryKey: ['threads'] })
      setMsgInput('')
    },
    onError: () => toast.error('Erro ao enviar mensagem'),
  })

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!activeThreadId || messages.length === 0) return
    // Marca lida até a mensagem mais recente (maior created_at). message_id é obrigatório no backend.
    const latest = messages.reduce((a, b) => (a.created_at >= b.created_at ? a : b))
    markThreadRead(activeThreadId, latest.id).catch(() => {})
  }, [activeThreadId, messages])

  const activeThread = threads.find(t => t.id === activeThreadId)
  const otherParticipant = activeThread?.participantes.find(p => p !== user?.id) ?? ''

  const handleSend = () => {
    if (!msgInput.trim() || !activeThreadId) return
    sendMut.mutate(msgInput.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const filteredThreads = threads.filter(t => {
    if (searchT && !t.participantes.join(' ').toLowerCase().includes(searchT.toLowerCase())) return false
    return true
  })

  return (
    <div className="msg-grid fade-in">
      {/* Thread list */}
      <div className="msg-list">
        <div className="ml-head">
          <div className="flex items-center justify-between gap-2">
            <h2>Mensagens</h2>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-8 items-center gap-1 rounded-md bg-[var(--color-ink)] px-2.5 text-xs font-medium text-[var(--color-on-dark-1)] hover:opacity-90"
              aria-label="Nova conversa"
            >
              <Plus className="h-3.5 w-3.5" /> Nova
            </button>
          </div>
          <div className="input-affix">
            <Search size={14} className="ix" />
            <input
              className="input"
              placeholder="Buscar conversas…"
              value={searchT}
              onChange={e => setSearchT(e.target.value)}
            />
          </div>
          <div className="row" style={{ marginTop: 12, gap: 6 }}>
            <span
              className={cn('chip', filter === 'todas' && 'active')}
              style={{ padding: '5px 10px', borderRadius: 9999, font: '600 11.5px var(--font-body)', cursor: 'pointer' }}
              onClick={() => setFilter('todas')}
            >
              Todas
            </span>
            <span
              className={cn('chip', filter === 'nao-lidas' && 'active')}
              style={{ padding: '5px 10px', borderRadius: 9999, font: '500 11.5px var(--font-body)', cursor: 'pointer' }}
              onClick={() => setFilter('nao-lidas')}
            >
              Não lidas
            </span>
          </div>
        </div>

        {threadsLoading ? (
          <div className="px-3 py-4"><SkeletonList count={4} /></div>
        ) : filteredThreads.length === 0 ? (
          <div className="px-3 py-4">
            <EmptyState
              title="Você ainda não tem conversas"
              description="Siga pessoas e seja seguido para iniciar uma conversa."
              action={{ label: 'Nova conversa', onClick: () => setModalOpen(true) }}
            />
          </div>
        ) : filteredThreads.map(t => {
          const other = t.participantes.find(p => p !== user?.id) ?? t.participantes[0] ?? ''
          const initials = getInitials(other)
          return (
            <div
              key={t.id}
              className={cn('thread', activeThreadId === t.id && 'active')}
              onClick={() => setActiveThreadId(t.id)}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 14px var(--font-display)', flex: 'none' }}>
                  {initials}
                </div>
                <PresenceDot uid={other} className="absolute right-0 bottom-0" />
              </div>
              <div className="body">
                <div className="head">
                  <span className="nm">{other}</span>
                  {t.last_message_at && <span className="ts">{formatTs(t.last_message_at)}</span>}
                </div>
                <div className="preview">{t.last_message ?? 'Sem mensagens'}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chat pane */}
      {!activeThreadId ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--color-fg-3)', fontSize: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={24} />
          </div>
          <p>Selecione uma conversa para começar</p>
        </div>
      ) : (
        <div className="msg-pane">
          <div className="mp-head">
            <div style={{ position: 'relative', flex: 'none' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 14px var(--font-display)' }}>
                {getInitials(otherParticipant)}
              </div>
              {otherParticipant && <PresenceDot uid={otherParticipant} className="absolute right-0 bottom-0" />}
            </div>
            <div>
              <div className="nm">{otherParticipant}</div>
              <div className="sub">Membro</div>
            </div>
            <div className="acts">
              <button className="btn-icon" title="Iniciar reunião"><Video size={16} /></button>
              <button className="btn-icon" title="Ligar"><Phone size={16} /></button>
              <button className="btn-icon" title="Detalhes"><Info size={16} /></button>
              <button className="btn-icon" title="Mais"><MoreHorizontal size={16} /></button>
            </div>
          </div>

          <div className="mp-body" ref={bodyRef}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-fg-3)', fontSize: 13, paddingTop: 24 }}>
                Nenhuma mensagem ainda. Diga olá!
              </div>
            ) : messages.map((m: Message) => (
              <div
                key={m.id}
                className={cn('msg-bubble', m.remetente_id === user?.id ? 'from-me' : 'from-them')}
              >
                <div>{m.conteudo}</div>
                <span className="ts">{formatTs(m.created_at)}</span>
              </div>
            ))}
          </div>

          <div className="mp-foot">
            <button className="btn-icon"><Plus size={16} /></button>
            <input
              placeholder={`Mensagem para ${otherParticipant}…`}
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn-icon"><Smile size={16} /></button>
            <button
              className="btn btn-primary"
              style={{ gap: 8 }}
              onClick={handleSend}
              disabled={!msgInput.trim() || sendMut.isPending}
            >
              <Send size={14} />Enviar
            </button>
          </div>
        </div>
      )}

      <NewThreadModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          if (wantNew || target) router.replace('/mensagens')
        }}
        initialTarget={target}
        onCreated={(tid) => {
          setActiveThreadId(tid)
          qc.invalidateQueries({ queryKey: ['threads'] })
        }}
      />
    </div>
  )
}

export default function MensagensPage() {
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList count={4} /></div>}>
      <MensagensInner />
    </Suspense>
  )
}
