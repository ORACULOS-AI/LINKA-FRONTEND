'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Users, MoreVertical, Mic, MicOff, Video, VideoOff,
  ScreenShare, Hand, MessageCircle, PhoneOff, Lock,
} from 'lucide-react'
import { getMeeting, getMeetingToken } from '@/lib/api/meetings'
import { useAuth } from '@/lib/stores/auth'
import { cn } from '@/lib/utils'

type Phase = 'pre' | 'connected' | 'ended'

function pad(n: number) { return String(n).padStart(2, '0') }

export default function SalaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const user = useAuth((s) => s.me)

  const [phase, setPhase] = useState<Phase>('pre')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [elapsedSecs, setElapsedSecs] = useState(0)

  const { data: meeting } = useQuery({
    queryKey: ['meeting', id],
    queryFn: () => getMeeting(id),
    enabled: !!id,
  })

  const { data: tokenData } = useQuery({
    queryKey: ['meeting-token', id],
    queryFn: () => getMeetingToken(id),
    enabled: !!id && phase === 'connected',
  })

  useEffect(() => {
    if (phase !== 'connected') return
    const t = setInterval(() => setElapsedSecs(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  const elapsed = `${pad(Math.floor(elapsedSecs / 3600))}:${pad(Math.floor((elapsedSecs % 3600) / 60))}:${pad(elapsedSecs % 60)}`

  const otherName = meeting
    ? (meeting.creator_id === user?.id ? meeting.participant_id : meeting.creator_id).slice(0, 8) + '…'
    : 'Participante'

  const title = meeting?.location_link ?? `Reunião ${id?.slice(-6) ?? ''}`

  return (
    <div className="sala-screen fade-in">
      {/* Sticky top bar */}
      <header className="sala-bar">
        <button className="sala-back" onClick={() => router.push('/reunioes')}>
          <ArrowLeft size={16} /> Sair da sala
        </button>
        <div className="sala-mid">
          <div className="sala-title">{title}</div>
          <div className="sala-sub">
            {phase === 'pre' && (
              <span className="row" style={{ gap: 6 }}><span className="dot-orange"></span> Aguardando você entrar</span>
            )}
            {phase === 'connected' && (
              <>
                <span className="row" style={{ gap: 6 }}><span className="dot-mint"></span> 2 participantes</span>
                <span className="muted">·</span>
                <span className="t-num">{elapsed}</span>
              </>
            )}
            {phase === 'ended' && (
              <span className="muted">Reunião encerrada</span>
            )}
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="avstack">
            <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'var(--color-purple)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {(user?.id ?? 'EU')[0] ?? 'E'}
            </div>
            <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'var(--color-blue)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {otherName[0]}
            </div>
          </div>
          <button className="btn-icon" title="Participantes"><Users size={16} /></button>
          <button className="btn-icon" title="Mais"><MoreVertical size={16} /></button>
        </div>
      </header>

      {/* PRE phase */}
      {phase === 'pre' && (
        <div className="sala-pre">
          <div className="pre-card">
            <div className="pre-cam">
              {camOn ? (
                <div className="cam-self">
                  <div className="avatar" style={{ width: 88, height: 88, fontSize: 32, background: 'var(--color-purple)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {(user?.id ?? 'EU')[0] ?? 'E'.toUpperCase()}
                  </div>
                  <div style={{ marginTop: 12, font: '600 14px var(--font-body)', color: '#fff' }}>{user?.id?.slice(0, 8)}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Câmera em preview · ninguém te vê ainda</div>
                </div>
              ) : (
                <div className="cam-off">
                  <VideoOff size={36} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <div style={{ marginTop: 12, font: '600 14px var(--font-body)', color: '#fff' }}>Câmera desligada</div>
                </div>
              )}
              <div className="cam-dock">
                <button className={cn('cam-tog', !micOn && 'off')} onClick={() => setMicOn(v => !v)}>
                  {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <button className={cn('cam-tog', !camOn && 'off')} onClick={() => setCamOn(v => !v)}>
                  {camOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
              </div>
            </div>
            <div className="pre-meta">
              <div className="eyebrow">Sala SeLinka · Jitsi Meet</div>
              <h2 style={{ font: '700 24px var(--font-display)', letterSpacing: '-0.02em', margin: '8px 0 6px' }}>{title}</h2>
              {meeting && (
                <div className="muted" style={{ marginBottom: 14 }}>
                  {new Date(meeting.scheduled_start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} ·{' '}
                  {new Date(meeting.scheduled_start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} –{' '}
                  {new Date(meeting.scheduled_end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <div className="row" style={{ gap: 10, marginBottom: 18 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--color-blue)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  {otherName[0]}
                </div>
                <div>
                  <div style={{ font: '600 13px var(--font-body)' }}>{otherName}</div>
                  <div className="muted">Participante</div>
                </div>
              </div>
              <div className="pre-status">
                <span className="dot-orange"></span> {otherName} ainda não entrou
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}
                onClick={() => setPhase('connected')}
              >
                <Video size={16} />Entrar agora
              </button>
              <div className="muted" style={{ marginTop: 12, textAlign: 'center', fontSize: 11.5 }}>
                <Lock size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                Sala criptografada · selinka-{id?.slice(-6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTED phase */}
      {phase === 'connected' && (
        <div className="sala-room">
          <div className="jitsi-tiles">
            <div className="jt-tile main">
              <div className="avatar" style={{ width: 120, height: 120, fontSize: 44, background: 'var(--color-blue)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {otherName[0]}
              </div>
              <div className="jt-name">{otherName} <Mic size={12} style={{ color: 'var(--color-mint)' }} /></div>
              <span className="jt-conn">HD</span>
            </div>
            <div className="jt-tile self">
              {camOn ? (
                <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, background: 'var(--color-purple)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(user?.id ?? 'EU')[0] ?? 'E'.toUpperCase()}
                </div>
              ) : (
                <VideoOff size={24} style={{ color: 'rgba(255,255,255,0.5)' }} />
              )}
              <div className="jt-name">
                Você {!micOn && <MicOff size={12} style={{ color: '#ff5577' }} />}
              </div>
            </div>
          </div>
          <div className="sala-dock">
            <button className={cn('dock-btn', !micOn && 'off')} onClick={() => setMicOn(v => !v)}>
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button className={cn('dock-btn', !camOn && 'off')} onClick={() => setCamOn(v => !v)}>
              {camOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button className="dock-btn"><ScreenShare size={20} /></button>
            <button className="dock-btn"><Hand size={20} /></button>
            <button className="dock-btn"><MessageCircle size={20} /></button>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
            <button className="dock-btn end" onClick={() => setPhase('ended')}>
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ENDED phase */}
      {phase === 'ended' && (
        <div className="sala-end">
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-mint-15)', color: '#006a3c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <PhoneOff size={28} />
          </div>
          <h2 style={{ font: '700 28px var(--font-display)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Reunião encerrada</h2>
          <div className="muted" style={{ marginBottom: 6 }}>{title}</div>
          <div className="muted" style={{ marginBottom: 24 }}>Duração total · {elapsed}</div>
          <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-tertiary">Salvar notas</button>
            <button className="btn btn-primary" onClick={() => router.push('/reunioes')}>
              Voltar para Minhas Reuniões
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
