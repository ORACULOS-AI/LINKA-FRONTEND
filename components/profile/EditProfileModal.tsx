'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEnum } from '@/lib/hooks/useEnum'
import type { UserProfile } from '@/lib/api/users'

type Props = {
  profile: UserProfile
  onClose: () => void
  onSave: (patch: Partial<UserProfile>) => void
  saving: boolean
}

export function EditProfileModal({ profile, onClose, onSave, saving }: Props) {
  const [form, setForm] = useState<Partial<UserProfile>>({
    bio: profile.bio ?? '',
    campus: profile.campus ?? '',
    telefone: profile.telefone ?? '',
    lattes: profile.lattes ?? '',
    siape: profile.siape ?? '',
    palavras_chave: profile.palavras_chave ?? [],
    curso: profile.curso ?? '',
    matricula: profile.matricula ?? '',
    setor: profile.setor ?? '',
    cargo: profile.cargo ?? '',
    empresa: profile.empresa ?? '',
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const campi = useEnum('campus')
  const cursos = useEnum('curso')
  // Curso oferecido no campus selecionado (metadata.campus é a lista de campi).
  const cursosDoCampus = cursos.filter((c) => {
    const list = c.metadata?.campus
    if (!form.campus || !Array.isArray(list)) return true
    return (list as string[]).includes(form.campus as string)
  })

  function buildPatchAndSave() {
    const patch: Partial<UserProfile> = { ...form }
    if (Array.isArray(patch.palavras_chave)) {
      patch.palavras_chave = patch.palavras_chave.map((s) => String(s).trim()).filter(Boolean)
    }
    onSave(patch)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display font-semibold">Editar perfil</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); buildPatchAndSave() }} className="overflow-y-auto max-h-[70vh] px-5 py-4 space-y-4">
          <Field label="Bio">
            <textarea
              rows={3}
              value={form.bio as string}
              onChange={set('bio')}
              placeholder="Fale um pouco sobre você…"
              className="input w-full resize-none"
            />
          </Field>

          <Field label="Campus / Unidade">
            <select value={form.campus as string} onChange={set('campus')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none">
              <option value="">Selecione…</option>
              {campi.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Telefone">
            <input type="text" value={form.telefone as string} onChange={set('telefone')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none" />
          </Field>

          {profile.tipo_usuario === 'pesquisador' && (
            <>
              <Field label="Lattes (URL)">
                <input type="url" value={form.lattes as string} onChange={set('lattes')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none" />
              </Field>
              <Field label="SIAPE">
                <input type="text" value={form.siape as string} onChange={set('siape')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none" />
              </Field>
              <Field label="Palavras-chave (separadas por vírgula)">
                <input
                  type="text"
                  value={Array.isArray(form.palavras_chave) ? form.palavras_chave.join(', ') : ''}
                  onChange={(e) => setForm((f) => ({ ...f, palavras_chave: e.target.value.split(',').map((s) => s.trim()) }))}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none"
                />
              </Field>
            </>
          )}

          {profile.tipo_usuario === 'estudante' && (
            <>
              <Field label="Curso">
                <select value={form.curso as string} onChange={set('curso')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none">
                  <option value="">Selecione…</option>
                  {cursosDoCampus.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Matrícula">
                <input type="text" value={form.matricula as string} onChange={set('matricula')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none" />
              </Field>
            </>
          )}

          {profile.tipo_usuario === 'tecnico_admin' && (
            <>
              <Field label="Setor">
                <input type="text" value={form.setor as string} onChange={set('setor')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none" />
              </Field>
              <Field label="Cargo">
                <input type="text" value={form.cargo as string} onChange={set('cargo')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none" />
              </Field>
            </>
          )}

          {profile.tipo_usuario === 'externo' && (
            <Field label="Empresa">
              <input type="text" value={form.empresa as string} onChange={set('empresa')} className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none" />
            </Field>
          )}
        </form>

        <footer className="flex justify-end gap-3 border-t border-border px-5 py-4">
          <Button variant="outline" type="button" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={buildPatchAndSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </footer>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-fg-3">{label}</label>
      {children}
    </div>
  )
}
