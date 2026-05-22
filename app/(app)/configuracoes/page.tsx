'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Image as ImageIcon,
  KeyRound,
  Monitor,
  Settings,
  Trash2,
  LogOut,
} from 'lucide-react'
import {
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
  fetchMyProfile,
} from '@/lib/api/users'
import {
  getMySessions,
  revokeSession,
  revokeAllSessions,
  type UserSession,
} from '@/lib/api/sessions'
import {
  getMyPreferences,
  updateMyPreferences,
  type UserPreferences,
} from '@/lib/api/preferences'
import { Avatar } from '@/components/ui/avatar'
import { toast, toastApiError } from '@/lib/toast'
import { cn } from '@/lib/utils'

type Tab = 'foto' | 'senha' | 'sessoes' | 'preferencias'

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState<Tab>('foto')

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:py-8">
      <Link href="/perfil" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar ao perfil
      </Link>
      <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
        <Settings className="h-6 w-6" /> Configurações
      </h1>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {([
            { k: 'foto' as Tab, label: 'Foto de perfil', Icon: ImageIcon },
            { k: 'senha' as Tab, label: 'Senha', Icon: KeyRound },
            { k: 'sessoes' as Tab, label: 'Sessões ativas', Icon: Monitor },
            { k: 'preferencias' as Tab, label: 'Preferências', Icon: Settings },
          ]).map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm',
                tab === t.k
                  ? 'bg-[var(--color-surface-2)] font-semibold'
                  : 'hover:bg-[var(--color-surface-2)]',
              )}
            >
              <t.Icon className="h-4 w-4 text-[var(--color-fg-3)]" /> {t.label}
            </button>
          ))}
        </nav>

        <section>
          {tab === 'foto' && <PhotoPanel />}
          {tab === 'senha' && <PasswordPanel />}
          {tab === 'sessoes' && <SessionsPanel />}
          {tab === 'preferencias' && <PreferencesPanel />}
        </section>
      </div>
    </div>
  )
}

function PhotoPanel() {
  const qc = useQueryClient()
  const fileInput = useRef<HTMLInputElement>(null)
  const meQ = useQuery({ queryKey: ['me-profile'], queryFn: fetchMyProfile })

  const uploadM = useMutation({
    mutationFn: (f: File) => uploadProfileImage(f),
    onSuccess: () => {
      toast.success('Foto atualizada')
      qc.invalidateQueries({ queryKey: ['me-profile'] })
    },
    onError: (e) => toastApiError(e, 'Falha ao enviar foto.'),
  })

  const deleteM = useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: () => {
      toast.success('Foto removida')
      qc.invalidateQueries({ queryKey: ['me-profile'] })
    },
    onError: (e) => toastApiError(e, 'Falha ao remover foto.'),
  })

  const me = meQ.data
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="font-display text-lg font-semibold">Foto de perfil</h2>
      <p className="mt-1 text-sm text-[var(--color-fg-3)]">PNG ou JPG, até 5MB.</p>

      <div className="mt-4 flex items-center gap-4">
        <Avatar nome={me?.nome ?? '?'} src={me?.foto_perfil ?? null} size={88} />
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileInput.current?.click()}
            disabled={uploadM.isPending}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:opacity-50"
          >
            {uploadM.isPending ? 'Enviando…' : 'Trocar foto'}
          </button>
          {me?.foto_perfil && (
            <button
              onClick={() => deleteM.mutate()}
              disabled={deleteM.isPending}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-md border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Remover
            </button>
          )}
          <input
            type="file"
            ref={fileInput}
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) uploadM.mutate(f)
            }}
          />
        </div>
      </div>
    </div>
  )
}

