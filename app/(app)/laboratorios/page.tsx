'use client'

import { LaboratoriosVitrine } from '@/components/vitrine/LaboratoriosVitrine'

// A vitrine de laboratórios vive em componente compartilhado (LaboratoriosVitrine),
// reusado pela versão pública em /vitrines/laboratorios. Aqui (autenticado) os cards
// abrem o detalhe normalmente.
export default function LaboratoriosPage() {
  return <LaboratoriosVitrine />
}
