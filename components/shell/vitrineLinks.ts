import { Briefcase, FlaskConical, Calendar, Lightbulb, type LucideIcon } from 'lucide-react'

export type VitrineLink = {
  href: string
  label: string
  icon: LucideIcon
  disabled?: boolean
  external?: boolean
}

// Lista canônica das 4 vitrines — usada no dropdown do desktop (VitrineDropdown)
// e no sheet do mobile (MobileTabBar).
export const VITRINE_LINKS: VitrineLink[] = [
  { href: '/negocios',     label: 'Negócios',     icon: Briefcase },
  { href: '/laboratorios', label: 'Laboratórios', icon: FlaskConical },
  { href: '/projetos',     label: 'Projetos',     icon: Lightbulb },
  { href: '/eventos',      label: 'Eventos',       icon: Calendar },
]

// Prefixos de rota que ativam o destaque "Vitrine" na navegação.
export const VITRINE_MATCH = ['/vitrine', '/negocios', '/laboratorios', '/eventos', '/iniciativas', '/projetos']
