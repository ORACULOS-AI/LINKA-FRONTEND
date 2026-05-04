import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, RotateCw, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SearchAndFilterBarProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  sortBy: 'recent' | 'oldest' | 'alphabetical'
  handleSortChange: (value: 'recent' | 'oldest' | 'alphabetical') => void
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void
  handleRefresh: () => void
}

export const SearchAndFilterBar = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  handleSortChange,
  handleSearch,
  handleRefresh,
}: SearchAndFilterBarProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 space-y-6">
    {/* Header */}
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
        <Search className="h-4 w-4 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">
        Buscar e Filtrar Iniciativas
      </h3>
    </div>

    {/* Search Bar */}
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
          <Input
            type="text"
            placeholder="Digite para buscar iniciativas por título, descrição ou palavras-chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-gray-50 border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 focus:bg-white rounded-xl shadow-sm transition-all duration-200 placeholder:text-gray-500"
          />
        </div>
        {searchTerm && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="h-6 w-6 p-0 hover:bg-purple-100 rounded-full"
            >
              <span className="text-gray-400 hover:text-gray-600">×</span>
            </Button>
          </div>
        )}
      </form>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
        </div>
        
        <div className="flex gap-3 items-center">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[200px] bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-11">
              <SelectValue placeholder="Escolha a ordenação" />
            </SelectTrigger>
            <SelectContent className="bg-white border-purple-200 rounded-xl shadow-lg">
              <SelectItem value="recent" className="hover:bg-purple-50">
                Mais recentes
              </SelectItem>
              <SelectItem value="oldest" className="hover:bg-purple-50">
                Mais antigas
              </SelectItem>
              <SelectItem value="alphabetical" className="hover:bg-purple-50">
                Ordem alfabética
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
) 