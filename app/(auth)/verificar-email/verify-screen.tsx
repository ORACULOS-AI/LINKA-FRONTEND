'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { OtpInput } from '@/components/auth/otp-input'

export function VerifyEmailScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function submit(submitCode?: string) {
    const finalCode = submitCode ?? code
    if (!email || finalCode.length !== 6) return
    setSubmitting(true)
    setInvalid(false)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: finalCode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setInvalid(true)
        toast.error(data?.detail ?? 'Código inválido ou expirado.')
        return
      }
      toast.success('E-mail confirmado! Faça login para continuar.')
      router.push('/entrar')
    } finally {
      setSubmitting(false)
    }
  }

  async function resend() {
    if (!email || cooldown > 0) return
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.detail ?? 'Não foi possível reenviar.')
        return
      }
      toast.success('Código reenviado.')
      setCooldown(45)
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthShell
      title="Verificar e-mail"
      lead="Enviamos um código de 6 dígitos para o seu e-mail."
      rightFooter={
        <>
          Voltar para <Link href="/entrar" style={{ fontWeight: 600 }}>Entrar</Link>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="col"
        style={{ gap: 16 }}
        noValidate
      >
        <div className="field">
          <label htmlFor="ve-email">E-mail</label>
          <div className="input-affix">
            <Mail size={16} className="ix" />
            <input
              id="ve-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={Boolean(params.get('email'))}
            />
          </div>
        </div>

        <div className="field">
          <label>Código</label>
          <OtpInput
            value={code}
            onChange={(v) => {
              setCode(v)
              setInvalid(false)
            }}
            invalid={invalid}
            autoFocus
            onComplete={(v) => submit(v)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting || code.length !== 6 || !email}
        >
          {submitting ? 'Confirmando…' : 'Confirmar'}
        </button>

        <div className="muted" style={{ textAlign: 'center' }}>
          Não recebeu?{' '}
          <button
            type="button"
            onClick={resend}
            disabled={resending || cooldown > 0 || !email}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontWeight: 600, color: 'var(--color-blue)' }}
          >
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
          </button>
        </div>
      </form>
    </AuthShell>
  )
}
