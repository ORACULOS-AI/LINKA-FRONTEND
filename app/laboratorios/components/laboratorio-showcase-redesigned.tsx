"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useLaboratorioApi } from "@/lib/api/laboratorio"
import { LaboratorioListImproved } from "./laboratorio-list-improved"
import { Search, TrendingUp, RotateCw, ChevronDown, Sparkles, FlaskConical } from "lucide-react"
import type { TipoLaboratorio, LaboratorioResponse } from "@/lib/types/laboratorioTypes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LaboratorioShowcaseProps {
  initialLaboratorios?: LaboratorioResponse[] | null
}

export function LaboratorioShowcaseRedesigned({ initialLaboratorios }: LaboratorioShowcaseProps) {
  const { useListLaboratorios } = useLaboratorioApi()

  const [tipoFilter, setTipoFilter] = useState<TipoLaboratorio | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleLaboratorios, setVisibleLaboratorios] = useState<LaboratorioResponse[]>(
    initialLaboratorios?.filter((l) => l.visivel === true) || [],
  )
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "alphabetical">("recent")
  const itemsPerPage = 9

  const { data: laboratorios, isLoading, error, refetch } = useListLaboratorios({ visivel: true }, false)

  useEffect(() => {
    if (laboratorios) {
      setVisibleLaboratorios(laboratorios)
    } else if (!laboratorios && initialLaboratorios) {
      setVisibleLaboratorios(initialLaboratorios)
    } else if (!laboratorios && !initialLaboratorios && !isLoading && !error) {
      setVisibleLaboratorios([])
    }
  }, [laboratorios, initialLaboratorios, isLoading, error])

  // Filtra e ordena os laboratórios
  const filteredAndSortedLaboratorios = useMemo(() => {
    let filtered = visibleLaboratorios

    // Filtro por tipo
    if (tipoFilter !== "all") {
      filtered = filtered.filter((lab) => lab.tipo === tipoFilter)
    }

    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (lab) =>
          lab.nome.toLowerCase().includes(searchLower) ||
          lab.responsavel?.toLowerCase().includes(searchLower) ||
          lab.descricao?.toLowerCase().includes(searchLower) ||
          lab.areas_pesquisa?.some((area) => area.toLowerCase().includes(searchLower)) ||
          lab.equipamentos?.some((eq) => eq.toLowerCase().includes(searchLower)),
      )
    }

    // Ordenação
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "alphabetical":
          return a.nome.localeCompare(b.nome, "pt-BR")
        case "recent":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [visibleLaboratorios, tipoFilter, searchTerm, sortBy])

  const getSortLabel = (sort: "recent" | "oldest" | "alphabetical") => {
    const labels = {
      recent: "Mais recentes",
      oldest: "Mais antigos",
      alphabetical: "A-Z",
    }
    return labels[sort]
  }

  const getTipoLabel = (tipo: TipoLaboratorio | "all") => {
    const labels = {
      all: "Todos os tipos",
      PESQUISA: "Pesquisa",
      ENSINO: "Ensino",
      EXTENSAO: "Extensão",
    }
    return labels[tipo] || tipo
  }

  if (initialLaboratorios === null && isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <FlaskConical className="h-12 w-12 text-purple-600" />
            </motion.div>
            <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-pulse" />
          </div>
          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <p className="text-gray-800 text-lg font-medium">Carregando laboratórios...</p>
            <p className="text-gray-500 text-sm mt-1">Preparando vitrine</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (error && !laboratorios && !initialLaboratorios) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar laboratórios</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <p className="text-sm text-gray-500">Por favor, tente atualizar a página ou contate o suporte.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* HEADER MINIMALISTA */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 text-white overflow-hidden">
        {/* Decorative blur orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Ecossistema UFC</span>
            </motion.div>

            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Vitrine de Laboratórios</h1>
              <p className="text-white/90 text-lg">
                Explore {visibleLaboratorios.length} laboratórios do ecossistema de inovação
              </p>
            </div>

            {/* Search Bar Integrada */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, responsável, área ou equipamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 text-base bg-white/95 backdrop-blur-sm border-0 focus:bg-white focus:ring-2 focus:ring-white/50 rounded-2xl shadow-xl placeholder:text-gray-500 text-gray-900"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 font-medium"
                  >
                    ×
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* BARRA DE CONTROLES HORIZONTAL */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro Tipo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <span className="text-sm font-medium text-gray-700">{getTipoLabel(tipoFilter)}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup
                  value={tipoFilter}
                  onValueChange={(v) => setTipoFilter(v as TipoLaboratorio | "all")}
                >
                  <DropdownMenuRadioItem value="all" className="rounded-lg">
                    Todos os tipos
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="PESQUISA" className="rounded-lg">
                    Pesquisa
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ENSINO" className="rounded-lg">
                    Ensino
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="EXTENSAO" className="rounded-lg">
                    Extensão
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ordenação */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">{getSortLabel(sortBy)}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as "recent" | "oldest" | "alphabetical")}
                >
                  <DropdownMenuRadioItem value="recent" className="rounded-lg">
                    Mais recentes
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest" className="rounded-lg">
                    Mais antigos
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="alphabetical" className="rounded-lg">
                    A-Z
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Stats + Refresh */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl">
                <span className="text-sm text-gray-600">
                  <strong className="text-purple-600">{filteredAndSortedLaboratorios.length}</strong> resultado
                  {filteredAndSortedLaboratorios.length !== 1 ? "s" : ""}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                className="h-10 w-10 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                title="Atualizar"
              >
                <RotateCw className="h-4 w-4 text-purple-600" />
              </Button>
            </div>
          </div>

          {/* Active Filters Indicator */}
          {(tipoFilter !== "all" || searchTerm !== "") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <span className="text-xs text-gray-500 font-medium">Filtros ativos:</span>
              {tipoFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  {getTipoLabel(tipoFilter)}
                  <button onClick={() => setTipoFilter("all")} className="hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              {searchTerm !== "" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setTipoFilter("all")
                  setSearchTerm("")
                }}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
              >
                Limpar tudo
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* LISTA DE LABORATÓRIOS */}
      <div className="container mx-auto px-4 py-12">
        <LaboratorioListImproved
          laboratorios={filteredAndSortedLaboratorios}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          loading={isLoading}
        />

        {/* Empty State */}
        {!isLoading && filteredAndSortedLaboratorios.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum laboratório encontrado</h3>
            <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca.</p>
            <Button
              onClick={() => {
                setTipoFilter("all")
                setSearchTerm("")
              }}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/25"
            >
              Limpar filtros
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