function PasswordPanel() {
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')

  const m = useMutation({
    mutationFn: () => changePassword(atual, nova),
    onSuccess: () => {
      toast.success('Senha alterada')
      setAtual('')
      setNova('')
      setConfirma('')
    },
    onError: (e) => toastApiError(e, 'Falha ao trocar senha.'),
  })

  const valid = atual.length >= 6 && nova.length >= 8 && nova === confirma

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (valid) m.mutate() }}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4"
    >
      <h2 className="font-display text-lg font-semibold">Trocar senha</h2>
      <Field label="Senha atual">
        <input type="password" className="input" value={atual} onChange={(e) => setAtual(e.target.value)} />
      </Field>
      <Field label="Nova senha (mín. 8 caracteres)">
        <input type="password" className="input" value={nova} onChange={(e) => setNova(e.target.value)} />
      </Field>
      <Field label="Confirme a nova senha">
        <input type="password" className="input" value={confirma} onChange={(e) => setConfirma(e.target.value)} />
        {confirma && confirma !== nova && (
          <span className="mt-1 block text-xs text-red-700">Senhas não coincidem.</span>
        )}
      </Field>
      <button
        type="submit"
        disabled={!valid || m.isPending}
        className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:opacity-50"
      >
        {m.isPending ? 'Salvando…' : 'Trocar senha'}
      </button>

      <style jsx>{`
        .input { width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 14px; }
      `}</style>
    </form>
  )
}

function SessionsPanel() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['my-sessions'], queryFn: getMySessions })

  const revokeM = useMutation({
    mutationFn: (sid: string) => revokeSession(sid),
    onSuccess: () => {
      toast.success('Sessão revogada')
      qc.invalidateQueries({ queryKey: ['my-sessions'] })
    },
    onError: (e) => toastApiError(e, 'Falha ao revogar.'),
  })

  const revokeAllM = useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      toast.success('Todas as outras sessões foram encerradas')
      qc.invalidateQueries({ queryKey: ['my-sessions'] })
    },
    onError: (e) => toastApiError(e, 'Falha ao revogar todas.'),
  })

  if (q.isLoading) return <p className="text-sm">Carregando…</p>

  const sessions: UserSession[] = q.data ?? []

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Sessões ativas</h2>
        {sessions.length > 1 && (
          <button
            onClick={() => {
              if (confirm('Encerrar todas as outras sessões?')) revokeAllM.mutate()
            }}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sair de todos os outros dispositivos
          </button>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-fg-3)]">Nenhuma sessão registrada.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{s.user_agent ?? 'Dispositivo desconhecido'}</div>
                <div className="text-xs text-[var(--color-fg-3)]">
                  {s.ip_address ?? '—'} ·{' '}
                  {new Date(s.created_at).toLocaleString('pt-BR')}
                  {s.revoked_at && ' · revogada'}
                </div>
              </div>
              {!s.revoked_at && (
                <button
                  onClick={() => revokeM.mutate(s.id)}
                  className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-xs hover:bg-[var(--color-surface-2)]"
                >
                  Revogar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PreferencesPanel() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['my-prefs'], queryFn: getMyPreferences })

  const m = useMutation({
    mutationFn: (p: Partial<UserPreferences>) => updateMyPreferences(p),
    onSuccess: () => {
      toast.success('Preferências salvas')
      qc.invalidateQueries({ queryKey: ['my-prefs'] })
    },
    onError: (e) => toastApiError(e, 'Falha ao salvar.'),
  })

  const prefs = q.data ?? {}

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-3">
      <h2 className="font-display text-lg font-semibold">Preferências</h2>
      <Toggle
        label="Notificações por e-mail"
        value={!!prefs.notificacoes_email}
        onChange={(v) => m.mutate({ notificacoes_email: v })}
      />
      <Toggle
        label="Notificações push"
        value={!!prefs.notificacoes_push}
        onChange={(v) => m.mutate({ notificacoes_push: v })}
      />
      <Field label="Idioma">
        <select
          className="input"
          value={prefs.idioma ?? 'pt-BR'}
          onChange={(e) => m.mutate({ idioma: e.target.value })}
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </Field>
      <style jsx>{`
        .input { width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 14px; }
      `}</style>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}
