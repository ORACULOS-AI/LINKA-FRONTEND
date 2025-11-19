import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NegocioType, type BusinessStatus } from '@/lib/types/businessTypes'

interface BusinessManagementFilterProps {
  filter: NegocioType | 'all'
  setFilter: (value: NegocioType | 'all') => void
  statusFilter: BusinessStatus | 'all'
  setStatusFilter: (value: BusinessStatus | 'all') => void
}

export function BusinessManagementFilter({
  filter,
  setFilter,
  statusFilter,
  setStatusFilter,
}: BusinessManagementFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Select
        value={filter}
        onValueChange={(value) => setFilter(value as NegocioType | 'all')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={NegocioType.INCUBADA}>Incubada</SelectItem>
          <SelectItem value={NegocioType.EXTERNO}>Externo</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={statusFilter}
        onValueChange={(value) =>
          setStatusFilter(value as BusinessStatus | 'all')
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="aprovado">Aprovados</SelectItem>
          <SelectItem value="pendente">Pendentes</SelectItem>
          <SelectItem value="recusado">Recusados</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
