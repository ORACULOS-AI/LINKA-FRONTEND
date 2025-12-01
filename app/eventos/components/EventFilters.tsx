"use client"

import { Search, SlidersHorizontal, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { EventStatus } from "@/lib/types/event"
import { cn } from "@/lib/utils"

interface EventFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedStatus: EventStatus
  onStatusChange: (status: EventStatus) => void
  sortOrder: "asc" | "desc"
  onSortChange: (order: "asc" | "desc") => void
  onRefresh: () => void
  totalCount?: number
  activeCount?: number
}

const STATUS_OPTIONS: { value: EventStatus; label: string; color: string }[] = [
  { value: "ATIVO", label: "Ativos", color: "bg-green-500" },
  { value: "PAUSADO", label: "Pausados", color: "bg-yellow-500" },
  { value: "CONCLUIDO", label: "Concluídos", color: "bg-blue-500" },
  { value: "CANCELADO", label: "Cancelados", color: "bg-red-500" },
]

export function EventFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  sortOrder,
  onSortChange,
  onRefresh,
  totalCount = 0,
  activeCount = 0,
}: EventFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Search and Quick Actions Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        {/* Search Bar */}
        <div className="flex-1 w-full lg:max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar eventos por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200"
            />
          </div>
        </div>

        {/* Sort and Refresh Controls */}
        <div className="flex gap-2 w-full lg:w-auto">
          {/* Sort Button */}
          <Button
            variant="outline"
            onClick={() => onSortChange(sortOrder === "asc" ? "desc" : "asc")}
            className="flex-1 lg:flex-none border-gray-200 hover:bg-purple-50 hover:border-purple-300"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {sortOrder === "asc" ? "Mais Próximos" : "Mais Distantes"}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={onRefresh}
            className="border-gray-200 hover:bg-purple-50 hover:border-purple-300"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl px-5 py-4 border border-purple-100">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-semibold text-purple-900">
            Filtrar por Status
          </Label>
          <div className="flex items-center gap-2 text-xs text-purple-700">
            <span className="font-medium">{totalCount}</span>
            <span className="text-purple-500">eventos</span>
            <span className="text-purple-400">•</span>
            <span className="font-medium">{activeCount}</span>
            <span className="text-purple-500">ativos</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => {
            const isSelected = selectedStatus === status.value
            return (
              <button
                key={status.value}
                onClick={() => onStatusChange(status.value)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                  "border-2 flex items-center gap-2",
                  isSelected
                    ? "bg-white border-purple-400 text-purple-900 shadow-md scale-105"
                    : "bg-white/50 border-transparent text-gray-700 hover:bg-white hover:border-purple-200 hover:scale-102"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", status.color)} />
                {status.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
