'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FlaskConical, Briefcase, Lightbulb, Calendar, Plus, type LucideIcon } from 'lucide-react'
import { getMyLabs } from '@/lib/api/labs'
import { getMyBusinesses } from '@/lib/api/business'
import { getMyInitiatives } from '@/lib/api/initiatives'
import { getMyEvents, getParticipatingEvents } from '@/lib/api/events'
import { EntityCard, type EntityKind } from '@/components/entity/EntityCard'
import { useAuth } from '@/lib/stores/auth'
import { cn } from '@/lib/utils'

const STATUS_PILL: Record<string, string> = {
  ativo: 'pill-ativo', aprovado: 'pill-ativo', APROVADO: 'pill-ativo', ATIVA: 'pill-ativo', presente: 'pill-ativo',
  pendente: 'pill-pendente', PENDENTE: 'pill-pendente', pendente_aprovacao: 'pill-pendente', check_in: 'pill-pendente',
  rascunho: 'pill-rascunho', PAUSADA: 'pill-pausada', inscrito: 'pill-rascunho',
  recusado: 'pill-cancelado', RECUSADO: 'pill-cancelado', cancelado: 'pill-cancelado', CANCELADA: 'pill-cancelado', ausente: 'pill-cancelado',
  concluido: 'pill-info', CONCLUIDA: 'pill-info', confirmado: 'pill-info',
}

export default function MeusItensPage() {
  const me = useAuth((s) => s.me)
  const labsQ = useQuery({ queryKey: ['me', 'labs'], queryFn: getMyLabs, enabled: me?.tipo === 'pesquisador' })
  const bizQ = useQuery({ queryKey: ['me', 'businesses'], queryFn: getMyBusinesses })
  const initsQ = useQuery({ queryKey: ['me', 'initiatives'], queryFn: getMyInitiatives })
  const evtsQ = useQuery({ queryKey: ['me', 'events'], queryFn: getMyEvents })
  const partQ = useQuery({ queryKey: ['me', 'participating'], queryFn: getParticipatingEvents })

  return (
    <div className="page fade-in" style={{ maxWidth: 1100 }}>
      <Link href="/perfil" className="row" style={{ gap: 4, color: 'var(--color-fg-3)', fontSize: 13, marginBottom: 12 }}>
        <ArrowLeft size={14} /> Voltar
      </Link>
      <div className="page-header">
        <div>
          <h1>Meus itens</h1>
          <p className="sub">Tudo que você criou ou faz parte na rede SeLinka.</p>
        </div>
      </div>

      <div className="col" style={{ gap: 28, marginTop: 8 }}>
        {me?.tipo === 'pesquisador' ? (
          <Section
            title="Laboratórios" Icon={FlaskConical} kind="laboratorio"
            createHref="/vitrine/laboratorios/novo" createLabel="Cadastrar laboratório"
            items={(labsQ.data ?? []).map((l) => ({
              id: l.uid, label: l.nome, sub: l.unidade,
              href: `/vitrine/laboratorios/${l.uid}`, status: l.status,
            }))}
            loading={labsQ.isLoading}
          />
        ) : (
          <section className="card">
            <div className="card-body">
              <header className="row" style={{ gap: 8, marginBottom: 10 }}>
                <FlaskConical size={18} style={{ color: 'var(--color-fg-3)' }} />
                <h2 className="font-display font-semibold" style={{ fontSize: 17 }}>Laboratórios</h2>
              </header>
              <div className="empty" style={{ padding: 16 }}>
                <p style={{ margin: 0 }}>
                  Apenas pesquisadores podem cadastrar laboratórios. Você pode ser <strong>convidado</strong> a integrar o time de um laboratório pelo responsável dele.
                </p>
              </div>
            </div>
          </section>
        )}

        <Section
          title="Negócios" Icon={Briefcase} kind="negocio"
          createHref="/vitrine/negocios/novo" createLabel="Cadastrar negócio"
          items={(bizQ.data ?? []).map((b) => ({
            id: b.id, label: b.nome, sub: b.categoria,
            href: `/vitrine/negocios/${b.id}`, status: b.status,
          }))}
          loading={bizQ.isLoading}
        />
        <Section
          title="Projetos" Icon={Lightbulb} kind="projeto"
          createHref="/vitrine/projetos/novo" createLabel="Criar projeto"
          items={(initsQ.data ?? []).map((i) => ({
            id: i.uid, label: i.titulo, sub: i.tipo,
            href: `/vitrine/projetos/${i.uid}`, status: i.status,
          }))}
          loading={initsQ.isLoading}
        />
        <Section
          title="Eventos organizados" Icon={Calendar} kind="evento"
          createHref="/vitrine/eventos/novo" createLabel="Criar evento"
          items={(evtsQ.data ?? []).map((e) => ({
            id: e.uid, label: e.titulo, sub: new Date(e.data_inicio).toLocaleDateString('pt-BR'),
            href: `/eventos/${e.uid}/painel`, status: e.status,
          }))}
          loading={evtsQ.isLoading}
        />
        <Section
          title="Eventos em que estou inscrito" Icon={Calendar} kind="evento"
          items={(partQ.data ?? []).map((p) => ({
            id: p.uid, label: `Evento ${p.event_id.slice(-6).toUpperCase()}`, sub: p.status,
            href: `/vitrine/eventos/${p.event_id}`, status: p.status,
          }))}
          loading={partQ.isLoading}
        />
      </div>
    </div>
  )
}

type Item = { id: string; label: string; sub?: string; href: string; status?: string }

function Section({
  title, Icon, items, loading, createHref, createLabel, kind,
}: {
  title: string
  Icon: LucideIcon
  items: Item[]
  loading?: boolean
  createHref?: string
  createLabel?: string
  kind: EntityKind
}) {
  return (
    <section>
      <header className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 className="row" style={{ gap: 8, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17 }}>
          <Icon size={18} style={{ color: 'var(--color-fg-3)' }} /> {title}
          <span className="pill pill-rascunho" style={{ textTransform: 'none', letterSpacing: 0 }}>{items.length}</span>
        </h2>
        {createHref && (
          <Link href={createHref} className="btn btn-secondary btn-sm">
            <Plus size={13} /> {createLabel ?? 'Criar'}
          </Link>
        )}
      </header>
      {loading ? (
        <p className="text-sm" style={{ color: 'var(--color-fg-3)' }}>Carregando…</p>
      ) : items.length === 0 ? (
        <div className="empty"><p style={{ margin: 0 }}>Nada por aqui ainda.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <EntityCardWithStatus key={it.id} item={it} kind={kind} />
          ))}
        </div>
      )}
    </section>
  )
}

function EntityCardWithStatus({ item, kind }: { item: Item; kind: EntityKind }) {
  return (
    <div style={{ position: 'relative' }}>
      <EntityCard
        id={item.id}
        kind={kind}
        href={item.href}
        nome={item.label}
        descricao={item.sub}
      />
      {item.status && (
        <span
          className={cn('pill', STATUS_PILL[item.status] ?? 'pill-rascunho')}
          style={{ position: 'absolute', top: 12, right: 14, zIndex: 1 }}
        >
          {item.status}
        </span>
      )}
    </div>
  )
}
