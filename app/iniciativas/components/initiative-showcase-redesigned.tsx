"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/context/AuthContext"
import { useInitiativesApi } from "@/lib/api/initiatives"
import {
  TipoIniciativa,
  PublicStatusIniciativa,
  StatusIniciativa,
  NivelMaturidade,
} from "@/lib/types/initiativeTypes"
import { InitiativeListImproved } from "./initiative-list-improved"
import { Search, TrendingUp, RotateCw, ChevronDown, Sparkles, Users, HandHeart, Star, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

export function InitiativeShowcaseRedesigned() {
  const { isAuthenticated, user } = useAuth()
  const [selectedType, setSelectedType] = useState<TipoIniciativa | "all">("all")
  const [selectedMaturity, setSelectedMaturity] = useState<NivelMaturidade | "all">("all")
  const [showCollaborating, setShowCollaborating] = useState(false)
  const [showInternational, setShowInternational] = useState(false)
  const [showWithIP, setShowWithIP] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "alphabetical">("recent")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusIniciativa | "all">("all")
  const itemsPerPage = 9

  const {
    useListInitiatives,
    useFavoriteInitiative,
    useUnfavoriteInitiative,
    useGetUserFavoriteInitiatives,
  } = useInitiativesApi()

  const {
    data: initiatives,
    isLoading,
    error,
    refetch,
  } = useListInitiatives(undefined, undefined, undefined, true)

  const { data: favoriteInitiatives } = useGetUserFavoriteInitiatives(isAuthenticated)

  const favoriteMutation = useFavoriteInitiative()
  const unfavoriteMutation = useUnfavoriteInitiative()

  const isInitiativeFavorited = (initiativeId: string) => {
    return favoriteInitiatives?.some((fav) => fav.uid === initiativeId) || false
  }

  const handleFavorite = (initiativeId: string) => {
    favoriteMutation.mutate(initiativeId)
  }

  const handleUnfavorite = (initiativeId: string) => {
    unfavoriteMutation.mutate(initiativeId)
  }

  // Filtra e ordena as iniciativas
  const filteredAndSortedInitiatives = useMemo(() => {
    if (!initiatives || !Array.isArray(initiatives)) return []

    let filtered = initiatives.filter((initiative) => {
      if (!initiative || typeof initiative !== "object") return false

      // Filtro por status
      if (statusFilter !== "all" && initiative.status !== statusFilter) return false

      // Filtro por tipo
      if (selectedType !== "all" && initiative.tipo !== selectedType) return false

      // Filtro por maturidade
      if (selectedMaturity !== "all" && initiative.nivel_maturidade !== selectedMaturity) return false

      // Filtro por aceita colaboradores
      if (showCollaborating && !initiative.aceita_colaboradores) return false

      // Filtro por colaboração internacional
      if (showInternational && !initiative.colaboracao_internacional) return false

      // Filtro por propriedade intelectual
      if (showWithIP && !initiative.tem_propriedade_intelectual) return false

      // Filtro por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const titulo = initiative.titulo?.toLowerCase() || ""
        const descricao = initiative.descricao?.toLowerCase() || ""
        const palavrasChave = Array.isArray(initiative.palavras_chave) ? initiative.palavras_chave : []
        const areasConhecimento = Array.isArray(initiative.areas_conhecimento)
          ? initiative.areas_conhecimento
          : []
        const tecnologias = Array.isArray(initiative.tecnologias_utilizadas)
          ? initiative.tecnologias_utilizadas
          : []

        const matches =
          titulo.includes(searchLower) ||
          descricao.includes(searchLower) ||
          palavrasChave.some((keyword) => (keyword?.toLowerCase() || "").includes(searchLower)) ||
          areasConhecimento.some((area) => (area?.toLowerCase() || "").includes(searchLower)) ||
          tecnologias.some((tech) => (tech?.toLowerCase() || "").includes(searchLower))

        if (!matches) return false
      }

      return true
    })

    // Ordenação
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a?.created_at || 0).getTime() - new Date(b?.created_at || 0).getTime()
        case "alphabetical":
          return (a?.titulo || "").localeCompare(b?.titulo || "", "pt-BR")
        case "recent":
        default:
          return new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
      }
    })
  }, [
    initiatives,
    statusFilter,
    selectedType,
    selectedMaturity,
    showCollaborating,
    showInternational,
    showWithIP,
    searchTerm,
    sortBy,
  ])

  const getTipoLabel = (tipo: TipoIniciativa | "all") => {
    const labels = {
      all: "Todos os tipos",
      [TipoIniciativa.PESQUISA]: "Pesquisa",
      [TipoIniciativa.INOVACAO]: "Inovação",
      [TipoIniciativa.EMPREENDEDORISMO]: "Empreendedorismo",
      [TipoIniciativa.EXTENSAO]: "Extensão",
      [TipoIniciativa.DESENVOLVIMENTO]: "Desenvolvimento",
      [TipoIniciativa.CONSULTORIA]: "Consultoria",
      [TipoIniciativa.OUTROS]: "Outros",
    }
    return labels[tipo] || tipo
  }

  const getMaturidadeLabel = (maturity: NivelMaturidade | "all") => {
    const labels = {
      all: "Todos os níveis",
      [NivelMaturidade.CONCEITO]: "Conceito (TRL 1-3)",
      [NivelMaturidade.PROTOTIPO]: "Protótipo (TRL 4-6)",
      [NivelMaturidade.DEMONSTRACAO]: "Demonstração (TRL 7-8)",
      [NivelMaturidade.COMERCIALIZACAO]: "Comercialização (TRL 9)",
    }
    return labels[maturity] || maturity
  }

  const getSortLabel = (sort: "recent" | "oldest" | "alphabetical") => {
    const labels = {
      recent: "Mais recentes",
      oldest: "Mais antigos",
      alphabetical: "A-Z",
    }
    return labels[sort]
  }

  const getStatusLabel = (status: StatusIniciativa | "all") => {
    const labels = {
      all: "Todos os status",
      [StatusIniciativa.ATIVA]: "Ativas",
      [StatusIniciativa.CONCLUIDA]: "Concluídas",
      [StatusIniciativa.PAUSADA]: "Pausadas",
      [StatusIniciativa.CANCELADA]: "Canceladas",
    }
    return labels[status] || status
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedType !== "all") count++
    if (selectedMaturity !== "all") count++
    if (showCollaborating) count++
    if (showInternational) count++
    if (showWithIP) count++
    return count
  }

  const clearAllFilters = () => {
    setStatusFilter("all")
    setSelectedType("all")
    setSelectedMaturity("all")
    setShowCollaborating(false)
    setShowInternational(false)
    setShowWithIP(false)
  }

  const activeFiltersCount = getActiveFiltersCount()

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
              <span className="text-sm font-medium">Ambiente Digital de Conexões</span>
            </motion.div>

            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Vitrine de Iniciativas</h1>
              <p className="text-white/90 text-lg">
                Explore {initiatives?.length || 0} iniciativas do ecossistema de inovação
              </p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-8 text-center"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-200" />
                <span className="text-2xl font-bold">{initiatives?.length || 0}</span>
                <span className="text-purple-200">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-200" />
                <span className="text-2xl font-bold">
                  {initiatives?.filter((i) => i.status === StatusIniciativa.ATIVA).length || 0}
                </span>
                <span className="text-purple-200">Ativas</span>
              </div>
              <div className="flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-purple-200" />
                <span className="text-2xl font-bold">
                  {initiatives?.filter((i) => i.status === StatusIniciativa.CONCLUIDA).length || 0}
                </span>
                <span className="text-purple-200">Concluídas</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-200" />
                <span className="text-2xl font-bold">
                  {initiatives?.filter((i) => i.aceita_colaboradores).length || 0}
                </span>
                <span className="text-purple-200">Colaborativas</span>
              </div>
            </motion.div>

            {/* Search Bar Integrada */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
                <Input
                  type="text"
                  placeholder="Buscar por título, descrição, palavras-chave ou tecnologias..."
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
            {/* Filtro Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <span className="text-sm font-medium text-gray-700">{getStatusLabel(statusFilter)}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusIniciativa | "all")}
                >
                  <DropdownMenuRadioItem value="all" className="rounded-lg">
                    Todos os status
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={StatusIniciativa.ATIVA} className="rounded-lg">
                    Ativas
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={StatusIniciativa.CONCLUIDA} className="rounded-lg">
                    Concluídas
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={StatusIniciativa.PAUSADA} className="rounded-lg">
                    Pausadas
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtro Tipo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <span className="text-sm font-medium text-gray-700">{getTipoLabel(selectedType)}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup
                  value={selectedType}
                  onValueChange={(v) => setSelectedType(v as TipoIniciativa | "all")}
                >
                  <DropdownMenuRadioItem value="all" className="rounded-lg">
                    Todos os tipos
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={TipoIniciativa.PESQUISA} className="rounded-lg">
                    Pesquisa
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={TipoIniciativa.INOVACAO} className="rounded-lg">
                    Inovação
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={TipoIniciativa.EMPREENDEDORISMO} className="rounded-lg">
                    Empreendedorismo
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={TipoIniciativa.EXTENSAO} className="rounded-lg">
                    Extensão
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={TipoIniciativa.DESENVOLVIMENTO} className="rounded-lg">
                    Desenvolvimento
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={TipoIniciativa.CONSULTORIA} className="rounded-lg">
                    Consultoria
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={TipoIniciativa.OUTROS} className="rounded-lg">
                    Outros
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtro Maturidade */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <span className="text-sm font-medium text-gray-700">{getMaturidadeLabel(selectedMaturity)}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup
                  value={selectedMaturity}
                  onValueChange={(v) => setSelectedMaturity(v as NivelMaturidade | "all")}
                >
                  <DropdownMenuRadioItem value="all" className="rounded-lg">
                    Todos os níveis
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={NivelMaturidade.CONCEITO} className="rounded-lg">
                    Conceito (TRL 1-3)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={NivelMaturidade.PROTOTIPO} className="rounded-lg">
                    Protótipo (TRL 4-6)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={NivelMaturidade.DEMONSTRACAO} className="rounded-lg">
                    Demonstração (TRL 7-8)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={NivelMaturidade.COMERCIALIZACAO} className="rounded-lg">
                    Comercialização (TRL 9)
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtros Avançados */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all relative"
                >
                  <Filter className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Filtros Avançados</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-xl border-purple-200" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filtros Avançados</h4>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-purple-600">
                      Limpar todos
                    </Button>
                  </div>

                  <div className="space-y-3">
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

                    <div className="flex items-center space-x-2">
                      <Checkbox id="international" checked={showInternational} onCheckedChange={setShowInternational} />
                      <label htmlFor="international" className="flex items-center gap-2 text-sm">
                        <HandHeart className="h-4 w-4 text-blue-500" />
                        Colaboração internacional
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="ip" checked={showWithIP} onCheckedChange={setShowWithIP} />
                      <label htmlFor="ip" className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Com propriedade intelectual
                      </label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
                  <strong className="text-purple-600">{filteredAndSortedInitiatives.length}</strong> resultado
                  {filteredAndSortedInitiatives.length !== 1 ? "s" : ""}
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
          {(statusFilter !== "all" ||
            selectedType !== "all" ||
            selectedMaturity !== "all" ||
            showCollaborating ||
            showInternational ||
            showWithIP ||
            searchTerm !== "") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <span className="text-xs text-gray-500 font-medium">Filtros ativos:</span>
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  {getStatusLabel(statusFilter)}
                  <button onClick={() => setStatusFilter("all")} className="hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              {selectedType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  {getTipoLabel(selectedType)}
                  <button onClick={() => setSelectedType("all")} className="hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              {selectedMaturity !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  {getMaturidadeLabel(selectedMaturity)}
                  <button onClick={() => setSelectedMaturity("all")} className="hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              {showCollaborating && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  Aceita colaboradores
                  <button onClick={() => setShowCollaborating(false)} className="hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              {showInternational && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  Colaboração internacional
                  <button onClick={() => setShowInternational(false)} className="hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              {showWithIP && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  Com propriedade intelectual
                  <button onClick={() => setShowWithIP(false)} className="hover:text-purple-900">
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
                  setStatusFilter("all")
                  setSelectedType("all")
                  setSelectedMaturity("all")
                  setShowCollaborating(false)
                  setShowInternational(false)
                  setShowWithIP(false)
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

      {/* LISTA DE INICIATIVAS */}
      <div className="container mx-auto px-4 py-12">
        <InitiativeListImproved
          initiatives={filteredAndSortedInitiatives}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          loading={isLoading}
          onFavorite={handleFavorite}
          onUnfavorite={handleUnfavorite}
          isInitiativeFavorited={isInitiativeFavorited}
          currentUserId={user?.uid}
        />

        {/* Empty State */}
        {!isLoading && filteredAndSortedInitiatives.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma iniciativa encontrada</h3>
            <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca.</p>
            <Button
              onClick={() => {
                setStatusFilter("all")
                setSelectedType("all")
                setSelectedMaturity("all")
                setShowCollaborating(false)
                setShowInternational(false)
                setShowWithIP(false)
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
