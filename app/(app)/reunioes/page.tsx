'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Video, Calendar, Check, X, Bell, RotateCcw, FileText, ExternalLink } from 'lucide-react'
import {
  listMeetings, createMeeting, createInstantMeeting, updateMeeting,
  type Meeting, type MeetingCreate, type InstantMeetingCreate,
} from '@/lib/api/meetings'
import { useAuth } from '@/lib/stores/auth'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type MeetingFilter = 'todas' | 'pendentes' | 'aceitas' | 'passadas'

const STATUS_META: Record<string, { label: string; pillClass: string; dot: string }> = {
  pending:   { label: 'Aguardando resposta', pillClass: 'pill-pendente', dot: 'var(--color-orange)' },
  accepted:  { label: 'Confirmada',          pillClass: 'pill-ativo',    dot: 'var(--color-mint)' },
  declined:  { label: 'Recusada',            pillClass: 'pill-pausada',  dot: 'var(--color-fg-3)' },
  cancelled: { label: 'Cancelada',           pillClass: 'pill-pausada',  dot: 'var(--color-fg-3)' },
  completed: { label: 'Concluída',           pillClass: 'pill-rascunho', dot: 'var(--color-ink)' },
}

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'hoje'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString()
}

function isPast(iso: string) {
  return new Date(iso) < new Date()
}

function minutesUntil(iso: string) {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 60000)
}

