import { BookOpen, Briefcase, Calendar, Cpu, FlaskConical, Lightbulb, type LucideIcon } from 'lucide-react'

export type VitrineLink =
  | { href: string; label: string; icon: LucideIcon; external?: false; disabled?: false }
  | { href: string; label: string; icon: LucideIcon; external: true; disabled?: false }
  | { label: string; icon: LucideIcon; disabled: true }

// Lista canônica das vitrines — usada no dropdown do desktop (VitrineDropdown)
// e no sheet do mobile (MobileTabBar).
export const VITRINE_LINKS: VitrineLink[] = [
  { href: '/negocios', label: 'Negócios', icon: Briefcase },
  { href: '/laboratorios', label: 'Laboratórios', icon: FlaskConical },
  { href: '/projetos', label: 'Projetos', icon: Lightbulb },
  { href: '/eventos', label: 'Eventos', icon: Calendar },
  { href: 'https://ufcinova.ufc.br/pt/vitrine-tecnologica/', label: 'Vitrine Tecnológica', icon: Cpu, external: true },
  { label: 'Saberes (Em breve)', icon: BookOpen, disabled: true },
]

// Prefixos de rota que ativam o destaque "Vitrine" na navegação.
export const VITRINE_MATCH = ['/vitrine', '/negocios', '/laboratorios', '/eventos', '/iniciativas', '/projetos']
