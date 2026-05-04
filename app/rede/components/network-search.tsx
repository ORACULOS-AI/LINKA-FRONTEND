"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface NetworkSearchProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
}

export function NetworkSearch({ searchQuery, setSearchQuery }: NetworkSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
      <Input
        type="search"
        placeholder="Buscar por nome, função ou instituição..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-3 text-base bg-white border-2 border-purple-100 focus:border-purple-400 rounded-2xl shadow-lg focus:shadow-purple-500/10 transition-all duration-300"
      />
    </div>
  )
}
