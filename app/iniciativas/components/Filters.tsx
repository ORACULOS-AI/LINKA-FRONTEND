import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import {
  TipoIniciativa,
  PublicStatusIniciativa,
  NivelMaturidade 
} from '@/lib/types/initiativeTypes'
import { X, Filter, Users, Globe, Award } from 'lucide-react'
import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

interface FiltersProps {
  selectedType?: TipoIniciativa
  setSelectedType: (type: TipoIniciativa | undefined) => void
  selectedStatus: PublicStatusIniciativa
  setSelectedStatus: (status: PublicStatusIniciativa) => void
  selectedMaturity?: NivelMaturidade
  setSelectedMaturity: (maturity: NivelMaturidade | undefined) => void
  showCollaborating?: boolean
  setShowCollaborating: (show: boolean) => void
  showInternational?: boolean
  setShowInternational: (show: boolean) => void
  showWithIP?: boolean
  setShowWithIP: (show: boolean) => void
}

export function Filters({
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  selectedMaturity,
  setSelectedMaturity,
  showCollaborating = false,
  setShowCollaborating,
  showInternational = false,
  setShowInternational,
  showWithIP = false,
  setShowWithIP,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const clearAllFilters = () => {
    setSelectedType(undefined)
    setSelectedMaturity(undefined)
    setShowCollaborating(false)
    setShowInternational(false)
    setShowWithIP(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedType) count++
    if (selectedMaturity) count++
    if (showCollaborating) count++
    if (showInternational) count++
    if (showWithIP) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Filtros Principais */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tipo */}
      <Select
          value={selectedType || undefined} 
          onValueChange={(value) => setSelectedType(value === 'all' ? undefined : value as TipoIniciativa)}
        >
          <SelectTrigger className="w-auto min-w-[140px]">
            <SelectValue placeholder="Tipo" />
        </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value={TipoIniciativa.PESQUISA}>Pesquisa</SelectItem>
            <SelectItem value={TipoIniciativa.INOVACAO}>Inovação</SelectItem>
            <SelectItem value={TipoIniciativa.EMPREENDEDORISMO}>Empreendedorismo</SelectItem>
            <SelectItem value={TipoIniciativa.EXTENSAO}>Extensão</SelectItem>
            <SelectItem value={TipoIniciativa.DESENVOLVIMENTO}>Desenvolvimento</SelectItem>
            <SelectItem value={TipoIniciativa.CONSULTORIA}>Consultoria</SelectItem>
            <SelectItem value={TipoIniciativa.OUTROS}>Outros</SelectItem>
          </SelectContent>
        </Select>

        {/* Maturidade */}
        <Select 
          value={selectedMaturity || undefined} 
          onValueChange={(value) => setSelectedMaturity(value === 'all' ? undefined : value as NivelMaturidade)}
        >
          <SelectTrigger className="w-auto min-w-[140px]">
            <SelectValue placeholder="Maturidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value={NivelMaturidade.CONCEITO}>Conceito (TRL 1-3)</SelectItem>
            <SelectItem value={NivelMaturidade.PROTOTIPO}>Protótipo (TRL 4-6)</SelectItem>
            <SelectItem value={NivelMaturidade.DEMONSTRACAO}>Demonstração (TRL 7-8)</SelectItem>
            <SelectItem value={NivelMaturidade.COMERCIALIZACAO}>Comercialização (TRL 9)</SelectItem>
        </SelectContent>
      </Select>

        {/* Filtros Avançados */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Avançados</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  Limpar todos
                </Button>
              </div>

              <div className="space-y-3">
                {/* Aceita Colaboradores */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="colaborating"
                    checked={showCollaborating}
                    onCheckedChange={setShowCollaborating}
                  />
                  <label htmlFor="colaborating" className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-green-500" />
                    Aceita colaboradores
                  </label>
                </div>

                {/* Colaboração Internacional */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="international"
                    checked={showInternational}
                    onCheckedChange={setShowInternational}
                  />
                  <label htmlFor="international" className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Colaboração internacional
                  </label>
                </div>

                {/* Propriedade Intelectual */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ip"
                    checked={showWithIP}
                    onCheckedChange={setShowWithIP}
                  />
                  <label htmlFor="ip" className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-yellow-500" />
                    Com propriedade intelectual
                  </label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filtros Ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tipo: {selectedType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedType(undefined)}
              />
            </Badge>
          )}
          
          {selectedMaturity && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Maturidade: {selectedMaturity}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSelectedMaturity(undefined)}
              />
            </Badge>
          )}
          
          {showCollaborating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Aceita colaboradores
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setShowCollaborating(false)}
              />
            </Badge>
          )}
          
          {showInternational && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Internacional
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setShowInternational(false)}
              />
            </Badge>
          )}
          
          {showWithIP && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              Com PI
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setShowWithIP(false)}
              />
            </Badge>
          )}
        </div>
      )}
  </div>
) 
} 