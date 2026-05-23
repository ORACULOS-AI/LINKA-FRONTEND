import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Calendar,
  FlaskConical,
  Lightbulb,
  PlayCircle,
  UserPlus,
} from 'lucide-react'

const HERO_STATS = [
  { n: '2.314', l: 'Pessoas na rede' },
  { n: '47', l: 'Negócios cadastrados' },
  { n: '28', l: 'Laboratórios ativos' },
  { n: '36', l: 'Projetos em andamento' },
]

const FEATURES = [
  {
    Icon: Briefcase,
    title: 'Negócios',
    desc: 'Startups, empresas juniores e spin-offs vinculados à UFC, com estágio, área e equipe.',
    cls: '',
  },
  {
    Icon: FlaskConical,
    title: 'Laboratórios',
    desc: 'Os 28 laboratórios da UFC ativos na rede — campus, responsável, áreas e projetos.',
    cls: 'purple',
  },
  {
    Icon: Lightbulb,
    title: 'Projetos',
    desc: 'Iniciativas com TRL, ODS e equipe — para colaborar, financiar ou inscrever-se.',
    cls: 'blue',
  },
  {
    Icon: Calendar,
    title: 'Eventos',
    desc: 'Hackathons, workshops, palestras e cursos abertos à comunidade UFC.',
    cls: 'orange',
  },
]

export default function LandingPage() {
  return (
    <div className="landing fade-in">
      <header className="landing-nav">
        <div className="brand">
          <Image src="/selinka/logo-selinka.png" alt="SeLinka" width={120} height={24} priority style={{ height: 24, width: 'auto' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span className="nm">SeLinka</span>
            <span className="sub">UFC · 2026</span>
          </div>
        </div>
        <nav className="nav-items">
          <Link href="/negocios">Negócios</Link>
          <Link href="/laboratorios">Laboratórios</Link>
          <Link href="/projetos">Projetos</Link>
          <Link href="/eventos">Eventos</Link>
          <Link href="#sobre">Sobre</Link>
        </nav>
        <div className="row" style={{ gap: 8 }}>
          <Link href="/entrar" className="btn btn-ghost btn-sm">Entrar</Link>
          <Link href="/entrar?mode=cadastro" className="btn btn-primary btn-sm btn-pill">Criar conta</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Plataforma de conexão · Universidade Federal do Ceará</div>
            <h1>A ponte entre a <span className="accent">pesquisa da UFC</span> e o mercado.</h1>
            <p>
              SeLinka conecta pesquisadores, estudantes, técnicos administrativos e parceiros externos aos negócios, laboratórios, projetos e eventos do ecossistema de inovação da UFC.
            </p>
            <div className="cta-row">
              <Link href="/entrar?mode=cadastro" className="btn btn-primary btn-lg btn-pill">
                Criar conta gratuita <ArrowRight size={18} />
              </Link>
              <Link href="/negocios" className="btn btn-ghost btn-lg">
                <PlayCircle size={18} /> Explorar vitrines
              </Link>
            </div>
            <div className="marks">
              <span className="m">PRPPG · UFC</span>
              <span className="m">PADETEC</span>
              <span className="m">FUNCAP</span>
              <span className="m">Sebrae · CE</span>
            </div>
          </div>

          <div className="landing-showcase" style={{ position: 'relative', height: 480, borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 24, right: 24, top: 24, padding: 18, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-2)' }}>
              <div className="row" style={{ gap: 10 }}>
                <div aria-hidden style={{ width: 36, height: 36, borderRadius: '50%', background: '#5C079E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 12px Inter' }}>MS</div>
                <div>
                  <div style={{ font: '600 13px Inter', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Maria Souza <BadgeCheck size={11} style={{ color: 'var(--color-blue)' }} />
                  </div>
                  <div className="muted">Pesquisadora · LEE/UFC · há 2 h</div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.5 }}>
                Resultados preliminares dos sensores AeroLab v3 instalados em 12 pontos de Fortaleza: queda de <b>18% no MP2.5</b> noturno…
              </div>
            </div>

            <div style={{ position: 'absolute', right: 28, bottom: 100, padding: 14, background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-2)', display: 'flex', alignItems: 'center', gap: 10, width: 280 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-mint-15)', color: '#006a3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lightbulb size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 13px Inter' }}>Sensores de baixo custo</div>
                <div className="muted">Inovação · TRL 4–6</div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--color-fg-3)' }} />
            </div>

            <div style={{ position: 'absolute', left: 32, bottom: 32, padding: 12, background: 'var(--color-ink)', color: '#fff', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 10, width: 240, boxShadow: 'var(--shadow-3)' }}>
              <UserPlus size={16} style={{ color: 'var(--color-mint)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 12.5px Inter' }}>+87 conexões</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>esta semana na rede</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="landing-band">
        <div className="landing-band-inner">
          <div className="eyebrow" style={{ color: 'var(--color-mint)' }}>Como funciona</div>
          <h2>Uma plataforma. Quatro tipos de pessoas. Quatro vitrines.</h2>
          <p>
            SeLinka organiza o ecossistema da UFC em entidades públicas: negócios (startups, EJs, spin-offs), laboratórios, projetos (com TRL e ODS) e eventos.
            Quatro perfis colaboram em volta delas — pesquisadores, estudantes, técnicos administrativos e parceiros externos.
          </p>
          <div className="feat-grid">
            {FEATURES.map(({ Icon, title, desc, cls }) => (
              <div className="feat" key={title}>
                <div className={`ic ${cls}`.trim()}><Icon size={20} /></div>
                <div className="ti">{title}</div>
                <div className="ds">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-stats">
        <div className="eyebrow" style={{ marginBottom: 22 }}>Em números · março/2026</div>
        <div className="grid">
          {HERO_STATS.map((s) => (
            <div className="stat" key={s.l}>
              <div className="n">{s.n}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-foot">
        <span>© 2026 Universidade Federal do Ceará · SeLinka · selinka.ufc.br</span>
        <div className="row">
          <a href="#">Termos</a>
          <a href="#">Privacidade</a>
          <a href="#">Acessibilidade</a>
          <a href="#">Contato</a>
        </div>
      </footer>
    </div>
  )
}
