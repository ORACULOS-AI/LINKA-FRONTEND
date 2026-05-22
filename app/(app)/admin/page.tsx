'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Lightbulb, BadgeAlert, BadgeCheck, Upload, Plus, MapPin, Check, X } from 'lucide-react'
import {
  listBusinessClaims, listLabClaims,
  approveBusinessClaim, rejectBusinessClaim,
  approveLabClaim, rejectLabClaim,
  type BusinessClaim, type LabClaim,
} from '@/lib/api/claims'
import { getDashboard } from '@/lib/api/dashboard'
import { listAdminInitiatives } from '@/lib/api/initiatives'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type AdminTab = 'claims' | 'iniciativas' | 'visibilidade' | 'tokens'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const cls = normalized === 'pendente' ? 'pill-pendente'
    : normalized === 'aprovado' ? 'pill-ativo'
    : 'pill-pausada'
  const label = normalized === 'pendente' ? 'Pendente' : normalized === 'aprovado' ? 'Aprovado' : 'Rejeitado'
  const dot = normalized === 'pendente' ? 'var(--color-orange)' : normalized === 'aprovado' ? 'var(--color-mint)' : 'var(--color-fg-3)'
  return (
    <span className={`pill ${cls}`}>
      <span className="dot" style={{ background: dot }}></span>
      {label}
    </span>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('claims')
  const qc = useQueryClient()

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  const { data: bizClaims = [] } = useQuery({
    queryKey: ['claims', 'business'],
    queryFn: listBusinessClaims,
  })

  const { data: labClaims = [] } = useQuery({
    queryKey: ['claims', 'labs'],
    queryFn: listLabClaims,
  })

  const { data: pendingInitiatives = [] } = useQuery({
    queryKey: ['admin', 'initiatives', 'pending'],
    queryFn: listAdminInitiatives,
  })

  const approveBiz = useMutation({
    mutationFn: (id: string) => approveBusinessClaim(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); toast.success('Claim aprovado!') },
    onError: () => toast.error('Erro ao aprovar'),
  })
  const rejectBiz = useMutation({
    mutationFn: (id: string) => rejectBusinessClaim(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); toast.success('Claim recusado') },
    onError: () => toast.error('Erro ao recusar'),
  })
  const approveLab = useMutation({
    mutationFn: (id: string) => approveLabClaim(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); toast.success('Claim aprovado!') },
    onError: () => toast.error('Erro ao aprovar'),
  })
  const rejectLab = useMutation({
    mutationFn: (id: string) => rejectLabClaim(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['claims'] }); toast.success('Claim recusado') },
    onError: () => toast.error('Erro ao recusar'),
  })

  const allClaims = [
    ...(bizClaims as BusinessClaim[]).map(c => ({ ...c, tipo: 'Negócio' as const })),
    ...(labClaims as LabClaim[]).map(c => ({ ...c, tipo: 'Laboratório' as const })),
  ]
  const pendingClaims = allClaims.filter(c => c.status === 'pendente')

  const now = new Date()
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
  const claimsAging = pendingClaims.filter(
    (c) => now.getTime() - new Date(c.created_at).getTime() >= SEVEN_DAYS_MS,
  ).length

  const projetosPendentes = pendingInitiatives.filter((i) => i.status === 'PENDENTE')
  const projetosNovosEstaSemana = projetosPendentes.filter(
    (i) => now.getTime() - new Date(i.created_at).getTime() < SEVEN_DAYS_MS,
  ).length

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const approvedThisMonth = allClaims.filter(
    (c) => c.status === 'aprovado' && new Date(c.updated_at) >= startOfMonth,
  ).length
  const approvedPrevMonth = allClaims.filter(
    (c) =>
      c.status === 'aprovado' &&
      new Date(c.updated_at) >= startOfPrevMonth &&
      new Date(c.updated_at) < startOfMonth,
  ).length
  const monthDelta = approvedPrevMonth
    ? Math.round(((approvedThisMonth - approvedPrevMonth) / approvedPrevMonth) * 100)
    : null
  const monthDeltaLabel = monthDelta === null
    ? approvedThisMonth > 0 ? 'sem comparativo anterior' : 'nenhuma no mês anterior'
    : `${monthDelta >= 0 ? '+' : ''}${monthDelta}% vs. mês anterior`

  const KPI_CARDS = [
    {
      l: 'Claims pendentes',
      v: pendingClaims.length,
      d: claimsAging > 0 ? `${claimsAging} aberto${claimsAging === 1 ? '' : 's'} há 7+ dias` : 'todos dentro do prazo',
      cor: 'orange',
      Icon: Shield,
    },
    {
      l: 'Projetos para aprovar',
      v: projetosPendentes.length,
      d: projetosNovosEstaSemana > 0 ? `${projetosNovosEstaSemana} submetido${projetosNovosEstaSemana === 1 ? '' : 's'} esta semana` : 'sem novidades esta semana',
      cor: 'blue',
      Icon: Lightbulb,
    },
    {
      l: 'Entidades não reivindicadas',
      v: '—',
      d: 'endpoint dedicado pendente',
      cor: 'purple',
      Icon: BadgeAlert,
    },
    {
      l: 'Verificações concluídas (mês)',
      v: approvedThisMonth,
      d: monthDeltaLabel,
      cor: 'mint',
      Icon: BadgeCheck,
    },
  ]

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Gestão · Painel admin</div>
          <h1>Painel admin</h1>
          <div className="sub">
            Aprovação de claims, validação de projetos e visibilidade pública das entidades. Acesso restrito a técnicos administrativos.
          </div>
        </div>
        <button className="btn btn-tertiary btn-sm">
          <Upload size={14} />Exportar relatório
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {KPI_CARDS.map(({ l, v, d, cor, Icon }) => (
          <div key={l} className="card">
            <div className="card-body" style={{ padding: 18 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="eyebrow">{l}</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `var(--color-${cor}-08, var(--color-surface-2))`, color: `var(--color-${cor})` }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{ font: '700 32px var(--font-display)', marginTop: 8, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              <div className="muted" style={{ marginTop: 6 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs-bar">
        {([
          { id: 'claims' as AdminTab,      l: `Claims de entidades · ${pendingClaims.length} pendentes` },
          { id: 'iniciativas' as AdminTab, l: `Projetos pendentes · ${projetosPendentes.length}` },
          { id: 'visibilidade' as AdminTab, l: 'Visibilidade pública' },
          { id: 'tokens' as AdminTab,      l: 'Tokens de claim' },
        ]).map(t => (
          <button key={t.id} className={cn('tab', tab === t.id && 'active')} onClick={() => setTab(t.id)}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Claims tab */}
      {tab === 'claims' && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Entidade</th>
                <th>Tipo</th>
                <th>Requerente</th>
                <th>Solicitado</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {allClaims.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-fg-3)', padding: '24px 0' }}>Nenhum claim encontrado</td></tr>
              ) : allClaims.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="who">
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-purple-08)', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flex: 'none' }}>
                        {c.tipo === 'Negócio' ? 'N' : 'L'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{'negocio_id' in c ? (c as BusinessClaim).negocio_id : (c as LabClaim).lab_uid}</div>
                        <div className="muted">{c.tipo}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="tag tag-purple">{c.tipo}</span></td>
                  <td>{c.user_uid.slice(0, 12)}…</td>
                  <td className="muted">{formatDate(c.created_at)}</td>
                  <td><StatusPill status={c.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    {c.status === 'pendente' ? (
                      <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-tertiary btn-sm">Detalhes</button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(229,16,46,0.1)', color: '#c50e29', border: '1px solid rgba(229,16,46,0.2)' }}
                          onClick={() => c.tipo === 'Negócio' ? rejectBiz.mutate(c.id) : rejectLab.mutate(c.id)}
                        >
                          <X size={12} />Recusar
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => c.tipo === 'Negócio' ? approveBiz.mutate(c.id) : approveLab.mutate(c.id)}
                        >
                          <Check size={12} />Aprovar
                        </button>
                      </div>
                    ) : (
                      <span className="muted">— {c.status} em {formatDate(c.updated_at)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Iniciativas tab */}
      {tab === 'iniciativas' && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Tipo</th>
                <th>Host</th>
                <th>Submetida</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {projetosPendentes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-fg-3)', padding: '24px 0' }}>
                    Nenhum projeto pendente
                  </td>
                </tr>
              ) : projetosPendentes.map((p) => (
                <tr key={p.uid}>
                  <td>
                    <div className="who">
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-blue-08)', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                        <Lightbulb size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.titulo}</div>
                        <div className="muted">{p.nivel_maturidade}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="tag tag-purple">{p.tipo}</span></td>
                  <td className="muted">{p.host_type} · {p.host_id.slice(0, 8)}…</td>
                  <td className="muted">{formatDate(p.created_at)}</td>
                  <td><StatusPill status="pendente" /></td>
                  <td style={{ textAlign: 'right' }}>
                    <a href={`/vitrine/projetos/${p.uid}`} className="btn btn-tertiary btn-sm">Revisar</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Visibilidade tab */}
      {tab === 'visibilidade' && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Entidade</th>
                <th>Tipo</th>
                <th>Reivindicada</th>
                <th>Visibilidade</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {allClaims.map(c => (
                <tr key={c.id}>
                  <td className="who">
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-purple-08)', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flex: 'none' }}>
                      {c.tipo === 'Negócio' ? 'N' : 'L'}
                    </div>
                    <span style={{ fontWeight: 600 }}>{'negocio_id' in c ? (c as BusinessClaim).negocio_id : (c as LabClaim).lab_uid}</span>
                  </td>
                  <td><span className="tag tag-purple">{c.tipo}</span></td>
                  <td><StatusPill status={c.status === 'aprovado' ? 'aprovado' : 'pendente'} /></td>
                  <td>
                    <label className="row" style={{ gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={c.status === 'aprovado'} style={{ accentColor: 'var(--color-mint)' }} />
                      <span style={{ fontSize: 13 }}>{c.status === 'aprovado' ? 'Pública' : 'Oculta'}</span>
                    </label>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-tertiary btn-sm">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tokens tab */}
      {tab === 'tokens' && (
        <div className="card">
          <div className="card-body" style={{ padding: 24, textAlign: 'center' }}>
            <h4 style={{ font: '600 17px var(--font-display)', margin: '0 0 8px' }}>Tokens de claim</h4>
            <p className="muted" style={{ marginBottom: 16 }}>
              A gestão completa de tokens (gerar, listar, revogar) foi movida para uma página dedicada.
            </p>
            <Link href="/admin/tokens" className="btn btn-primary btn-sm">
              Abrir gestão de tokens
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