function MeetingRow({ m, userId, onUpdate }: { m: Meeting; userId: string; onUpdate: () => void }) {
  const sm = STATUS_META[m.status] ?? { label: 'Pendente', pillClass: 'pill-pendente', dot: 'var(--color-orange)' }
  const isMine = m.creator_id === userId
  const isPending = m.status === 'pending'
  const isAccepted = m.status === 'accepted'
  const past = isPast(m.scheduled_end)
  const mins = minutesUntil(m.scheduled_start)
  const canJoin = isAccepted && mins <= 10 && !past
  const qc = useQueryClient()

  const update = useMutation({
    mutationFn: (status: string) => updateMeeting(m.id, { status: status as Meeting['status'] }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings'] }); onUpdate() },
    onError: () => toast.error('Erro ao atualizar reunião'),
  })

  return (
    <div className="meet-row">
      <div className="meet-time">
        <div className="hour">{formatHour(m.scheduled_start)}</div>
        <div className="dur">{formatHour(m.scheduled_end)}</div>
        {canJoin && <span className="now-dot" title={`em ${mins} min`}></span>}
      </div>

      <div className="meet-divider"></div>

      <div className="meet-body">
        <div className="row" style={{ gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span className={`pill ${sm.pillClass}`}>
            <span className="dot" style={{ background: sm.dot }}></span>
            {sm.label}
          </span>
          {isToday(m.scheduled_start) && isAccepted && mins > 0 && (
            <span className="tag tag-mint">
              {mins <= 10 ? `começa em ${mins} min` : `daqui a ${Math.floor(mins / 60)}h ${mins % 60}m`}
            </span>
          )}
          {!isToday(m.scheduled_start) && (
            <span className="muted">{formatDate(m.scheduled_start)}</span>
          )}
        </div>
        <div className="meet-title">{m.location_link ?? `Reunião ${m.id.slice(-6)}`}</div>
        <div className="row" style={{ gap: 6, marginTop: 8 }}>
          <span className="muted" style={{ fontSize: 12 }}>
            {isMine ? 'Com ' : 'De '}{isMine ? m.participant_id.slice(0, 8) : m.creator_id.slice(0, 8)}…
          </span>
          {m.location_link && (
            <>
              <span className="muted">·</span>
              <code style={{ fontSize: 11.5, color: 'var(--color-fg-3)', background: 'transparent' }}>
                {m.location_link.replace('https://', '')}
              </code>
            </>
          )}
        </div>
      </div>

      <div className="meet-actions">
        {isPending && !isMine && (
          <>
            <button className="btn btn-tertiary btn-sm" onClick={() => update.mutate('declined')}>
              <X size={13} />Recusar
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => update.mutate('accepted')}>
              <Check size={13} />Aceitar
            </button>
          </>
        )}
        {isPending && isMine && (
          <>
            <button className="btn btn-tertiary btn-sm" onClick={() => update.mutate('cancelled')}>
              Cancelar
            </button>
            <button className="btn btn-ghost btn-sm">
              <Bell size={13} />Lembrar
            </button>
          </>
        )}
        {isAccepted && canJoin && (
          <Link href={`/reunioes/${m.id}/sala`} className="btn btn-primary btn-sm">
            <Video size={13} />Entrar agora
          </Link>
        )}
        {isAccepted && !canJoin && !past && (
          <>
            <button className="btn btn-tertiary btn-sm" onClick={() => update.mutate('cancelled')}>
              <X size={13} />Cancelar
            </button>
            <Link href={`/reunioes/${m.id}/sala`} className="btn btn-secondary btn-sm">
              <ExternalLink size={13} />Ver sala
            </Link>
          </>
        )}
        {(past || m.status === 'completed') && m.status === 'completed' && (
          <>
            <button className="btn btn-ghost btn-sm"><RotateCcw size={13} />Reagendar</button>
            <button className="btn btn-tertiary btn-sm"><FileText size={13} />Notas</button>
          </>
        )}
        {past && m.status === 'declined' && (
          <button className="btn btn-ghost btn-sm"><RotateCcw size={13} />Tentar de novo</button>
        )}
      </div>
    </div>
  )
}

function NovaReuniaoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tipo, setTipo] = useState<'agendar' | 'instantanea'>('agendar')
  const [participantId, setParticipantId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('14:00')
  const [endTime, setEndTime] = useState('15:00')
  const [message, setMessage] = useState('')
  const [duration, setDuration] = useState(60)
  const qc = useQueryClient()

  const createMut = useMutation({
    mutationFn: () => {
      if (tipo === 'instantanea') {
        const payload: InstantMeetingCreate = { participant_id: participantId, duration_minutes: duration }
        return createInstantMeeting(payload)
      } else {
        const payload: MeetingCreate = {
          participant_id: participantId,
          scheduled_start: `${date}T${startTime}:00`,
          scheduled_end: `${date}T${endTime}:00`,
          message: message || null,
        }
        return createMeeting(payload)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meetings'] })
      toast.success(tipo === 'instantanea' ? 'Sala criada! Link enviado.' : 'Convite enviado!')
      onClose()
    },
    onError: () => toast.error('Erro ao criar reunião'),
  })

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">Nova reunião</div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {/* tipo toggle */}
          <div className="row" style={{ gap: 4, padding: 4, background: 'var(--color-surface-2)', borderRadius: 9999, marginBottom: 18 }}>
            <button
              onClick={() => setTipo('agendar')}
              style={{ flex: 1, border: 0, padding: '8px 14px', borderRadius: 9999, font: '600 13px var(--font-body)', cursor: 'pointer', background: tipo === 'agendar' ? 'var(--color-ink)' : 'transparent', color: tipo === 'agendar' ? '#fff' : 'var(--color-fg-2)' }}
            >
              Agendar
            </button>
            <button
              onClick={() => setTipo('instantanea')}
              style={{ flex: 1, border: 0, padding: '8px 14px', borderRadius: 9999, font: '600 13px var(--font-body)', cursor: 'pointer', background: tipo === 'instantanea' ? 'var(--color-ink)' : 'transparent', color: tipo === 'instantanea' ? '#fff' : 'var(--color-fg-2)' }}
            >
              Instantânea
            </button>
          </div>

          <div className="col" style={{ gap: 14 }}>
            <div className="field">
              <label>ID do participante</label>
              <input className="input" placeholder="UID do participante" value={participantId} onChange={e => setParticipantId(e.target.value)} />
            </div>

            {tipo === 'agendar' && (
              <>
                <div className="field">
                  <label>Título</label>
                  <input className="input" placeholder="Ex.: Alinhamento parceria AeroLab" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label>Data</label>
                    <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Início</label>
                    <input className="input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Fim</label>
                    <input className="input" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label>Mensagem (opcional)</label>
                  <textarea className="textarea" rows={3} placeholder="Oi! Topa marcar para conversar sobre…" value={message} onChange={e => setMessage(e.target.value)} />
                </div>
              </>
            )}

            {tipo === 'instantanea' && (
              <>
                <div className="field">
                  <label>Duração</label>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    {[15, 30, 45, 60, 90].map(n => (
                      <span
                        key={n}
                        onClick={() => setDuration(n)}
                        style={{ padding: '7px 14px', borderRadius: 9999, background: n === duration ? 'var(--color-ink)' : '#fff', color: n === duration ? '#fff' : 'var(--color-fg-1)', border: `1px solid ${n === duration ? 'var(--color-ink)' : 'var(--color-border-strong)'}`, font: '500 12.5px var(--font-body)', cursor: 'pointer' }}
                      >
                        {n} min
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 14, background: 'var(--color-mint-08)', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#006a3c', lineHeight: 1.5 }}>
                  Geramos o link da sala Jitsi agora e enviamos por mensagem direta. Você já entra na sala — basta esperar.
                </div>
              </>
            )}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            disabled={!participantId || createMut.isPending || (tipo === 'agendar' && !date)}
            onClick={() => createMut.mutate()}
          >
            {tipo === 'instantanea' ? 'Criar e entrar' : 'Enviar convite'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReunioesPage() {
  const user = useAuth((s) => s.me)
  const [filter, setFilter] = useState<MeetingFilter>('todas')
  const [showCreate, setShowCreate] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => listMeetings({ limit: 50 }),
  })
  const meetings = data?.items ?? []

  const filtered = meetings.filter(m => {
    if (filter === 'pendentes') return m.status === 'pending'
    if (filter === 'aceitas')   return m.status === 'accepted'
    if (filter === 'passadas')  return ['completed', 'declined', 'cancelled'].includes(m.status) || isPast(m.scheduled_end)
    return true
  })

  const today = filtered.filter(m => isToday(m.scheduled_start) && !isPast(m.scheduled_end))
  const upcoming = filtered.filter(m => !isToday(m.scheduled_start) && !isPast(m.scheduled_end))
  const past = filtered.filter(m => isPast(m.scheduled_end) || ['completed', 'declined', 'cancelled'].includes(m.status))

  const groups = [
    { id: 'hoje', label: `Hoje · ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`, items: today },
    { id: 'prox', label: 'Próximos dias', items: upcoming },
    { id: 'past', label: 'Passadas', items: past },
  ].filter(g => g.items.length > 0)

  const tabCounts = {
    todas:    meetings.length,
    pendentes: meetings.filter(m => m.status === 'pending').length,
    aceitas:   meetings.filter(m => m.status === 'accepted').length,
    passadas:  meetings.filter(m => ['completed', 'declined', 'cancelled'].includes(m.status) || isPast(m.scheduled_end)).length,
  }

  return (
    <div className="page page-narrow fade-in">
      <div className="page-header">
        <div>
          <h1>Minhas reuniões</h1>
          <div className="sub">Reuniões 1:1 com participantes da rede — agendadas e instantâneas, dentro do Jitsi.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-tertiary btn-sm">
            <Calendar size={14} />Sincronizar agenda
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} />Nova reunião
          </button>
        </div>
      </div>

      <div className="tabs-bar">
        {([
          { id: 'todas',    label: `Todas · ${tabCounts.todas}` },
          { id: 'pendentes', label: `Pendentes · ${tabCounts.pendentes}` },
          { id: 'aceitas',  label: `Confirmadas · ${tabCounts.aceitas}` },
          { id: 'passadas', label: `Passadas · ${tabCounts.passadas}` },
        ] as { id: MeetingFilter; label: string }[]).map(t => (
          <button key={t.id} className={cn('tab', filter === t.id && 'active')} onClick={() => setFilter(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Video size={28} style={{ color: 'var(--color-fg-3)' }} />
          </div>
          <h3>Sem reuniões neste filtro</h3>
          <p>Crie uma reunião com qualquer pessoa da sua rede ou abra uma sala instantânea.</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} />Nova reunião
          </button>
        </div>
      ) : (
        <div className="col" style={{ gap: 28 }}>
          {groups.map(g => (
            <section key={g.id}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{g.label} · {g.items.length}</div>
              <div className="col" style={{ gap: 10 }}>
                {g.items.map(m => (
                  <MeetingRow key={m.id} m={m} userId={user?.id ?? ''} onUpdate={refetch} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <NovaReuniaoModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
