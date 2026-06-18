import { redirect } from 'next/navigation'

// /vitrines → entra direto na primeira vitrine pública.
export default function VitrinesIndex() {
  redirect('/vitrines/laboratorios')
}
