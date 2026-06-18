'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Lock,
  Mail,
  Microscope,
  Shield,
  Check,
} from 'lucide-react'

/* Persona detection — mesma regra do protótipo
   @alu.ufc.br -> estudante (auto)
   @ufc.br     -> ufc (pesquisador OU técnico — escolha)
   outros      -> externo (auto)                                          */
type Detected =
  | { kind: 'estudante'; domain: 'alu' }
  | { kind: 'ufc'; domain: 'ufc' }
  | { kind: 'externo'; domain: 'externo' }
  | { kind: null }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function isValidEmail(email: string): boolean {
  return EMAIL_RE.test((email || '').trim())
}

function detectPersona(email: string): Detected {
  const e = (email || '').toLowerCase().trim()
  if (!e || !e.includes('@')) return { kind: null }
  if (/@alu\.ufc\.br$/.test(e)) return { kind: 'estudante', domain: 'alu' }
  if (/@ufc\.br$/.test(e)) return { kind: 'ufc', domain: 'ufc' }
  if (!isValidEmail(e)) return { kind: null }
  return { kind: 'externo', domain: 'externo' }
}

type Mode = 'login' | 'cadastro'

interface PublicNums { negocios: number; laboratorios: number; iniciativas: number; eventos: number }

async function fetchPublicNums(): Promise<PublicNums | null> {
  try {
    const res = await fetch('/api/dashboard/public', { cache: 'no-store' })
    if (!res.ok) return null
    const body = await res.json()
    const d = body?.data ?? body
    return {
      negocios: d?.numeros?.total_negocios ?? 0,
      laboratorios: d?.numeros?.total_laboratorios ?? 0,
      iniciativas: d?.numeros?.total_iniciativas ?? 0,
      eventos: d?.numeros?.total_eventos ?? 0,
    }
  } catch {
    return null
  }
}

