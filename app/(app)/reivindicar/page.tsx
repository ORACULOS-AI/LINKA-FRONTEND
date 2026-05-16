'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Shield, Microscope, Info, Clock, BadgeCheck, XCircle, Check, X, FlaskConical } from 'lucide-react'
import {
  claimLab, getLabClaimStatus, listLabClaims,
  approveLabClaim, rejectLabClaim,
  type LabClaim,
} from '@/lib/api/claims'
import { getLab } from '@/lib/api/labs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Persp = 'pesquisador' | 'admin'
type View = 'form' | 'status'

const MIN_LEN = 20
const MAX_LEN = 2000

function ClaimStatusBanner({ claim, onNew }: { claim: LabClaim; onNew: () => void }) {
  const isPending = claim.status === 'pendente'
  const isApproved = claim.status === 'aprovado'

  const palette = isPending
    ? { bg: 'var(--color-orange-15)', fg: '#8c5500', label: 'Em análise', Icon: Clock }
    : isApproved
    ? { bg: 'var(--color-mint-15)', fg: '#006a3c', label: 'Aprovada', Icon: BadgeCheck }
    : { bg: 'rgba(229,16,46,0.08)', fg: '#c50e29', label: 'Recusada', Icon: XCircle }

  const { Icon: Ic } = palette

  return (
    <div className="card" style={{ borderColor: palette.fg + '33' }}>
      <div className="card-body" style={{ padding: 0 }}>
        <div style={{ padding: 22, background: palette.bg, color: palette.fg, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', color: palette.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <span style={{ font: '700 11px var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{palette.label}</span>
              <span style={{ fontSize: 12, opacity: 0.8 }}>· enviada {new Date(claim.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div style={{ font: '600 16px var(--font-display)', margin: '4px 0 2px' }}>
              {isPending && 'Sua reivindicação está na fila da PRPPG'}
              {isApproved && 'Você é o responsável pelo laboratório!'}
              {claim.status === 'rejeitado' && 'Sua reivindicação foi recusada'}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.9 }}>
              {isPending && 'A decisão sai em até 3 dias úteis. Você pode cancelar agora e enviar outra justificativa se quiser.'}
              {isApproved && 'Agora você pode editar os dados do laboratório, adicionar membros e vincular projetos.'}
              {claim.status === 'rejeitado' && 'Verifique os requisitos e tente novamente com mais detalhes.'}
            </div>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Sua reivindicação</div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--color-fg-2)', lineHeight: 1.5 }}>
            ID: <code style={{ fontSize: 12 }}>{claim.id}</code>
          </p>
          <div style={{ borderTop: '1px solid var(--color-border)', margin: '18px 0' }} />
          <div className="row" style={{ justifyContent: 'space-between' }}>
            {isPending && (
              <>
                <button className="btn btn-tertiary btn-sm"><X size={13} />Cancelar solicitação</button>
                <span className="muted">ID #{claim.id.slice(-6)}</span>
              </>
            )}
            {isApproved && (
              <>
                <button className="btn btn-ghost">Editar laboratório</button>
                <button className="btn btn-primary">Ir ao laboratório</button>
              </>
            )}
            {claim.status === 'rejeitado' && (
              <>
                <button className="btn btn-ghost" onClick={onNew}>Enviar nova justificativa</button>
                <span className="muted">Recusada em {new Date(claim.updated_at).toLocaleDateString('pt-BR')}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClaimPesquisador({ labUid }: { labUid: string | null }) {
  const [view, setView] = useState<View>('form')
  const [justificativa, setJustificativa] = useState('')
  const qc = useQueryClient()

  const { data: lab } = useQuery({
    queryKey: ['lab', labUid],
    queryFn: () => getLab(labUid!),
    enabled: !!labUid,
  })

  const { data: claimStatus } = useQuery({
    queryKey: ['lab-claim-status', labUid],
    queryFn: () => getLabClaimStatus(labUid!),
    enabled: !!labUid,
  })

  const { data: allClaims = [] } = useQuery({
    queryKey: ['claims', 'labs'],
    queryFn: listLabClaims,
  })

  const myClaim = (allClaims as LabClaim[]).find(c => c.lab_uid === labUid)

  const claimMut = useMutation({
    mutationFn: () => claimLab(labUid!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-claim-status', labUid] })
      qc.invalidateQueries({ queryKey: ['claims', 'labs'] })
      setView('status')
      toast.success('Reivindicação enviada!')
    },
    onError: () => toast.error('Erro ao enviar reivindicação'),
  })

  const valid = justificativa.trim().length >= MIN_LEN

  return (
    <div className="grid-detail">
      <div className="col" style={{ gap: 18 }}>
        {/* Lab header */}
        {lab && (
          <div className="entity-hero" style={{ marginBottom: 0 }}>
            <div className="cover cover-blue" style={{ height: 120 }}></div>
            <div className="body" style={{ paddingBottom: 18 }}>
              <div className="logo" style={{ width: 72, height: 72, fontSize: 22, top: -32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-blue)', color: '#fff', borderRadius: 16, position: 'absolute' }}>
                {(lab.sigla as string | null | undefined) ?? lab.nome.slice(0, 3).toUpperCase()}
              </div>
              <div style={{ paddingTop: 48 }}>
                <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                  <span className="tag tag-blue">Laboratório</span>
                  <span className="tag tag-orange">Não reivindicado</span>
                </div>
                <h1 style={{ font: '700 22px var(--font-display)', margin: 0 }}>{lab.nome}</h1>
                <div className="sub" style={{ marginTop: 4 }}>
                  {lab.unidade && <span>{lab.unidade}</span>}
                  {lab.campus && <><span>·</span><span>Campus {lab.campus}</span></>}
                </div>
              </div>
            </div>
          </div>
        )}

        {!labUid && (
          <div className="card">
            <div className="card-body" style={{ padding: 24 }}>
              <div className="field">
                <label>UID do laboratório</label>
                <input className="input" placeholder="Cole o UID do laboratório que deseja reivindicar" />
                <span className="hint">Você pode encontrar o UID na página do laboratório.</span>
              </div>
            </div>
          </div>
        )}

        {/* Form / Status */}
        {(view === 'form' || !myClaim) && (
          <div className="card">
            <div className="card-body" style={{ padding: 24 }}>
              <h3 style={{ font: '600 18px var(--font-display)', margin: '0 0 6px' }}>Justificar a reivindicação</h3>
              <p className="muted" style={{ margin: '0 0 18px', fontSize: 13.5 }}>
                Explique sua relação formal com o laboratório. Inclua referências (SIAPE, portarias, projetos vigentes, chave de sala) que ajudem a PRPPG a aprovar.
              </p>

              <div className="field">
                <label>Justificativa</label>
                <textarea
                  className="textarea"
                  rows={6}
                  value={justificativa}
                  onChange={e => setJustificativa(e.target.value.slice(0, MAX_LEN))}
                  placeholder="Ex.: Sou docente do DETI/UFC desde 2019 e coordeno o laboratório desde 2023…"
                />
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                  <span className={cn('hint', justificativa.length > 0 && !valid && 'is-error')}>
                    {!valid && justificativa.length > 0 ? `Mínimo ${MIN_LEN} caracteres` : `Entre ${MIN_LEN} e ${MAX_LEN} caracteres`}
                  </span>
                  <span className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{justificativa.length} / {MAX_LEN}</span>
                </div>
              </div>

              <div style={{ padding: 14, background: 'var(--color-blue-08)', borderRadius: 'var(--radius-md)', marginTop: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Info size={18} style={{ color: 'var(--color-blue)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: 'var(--color-fg-1)', lineHeight: 1.5 }}>
                  Sua solicitação será analisada pela <b>PRPPG · UFC</b> em até 3 dias úteis. Você receberá uma notificação no SeLinka quando houver decisão.
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', margin: '20px 0 16px' }} />
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" onClick={() => history.back()}>Cancelar</button>
                <button
                  className="btn btn-primary"
                  disabled={!valid || !labUid || claimMut.isPending}
                  onClick={() => claimMut.mutate()}
                >
                  Enviar reivindicação
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'status' && myClaim && (
          <ClaimStatusBanner claim={myClaim} onNew={() => setView('form')} />
        )}
      </div>

      {/* Right rail */}
      <aside className="col" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-body">
            <div className="eyebrow">Estado atual</div>
            <p style={{ marginTop: 10, fontSize: 13, color: 'var(--color-fg-2)', lineHeight: 1.5 }}>
              Este laboratório ainda não tem um responsável institucional vinculado. Os dados foram importados do SIGAA em pré-cadastro.
            </p>
            <div style={{ borderTop: '1px solid var(--color-border)', margin: '14px 0' }} />
            <div className="col" style={{ gap: 10 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Responsável atual</span><b>—</b>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Importado em</span><span>12 jan 2024</span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Fonte</span><span className="tag tag-ink">SIGAA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="eyebrow">Quem pode reivindicar</div>
            <ul style={{ margin: '12px 0 0', padding: '0 0 0 18px', fontSize: 13, color: 'var(--color-fg-2)', lineHeight: 1.7 }}>
              <li>Pesquisadores com SIAPE da UFC</li>
              <li>Coordenadores designados por portaria</li>
              <li>Vínculo formal com a unidade do lab</li>
            </ul>
            <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
              Estudantes e parceiros externos podem solicitar ingresso na equipe, mas não titularidade.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function ClaimAdmin() {
  const qc = useQueryClient()

  const { data: labClaims = [] } = useQuery({
    queryKey: ['claims', 'labs'],
    queryFn: listLabClaims,
  })

  const claims = labClaims as LabClaim[]
  const pendentes = claims.filter(c => c.status === 'pendente')
  const historico = claims.filter(c => c.status !== 'pendente')

  const approveMut = useMutation({
    mutationFn: (id: string) => approveLabClaim(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); toast.success('Aprovado!') },
    onError: () => toast.error('Erro ao aprovar'),
  })

  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectLabClaim(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); toast.success('Recusado') },
    onError: () => toast.error('Erro ao recusar'),
  })

  return (
    <>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { l: 'Aguardando análise',    v: pendentes.length, d: '2 há mais de 24h',       cor: 'orange', Icon: Clock },
          { l: 'Aprovadas (mês)',        v: historico.filter(c => c.status === 'aprovado').length, d: '', cor: 'mint', Icon: BadgeCheck },
          { l: 'Recusadas (mês)',        v: historico.filter(c => c.status === 'rejeitado').length, d: 'todas com justificativa', cor: 'ink', Icon: XCircle },
          { l: 'Labs sem responsável',   v: 14, d: 'em pré-cadastro do SIGAA',             cor: 'blue', Icon: FlaskConical },
        ].map(({ l, v, d, cor, Icon: Ic }) => (
          <div key={l} className="card">
            <div className="card-body" style={{ padding: 18 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="eyebrow">{l}</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `var(--color-${cor}-08, var(--color-surface-2))`, color: `var(--color-${cor})` }}>
                  <Ic size={16} />
                </div>
              </div>
              <div style={{ font: '700 32px var(--font-display)', marginTop: 8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              <div className="muted" style={{ marginTop: 6 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ font: '600 20px var(--font-display)', margin: 0 }}>Pendentes · {pendentes.length}</h3>
        <div className="row" style={{ gap: 8 }}>
          <select className="select" style={{ width: 'auto' }}>
            <option>Mais antigas primeiro</option>
            <option>Mais recentes</option>
          </select>
        </div>
      </div>

      <div className="col" style={{ gap: 10, marginBottom: 32 }}>
        {pendentes.length === 0 ? (
          <div className="empty"><h3>Nenhuma solicitação pendente</h3></div>
        ) : pendentes.map(c => (
          <div key={c.id} className="card">
            <div className="card-body" style={{ padding: 18 }}>
              <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {c.user_uid[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ font: '600 14.5px var(--font-body)' }}>{c.user_uid.slice(0, 12)}…</span>
                    <span className="muted">→</span>
                    <span style={{ font: '600 13.5px var(--font-body)' }}>{c.lab_uid.slice(0, 12)}…</span>
                    <span className="muted" style={{ marginLeft: 'auto' }}>
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="row" style={{ gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'rgba(229,16,46,0.1)', color: '#c50e29', border: '1px solid rgba(229,16,46,0.2)' }}
                      onClick={() => rejectMut.mutate(c.id)}
                    >
                      <X size={12} />Recusar
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => approveMut.mutate(c.id)}>
                      <Check size={12} />Aprovar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {historico.length > 0 && (
        <>
          <h3 style={{ font: '600 20px var(--font-display)', margin: '0 0 14px' }}>Histórico recente</h3>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Laboratório</th>
                  <th>Solicitante</th>
                  <th>Status</th>
                  <th>Decidida em</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.lab_uid.slice(0, 16)}…</td>
                    <td>{c.user_uid.slice(0, 12)}…</td>
                    <td>
                      <span className={cn('pill', c.status === 'aprovado' ? 'pill-ativo' : 'pill-pausada')}>
                        <span className="dot" style={{ background: c.status === 'aprovado' ? 'var(--color-mint)' : 'var(--color-fg-3)' }}></span>
                        {c.status === 'aprovado' ? 'Aprovado' : 'Recusado'}
                      </span>
                    </td>
                    <td className="muted">{new Date(c.updated_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

export default function ReivindicarPage() {
  const searchParams = useSearchParams()
  const labUid = searchParams.get('lab')
  const [persp, setPersp] = useState<Persp>('pesquisador')

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Reivindicar laboratório</h1>
          <div className="sub">
            Pesquisadores podem reivindicar a titularidade de laboratórios pré-cadastrados. Administradores da PRPPG aprovam ou recusam com justificativa.
          </div>
        </div>
        <div style={{ display: 'inline-flex', borderRadius: 9999, padding: 4, background: 'var(--color-surface-2)' }}>
          {([
            { id: 'pesquisador' as Persp, label: 'Pesquisador', Icon: Microscope },
            { id: 'admin' as Persp, label: 'Admin · PRPPG', Icon: Shield },
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

      {persp === 'pesquisador' && <ClaimPesquisador labUid={labUid} />}
      {persp === 'admin' && <ClaimAdmin />}
    </div>
  )
}
