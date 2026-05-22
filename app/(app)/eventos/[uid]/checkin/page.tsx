'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Shield, User, RefreshCw, Download, Maximize2, Printer, Check, QrCode, Info } from 'lucide-react'
import {
  getEvent, getEventQrCode, getEventStats, checkInEvent,
  type Event, type EventStats,
} from '@/lib/api/events'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Perspective = 'organizador' | 'participante'
type CheckinPhase = 'scan' | 'manual' | 'success'

function FakeQR({ seed = 'SELK', size = 280 }: { seed?: string; size?: number }) {
  const N = 21
  const rng = (i: number) => {
    let h = 0
    for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k) + i * 7) | 0
    return (Math.abs(h) % 100) / 100
  }
  const cells: [number, number][] = []
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const isFinder = (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7)
      if (isFinder) continue
      if (rng(y * N + x) > 0.5) cells.push([x, y])
    }
  }
  const finder = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`}>
      <rect width="7" height="7" fill="var(--color-ink)" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" fill="var(--color-ink)" />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${N} ${N}`} width={size} height={size} style={{ background: '#fff', display: 'block' }} shapeRendering="crispEdges">
      {cells.map(([x, y], i) => <rect key={i} x={x} y={y} width="1" height="1" fill="var(--color-ink)" />)}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  )
}

