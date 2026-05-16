'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ExternalLink, Download, Share2, Copy, Award, XCircle, Clock, RefreshCw, ShieldCheck } from 'lucide-react'
import { getEvent, getEventCertificate } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { toast } from 'sonner'

type CertState = 'ready' | 'not-generated' | 'not-eligible' | 'expired'

type CertData = {
  url?: string
  nome?: string
  evento?: string
  data?: string
  carga_horaria?: string
  codigo?: string
}

function CertificadoPreview({ nome, evento, data, carga, codigo }: { nome: string; evento: string; data: string; carga: string; codigo: string }) {
  return (
    <div className="cert-preview">
      <div className="cert-pattern"></div>
      <div className="cert-body">
        <div className="cert-head">
          <span style={{ font: '700 13px var(--font-display)', color: '#fff', letterSpacing: '-0.01em' }}>SeLinka · UFC</span>
        </div>
        <div className="cert-bigword">CERTIFICADO</div>
        <div className="cert-text">
          Certificamos que <b style={{ color: 'var(--color-mint)' }}>{nome}</b> participou do evento{' '}
          <b>{evento}</b>, realizado em <b>{data}</b>, com carga horária total de <b>{carga}</b>.
        </div>
        <div className="cert-foot">
          <div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: 6, font: '600 11px var(--font-body)', color: 'rgba(255,255,255,0.85)' }}>
              UFC · SeLinka
            </div>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)' }}>Pró-Reitoria de Pesquisa e Pós-Graduação</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ font: '500 9px var(--font-mono)', color: 'rgba(255,255,255,0.6)' }}>{codigo}</div>
            <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>selinka.ufc.br/verificar</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CertificadoPage() {
  const { uid } = useParams<{ uid: string }>()
  const user = useAuth((s) => s.me)

  const { data: event } = useQuery({
    queryKey: ['event', uid],
    queryFn: () => getEvent(uid),
    enabled: !!uid,
  })

  const { data: certData, refetch: refetchCert, isError, isLoading } = useQuery({
    queryKey: ['event-certificate', uid],
    queryFn: () => getEventCertificate(uid),
    enabled: !!uid,
    retry: false,
  })

  const cert = certData as CertData | undefined | null
  const codigo = cert?.codigo ?? `${uid?.slice(-6).toUpperCase()}-${(user?.id ?? '').slice(-6).toUpperCase()}-9F2A`

  // Determine state from API response
  const certState: CertState = (() => {
    if (isLoading || isError || !cert) return 'not-eligible'
    if (cert.url) return 'ready'
    return 'not-generated'
  })()

  const nome = cert?.nome ?? user?.id ?? 'Participante'
  const eventoNome = cert?.evento ?? event?.titulo ?? 'Evento SeLinka'
  const dataStr = cert?.data ?? (event ? new Date(event.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '')
  const carga = cert?.carga_horaria ?? '—'

  const gerarMut = useMutation({
    mutationFn: () => getEventCertificate(uid),
    onSuccess: () => { refetchCert(); toast.success('Certificado gerado!') },
    onError: () => toast.error('Erro ao gerar certificado'),
  })

  return (
    <div className="page page-narrow fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Eventos · {event?.titulo ?? uid} · Certificado</div>
          <h1>Meu certificado</h1>
          <div className="sub">
            Os certificados SeLinka são gerados após a conclusão do evento. URLs assinadas — válidas por 1 hora.
          </div>
        </div>
        <button className="btn btn-ghost btn-sm">
          <ExternalLink size={14} />Validar autenticidade
        </button>
      </div>

      <div className="grid-detail">
        <div className="col" style={{ gap: 18 }}>
          {certState === 'ready' && (
            <>
              <div className="cert-pdf-shell">
                <CertificadoPreview nome={nome} evento={eventoNome} data={dataStr} carga={carga} codigo={codigo} />
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {cert?.url ? (
                  <a href={cert.url} target="_blank" rel="noopener" className="btn btn-primary">
                    <Download size={14} />Baixar PDF
                  </a>
                ) : (
                  <button className="btn btn-primary"><Download size={14} />Baixar PDF</button>
                )}
                <button className="btn btn-secondary"><Share2 size={14} />Compartilhar</button>
                <button className="btn btn-tertiary">LinkedIn</button>
                <button
                  className="btn btn-ghost"
                  onClick={() => { navigator.clipboard.writeText(`selinka.ufc.br/verificar/${codigo}`); toast.success('Link copiado!') }}
                >
                  <Copy size={14} />Copiar link
                </button>
              </div>
            </>
          )}

          {certState === 'not-generated' && (
            <div className="card">
              <div className="card-body" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-mint-15)', color: '#006a3c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <Award size={28} />
                </div>
                <h3 style={{ font: '700 22px var(--font-display)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                  Você tem direito ao certificado deste evento!
                </h3>
                <p className="muted" style={{ maxWidth: '50ch', margin: '0 auto 22px', lineHeight: 1.55 }}>
                  Sua presença foi validada pelo organizador. Clique para gerar — leva ~3 segundos.
                </p>
                <button
                  className="btn btn-primary"
                  disabled={gerarMut.isPending}
                  onClick={() => gerarMut.mutate()}
                >
                  <Award size={14} />Gerar meu certificado
                </button>
              </div>
            </div>
          )}

          {certState === 'not-eligible' && (
            <div className="card" style={{ borderColor: 'rgba(229,16,46,0.18)' }}>
              <div className="card-body" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(229,16,46,0.08)', color: '#c50e29', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <XCircle size={28} />
                </div>
                <h3 style={{ font: '700 22px var(--font-display)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                  Você ainda não pode emitir este certificado
                </h3>
                <p style={{ maxWidth: '52ch', margin: '0 auto 4px', color: 'var(--color-fg-2)', lineHeight: 1.55 }}>
                  Para receber o certificado, é preciso que o evento esteja <b>concluído</b> e que sua presença tenha sido{' '}
                  <b>validada pelo organizador</b>.
                </p>
                <div className="row" style={{ gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                  <span className="tag tag-ink">Status do evento: <b style={{ marginLeft: 4 }}>{event?.status ?? 'Ativo'}</b></span>
                  <span className="tag tag-ink">Sua situação: <b style={{ marginLeft: 4 }}>Inscrito</b></span>
                </div>
                <Link href={`/eventos/${uid}/checkin`} className="btn btn-secondary" style={{ marginTop: 22 }}>
                  Fazer check-in agora
                </Link>
              </div>
            </div>
          )}

          {(certState as string) === 'expired' && (
            <div className="card" style={{ borderColor: 'rgba(255,158,0,0.3)' }}>
              <div className="card-body" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--color-orange-15)', color: '#8c5500', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <Clock size={28} />
                </div>
                <h3 style={{ font: '700 22px var(--font-display)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                  Link expirado
                </h3>
                <p className="muted" style={{ maxWidth: '52ch', margin: '0 auto 22px', lineHeight: 1.55 }}>
                  URLs de download têm validade de 1 hora por segurança. Gere uma nova — o certificado em si continua o mesmo.
                </p>
                <button className="btn btn-primary" onClick={() => refetchCert()}>
                  <RefreshCw size={14} />Gerar nova URL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-body">
              <div className="eyebrow">Dados do certificado</div>
              <div className="col" style={{ gap: 12, marginTop: 14 }}>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>NOME</div>
                  <div style={{ font: '600 14px var(--font-body)', marginTop: 2 }}>{nome}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>EVENTO</div>
                  <div style={{ font: '600 14px var(--font-body)', marginTop: 2 }}>{eventoNome}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>DATA</div>
                  <div style={{ font: '500 14px var(--font-body)', marginTop: 2 }}>{dataStr}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>CARGA HORÁRIA</div>
                  <div style={{ font: '500 14px var(--font-body)', marginTop: 2 }}>{carga}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize: 11 }}>CÓDIGO DE VERIFICAÇÃO</div>
                  <code style={{ font: '600 13px var(--font-mono)', marginTop: 4, display: 'inline-block', padding: '4px 8px', background: 'var(--color-surface-2)', borderRadius: 6 }}>
                    {codigo}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--color-ink)', color: '#fff', border: 0 }}>
            <div className="card-body">
              <ShieldCheck size={22} style={{ color: 'var(--color-mint)', marginBottom: 10 }} />
              <h4 style={{ font: '600 16px var(--font-display)', margin: '0 0 6px' }}>Certificado oficial SeLinka</h4>
              <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>
                Emitido pela UFC e assinado digitalmente. Qualquer pessoa pode confirmar a autenticidade em:
              </p>
              <code style={{ font: '500 12px var(--font-mono)', display: 'block', padding: '8px 10px', background: 'rgba(255,255,255,0.08)', color: 'var(--color-mint)', borderRadius: 6 }}>
                selinka.ufc.br/verificar/{codigo}
              </code>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
