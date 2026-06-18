'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X, Lightbulb, Briefcase, FlaskConical, Calendar, Image as ImageIcon, Plus, Loader2,
} from 'lucide-react'
import { createPost, uploadPostMedia, type TipoPost, type Visibility, type MidiaItem } from '@/lib/api/feed'
import { getMyBusinesses } from '@/lib/api/business'
import { getMyLabs } from '@/lib/api/labs'
import { getMyInitiatives } from '@/lib/api/initiatives'
import { getMyEvents } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Visibilidade ────────────────────────────────────────────────────────────

const VIS_OPTIONS: { v: Visibility; label: string; short: string }[] = [
  { v: 'public',    label: 'Público — qualquer pessoa',     short: '🌎 Público' },
  { v: 'followers', label: 'Seguidores — quem me segue',    short: '👥 Seguidores' },
  { v: 'private',   label: 'Privado — só eu',               short: '🔒 Só eu' },
]

// ─── Contexto de entidade ────────────────────────────────────────────────────

type RefKind = 'projeto' | 'negocio' | 'laboratorio' | 'evento'

type RefOption = {
  kind: RefKind
  tipo: TipoPost
  id: string
  label: string
  badge?: string
  pending?: boolean
}

const KIND_META: Record<RefKind, { icon: typeof Lightbulb; label: string; color: string; createHref: string }> = {
  projeto:     { icon: Lightbulb,    label: 'Projeto',      color: 'text-mint hover:bg-mint/10',     createHref: '/vitrine/projetos/novo' },
  negocio:     { icon: Briefcase,    label: 'Negócio',      color: 'text-purple hover:bg-purple/10', createHref: '/vitrine/negocios/novo' },
  laboratorio: { icon: FlaskConical, label: 'Laboratório',  color: 'text-blue hover:bg-blue-50',     createHref: '/vitrine/laboratorios/novo' },
  evento:      { icon: Calendar,     label: 'Evento',       color: 'text-orange hover:bg-orange/10', createHref: '/vitrine/eventos/novo' },
}

const MAX_CHARS = 2000
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm'

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = { open: boolean; onClose: () => void; initialKind?: RefKind }

// ─── Component ───────────────────────────────────────────────────────────────

