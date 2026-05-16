'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'

export default function Page() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.detail ?? 'Não foi possível enviar o código.')
        return
      }
      toast.success('Enviamos um código para o seu e-mail.')
      router.push(`/resetar-senha?email=${encodeURIComponent(email)}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Recuperar senha"
      lead="Informe o e-mail da sua conta para receber um código de 6 dígitos."
      rightFooter={
        <>
          Lembrou? <Link href="/entrar" style={{ fontWeight: 600 }}>Entrar</Link>
        </>
      }
    >
      <form onSubmit={submit} className="col" style={{ gap: 16 }} noValidate>
        <div className="field">
          <label htmlFor="fp-email">E-mail</label>
          <div className="input-affix">
            <Mail size={16} className="ix" />
            <input
              id="fp-email"
              className="input"
              type="email"
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@ufc.br"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting || !email}>
          {submitting ? 'Enviando…' : 'Enviar código'}
        </button>
      </form>
    </AuthShell>
  )
}
