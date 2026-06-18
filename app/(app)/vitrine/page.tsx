import { redirect } from 'next/navigation'

// A listagem da vitrine foi dividida em páginas por entidade (estilo filter-pane):
// /negocios, /laboratorios, /projetos, /eventos. Mantemos /vitrine como atalho.
export default async function VitrinePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const dest =
    tab === 'laboratorios' ? '/laboratorios'
      : tab === 'projetos' ? '/projetos'
        : tab === 'eventos' ? '/eventos'
          : '/negocios'
  redirect(dest)
}