export function AuthScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/feed'
  const initialMode: Mode = params.get('mode') === 'cadastro' ? 'cadastro' : 'login'

  const [mode, setMode] = useState<Mode>(initialMode)
  const [nums, setNums] = useState<PublicNums | null>(null)

  useEffect(() => {
    fetchPublicNums().then(setNums)
  }, [])

  return (
    <div className="auth fade-in">
      {/* Left: pattern + brand pitch */}
      <div className="auth-pattern">
        <Link href="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Image
            src="/selinka/logo-selinka.png"
            alt="SeLinka"
            width={140}
            height={28}
            priority
            style={{ height: 28, width: 'auto', filter: 'invert(1)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span className="nm">SeLinka</span>
            <span className="sub">UFC · 2026</span>
          </div>
        </Link>

        <div className="hero-block">
          <div className="eyebrow">Plataforma de conexão · UFC</div>
          <h1>A rede de inovação da UFC, em um só lugar.</h1>
          <p>Conecte-se ao ecossistema de pesquisa, laboratórios, startups e eventos da Universidade Federal do Ceará.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 360 }}>
            {[
              { Icon: Briefcase, n: nums?.negocios, l: 'Negócios' },
              { Icon: FlaskConical, n: nums?.laboratorios, l: 'Laboratórios' },
              { Icon: Lightbulb, n: nums?.iniciativas, l: 'Projetos' },
              { Icon: Calendar, n: nums?.eventos, l: 'Eventos' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px 16px', background: 'rgba(6,7,15,0.88)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)' }}>
                <s.Icon size={16} style={{ color: 'var(--color-mint)' }} />
                <div style={{ font: '700 22px var(--font-display)', marginTop: 8, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {s.n != null ? s.n.toLocaleString('pt-BR') : '—'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="auth-form-wrap">
        <div className="auth-form">
          <div className="row between" style={{ marginBottom: 28 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-fg-2)' }}>
              <ArrowLeft size={14} /> Voltar
            </Link>
            <span className="muted">
              {mode === 'login' ? (
                <>Não tem conta? <button type="button" onClick={() => setMode('cadastro')} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontWeight: 600, color: 'var(--color-fg-2)' }}>Criar agora</button></>
              ) : (
                <>Já tem conta? <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontWeight: 600, color: 'var(--color-fg-2)' }}>Entrar</button></>
              )}
            </span>
          </div>

          <div className="tabs">
            <button className={'tab' + (mode === 'login' ? ' active' : '')} onClick={() => setMode('login')}>Entrar</button>
            <button className={'tab' + (mode === 'cadastro' ? ' active' : '')} onClick={() => setMode('cadastro')}>Criar conta</button>
          </div>

          {mode === 'login' ? <LoginPanel onSuccess={() => router.push(next)} /> : <SignupPanel />}
        </div>
      </div>
    </div>
  )
}

function LoginPanel({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const params = useSearchParams()
  // Vem de /verificar-email: prefill do e-mail confirmado para o login fluir direto
  // (evita form em branco e digitação repetida — fonte comum de "não consigo entrar").
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [pwd, setPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (params.get('verified') === '1') {
      toast.success('E-mail confirmado. Entre com sua senha para continuar.')
    }
  }, [params])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !pwd) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd, remember_me: remember }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 403 && /verific/i.test(data?.detail ?? '')) {
          router.push(`/verificar-email?email=${encodeURIComponent(email)}`)
          return
        }
        toast.error(res.status === 401 ? 'E-mail ou senha incorretos.' : data?.detail ?? 'Não foi possível entrar.')
        return
      }
      onSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2>Bem-vindo(a) de volta 👋</h2>
      <p className="lead">Use seu e-mail institucional ou o cadastrado como parceiro externo.</p>

      <div className="col" style={{ gap: 14 }}>
        <div className="field">
          <label htmlFor="login-email">E-mail</label>
          <div className="input-affix">
            <Mail size={16} className="ix" />
            <input
              id="login-email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@ufc.br"
              autoFocus={!email}
            />
          </div>
        </div>

        <div className="field">
          <div className="row between">
            <label htmlFor="login-pwd">Senha</label>
            <Link href="/esqueci-senha" style={{ fontSize: 12.5 }}>Esqueci a senha</Link>
          </div>
          <div className="input-affix">
            <Lock size={16} className="ix" />
            <input
              id="login-pwd"
              className="input"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Sua senha"
              autoFocus={!!email}
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

        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Manter conectada neste dispositivo</span>
        </label>

        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting || !email || !pwd}>
          {submitting ? 'Entrando…' : 'Entrar'} <ArrowRight size={16} />
        </button>
      </div>

      <div className="footer">
        Não tem conta? <Link href="/entrar?mode=cadastro" style={{ fontWeight: 600 }}>Criar agora</Link>
      </div>
    </form>
  )
}

type UfcRole = 'pesquisador' | 'tecnico_admin'

