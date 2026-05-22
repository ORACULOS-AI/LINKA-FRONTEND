'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X,
  Lightbulb,
  Briefcase,
  FlaskConical,
  Calendar,
  Image as ImageIcon,
  Paperclip,
  Plus,
} from 'lucide-react'
import { createPost, type TipoPost, type Visibility } from '@/lib/api/feed'
import { getMyBusinesses } from '@/lib/api/business'
import { getMyLabs } from '@/lib/api/labs'
import { getMyInitiatives } from '@/lib/api/initiatives'
import { getMyEvents } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const VIS_OPTIONS = [
  { v: 'public' as Visibility, label: '🌎 Público — qualquer pessoa pode ver' },
  { v: 'connections' as Visibility, label: 'Conexões — apenas minhas conexões' },
  { v: 'private' as Visibility, label: '🔒 Apenas eu' },
]

const MAX_CHARS = 1000

type RefKind = 'projeto' | 'negocio' | 'laboratorio' | 'evento'

type RefOption = {
  kind: RefKind
  refTipo: 'INICIATIVA_REF' | 'NEGOCIO_REF' | 'LAB_REF' | 'EVENT_REF'
  postTipo: TipoPost
  id: string
  label: string
  badge?: string
  pending?: boolean
}

const KIND_META: Record<
  RefKind,
  { icon: typeof Lightbulb; label: string; color: string; createHref: string }
> = {
  projeto: {
    icon: Lightbulb,
    label: 'Projeto',
    color: 'text-mint hover:bg-mint/10',
    createHref: '/vitrine/projetos/novo',
  },
  negocio: {
    icon: Briefcase,
    label: 'Negócio',
    color: 'text-purple hover:bg-purple/10',
    createHref: '/vitrine/negocios/novo',
  },
  laboratorio: {
    icon: FlaskConical,
    label: 'Laboratório',
    color: 'text-blue hover:bg-blue-50',
    createHref: '/vitrine/laboratorios/novo',
  },
  evento: {
    icon: Calendar,
    label: 'Evento',
    color: 'text-orange hover:bg-orange/10',
    createHref: '/vitrine/eventos/novo',
  },
}

type Props = { open: boolean; onClose: () => void }

