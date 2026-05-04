import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BusinessManagementSortProps {
  handleSortChange: (value: 'recent' | 'oldest' | 'alphabetical') => void
}

export function BusinessManagementSort({
  handleSortChange,
}: BusinessManagementSortProps) {
  return (
    <Select onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recent">Mais recentes</SelectItem>
        <SelectItem value="oldest">Mais antigos</SelectItem>
        <SelectItem value="alphabetical">Ordem alfabética</SelectItem>
      </SelectContent>
    </Select>
  )
}
