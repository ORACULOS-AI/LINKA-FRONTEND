'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  QrCode, Users, CheckCircle2, Award, Send, Ban, Flag, Loader2, Calendar, MapPin, Pencil, Eye,
} from 'lucide-react'
import {
  getEvent, getEventParticipants, getEventStats, getEventQrCode,
  validatePresence, generateCertificatesBulk,
  publishEvent, cancelEvent, concludeEvent,
  type Event as EventT, type Participante,
} from '@/lib/api/events'
import { EntityProfileShell } from '@/components/entity/EntityProfileShell'
import { useAuth } from '@/lib/stores/auth'
import { toast, toastApiError } from '@/lib/toast'
import { cn } from '@/lib/utils'

function initials(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

const STATUS_PILL: Record<string, string> = {
  rascunho: 'pill-rascunho',
  pendente_aprovacao: 'pill-pendente',
  ativo: 'pill-ativo',
  cancelado: 'pill-cancelado',
  concluido: 'pill-info',
}

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  pendente_aprovacao: 'Em análise',
  ativo: 'Ativo',
  cancelado: 'Cancelado',
  concluido: 'Concluído',
}

export default function PainelEventoPage() {
  const params = useParams<{ uid: string }>()
  const uid = params.uid
  const qc = useQueryClient()
  const me = useAuth((s) => s.me)

  const eventQ = useQuery({ queryKey: ['event', uid], queryFn: () => getEvent(uid) })
  const statsQ = useQuery({
    queryKey: ['event', uid, 'stats'],
    queryFn: () => getEventStats(uid),
    enabled: !!eventQ.data,
  })

  if (eventQ.isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center" style={{ color: 'var(--color-fg-3)' }}>
        <Loader2 className="mx-auto h-6 w-6 animate-spin" /> Carregando…
      </div>
    )
  }
  if (eventQ.isError || !eventQ.data) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center" style={{ color: 'var(--color-fg-3)' }}>
        Evento não encontrado.
      </div>
    )
  }
  const event = eventQ.data
  const isOwner = me?.id === event.uid_owner || !!me?.is_admin

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
            <h1 className="font-display text-xl font-semibold">Acesso restrito</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-fg-3)' }}>
              Apenas o organizador do evento pode acessar este painel.
            </p>
            <Link href={`/vitrine/eventos/${uid}`} className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
              Ver evento
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const dataInicioFmt = new Date(event.data_inicio).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const s = statsQ.data

  return (
    <EntityProfileShell
      accentColor="orange"
      coverImage={event.imagem_capa ?? null}
      avatarImage={event.logo_url ?? null}
      initials={initials(event.titulo)}
      title={event.titulo}
      subtitle={`Painel do organizador · ${event.categoria}`}
      metadata={[
        { icon: Calendar, value: dataInicioFmt },
        { icon: MapPin, value: event.is_online ? 'Online' : (event.local ?? '—') },
      ]}
      statusPill={<span className={`pill ${STATUS_PILL[event.status] ?? 'pill-info'}`}>{STATUS_LABEL[event.status] ?? event.status}</span>}
      actions={
        <>
          <Link href={`/vitrine/eventos/${uid}`} className="btn btn-secondary btn-sm">
            <Eye size={14} /> Página pública
          </Link>
          <LifecycleControls event={event} qc={qc} />
        </>
      }
      stats={s ? [
        { label: 'Inscritos', value: s.total_inscritos },
        { label: 'Check-ins', value: s.total_check_ins },
        { label: 'Presentes', value: s.total_presentes },
        { label: 'Certificados', value: s.total_certificados_emitidos },
      ] : []}
      tabs={[
        {
          id: 'visao',
          label: 'Visão geral',
          content: <StatsPanel eventId={uid} event={event} />,
        },
        {
          id: 'participantes',
          label: 'Participantes',
          count: s?.total_inscritos,
          content: <ParticipantsPanel eventId={uid} />,
        },
        {
          id: 'qr',
          label: 'QR de Check-in',
          content: <QrPanel eventId={uid} />,
        },
        {
          id: 'certificados',
          label: 'Certificados',
          content: <CertificatesPanel eventId={uid} event={event} />,
        },
      ]}
    />
  )
}