function CheckinOrganizador({ event, stats }: { event: Event; stats: EventStats | undefined }) {
  const present = stats?.total_presentes ?? 0
  const total = stats?.total_inscritos ?? event.capacidade_maxima ?? 0
  const pct = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
      {/* Big QR */}
      <div className="card">
        <div className="card-body" style={{ padding: 36, textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Token #{event.uid.slice(-6).toUpperCase()} · expira em 14:55
          </div>
          <h3 style={{ font: '700 22px var(--font-display)', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            Aponte a câmera para fazer check-in
          </h3>
          <div className="muted" style={{ marginBottom: 24 }}>
            Cada participante deve escanear o QR e bater o botão &ldquo;Confirmar&rdquo; no celular. O token roda a cada 5 minutos.
          </div>

          <div className="qr-frame">
            <FakeQR seed={event.uid.toUpperCase()} size={280} />
          </div>

          <div className="row" style={{ justifyContent: 'center', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
            <span className="row" style={{ gap: 6 }}>
              <span className="dot-mint" style={{ width: 8, height: 8 }}></span>
              <b>{present}</b>
              <span className="muted"> de {total} inscritos</span>
            </span>
            <span className="muted">·</span>
            <span className="muted">{pct}% presença</span>
          </div>

          <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 22, flexWrap: 'wrap' }}>
            <button className="btn btn-tertiary btn-sm"><RefreshCw size={13} />Gerar novo token</button>
            <button className="btn btn-tertiary btn-sm"><Download size={13} />Baixar QR (PNG)</button>
            <button className="btn btn-secondary btn-sm"><Maximize2 size={13} />Exibir no telão</button>
            <button className="btn btn-primary btn-sm"><Printer size={13} />Imprimir</button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="col" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="row" style={{ justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--color-border)' }}>
              <h4 style={{ font: '600 14px var(--font-display)', margin: 0 }}>Check-ins agora</h4>
              <span className="muted">tempo real</span>
            </div>
            <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--color-fg-3)', fontSize: 13 }}>
              Nenhum check-in ainda
            </div>
            <div style={{ padding: 14, textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ font: '600 12.5px var(--font-body)', cursor: 'pointer', color: 'var(--color-purple)' }}>
                Ver todos os participantes →
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="eyebrow">Status do evento</div>
            <div className="col" style={{ gap: 10, marginTop: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Status</span>
                <span className="pill pill-ativo"><span className="dot" style={{ background: 'var(--color-mint)' }}></span>Em andamento</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Inscritos</span>
                <b className="t-num">{total}</b>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Presentes</span>
                <b className="t-num">{present}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckinParticipante({ event, eventId }: { event: Event; eventId: string }) {
  const [phase, setPhase] = useState<CheckinPhase>('scan')
  const [code, setCode] = useState('')

  // Backend só aceita check-in com evento `ativo`. Espelhar a janela na UI:
  // 30min antes do início até 2h depois do fim.
  const now = Date.now()
  const inicio = new Date(event.data_inicio).getTime()
  const fim = new Date(event.data_fim).getTime()
  const janelaAberta =
    event.status === 'ativo' && now >= inicio - 30 * 60_000 && now <= fim + 2 * 60 * 60_000

  const checkinMut = useMutation({
    mutationFn: () => checkInEvent(eventId),
    onSuccess: () => setPhase('success'),
    onError: () => toast.error('Erro ao registrar check-in'),
  })

  if (!janelaAberta) {
    const antes = now < inicio - 30 * 60_000
    const concluido = event.status === 'concluido'
    const cancelado = event.status === 'cancelado'
    let titulo = 'Check-in indisponível'
    let descricao = ''
    if (cancelado) {
      titulo = 'Evento cancelado'
      descricao = 'Este evento foi cancelado pelo organizador.'
    } else if (concluido) {
      titulo = 'Evento concluído'
      descricao = 'Se você participou, seu certificado já está disponível.'
    } else if (antes) {
      const inicioStr = new Date(event.data_inicio).toLocaleString('pt-BR')
      titulo = 'Check-in ainda não liberado'
      descricao = `Volte a partir de ${inicioStr} (30 min antes do início).`
    } else {
      titulo = 'Janela de check-in encerrada'
      descricao = 'A janela de check-in (até 2h após o fim) já foi fechada.'
    }
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card">
          <div className="card-body" style={{ padding: '28px 24px', textAlign: 'center' }}>
            <Info size={28} style={{ color: 'var(--color-orange)' }} />
            <h3 style={{ font: '700 18px var(--font-display)', margin: '12px 0 4px' }}>{titulo}</h3>
            <div className="muted">{descricao}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '28px 24px 0', textAlign: 'center' }}>
          <span className="tag tag-orange">{event.categoria}</span>
          <h3 style={{ font: '700 22px var(--font-display)', letterSpacing: '-0.02em', margin: '12px 0 4px' }}>
            {event.titulo}
          </h3>
          <div className="muted">
            {new Date(event.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })} · {event.local ?? 'Online'}
          </div>
        </div>

        {phase === 'scan' && (
          <div className="card-body" style={{ padding: 24 }}>
            <div className="cam-frame">
              <div className="cam-feed">
                <div className="cam-grid"></div>
                <div className="cam-target"></div>
                <span className="cam-hint">Aproxime o QR do quadro</span>
              </div>
            </div>
            <div className="col" style={{ gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => checkinMut.mutate()}>
                <QrCode size={16} />Já estou em frente ao QR
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPhase('manual')}>
                Inserir código manualmente
              </button>
            </div>
            <div className="muted" style={{ textAlign: 'center', marginTop: 14, fontSize: 11.5 }}>
              <Info size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
              Permita acesso à câmera quando o navegador pedir.
            </div>
          </div>
        )}

        {phase === 'manual' && (
          <div className="card-body" style={{ padding: 24 }}>
            <div className="field">
              <label>Código do evento</label>
              <input
                className="input"
                placeholder={`${eventId.slice(-6).toUpperCase()}-XXXX`}
                style={{ textAlign: 'center', font: '600 18px var(--font-mono)', letterSpacing: '0.1em' }}
                value={code}
                onChange={e => setCode(e.target.value)}
              />
              <span className="hint">Peça ao organizador o código mostrado no painel — ele muda a cada 5 min.</span>
            </div>
            <div className="col" style={{ gap: 8, marginTop: 18 }}>
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                disabled={!code || checkinMut.isPending}
                onClick={() => checkinMut.mutate()}
              >
                <Check size={16} />Confirmar check-in
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setPhase('scan')}>
                Voltar a escanear
              </button>
            </div>
          </div>
        )}

        {phase === 'success' && (
          <div className="card-body" style={{ padding: '32px 24px', textAlign: 'center', background: 'var(--color-mint-08)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-mint)', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Check size={32} />
            </div>
            <h3 style={{ font: '700 20px var(--font-display)', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
              Presença registrada ✓
            </h3>
            <div className="muted" style={{ marginBottom: 18 }}>
              Seu certificado ficará disponível após a conclusão do evento.
            </div>
            <button className="btn btn-secondary" onClick={() => setPhase('scan')}>Concluído</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CheckinPage() {
  const { uid } = useParams<{ uid: string }>()
  const [persp, setPersp] = useState<Perspective>('organizador')

  const { data: event } = useQuery({
    queryKey: ['event', uid],
    queryFn: () => getEvent(uid),
    enabled: !!uid,
  })

  const { data: stats } = useQuery({
    queryKey: ['event-stats', uid],
    queryFn: () => getEventStats(uid),
    enabled: !!uid && persp === 'organizador',
  })

  if (!event) {
    return <div className="page fade-in"><div className="empty"><p>Carregando evento…</p></div></div>
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Eventos · {event.titulo} · Check-in</div>
          <h1>Check-in por QR Code</h1>
          <div className="sub">
            {event.titulo} · {new Date(event.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {event.local ?? 'Online'}
          </div>
        </div>
        {/* Perspective toggle */}
        <div style={{ display: 'inline-flex', borderRadius: 9999, padding: 4, background: 'var(--color-surface-2)' }}>
          {([
            { id: 'organizador' as Perspective, label: 'Organizador', Icon: Shield },
            { id: 'participante' as Perspective, label: 'Participante', Icon: User },
          ]).map(({ id, label, Icon: Ic }) => (
            <button
              key={id}
              onClick={() => setPersp(id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: 0, borderRadius: 9999, font: '600 12.5px var(--font-body)', cursor: 'pointer', background: persp === id ? 'var(--color-ink)' : 'transparent', color: persp === id ? '#fff' : 'var(--color-fg-2)' }}
            >
              <Ic size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {persp === 'organizador' && <CheckinOrganizador event={event} stats={stats} />}
      {persp === 'participante' && <CheckinParticipante event={event} eventId={uid} />}
    </div>
  )
}
