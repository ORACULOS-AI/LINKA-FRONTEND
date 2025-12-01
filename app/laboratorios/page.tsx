import { LaboratorioShowcaseRedesigned } from "./components/laboratorio-showcase-redesigned"
import { fetchPublicLaboratoriosForServer } from "@/lib/api/laboratorio"
import type { LaboratorioResponse } from "@/lib/types/laboratorioTypes"

export default async function LaboratorioShowcasePage() {
  const initialLaboratorios: LaboratorioResponse[] | null = await fetchPublicLaboratoriosForServer({ visivel: true })
  return <LaboratorioShowcaseRedesigned initialLaboratorios={initialLaboratorios} />
}
