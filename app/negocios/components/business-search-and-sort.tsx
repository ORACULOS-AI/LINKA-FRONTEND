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

interface BusinessSearchAndSortProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  sortBy: 'recent' | 'oldest' | 'alphabetical'
  handleSortChange: (value: 'recent' | 'oldest' | 'alphabetical') => void
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void
  handleRetry: () => void
}

export const BusinessSearchAndSort = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  handleSortChange,
  handleSearch,
  handleRetry
}: BusinessSearchAndSortProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 space-y-6">
    {/* Header */}
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
        <Search className="h-4 w-4 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">
        Buscar e Filtrar Negócios
      </h3>
    </div>

    {/* Search Bar */}
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
          <Input
            type="text"
            placeholder="Digite para buscar negócios por nome, descrição ou palavras-chave..."
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
              <SelectItem 
                value="recent" 
                className="hover:bg-purple-50 focus:bg-purple-50 rounded-lg py-3"
              >
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Mais recentes</span>
                </div>
              </SelectItem>
              <SelectItem 
                value="oldest" 
                className="hover:bg-purple-50 focus:bg-purple-50 rounded-lg py-3"
              >
                <div className="flex items-center gap-2">
                  <span>🕐</span>
                  <span>Mais antigos</span>
                </div>
              </SelectItem>
              <SelectItem 
                value="alphabetical" 
                className="hover:bg-purple-50 focus:bg-purple-50 rounded-lg py-3"
              >
                <div className="flex items-center gap-2">
                  <span>🔤</span>
                  <span>Ordem alfabética</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="default"
            onClick={handleRetry}
            className="h-11 px-4 bg-white border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2"
            title="Atualizar lista de negócios"
          >
            <RotateCw className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 px-4 py-2 rounded-lg">
          <Search className="h-4 w-4 text-purple-500" />
          <span>Buscando por: <strong className="text-purple-700">"{searchTerm}"</strong></span>
        </div>
      )}
    </div>
  </div>
) 