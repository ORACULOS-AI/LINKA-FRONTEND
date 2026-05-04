'use client'

import { EventStatus, EventCategoria, EventStatusLabels, EventCategoriaLabels, EventFiltersState, initialEventFilters } from '@/lib/types/eventTypes'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Search, X, Filter } from 'lucide-react'

interface EventFiltersProps {
  filters: EventFiltersState
  onFiltersChange: (filters: EventFiltersState) => void
  onReset?: () => void
}

export function EventFilters({ filters, onFiltersChange, onReset }: EventFiltersProps) {
  const updateFilter = <K extends keyof EventFiltersState>(
    key: K,
    value: EventFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = () => {
    return JSON.stringify(filters) !== JSON.stringify(initialEventFilters)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* Busca Textual */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar eventos por título ou descrição..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status */}
        <div>
          <Label>Status</Label>
          <Select
            value={filters.selectedStatus}
            onValueChange={(value) => updateFilter('selectedStatus', value as EventStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.values(EventStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {EventStatusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div>
          <Label>Categoria</Label>
          <Select
            value={filters.selectedCategoria}
            onValueChange={(value) => updateFilter('selectedCategoria', value as EventCategoria | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.values(EventCategoria).map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {EventCategoriaLabels[categoria]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ordenação */}
        <div>
          <Label>Ordenar por</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data_inicio">Data do Evento</SelectItem>
              <SelectItem value="created_at">Data de Criação</SelectItem>
              <SelectItem value="titulo">Título</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Switches */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="online"
            checked={filters.isOnlineOnly}
            onCheckedChange={(checked) => updateFilter('isOnlineOnly', checked)}
          />
          <Label htmlFor="online">Apenas eventos online</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="vagas"
            checked={filters.onlyWithVacancies}
            onCheckedChange={(checked) => updateFilter('onlyWithVacancies', checked)}
          />
          <Label htmlFor="vagas">Apenas com vagas</Label>
        </div>
      </div>

      {/* Botão Limpar */}
      {hasActiveFilters() && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFiltersChange(initialEventFilters)}
          className="w-full md:w-auto"
        >
          <X className="w-4 h-4 mr-2" />
          Limpar Filtros
        </Button>
      )}
    </div>
  )
}