function SignupPanel() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [accept, setAccept] = useState(false)
  const [ufcRole, setUfcRole] = useState<UfcRole>('pesquisador')
  const [submitting, setSubmitting] = useState(false)

  const detected = detectPersona(email)
  const finalTipo =
    detected.kind === 'estudante' ? 'estudante' :
    detected.kind === 'externo'   ? 'externo'   :
    detected.kind === 'ufc'       ? ufcRole     : null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!finalTipo || !accept) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha: pwd, tipo_usuario: finalTipo }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.detail ?? 'Não foi possível criar a conta.')
        return
      }
      toast.success('Conta criada. Enviamos um código para o seu e-mail.')
      window.location.href = `/verificar-email?email=${encodeURIComponent(email)}&tipo=${finalTipo}`
      return
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <h2>Crie sua conta</h2>
      <p className="lead">Use seu e-mail institucional (@ufc.br ou @alu.ufc.br) ou um e-mail corporativo se você for parceiro externo.</p>

      <div className="col" style={{ gap: 14 }}>
        <div className="field">
          <label htmlFor="su-nome">Nome completo</label>
          <input id="su-nome" className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Maria Souza" autoComplete="name" />
        </div>

        <div className="field">
          <label htmlFor="su-email">E-mail</label>
          <div className="input-affix">
            <Mail size={16} className="ix" />
            <input
              id="su-email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@ufc.br · voce@alu.ufc.br · voce@empresa.com"
            />
          </div>

          {detected.kind === 'estudante' && (
            <DetectChip cor="mint" Icon={GraduationCap} title="Detectamos @alu.ufc.br" sub="Vamos cadastrar você como estudante UFC. Pediremos curso e matrícula no próximo passo." />
          )}
          {detected.kind === 'ufc' && (
            <DetectChip cor="purple" Icon={Building2} title="Detectamos @ufc.br" sub="Você é pesquisador(a) ou técnico(a) administrativo(a)?">
              <div className="row" style={{ gap: 6, marginTop: 10 }}>
                <DomainRoleTile active={ufcRole === 'pesquisador'} onClick={() => setUfcRole('pesquisador')} Icon={Microscope} name="Pesquisador" hint="Lattes + SIAPE" />
                <DomainRoleTile active={ufcRole === 'tecnico_admin'} onClick={() => setUfcRole('tecnico_admin')} Icon={Shield} name="Técnico admin" hint="SIAPE + setor" />
              </div>
            </DetectChip>
          )}
          {detected.kind === 'externo' && (
            <DetectChip cor="orange" Icon={Briefcase} title="Domínio externo" sub="Vamos cadastrar você como parceiro externo. Pediremos sua empresa e cargo no próximo passo." />
          )}
          {!detected.kind && (
            <span className="hint">Detectamos seu vínculo com a UFC pelo domínio do e-mail.</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="su-pwd">Senha</label>
          <div className="input-affix">
            <Lock size={16} className="ix" />
            <input
              id="su-pwd"
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

        <label className="check">
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
          <span>Li e aceito os <a href="#">Termos de uso</a> e a <a href="#">Política de privacidade</a> da UFC.</span>
        </label>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={!finalTipo || !accept || !nome || pwd.length < 8 || submitting}
        >
          {submitting ? 'Criando…' : 'Criar conta e completar perfil'} <ArrowRight size={16} />
        </button>
      </div>

      <div className="footer">
        Já tem conta? <Link href="/entrar" style={{ fontWeight: 600 }}>Entrar</Link>
      </div>
    </form>
  )
}

type Cor = 'mint' | 'purple' | 'orange' | 'blue'

function DetectChip({
  cor,
  Icon,
  title,
  sub,
  children,
}: {
  cor: Cor
  Icon: typeof GraduationCap
  title: string
  sub: string
  children?: React.ReactNode
}) {
  const bg = ({
    mint: 'var(--color-mint-08)',
    purple: 'var(--color-purple-08)',
    orange: 'var(--color-orange-15)',
    blue: 'var(--color-blue-08)',
  } as const)[cor]
  const fg = ({
    mint: '#006a3c',
    purple: 'var(--color-purple)',
    orange: '#8c5500',
    blue: 'var(--color-blue)',
  } as const)[cor]

  return (
    <div style={{ marginTop: 8, padding: 12, background: bg, borderRadius: 'var(--radius-md)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <Icon size={18} style={{ color: fg, flex: 'none', marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 13px Inter', color: fg }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--color-fg-2)', marginTop: 2, lineHeight: 1.5 }}>{sub}</div>
        {children}
      </div>
    </div>
  )
}

function DomainRoleTile({
  active,
  onClick,
  Icon,
  name,
  hint,
}: {
  active: boolean
  onClick: () => void
  Icon: typeof Microscope
  name: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        border: '1.5px solid ' + (active ? 'var(--color-ink)' : 'var(--color-border-strong)'),
        background: active ? 'var(--color-ink)' : '#fff',
        color: active ? '#fff' : 'var(--color-fg-1)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all var(--motion-fast)',
      }}
    >
      <Icon size={16} style={{ color: active ? 'var(--color-mint)' : 'var(--color-fg-3)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 13px Inter' }}>{name}</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>{hint}</div>
      </div>
      {active ? <Check size={14} /> : null}
    </button>
  )
}
