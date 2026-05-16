'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Globe, Users as UsersIcon, Lock, Lightbulb, Briefcase, FlaskConical, Calendar, Image as ImageIcon, Paperclip } from 'lucide-react'
import { createPost, type Visibility } from '@/lib/api/feed'
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

type Props = { open: boolean; onClose: () => void }

export function PostComposer({ open, onClose }: Props) {
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [vis, setVis] = useState<Visibility>('public')

  const m = useMutation({
    mutationFn: () => createPost({ conteudo: text.trim(), visibility: vis }),
    onSuccess: () => {
      toast.success('Post publicado')
      setText('')
      qc.invalidateQueries({ queryKey: ['feed'] })
      onClose()
    },
    onError: () => toast.error('Falha ao publicar'),
  })

  if (!open) return null

  const remaining = MAX_CHARS - text.length
  const firstName = me?.nome.split(' ')[0] ?? ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl rounded-lg bg-paper shadow-xl">
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
                  <option key={x.v} value={x.v}>{x.label}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={6}
            placeholder={`O que você quer compartilhar, ${firstName}?\nUse @ para mencionar pessoas e # para hashtags.`}
            className="w-full resize-none rounded-md border-0 bg-transparent text-[16px] placeholder:text-ink/35 focus:outline-none leading-relaxed"
          />

          <div className="mt-3 border-t border-border pt-3 flex flex-wrap gap-2">
            <button type="button" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-mint hover:bg-mint/10 transition-colors">
              <Lightbulb className="h-4 w-4" /> Projeto
            </button>
            <button type="button" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-purple hover:bg-purple/10 transition-colors">
              <Briefcase className="h-4 w-4" /> Negócio
            </button>
            <button type="button" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-selinka-blue hover:bg-blue-50 transition-colors">
              <FlaskConical className="h-4 w-4" /> Laboratório
            </button>
            <button type="button" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-orange hover:bg-orange/10 transition-colors">
              <Calendar className="h-4 w-4" /> Evento
            </button>
            <div className="flex-1" />
            <button type="button" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-ink/50 hover:bg-surface-2 transition-colors">
              <ImageIcon className="h-4 w-4" /> Mídia
            </button>
            <button type="button" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-ink/50 hover:bg-surface-2 transition-colors">
              <Paperclip className="h-4 w-4" /> Arquivo
            </button>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border px-5 py-3">
          <span className={cn(
            'text-[12px] tabular-nums',
            remaining < 100 ? 'text-orange font-medium' : 'text-ink/40',
          )}>
            {remaining} caracteres restantes
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button
              size="sm"
              loading={m.isPending}
              disabled={!text.trim()}
              onClick={() => m.mutate()}
            >
              Publicar
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
