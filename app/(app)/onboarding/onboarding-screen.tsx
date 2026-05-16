'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Camera,
  CheckCircle2,
  GraduationCap,
  Info,
  Lightbulb,
  Link as LinkIcon,
  Microscope,
  Shield,
  Upload,
  Users,
} from 'lucide-react'
import { fetchMe } from '@/lib/api/client'

type Persona = 'pesquisador' | 'estudante' | 'tecnico_admin' | 'externo'

const PERSONA_CONFIG: Record<
  Persona,
  {
    label: string
    Icon: typeof Microscope
    cor: 'purple' | 'mint' | 'blue' | 'orange'
    chip: string
    requiredFields: string
  }
> = {
  pesquisador: {
    label: 'Pesquisador',
    Icon: Microscope,
    cor: 'purple',
    chip: 'Verificado via SIAPE + CV Lattes',
    requiredFields: 'Lattes, SIAPE, departamento, campus e áreas de pesquisa.',
  },
  estudante: {
    label: 'Estudante',
    Icon: GraduationCap,
    cor: 'mint',
    chip: 'Vinculado pela matrícula UFC',
    requiredFields: 'Curso, matrícula, campus e áreas de interesse.',
  },
  tecnico_admin: {
    label: 'Técnico administrativo',
    Icon: Shield,
    cor: 'blue',
    chip: 'Vinculado via SIAPE da UFC',
    requiredFields: 'SIAPE, cargo, setor, campus e ramal interno.',
  },
  externo: {
    label: 'Parceiro externo',
    Icon: Briefcase,
    cor: 'orange',
    chip: 'Conta de parceiro · sem vínculo institucional',
    requiredFields: 'Empresa, cargo e áreas de interesse.',
  },
}

const CAMPI = ['Pici', 'Quixadá', 'Sobral', 'Crateús', 'Russas', 'Benfica', 'Porangabussu', 'Itapajé']

const AREAS = [
  'IoT', 'Sensoriamento ambiental', 'Edge AI', 'NLP', 'Visão computacional', 'Biotecnologia',
  'Energias renováveis', 'Telessaúde', 'Saúde coletiva', 'Cidades inteligentes', 'Sustentabilidade',
  'Agronegócio', 'Engenharia de materiais', 'Microeletrônica', 'Robótica', 'Educação',
  'Empreendedorismo', 'Extensão rural', 'Patrimônio cultural', 'Cibersegurança',
]

const ODS = ['ODS 2', 'ODS 3', 'ODS 4', 'ODS 6', 'ODS 8', 'ODS 9', 'ODS 10', 'ODS 11', 'ODS 12', 'ODS 13', 'ODS 14']

const SEMESTRES = ['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º+']

const CURSOS = [
  'Engenharia da Computação',
  'Ciência da Computação',
  'Engenharia Elétrica',
  'Engenharia Mecânica',
  'Engenharia de Teleinformática',
  'Engenharia Química',
  'Medicina',
  'Direito',
  'Administração',
]

function inferPersona(email?: string | null, tipoFromUrl?: string | null): Persona {
  if (tipoFromUrl && tipoFromUrl in PERSONA_CONFIG) return tipoFromUrl as Persona
  if (!email) return 'externo'
  const e = email.toLowerCase()
  if (/@alu\.ufc\.br$/.test(e)) return 'estudante'
  if (/@ufc\.br$/.test(e)) return 'pesquisador'
  return 'externo'
}

