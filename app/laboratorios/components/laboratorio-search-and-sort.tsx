"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, RefreshCw } from "lucide-react"

interface LaboratorioSearchAndSortProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  sortBy: "recent" | "oldest" | "alphabetical"
  handleSortChange: (value: "recent" | "oldest" | "alphabetical") => void
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void
  handleRetry: () => void
}

export function LaboratorioSearchAndSort({
  searchTerm,
  setSearchTerm,
  sortBy,
  handleSortChange,
  handleSearch,
  handleRetry,
}: LaboratorioSearchAndSortProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
      <div className="flex-1 w-full lg:max-w-2xl">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar laboratórios por nome, responsável ou área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </form>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[200px] bg-white border border-gray-200 rounded-xl shadow-sm">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
            <SelectItem value="alphabetical">Ordem alfabética</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRetry}
          className="h-12 w-12 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
