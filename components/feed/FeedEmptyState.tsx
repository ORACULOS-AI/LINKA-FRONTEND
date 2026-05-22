'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  UserPlus,
  Sparkles,
  Plus,
  FlaskConical,
  Briefcase,
  Lightbulb,
  Calendar,
} from 'lucide-react'
import { getSuggestions } from '@/lib/api/connections'
import {
  fetchShowcaseLabs,
  fetchShowcaseNegocios,
  fetchShowcaseIniciativas,
  fetchShowcaseEventos,
} from '@/lib/api/showcase'
import { followUser } from '@/lib/api/connections'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { toast } from 'sonner'

const CREATE_CTA: Record<
  string,
  { label: string; href: string; icon: typeof FlaskConical }
> = {
  pesquisador: { label: 'Cadastrar laboratório', href: '/vitrine/laboratorios/novo', icon: FlaskConical },
  estudante: { label: 'Explorar oportunidades', href: '/vitrine', icon: Sparkles },
  tecnico_admin: { label: 'Conhecer iniciativas', href: '/vitrine?tab=projetos', icon: Lightbulb },
  externo: { label: 'Cadastrar negócio', href: '/vitrine/negocios/novo', icon: Briefcase },
}

export function FeedEmptyState() {
  const me = useAuth((s) => s.me)
  const cta = me ? CREATE_CTA[me.tipo] ?? CREATE_CTA.externo : null

  const suggQ = useQuery({
    queryKey: ['empty', 'suggestions'],
    queryFn: () => getSuggestions(8),
  })
  const labsQ = useQuery({
    queryKey: ['empty', 'showcase-labs'],
    queryFn: () => fetchShowcaseLabs(4),
  })
  const bizQ = useQuery({
    queryKey: ['empty', 'showcase-business'],
    queryFn: () => fetchShowcaseNegocios(4),
  })
  const initsQ = useQuery({
    queryKey: ['empty', 'showcase-inits'],
    queryFn: () => fetchShowcaseIniciativas(4),
  })
  const eventsQ = useQuery({
    queryKey: ['empty', 'showcase-events'],
    queryFn: () => fetchShowcaseEventos(4),
  })

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <h2 className="font-display text-xl font-semibold">Bem-vindo à rede SeLinka</h2>
        <p className="mt-1 text-sm text-[var(--color-fg-3)]">
          Seu feed ainda está vazio. Comece seguindo pessoas, explorando o ecossistema ou
          criando seu próprio conteúdo.
        </p>
      </div>

      {/* Sugestões de pessoas */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-medium">
            <UserPlus className="h-4 w-4 text-[var(--color-blue)]" /> Pessoas para você seguir
          </h3>
          <Link href="/conexoes/sugestoes" className="text-xs text-[var(--color-blue)]">
            Ver todos
          </Link>
        </header>
        {suggQ.isLoading ? (
          <p className="text-sm text-[var(--color-fg-3)]">Carregando…</p>
        ) : (suggQ.data ?? []).length === 0 ? (
          <p className="text-sm text-[var(--color-fg-3)]">
            Nenhuma sugestão por enquanto — explore a vitrine para descobrir pessoas.
          </p>
        ) : (
          <div className="max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(suggQ.data ?? []).map((u) => (
                <SuggestionCard
                  key={u.uid}
                  uid={u.uid}
                  nome={u.nome}
                  foto={u.foto_url ?? null}
                  sub={u.campus ?? u.tipo_usuario ?? ''}
                />
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Showcase agregada */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ShowcaseGroup
          title="Laboratórios"
          icon={FlaskConical}
          href="/vitrine?tab=laboratorios"
          items={(labsQ.data ?? []).map((l) => ({ id: l.uid, label: l.nome, href: `/vitrine/laboratorios/${l.uid}` }))}
        />
        <ShowcaseGroup
          title="Negócios"
          icon={Briefcase}
          href="/vitrine?tab=negocios"
          items={(bizQ.data ?? []).map((b) => ({ id: b.id, label: b.nome, href: `/vitrine/negocios/${b.id}` }))}
        />
        <ShowcaseGroup
          title="Projetos"
          icon={Lightbulb}
          href="/vitrine?tab=projetos"
          items={(initsQ.data ?? []).map((i) => ({ id: i.uid, label: i.titulo, href: `/vitrine/projetos/${i.uid}` }))}
        />
        <ShowcaseGroup
          title="Eventos"
          icon={Calendar}
          href="/vitrine?tab=eventos"
          items={(eventsQ.data ?? []).map((e) => ({
            id: e.uid,
            label: e.titulo,
            href: `/vitrine/eventos/${e.uid}`,
            sub: new Date(e.data_inicio).toLocaleDateString('pt-BR'),
          }))}
        />
      </div>

      {/* CTA contextualizado por papel */}
      {cta && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5 text-center">
          <cta.icon className="mx-auto mb-2 h-7 w-7 text-[var(--color-purple)]" />
          <h3 className="font-display text-base font-semibold">Crie seu primeiro item</h3>
          <p className="mt-1 text-sm text-[var(--color-fg-3)]">
            Como <strong>{me?.tipo}</strong>, você pode começar contribuindo com o ecossistema.
          </p>
          <Link
            href={cta.href}
            className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> {cta.label}
          </Link>
        </div>
      )}
    </div>
  )
}

function SuggestionCard({ uid, nome, foto, sub }: { uid: string; nome: string; foto: string | null; sub: string }) {
  const onFollow = async () => {
    try {
      await followUser(uid)
      toast.success(`Você está seguindo ${nome.split(' ')[0]}`)
    } catch {
      toast.error('Não foi possível seguir.')
    }
  }
  return (
    <li className="flex flex-col items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-center">
      <Link href={`/perfil/${uid}`} className="contents">
        <Avatar nome={nome} src={foto ?? undefined} size={48} />
        <span className="text-sm font-medium truncate w-full">{nome}</span>
      </Link>
      {sub && <span className="text-xs text-[var(--color-fg-3)] truncate w-full">{sub}</span>}
      <button
        type="button"
        onClick={onFollow}
        className="mt-1 inline-flex h-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-medium hover:bg-[var(--color-ink)] hover:text-[var(--color-on-dark-1)]"
      >
        Seguir
      </button>
    </li>
  )
}

function ShowcaseGroup({
  title,
  icon: Icon,
  href,
  items,
}: {
  title: string
  icon: typeof FlaskConical
  href: string
  items: { id: string; label: string; href: string; sub?: string }[]
}) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium">
          <Icon className="h-4 w-4 text-[var(--color-fg-3)]" /> {title}
        </h3>
        <Link href={href} className="text-xs text-[var(--color-blue)]">
          Ver todos
        </Link>
      </header>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-fg-3)]">Nada em destaque agora.</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 4).map((it) => (
            <li key={it.id}>
              <Link
                href={it.href}
                className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm hover:bg-[var(--color-surface)]"
              >
                <span className="truncate font-medium">{it.label}</span>
                {it.sub && <span className="ml-2 shrink-0 text-xs text-[var(--color-fg-3)]">{it.sub}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
