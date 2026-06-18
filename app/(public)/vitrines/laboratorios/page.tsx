'use client'

import { LaboratoriosVitrine } from '@/components/vitrine/LaboratoriosVitrine'

// Vitrine pública (sem auth): grid navegável igual ao app, mas cada card linka para
// o cadastro — abrir o detalhe exige conta. Reusa o componente compartilhado.
export default function VitrineLaboratoriosPublica() {
  return <LaboratoriosVitrine ctaHref="/entrar?mode=cadastro" />
}