// --- Lifecycle controls ---

function LifecycleControls({ event, qc }: { event: EventT; qc: ReturnType<typeof useQueryClient> }) {
  const pubM = useMutation({
    mutationFn: () => publishEvent(event.uid),
    onSuccess: () => {
      toast.success('Evento publicado — enviado para aprovação')
      qc.invalidateQueries({ queryKey: ['event', event.uid] })
    },
    onError: (e) => toastApiError(e, 'Não foi possível publicar.'),
  })
  const cancelM = useMutation({
    mutationFn: () => cancelEvent(event.uid),
    onSuccess: () => {
      toast.success('Evento cancelado')
      qc.invalidateQueries({ queryKey: ['event', event.uid] })
    },
    onError: (e) => toastApiError(e, 'Não foi possível cancelar.'),
  })
  const concludeM = useMutation({
    mutationFn: () => concludeEvent(event.uid),
    onSuccess: () => {
      toast.success('Evento concluído')
      qc.invalidateQueries({ queryKey: ['event', event.uid] })
    },
    onError: (e) => toastApiError(e, 'Ainda não é possível concluir.'),
  })

  const now = Date.now()
  const fim = new Date(event.data_fim).getTime()
  const podeConcluir = event.status === 'ativo' && now >= fim

  return (
    <>
      {event.status === 'rascunho' && (
        <button onClick={() => pubM.mutate()} disabled={pubM.isPending} className="btn btn-primary btn-sm">
          <Send size={14} /> Publicar
        </button>
      )}
      <Link href={`/vitrine/eventos/${event.uid}/editar`} className="btn btn-secondary btn-sm">
        <Pencil size={14} /> Editar
      </Link>
      {event.status !== 'cancelado' && event.status !== 'concluido' && (
        <button
          onClick={() => { if (confirm('Cancelar este evento? Participantes serão notificados.')) cancelM.mutate() }}
          disabled={cancelM.isPending}
          className="btn btn-secondary btn-sm"
          style={{ color: 'var(--color-orange)' }}
        >
          <Ban size={14} /> Cancelar
        </button>
      )}
      {podeConcluir && (
        <button onClick={() => concludeM.mutate()} disabled={concludeM.isPending} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-mint)' }}>
          <Flag size={14} /> Concluir
        </button>
      )}
    </>
  )
}

// --- Stats ---

function StatsPanel({ eventId, event }: { eventId: string; event: EventT }) {
  const statsQ = useQuery({ queryKey: ['event', eventId, 'stats'], queryFn: () => getEventStats(eventId) })
  if (statsQ.isLoading) return <p className="text-sm" style={{ color: 'var(--color-fg-3)' }}>Carregando…</p>
  const s = statsQ.data
  if (!s) return null
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Inscritos" value={s.total_inscritos} />
      <Stat label="Check-ins" value={s.total_check_ins} />
      <Stat label="Presentes" value={s.total_presentes} />
      <Stat label="Certificados" value={s.total_certificados_emitidos} />
      <Stat label="Capacidade" value={event.capacidade_maxima ?? '—'} />
      <Stat label="Taxa de presença" value={`${(s.taxa_presenca * 100).toFixed(0)}%`} />
      <Stat label="Conversão" value={`${(s.taxa_conversao * 100).toFixed(0)}%`} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <div className="card-body" style={{ padding: 14 }}>
        <div className="eyebrow">{label}</div>
        <div className="mt-1 font-display text-xl font-semibold">{value}</div>
      </div>
    </div>
  )
}

// --- Participants ---

