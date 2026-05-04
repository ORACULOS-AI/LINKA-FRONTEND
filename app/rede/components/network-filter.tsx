"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

interface NetworkFilterProps {
  roleFilter: string
  setRoleFilter: (value: string) => void
}

export function NetworkFilter({ roleFilter, setRoleFilter }: NetworkFilterProps) {
  return (
    <Select value={roleFilter} onValueChange={setRoleFilter}>
      <SelectTrigger className="w-full sm:w-[200px] bg-white border-2 border-purple-100 focus:border-purple-400 rounded-2xl shadow-lg py-3 px-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-purple-500" />
          <SelectValue placeholder="Filtrar por função" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white border-purple-100 rounded-xl shadow-xl">
        <SelectItem value="all" className="hover:bg-purple-50 focus:bg-purple-50 text-gray-700 rounded-lg">
          Todos os Usuários
        </SelectItem>
        <SelectItem value="estudante" className="hover:bg-purple-50 focus:bg-purple-50 text-gray-700 rounded-lg">
          Estudantes
        </SelectItem>
        <SelectItem value="pesquisador" className="hover:bg-purple-50 focus:bg-purple-50 text-gray-700 rounded-lg">
          Pesquisadores
        </SelectItem>
        <SelectItem value="tecnico_admin" className="hover:bg-purple-50 focus:bg-purple-50 text-gray-700 rounded-lg">
          Técnicos Administrativos
        </SelectItem>
        <SelectItem value="externo" className="hover:bg-purple-50 focus:bg-purple-50 text-gray-700 rounded-lg">
          Externos
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