export function PostComposer({ open, onClose }: Props) {
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()

  const [text, setText] = useState('')
  const [vis, setVis] = useState<Visibility>('public')
  const [pickerKind, setPickerKind] = useState<RefKind | null>(null)
  const [ref, setRef] = useState<RefOption | null>(null)

  // Carrega TODAS as entidades quando o modal abre — usamos os counts para
  // saber quais botões de tipo de ref devem aparecer. Sem isso, mostraríamos
  // "Cadastrar X" mesmo quando o usuário sequer pode criar (ex.: externo + lab).
  const safe = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[])
  const myBizQ = useQuery({
    queryKey: ['post-composer', 'my-businesses'],
    queryFn: () => safe(getMyBusinesses()),
    enabled: open,
  })
  const myLabsQ = useQuery({
    queryKey: ['post-composer', 'my-labs'],
    queryFn: () => safe(getMyLabs()),
    enabled: open,
  })
  const myInitsQ = useQuery({
    queryKey: ['post-composer', 'my-initiatives'],
    queryFn: () => safe(getMyInitiatives()),
    enabled: open,
  })
  const myEventsQ = useQuery({
    queryKey: ['post-composer', 'my-events'],
    queryFn: () => safe(getMyEvents()),
    enabled: open,
  })

  // Quais tipos o usuário pode realmente vincular (tem ≥ 1 entidade na conta)
  const availableKinds = useMemo<Set<RefKind>>(() => {
    const set = new Set<RefKind>()
    if ((myBizQ.data ?? []).length > 0) set.add('negocio')
    if ((myLabsQ.data ?? []).length > 0) set.add('laboratorio')
    if ((myInitsQ.data ?? []).length > 0) set.add('projeto')
    if ((myEventsQ.data ?? []).length > 0) set.add('evento')
    return set
  }, [myBizQ.data, myLabsQ.data, myInitsQ.data, myEventsQ.data])

  const m = useMutation({
    mutationFn: () =>
      createPost({
        conteudo: text.trim(),
        visibility: vis,
        tipo: ref?.postTipo ?? 'TEXT',
        ref_id: ref?.id,
        ref_tipo: ref?.refTipo,
      }),
    onSuccess: () => {
      toast.success('Post publicado')
      setText('')
      setRef(null)
      setPickerKind(null)
      qc.invalidateQueries({ queryKey: ['feed'] })
      onClose()
    },
    onError: () => toast.error('Falha ao publicar'),
  })

  // Limpa estado quando fecha
  useEffect(() => {
    if (!open) {
      setPickerKind(null)
    }
  }, [open])

  const pickerOptions = useMemo<RefOption[]>(() => {
    if (!pickerKind) return []
    if (pickerKind === 'negocio') {
      return (myBizQ.data ?? [])
        .map((b) => ({
          kind: 'negocio' as const,
          refTipo: 'NEGOCIO_REF' as const,
          postTipo: 'NEGOCIO_REF' as TipoPost,
          id: b.id,
          label: b.nome,
          badge: b.categoria,
          pending: !(b.status === 'aprovado' && b.visivel !== false),
        }))
    }
    if (pickerKind === 'laboratorio') {
      return (myLabsQ.data ?? [])
        .map((l) => ({
          kind: 'laboratorio' as const,
          refTipo: 'LAB_REF' as const,
          postTipo: 'LAB_REF' as TipoPost,
          id: l.uid,
          label: l.nome,
          badge: l.unidade,
          pending: l.status?.toUpperCase?.() !== 'APROVADO',
        }))
    }
    if (pickerKind === 'projeto') {
      return (myInitsQ.data ?? [])
        .map((i) => ({
          kind: 'projeto' as const,
          refTipo: 'INICIATIVA_REF' as const,
          postTipo: 'INICIATIVA_REF' as TipoPost,
          id: i.uid,
          label: i.titulo,
          badge: i.tipo,
          pending: !(i.status === 'ATIVA' || i.status === 'PAUSADA' || i.status === 'CONCLUIDA'),
        }))
    }
    if (pickerKind === 'evento') {
      return (myEventsQ.data ?? [])
        .map((e) => ({
          kind: 'evento' as const,
          refTipo: 'EVENT_REF' as const,
          postTipo: 'EVENT_REF' as TipoPost,
          id: e.uid,
          label: e.titulo,
          badge: new Date(e.data_inicio).toLocaleDateString('pt-BR'),
          pending: !(e.status === 'ativo' || e.status === 'concluido'),
        }))
    }
    return []
  }, [pickerKind, myBizQ.data, myLabsQ.data, myInitsQ.data, myEventsQ.data])

  const pickerLoading =
    (pickerKind === 'negocio' && myBizQ.isLoading) ||
    (pickerKind === 'laboratorio' && myLabsQ.isLoading) ||
    (pickerKind === 'projeto' && myInitsQ.isLoading) ||
    (pickerKind === 'evento' && myEventsQ.isLoading)

  if (!open) return null

  const remaining = MAX_CHARS - text.length
  const firstName = me?.nome.split(' ')[0] ?? ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-enter w-full max-w-xl rounded-xl bg-surface">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-lg font-semibold">Publicar no feed</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded p-1 hover:bg-surface-2">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <Avatar nome={me?.nome ?? '?'} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{me?.nome}</p>
              <select
                value={vis}
                onChange={(e) => setVis(e.target.value as Visibility)}
                className="mt-1 rounded-full border border-border bg-surface px-3 py-1 text-[12.5px] focus:outline-none"
              >
                {VIS_OPTIONS.map((x) => (
                  <option key={x.v} value={x.v}>
                    {x.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={6}
            placeholder={`O que você quer compartilhar, ${firstName}?\nUse @ para mencionar pessoas e # para hashtags.`}
            className="w-full resize-none rounded-md border-0 bg-transparent text-[16px] placeholder:text-fg-1/35 focus:outline-none leading-relaxed"
          />

          {/* Ref selecionada */}
          {ref && (
            <div className="mt-2 flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-[13px]">
              <span className="flex items-center gap-2">
                {(() => {
                  const Icon = KIND_META[ref.kind].icon
                  return <Icon className="h-4 w-4" />
                })()}
                <span className="font-medium">{KIND_META[ref.kind].label}:</span>
                <span className="truncate">{ref.label}</span>
                {ref.badge && <span className="text-fg-3">· {ref.badge}</span>}
              </span>
              <button
                type="button"
                onClick={() => setRef(null)}
                className="rounded p-1 hover:bg-surface"
                aria-label="Remover vínculo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Picker contextual */}
          {pickerKind && (
            <div className="mt-3 rounded-md border border-border bg-surface-2 p-3">
              <div className="mb-2 flex items-center justify-between">
                <strong className="text-[13px]">
                  Vincular a {KIND_META[pickerKind].label.toLowerCase()}
                </strong>
                <button
                  type="button"
                  onClick={() => setPickerKind(null)}
                  className="rounded p-1 hover:bg-surface"
                  aria-label="Fechar picker"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {pickerLoading ? (
                <p className="text-[13px] text-fg-3">Carregando…</p>
              ) : pickerOptions.length === 0 ? (
                <div className="space-y-2 text-[13px]">
                  <p className="text-fg-3">
                    Você ainda não tem {KIND_META[pickerKind].label.toLowerCase()} aprovado para
                    vincular.
                  </p>
                  <Link
                    href={KIND_META[pickerKind].createHref}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium hover:bg-surface-2"
                  >
                    <Plus className="h-3.5 w-3.5" /> Cadastrar {KIND_META[pickerKind].label.toLowerCase()}
                  </Link>
                </div>
              ) : (
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {pickerOptions.map((opt) => (
                    <li key={`${opt.refTipo}:${opt.id}`}>
                      <button
                        type="button"
                        disabled={opt.pending}
                        onClick={() => {
                          if (opt.pending) return
                          setRef(opt)
                          setPickerKind(null)
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-[13px]',
                          opt.pending
                            ? 'bg-surface-2 opacity-70 cursor-not-allowed'
                            : 'bg-surface hover:bg-surface-2',
                        )}
                      >
                        <span className="truncate font-medium">{opt.label}</span>
                        <span className="ml-2 flex shrink-0 items-center gap-2">
                          {opt.pending && (
                            <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[11px] font-medium text-orange">
                              aguardando
                            </span>
                          )}
                          {opt.badge && <span className="text-fg-3">{opt.badge}</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-3 border-t border-border pt-3 flex flex-wrap gap-2">
            {(Object.keys(KIND_META) as RefKind[])
              .filter((kind) => availableKinds.has(kind))
              .map((kind) => {
                const meta = KIND_META[kind]
                const Icon = meta.icon
                const active = pickerKind === kind || ref?.kind === kind
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => {
                      setRef(null)
                      setPickerKind(pickerKind === kind ? null : kind)
                    }}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
                      meta.color,
                      active && 'ring-1 ring-current',
                    )}
                  >
                    <Icon className="h-4 w-4" /> {meta.label}
                  </button>
                )
              })}
            <div className="flex-1" />
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-fg-3 hover:bg-surface-2 transition-colors"
              disabled
              title="Em breve"
            >
              <ImageIcon className="h-4 w-4" /> Mídia
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-fg-3 hover:bg-surface-2 transition-colors"
              disabled
              title="Em breve"
            >
              <Paperclip className="h-4 w-4" /> Arquivo
            </button>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <span
            className={cn(
              'text-[12px] tabular-nums',
              remaining < 100 ? 'text-orange font-medium' : 'text-fg-4',
            )}
          >
            {remaining} caracteres restantes
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" loading={m.isPending} disabled={!text.trim()} onClick={() => m.mutate()}>
              Publicar
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