export function PostComposer({ open, onClose, initialKind }: Props) {
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState('')
  const [vis, setVis] = useState<Visibility>('public')
  const [pickerKind, setPickerKind] = useState<RefKind | null>(null)
  const [ref, setRef] = useState<RefOption | null>(null)
  const [media, setMedia] = useState<MidiaItem[]>([])
  const [uploading, setUploading] = useState(false)

  // Pré-selecionar kind ao abrir
  useEffect(() => {
    if (open && initialKind) setPickerKind(initialKind)
    if (!open) { setPickerKind(null); setRef(null); setText(''); setMedia([]) }
  }, [open, initialKind])

  // ── Carrega entidades do usuário ──────────────────────────────────────────
  const safe = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[])
  const myBizQ   = useQuery({ queryKey: ['post-composer', 'my-businesses'],  queryFn: () => safe(getMyBusinesses()),  enabled: open })
  const myLabsQ  = useQuery({ queryKey: ['post-composer', 'my-labs'],        queryFn: () => safe(getMyLabs()),        enabled: open })
  const myInitsQ = useQuery({ queryKey: ['post-composer', 'my-initiatives'], queryFn: () => safe(getMyInitiatives()), enabled: open })
  const myEventsQ = useQuery({ queryKey: ['post-composer', 'my-events'],     queryFn: () => safe(getMyEvents()),      enabled: open })

  const availableKinds = useMemo<Set<RefKind>>(() => {
    const s = new Set<RefKind>()
    if ((myBizQ.data ?? []).length > 0)    s.add('negocio')
    if ((myLabsQ.data ?? []).length > 0)   s.add('laboratorio')
    if ((myInitsQ.data ?? []).length > 0)  s.add('projeto')
    if ((myEventsQ.data ?? []).length > 0) s.add('evento')
    return s
  }, [myBizQ.data, myLabsQ.data, myInitsQ.data, myEventsQ.data])

  const pickerOptions = useMemo<RefOption[]>(() => {
    if (!pickerKind) return []
    if (pickerKind === 'negocio')
      return (myBizQ.data ?? []).map((b) => ({
        kind: 'negocio' as const, tipo: 'NEGOCIO' as TipoPost, id: b.id, label: b.nome, badge: b.categoria,
        pending: !(b.status === 'aprovado' && b.visivel !== false),
      }))
    if (pickerKind === 'laboratorio')
      return (myLabsQ.data ?? []).map((l) => ({
        kind: 'laboratorio' as const, tipo: 'LABORATORIO' as TipoPost, id: l.uid, label: l.nome, badge: l.unidade,
        pending: l.status?.toUpperCase?.() !== 'APROVADO',
      }))
    if (pickerKind === 'projeto')
      return (myInitsQ.data ?? []).map((i) => ({
        kind: 'projeto' as const, tipo: 'PROJETO' as TipoPost, id: i.uid, label: i.titulo, badge: i.tipo,
        pending: !['ATIVA', 'PAUSADA', 'CONCLUIDA'].includes(i.status ?? ''),
      }))
    if (pickerKind === 'evento')
      return (myEventsQ.data ?? []).map((e) => ({
        kind: 'evento' as const, tipo: 'EVENTO' as TipoPost, id: e.uid, label: e.titulo,
        badge: new Date(e.data_inicio).toLocaleDateString('pt-BR'),
        pending: !['ativo', 'concluido'].includes(e.status ?? ''),
      }))
    return []
  }, [pickerKind, myBizQ.data, myLabsQ.data, myInitsQ.data, myEventsQ.data])

  // ── Upload de mídia ───────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (media.length + files.length > 4) {
      toast.error('Máximo de 4 arquivos por post')
      return
    }
    setUploading(true)
    try {
      const uploaded = await Promise.all(files.map((f) => uploadPostMedia(f)))
      setMedia((prev) => [...prev, ...uploaded])
    } catch {
      toast.error('Falha ao enviar arquivo. Verifique o formato e tente novamente.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function removeMedia(idx: number) {
    setMedia((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── Publicar ──────────────────────────────────────────────────────────────
  const m = useMutation({
    mutationFn: () => createPost({
      conteudo: text.trim(),
      visibility: vis,
      tipo: ref?.tipo ?? 'PESSOAL',
      ref_id: ref?.id,
      midia: media.length > 0 ? media : undefined,
    }),
    onSuccess: () => {
      toast.success('Post publicado')
      qc.invalidateQueries({ queryKey: ['feed'] })
      onClose()
    },
    onError: () => toast.error('Falha ao publicar'),
  })

  if (!open) return null

  const remaining = MAX_CHARS - text.length
  const firstName = me?.nome.split(' ')[0] ?? ''
  const canPublish = (text.trim().length > 0 || media.length > 0) && !uploading

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-enter w-full max-w-xl rounded-xl bg-surface shadow-xl">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-lg font-semibold">Nova publicação</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded p-1 hover:bg-surface-2">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-5 space-y-4">

          {/* Autor + visibilidade */}
          <div className="flex items-center gap-3">
            <Avatar nome={me?.nome ?? '?'} src={me?.avatar_url ?? undefined} size={44} />
            <div>
              <p className="text-sm font-semibold leading-tight">{me?.nome}</p>
              <select
                value={vis}
                onChange={(e) => setVis(e.target.value as Visibility)}
                className="mt-0.5 rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {VIS_OPTIONS.map((x) => (
                  <option key={x.v} value={x.v}>{x.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={5}
            autoFocus
            placeholder={`O que você quer compartilhar, ${firstName}?`}
            className="w-full resize-none rounded-md border-0 bg-transparent text-[16px] placeholder:text-fg-1/35 focus:outline-none leading-relaxed"
          />

          {/* Preview de mídia */}
          {media.length > 0 && (
            <div className={cn('grid gap-2', media.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
              {media.map((m, i) => (
                <div key={i} className="relative group rounded-md overflow-hidden bg-surface-2">
                  {m.tipo === 'video' ? (
                    <video src={m.url} className="w-full max-h-48 object-cover rounded-md" />
                  ) : (
                    <img src={m.url} alt="" className="w-full max-h-48 object-cover rounded-md" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(i)}
                    className="absolute top-1.5 right-1.5 rounded-full bg-ink/70 p-1 text-paper opacity-100"
                    aria-label="Remover"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Entidade selecionada */}
          {ref && (
            <div className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-[13px]">
              <span className="flex items-center gap-2">
                {(() => { const Icon = KIND_META[ref.kind].icon; return <Icon className="h-4 w-4" /> })()}
                <span className="font-medium">{KIND_META[ref.kind].label}:</span>
                <span className="truncate">{ref.label}</span>
              </span>
              <button type="button" onClick={() => setRef(null)} className="rounded p-1 hover:bg-surface" aria-label="Remover vínculo">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Picker de entidade */}
          {pickerKind && (
            <div className="rounded-md border border-border bg-surface-2 p-3">
              <div className="mb-2 flex items-center justify-between">
                <strong className="text-[13px]">Vincular a {KIND_META[pickerKind].label.toLowerCase()}</strong>
                <button type="button" onClick={() => setPickerKind(null)} className="rounded p-1 hover:bg-surface" aria-label="Fechar">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {pickerOptions.length === 0 ? (
                <div className="space-y-2 text-[13px]">
                  <p className="text-fg-3">Você ainda não tem {KIND_META[pickerKind].label.toLowerCase()} para vincular.</p>
                  <Link href={KIND_META[pickerKind].createHref} onClick={onClose}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium hover:bg-surface-2">
                    <Plus className="h-3.5 w-3.5" /> Cadastrar
                  </Link>
                </div>
              ) : (
                <ul className="space-y-1 max-h-44 overflow-y-auto">
                  {pickerOptions.map((opt) => (
                    <li key={`${opt.tipo}:${opt.id}`}>
                      <button
                        type="button"
                        onClick={() => { setRef(opt); setPickerKind(null) }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-[13px] bg-surface hover:bg-surface-2',
                        )}
                      >
                        <span className="truncate font-medium">{opt.label}</span>
                        <span className="ml-2 flex shrink-0 gap-2 text-fg-3">
                          {opt.pending && <span className="rounded-full bg-orange/10 px-2 py-0.5 text-[11px] text-orange font-medium">aguardando</span>}
                          {opt.badge}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Barra de ações */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {/* Mídia */}
            <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || media.length >= 4}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-fg-2 hover:bg-surface-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {uploading ? 'Enviando…' : 'Mídia'}
            </button>

            {/* Contexto de entidade */}
            {(Object.keys(KIND_META) as RefKind[]).map((kind) => {
              const meta = KIND_META[kind]
              const Icon = meta.icon
              const active = pickerKind === kind || ref?.kind === kind
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => { setRef(null); setPickerKind(pickerKind === kind ? null : kind) }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                    meta.color,
                    active && 'ring-1 ring-current',
                  )}
                >
                  <Icon className="h-4 w-4" /> {meta.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <span className={cn('text-[12px] tabular-nums', remaining < 100 ? 'text-orange font-medium' : 'text-fg-4')}>
            {remaining}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" loading={m.isPending} disabled={!canPublish} onClick={() => m.mutate()}>
              Publicar
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
