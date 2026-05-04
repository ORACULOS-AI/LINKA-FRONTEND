import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BusinessManagementSearchProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void
}

export function BusinessManagementSearch({
  searchTerm,
  setSearchTerm,
  handleSearch,
}: BusinessManagementSearchProps) {
  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <Input
        type="text"
        placeholder="Buscar negócios..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button type="submit">Buscar</Button>
    </form>
  )
}
