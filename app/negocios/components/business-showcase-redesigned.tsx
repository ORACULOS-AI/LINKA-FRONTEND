"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useBusinessApi } from "@/lib/api/business"
import { BusinessListImproved } from "./business-list-improved"
import { Search, TrendingUp, RotateCw, ChevronDown, Sparkles } from "lucide-react"
import type { NegocioType, NegocioResponse, CategoriaNegocio } from "@/lib/types/businessTypes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BusinessShowcaseProps {
  initialBusinesses?: NegocioResponse[] | null
}

export function BusinessShowcaseRedesigned({ initialBusinesses }: BusinessShowcaseProps) {
  const { useListBusinesses } = useBusinessApi()

  const [tipoFilter, setTipoFilter] = useState<NegocioType | "all">("all")
  const [categoriaFilter, setCategoriaFilter] = useState<CategoriaNegocio | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleBusinesses, setVisibleBusinesses] = useState<NegocioResponse[]>(
    initialBusinesses?.filter((b) => b.visivel === true) || [],
  )
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "alphabetical">("recent")
  const itemsPerPage = 9

  const {
    data: businesses,
    isLoading,
    error,
    refetch,
  } = useListBusinesses("aprovado", undefined, undefined, {
    initialData: initialBusinesses,
  })

  useEffect(() => {
    if (businesses) {
      const filtered = businesses.filter((business: NegocioResponse) => business.visivel === true)
      setVisibleBusinesses(filtered)
    } else if (!businesses && initialBusinesses) {
      const filtered = initialBusinesses.filter((business: NegocioResponse) => business.visivel === true)
      setVisibleBusinesses(filtered)
    } else if (!businesses && !initialBusinesses && !isLoading && !error) {
      setVisibleBusinesses([])
    }
  }, [businesses, initialBusinesses, isLoading, error])

  // Filtrar businesses baseado nos filtros ativos
  const filteredBusinesses = visibleBusinesses.filter((business) => {
    const matchesTipo = tipoFilter === "all" || business.tipo_negocio === tipoFilter
    const matchesCategoria = categoriaFilter === "all" || business.categoria === categoriaFilter
    const matchesSearch =
      searchTerm === "" ||
      business.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.palavras_chave.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesTipo && matchesCategoria && matchesSearch
  })

  const getTipoLabel = (tipo: NegocioType | "all") => {
    const labels = {
      all: "Todos os tipos",
      incubada: "Incubadas",
      parceira: "Parceiras",
    }
    return labels[tipo] || tipo
  }

  const getCategoriaLabel = (categoria: CategoriaNegocio | "all") => {
    const labels = {
      all: "Todas categorias",
      STARTUP: "Startups",
      EMPRESA_JUNIOR: "Empresas Juniores",
      SPIN_OFF: "Spin-offs",
      OUTRO: "Outros",
    }
    return labels[categoria] || categoria
  }

  const getSortLabel = (sort: "recent" | "oldest" | "alphabetical") => {
    const labels = {
      recent: "Mais recentes",
      oldest: "Mais antigos",
      alphabetical: "A-Z",
    }
    return labels[sort]
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
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Vitrine de Negócios
              </h1>
              <p className="text-white/90 text-lg">
                Explore {visibleBusinesses.length} negócios do ecossistema de inovação
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
                  placeholder="Buscar por nome, descrição ou palavras-chave..."
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
                  <span className="text-sm font-medium text-gray-700">
                    Tipo: {getTipoLabel(tipoFilter)}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup value={tipoFilter} onValueChange={(v) => setTipoFilter(v as NegocioType | "all")}>
                  <DropdownMenuRadioItem value="all" className="rounded-lg">Todos os tipos</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="incubada" className="rounded-lg">Incubadas</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="parceira" className="rounded-lg">Parceiras</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtro Categoria */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {getCategoriaLabel(categoriaFilter)}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup value={categoriaFilter} onValueChange={(v) => setCategoriaFilter(v as CategoriaNegocio | "all")}>
                  <DropdownMenuRadioItem value="all" className="rounded-lg">Todas categorias</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="STARTUP" className="rounded-lg">Startups</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="EMPRESA_JUNIOR" className="rounded-lg">Empresas Juniores</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="SPIN_OFF" className="rounded-lg">Spin-offs</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="OUTRO" className="rounded-lg">Outros</DropdownMenuRadioItem>
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
                  <span className="text-sm font-medium text-gray-700">
                    {getSortLabel(sortBy)}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as "recent" | "oldest" | "alphabetical")}>
                  <DropdownMenuRadioItem value="recent" className="rounded-lg">Mais recentes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest" className="rounded-lg">Mais antigos</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="alphabetical" className="rounded-lg">A-Z</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Stats + Refresh */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl">
                <span className="text-sm text-gray-600">
                  <strong className="text-purple-600">{filteredBusinesses.length}</strong> resultado{filteredBusinesses.length !== 1 ? 's' : ''}
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
          {(tipoFilter !== "all" || categoriaFilter !== "all" || searchTerm !== "") && (
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
                  <button onClick={() => setTipoFilter("all")} className="hover:text-purple-900">×</button>
                </span>
              )}
              {categoriaFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  {getCategoriaLabel(categoriaFilter)}
                  <button onClick={() => setCategoriaFilter("all")} className="hover:text-purple-900">×</button>
                </span>
              )}
              {searchTerm !== "" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="hover:text-purple-900">×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setTipoFilter("all")
                  setCategoriaFilter("all")
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

      {/* LISTA DE NEGÓCIOS */}
      <div className="container mx-auto px-4 py-12">
        <BusinessListImproved
          businesses={filteredBusinesses}
          filter={tipoFilter}
          categoriaFilter={categoriaFilter}
          searchTerm=""
          sortBy={sortBy}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          loading={isLoading}
        />

        {/* Empty State */}
        {!isLoading && filteredBusinesses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum negócio encontrado</h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar os filtros ou termos de busca.
            </p>
            <Button
              onClick={() => {
                setTipoFilter("all")
                setCategoriaFilter("all")
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
