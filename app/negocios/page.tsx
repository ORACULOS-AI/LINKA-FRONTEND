import { BusinessShowcaseRedesigned } from "./components/business-showcase-redesigned"
import { fetchPublicBusinessesForServer } from "@/lib/api/business"
import type { NegocioResponse } from "@/lib/types/businessTypes"

export default async function BusinessShowcasePage() {
  const initialBusinesses: NegocioResponse[] | null = await fetchPublicBusinessesForServer("aprovado")
  return <BusinessShowcaseRedesigned initialBusinesses={initialBusinesses} />
}
