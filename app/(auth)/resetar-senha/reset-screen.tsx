'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { OtpInput } from '@/components/auth/otp-input'

export function ResetScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [code, setCode] = useState('')
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [codeInvalid, setCodeInvalid] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || code.length !== 6 || pwd.length < 8 || pwd !== confirm) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: pwd }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (/c[oó]d/i.test(data?.detail ?? '')) setCodeInvalid(true)
        toast.error(data?.detail ?? 'Não foi possível redefinir a senha.')
        return
      }
      toast.success('Senha redefinida com sucesso.')
      router.push('/entrar')
    } finally {
      setSubmitting(false)
    }
  }

  const mismatch = confirm.length > 0 && pwd !== confirm

  return (
    <AuthShell
      title="Definir nova senha"
      lead="Use o código que enviamos para o seu e-mail."
      rightFooter={
        <>
          Não recebeu? <Link href="/esqueci-senha" style={{ fontWeight: 600 }}>Enviar de novo</Link>
        </>
      }
    >
      <form onSubmit={submit} className="col" style={{ gap: 16 }} noValidate>
        <div className="field">
          <label htmlFor="rp-email">E-mail</label>
          <div className="input-affix">
            <Mail size={16} className="ix" />
            <input
              id="rp-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={Boolean(params.get('email'))}
            />
          </div>
        </div>

        <div className="field">
          <label>Código recebido</label>
          <OtpInput
            value={code}
            onChange={(v) => {
              setCode(v)
              setCodeInvalid(false)
            }}
            invalid={codeInvalid}
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="rp-pwd">Nova senha</label>
          <div className="input-affix">
            <Lock size={16} className="ix" />
            <input
              id="rp-pwd"
              className="input"
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--color-fg-3)', padding: 6 }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="rp-pwd2">Confirmar nova senha</label>
          <div className="input-affix">
            <Lock size={16} className="ix" />
            <input
              id="rp-pwd2"
              className="input"
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>
          {mismatch ? <span className="error">As senhas não conferem.</span> : null}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting || code.length !== 6 || pwd.length < 8 || mismatch || !email}
        >
          {submitting ? 'Redefinindo…' : 'Redefinir senha'}
        </button>
      </form>
    </AuthShell>
  )
}