function ParticipantsPanel({ eventId }: { eventId: string }) {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['event', eventId, 'participants'],
    queryFn: () => getEventParticipants(eventId),
  })
  const validM = useMutation({
    mutationFn: (uidUsuario: string) => validatePresence(eventId, uidUsuario),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', eventId, 'participants'] })
      qc.invalidateQueries({ queryKey: ['event', eventId, 'stats'] })
      toast.success('Presença validada')
    },
    onError: (e) => toastApiError(e, 'Falha ao validar.'),
  })

  if (q.isLoading) return <p className="text-sm" style={{ color: 'var(--color-fg-3)' }}>Carregando…</p>
  const list = q.data ?? []
  if (!list.length) {
    return (
      <div className="empty">
        <Users size={28} style={{ color: 'var(--color-fg-3)' }} />
        <h3>Ninguém inscrito ainda</h3>
      </div>
    )
  }

  return (
    <div className="card">
      <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {list.map((p) => (
          <li key={p.uid} className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{p.nome}</div>
              <div className="text-xs" style={{ color: 'var(--color-fg-3)' }}>{p.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <ParticipantStatusPill status={p.status} />
              {(p.status === 'check_in' || p.status === 'confirmado' || p.status === 'inscrito') && (
                <button
                  onClick={() => validM.mutate(p.uid_usuario)}
                  disabled={validM.isPending}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--color-mint)' }}
                >
                  <CheckCircle2 size={14} /> Presente
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ParticipantStatusPill({ status }: { status: Participante['status'] }) {
  const map: Record<Participante['status'], string> = {
    inscrito: 'pill-rascunho',
    confirmado: 'pill-info',
    check_in: 'pill-pendente',
    presente: 'pill-ativo',
    ausente: 'pill-cancelado',
    cancelado: 'pill-cancelado',
  }
  const label: Record<Participante['status'], string> = {
    inscrito: 'Inscrito',
    confirmado: 'Confirmado',
    check_in: 'Check-in',
    presente: 'Presente',
    ausente: 'Ausente',
    cancelado: 'Cancelado',
  }
  return <span className={cn('pill', map[status])}>{label[status]}</span>
}

// --- QR ---

function QrPanel({ eventId }: { eventId: string }) {
  const q = useQuery({ queryKey: ['event', eventId, 'qr'], queryFn: () => getEventQrCode(eventId) })
  if (q.isLoading) return <p className="text-sm" style={{ color: 'var(--color-fg-3)' }}>Gerando QR…</p>
  if (q.isError || !q.data) return <p className="text-sm" style={{ color: 'var(--color-danger)' }}>Não foi possível gerar o QR code.</p>

  const data = q.data as { png_base64?: string; payload?: string }
  return (
    <div className="card">
      <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
        <QrCode size={28} style={{ color: 'var(--color-fg-3)', margin: '0 auto 8px' }} />
        <h3 className="font-display text-lg font-semibold">QR de Check-in</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-fg-3)' }}>
          Imprima ou exiba este QR na entrada. Participantes escaneiam para fazer check-in.
        </p>
        {data.png_base64 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${data.png_base64}`}
            alt="QR Code"
            className="mx-auto mt-4 h-64 w-64 rounded-md"
            style={{ border: '1px solid var(--color-border)' }}
          />
        )}
        {data.payload && <code className="mt-4 block break-all text-xs" style={{ color: 'var(--color-fg-3)' }}>{data.payload}</code>}
      </div>
    </div>
  )
}

// --- Certificates ---

function CertificatesPanel({ eventId, event }: { eventId: string; event: EventT }) {
  const qc = useQueryClient()
  const genM = useMutation({
    mutationFn: () => generateCertificatesBulk(eventId),
    onSuccess: () => {
      toast.success('Certificados em geração')
      qc.invalidateQueries({ queryKey: ['event', eventId, 'stats'] })
    },
    onError: (e) => toastApiError(e, 'Falha ao gerar certificados.'),
  })

  if (event.status !== 'concluido') {
    return (
      <div className="empty">
        <Award size={28} style={{ color: 'var(--color-fg-3)' }} />
        <h3>Aguardando conclusão</h3>
        <p>Certificados ficam disponíveis após a conclusão do evento.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
        <Award size={40} style={{ color: 'var(--color-purple)', margin: '0 auto' }} />
        <h3 className="mt-2 font-display text-lg font-semibold">Gerar certificados em lote</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-fg-3)' }}>
          Emite o certificado para todos os participantes marcados como <strong>presente</strong>.
        </p>
        <button onClick={() => genM.mutate()} disabled={genM.isPending} className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
          {genM.isPending ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
          Gerar certificados
        </button>
      </div>
    </div>
  )
}