export function OnboardingScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const meQuery = useQuery({ queryKey: ['me'], queryFn: fetchMe })

  const me = meQuery.data
  const tipo: Persona = me?.tipo
    ? (me.tipo as Persona)
    : inferPersona(me?.email, params.get('tipo'))
  const cfg = PERSONA_CONFIG[tipo]
  const PersonaIcon = cfg.Icon

  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [saving, setSaving] = useState(false)

  // Step 0 fields
  const [siape, setSiape] = useState('')
  const [lattes, setLattes] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [curso, setCurso] = useState(CURSOS[0])
  const [matricula, setMatricula] = useState('')
  const [semestre, setSemestre] = useState('1º')
  const [cargo, setCargo] = useState('')
  const [setor, setSetor] = useState('')
  const [ramal, setRamal] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [campus, setCampus] = useState('Pici')
  const [telefone, setTelefone] = useState('')

  // Step 1 fields
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [interests, setInterests] = useState<Set<string>>(new Set())
  const [odsSel, setOdsSel] = useState<Set<string>>(new Set())

  function toggle(set: Set<string>, key: string, setter: (s: Set<string>) => void) {
    const next = new Set(set)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setter(next)
  }

  async function finish() {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        onboarding_complete: true,
        avatar_url: avatar || undefined,
        bio: bio || undefined,
        campus: tipo !== 'externo' ? campus : undefined,
        telefone: telefone || undefined,
        areas_interesse: interests.size ? Array.from(interests) : undefined,
        ods_interesse: odsSel.size ? Array.from(odsSel) : undefined,
        siape: tipo === 'pesquisador' || tipo === 'tecnico_admin' ? siape || undefined : undefined,
        lattes_url: tipo === 'pesquisador' ? lattes || undefined : undefined,
        departamento: tipo === 'pesquisador' ? departamento || undefined : undefined,
        curso: tipo === 'estudante' ? curso : undefined,
        matricula: tipo === 'estudante' ? matricula || undefined : undefined,
        semestre: tipo === 'estudante' ? semestre : undefined,
        cargo: tipo === 'tecnico_admin' || tipo === 'externo' ? cargo || undefined : undefined,
        setor: tipo === 'tecnico_admin' ? setor || undefined : undefined,
        ramal: tipo === 'tecnico_admin' ? ramal || undefined : undefined,
        empresa: tipo === 'externo' ? empresa || undefined : undefined,
        cnpj: tipo === 'externo' ? cnpj || undefined : undefined,
      }
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.detail ?? 'Falha ao salvar perfil.')
        return
      }
      toast.success('Perfil pronto!')
      router.push('/feed')
    } finally {
      setSaving(false)
    }
  }

  const steps = [{ label: 'Vínculo' }, { label: 'Sobre' }, { label: 'Conexões' }]

  const personaBg = `var(--color-${cfg.cor}-08, var(--color-${cfg.cor}-15))`
  const personaFg = `var(--color-${cfg.cor})`

  return (
    <div className="ob-wrap">
      <div className="ob fade-in">
        {/* Persona chip */}
        <div className="row" style={{ gap: 10, marginBottom: 18 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: personaBg,
              color: personaFg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <PersonaIcon size={18} />
          </div>
          <div>
            <div style={{ font: '600 13px Inter' }}>
              Você é <b style={{ color: personaFg }}>{cfg.label}</b>
            </div>
            <div className="muted" style={{ marginTop: 2 }}>{cfg.chip}</div>
          </div>
        </div>

        <div className="row between" style={{ marginBottom: 22, alignItems: 'flex-start' }}>
          <div>
            <div className="eyebrow">Complete seu perfil · passo {step + 1} de {steps.length}</div>
            <h2 style={{ marginTop: 8 }}>
              {step === 0 &&
                (tipo === 'estudante'
                  ? 'Seus dados de matrícula'
                  : tipo === 'tecnico_admin'
                  ? 'Seus dados de servidor'
                  : tipo === 'externo'
                  ? 'Sua empresa'
                  : 'Seus dados de pesquisador')}
              {step === 1 && 'Sobre você'}
              {step === 2 && 'Pronto para começar 🚀'}
            </h2>
            <p className="lead">
              {step === 0 && `Precisamos confirmar ${cfg.requiredFields}`}
              {step === 1 && 'Foto, bio e áreas de interesse personalizam seu feed e suas sugestões de conexão.'}
              {step === 2 && 'Seu perfil está pronto. Você pode editar tudo isso a qualquer momento em "Editar perfil".'}
            </p>
          </div>
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            style={{ background: 'none', border: 0, fontSize: 13, color: 'var(--color-fg-3)', cursor: 'pointer' }}
          >
            Pular →
          </button>
        </div>

        <div className="stepper">
          {steps.map((_, i) => (
            <div key={i} className={'seg' + (i < step ? ' done' : i === step ? ' current' : '')} />
          ))}
        </div>

        {/* Step 0 — persona-specific */}
        {step === 0 && (
          <div className="col" style={{ gap: 16 }}>
            {tipo === 'pesquisador' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label>SIAPE</label>
                    <input className="input" value={siape} onChange={(e) => setSiape(e.target.value)} placeholder="0000000" />
                    <span className="hint">Servidor com Lattes · obrigatório.</span>
                  </div>
                  <div className="field">
                    <label>Currículo Lattes</label>
                    <div className="input-affix">
                      <LinkIcon size={14} className="ix" />
                      <input className="input" value={lattes} onChange={(e) => setLattes(e.target.value)} placeholder="lattes.cnpq.br/…" />
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label>Departamento / unidade de lotação</label>
                  <input className="input" value={departamento} onChange={(e) => setDepartamento(e.target.value)} placeholder="Ex.: DETI · CT/UFC" />
                </div>
              </>
            )}

            {tipo === 'estudante' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label>Curso</label>
                    <select className="select" value={curso} onChange={(e) => setCurso(e.target.value)}>
                      {CURSOS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Matrícula UFC</label>
                    <input className="input" value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="202315001" />
                  </div>
                </div>
                <div className="field">
                  <label>Semestre atual</label>
                  <div className="chip-pickset">
                    {SEMESTRES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSemestre(s)}
                        className={'chip-pick' + (semestre === s ? ' active' : '')}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tipo === 'tecnico_admin' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label>SIAPE</label>
                    <input className="input" value={siape} onChange={(e) => setSiape(e.target.value)} placeholder="0000000" />
                  </div>
                  <div className="field">
                    <label>Cargo</label>
                    <input className="input" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex.: Analista de TI" />
                  </div>
                </div>
                <div className="field">
                  <label>Setor / departamento de lotação</label>
                  <input className="input" value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Ex.: PRPPG" />
                </div>
                <div className="field">
                  <label>Ramal interno (opcional)</label>
                  <input className="input" value={ramal} onChange={(e) => setRamal(e.target.value)} placeholder="3366-0000" style={{ maxWidth: 240 }} />
                </div>
              </>
            )}

            {tipo === 'externo' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label>Empresa</label>
                    <input className="input" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="BiomaTech" />
                  </div>
                  <div className="field">
                    <label>CNPJ (opcional)</label>
                    <input className="input" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                  </div>
                </div>
                <div className="field">
                  <label>Seu cargo</label>
                  <input className="input" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex.: CTO · Pesquisadora de P&D" />
                </div>
                <div style={{ padding: 14, background: 'var(--color-orange-15)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Info size={18} style={{ color: '#8c5500', flex: 'none', marginTop: 2 }} />
                  <div style={{ fontSize: 13.5, color: '#8c5500', lineHeight: 1.5 }}>
                    Parceiros externos não têm verificação automática. Você pode solicitar verificação manual depois, vinculando-se a um negócio cadastrado.
                  </div>
                </div>
              </>
            )}

            {tipo !== 'externo' && (
              <div className="field">
                <label>Campus</label>
                <div className="chip-pickset">
                  {CAMPI.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCampus(c)}
                      className={'chip-pick' + (campus === c ? ' active' : '')}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="field">
              <label>Telefone (opcional)</label>
              <input className="input" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(85) 9 ____ - ____" style={{ maxWidth: 240 }} />
            </div>

            {tipo !== 'externo' && (
              <div style={{ padding: 14, background: 'var(--color-mint-08)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <BadgeCheck size={18} style={{ color: '#006a3c', flex: 'none', marginTop: 2 }} />
                <div style={{ fontSize: 13.5, color: '#006a3c', lineHeight: 1.5 }}>
                  <b>Verificação automática:</b> conferimos seus dados com a base institucional da UFC para liberar a marca verificada e dar acesso à criação de projetos e à reivindicação de entidades.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1 — sobre */}
        {step === 1 && (
          <div className="col" style={{ gap: 22 }}>
            <div className="row" style={{ gap: 16, alignItems: 'center' }}>
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--color-surface-2)', border: '2px dashed var(--color-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-fg-3)', flex: 'none', overflow: 'hidden' }}>
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={24} />
                )}
              </div>
              <div>
                <div style={{ font: '600 14px Inter' }}>Foto de perfil</div>
                <div className="muted" style={{ marginBottom: 8 }}>Cole uma URL pública (upload sai em F11).</div>
                <div className="input-affix" style={{ maxWidth: 360 }}>
                  <Upload size={14} className="ix" />
                  <input className="input" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
                </div>
              </div>
            </div>

            <div className="field">
              <label>Bio curta</label>
              <textarea
                className="textarea"
                rows={3}
                maxLength={160}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  tipo === 'estudante'
                    ? 'Conte em que projetos você quer entrar, o que está estudando, com o que adoraria contribuir…'
                    : tipo === 'externo'
                    ? 'Conte o que sua empresa faz e que tipo de colaboração você busca na UFC…'
                    : 'Resuma sua linha de pesquisa, projetos atuais e o que você está buscando aqui.'
                }
              />
              <span className="hint">{160 - bio.length} caracteres restantes — aparece no seu perfil e nas sugestões para outras pessoas.</span>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                {tipo === 'pesquisador' ? 'Áreas de pesquisa' : tipo === 'tecnico_admin' ? 'Atuação principal' : 'Áreas de interesse'} · {interests.size} selecionadas
              </div>
              <div className="chip-pickset">
                {AREAS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggle(interests, k, setInterests)}
                    className={'chip-pick' + (interests.has(k) ? ' active' : '')}
                    style={interests.has(k) ? { background: 'var(--color-purple)', borderColor: 'var(--color-purple)' } : undefined}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <span className="hint" style={{ marginTop: 10, display: 'block' }}>
                Mínimo 3 áreas. Você verá projetos, eventos e pessoas vinculados a elas no seu feed.
              </span>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>ODS de interesse (opcional)</div>
              <div className="chip-pickset">
                {ODS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggle(odsSel, k, setOdsSel)}
                    className={'chip-pick' + (odsSel.has(k) ? ' active' : '')}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — pronto */}
        {step === 2 && (
          <div className="col" style={{ gap: 18 }}>
            <div style={{ padding: 24, background: 'var(--color-mint)', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, opacity: 0.18, background: 'url(/selinka/grafismo-1.svg) no-repeat center/contain' }} />
              <CheckCircle2 size={32} style={{ color: 'var(--color-ink)' }} />
              <h3 style={{ font: '700 22px var(--font-display)', margin: '12px 0 6px', position: 'relative' }}>Perfil pronto!</h3>
              <p style={{ margin: 0, color: 'var(--color-ink)', maxWidth: '50ch', position: 'relative' }}>
                {tipo === 'externo'
                  ? 'Sua conta de parceiro foi criada. Você já pode explorar as vitrines, seguir pesquisadores e participar de eventos abertos.'
                  : 'Verificamos seus dados e ativamos a marca verificada na sua conta. Já preparamos sugestões iniciais a partir das suas áreas de interesse.'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <Users size={20} style={{ color: 'var(--color-purple)' }} />
                <div style={{ font: '600 14px Inter', margin: '8px 0 4px' }}>
                  {tipo === 'estudante' ? 14 : tipo === 'externo' ? 6 : 18} pessoas para conhecer
                </div>
                <div className="muted">
                  {tipo === 'estudante' ? 'Veteranos do seu curso e do seu campus.' : 'Pessoas da sua área e campus.'}
                </div>
              </div>
              <div style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <Lightbulb size={20} style={{ color: 'var(--color-mint)' }} />
                <div style={{ font: '600 14px Inter', margin: '8px 0 4px' }}>
                  {tipo === 'estudante' ? '12 projetos com vagas' : tipo === 'externo' ? '8 negócios afins' : '8 projetos abertos'}
                </div>
                <div className="muted">
                  {tipo === 'estudante'
                    ? 'Aceitando estudantes em IoT e biotec.'
                    : tipo === 'externo'
                    ? 'Startups e spin-offs em áreas próximas das suas.'
                    : 'Aceitando colaboradores em sua área.'}
                </div>
              </div>
            </div>
          </div>
        )}

        <hr className="divider" style={{ margin: '28px 0 20px' }} />
        <div className="row between">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as 0 | 1 | 2) : s))}
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          {step < 2 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStep((s) => ((s + 1) as 0 | 1 | 2))}
            >
              Continuar <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={finish} disabled={saving}>
              {saving ? 'Salvando…' : 'Ir para o feed'} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
