"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useLaboratorioApi } from "@/lib/api/laboratorio"
import { LaboratorioSearchAndSort } from "./laboratorio-search-and-sort"
import LaboratorioList from "./laboratorio-list"
import { FlaskConical, Sparkles, TrendingUp } from "lucide-react"
import type { TipoLaboratorio, LaboratorioResponse } from "@/lib/types/laboratorioTypes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LaboratorioShowcaseProps {
  initialLaboratorios?: LaboratorioResponse[] | null
}

export function LaboratorioShowcase({ initialLaboratorios }: LaboratorioShowcaseProps) {
  const { useListLaboratorios } = useLaboratorioApi()

  const [filter, setFilter] = useState<TipoLaboratorio | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleLaboratorios, setVisibleLaboratorios] = useState<LaboratorioResponse[]>(
    initialLaboratorios?.filter((l) => l.visivel === true) || [],
  )
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "alphabetical">("recent")
  const itemsPerPage = 9

  const {
    data: laboratorios,
    isLoading,
    error,
    refetch,
  } = useListLaboratorios({
    visivel: true,
  }, false)

  useEffect(() => {
    if (laboratorios) {
      // A API já filtra por visivel=true, então não precisamos filtrar novamente
      setVisibleLaboratorios(laboratorios)
    } else if (!laboratorios && initialLaboratorios) {
      // A função fetchPublicLaboratoriosForServer já filtra por visivel=true
      setVisibleLaboratorios(initialLaboratorios)
    } else if (!laboratorios && !initialLaboratorios && !isLoading && !error) {
      setVisibleLaboratorios([])
    }
  }, [laboratorios, initialLaboratorios, isLoading, error])

  const handleSortChange = (value: "recent" | "oldest" | "alphabetical") => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleRetry = () => {
    refetch()
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Ambiente Digital de Conexões</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Vitrine de Laboratórios
            </motion.h1>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-200" />
                <span className="text-2xl font-bold">{visibleLaboratorios.length}</span>
                <span className="text-purple-200">Laboratórios</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Search Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LaboratorioSearchAndSort
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            handleSortChange={handleSortChange}
            handleSearch={handleSearch}
            handleRetry={handleRetry}
          />
        </motion.div>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) => setFilter(value as TipoLaboratorio | "all")}
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
            <TabsList className="bg-white border border-purple-100 p-1 rounded-2xl shadow-lg flex-wrap h-auto justify-start">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 sm:px-6 py-3 font-medium transition-all duration-300 flex items-center gap-2"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="PESQUISA"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 sm:px-6 py-3 font-medium transition-all duration-300 flex items-center gap-2"
              >
                Pesquisa
              </TabsTrigger>
              <TabsTrigger
                value="ENSINO"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 sm:px-6 py-3 font-medium transition-all duration-300 flex items-center gap-2"
              >
                Ensino
              </TabsTrigger>
              <TabsTrigger
                value="EXTENSAO"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-4 sm:px-6 py-3 font-medium transition-all duration-300 flex items-center gap-2"
              >
                Extensão
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all">
            <LaboratorioList
              laboratorios={visibleLaboratorios}
              filter="all"
              searchTerm={searchTerm}
              sortBy={sortBy}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              loading={isLoading}
            />
          </TabsContent>
          <TabsContent value="PESQUISA">
            <LaboratorioList
              laboratorios={visibleLaboratorios}
              filter="PESQUISA"
              searchTerm={searchTerm}
              sortBy={sortBy}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              loading={isLoading}
            />
          </TabsContent>
          <TabsContent value="ENSINO">
            <LaboratorioList
              laboratorios={visibleLaboratorios}
              filter="ENSINO"
              searchTerm={searchTerm}
              sortBy={sortBy}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              loading={isLoading}
            />
          </TabsContent>
          <TabsContent value="EXTENSAO">
            <LaboratorioList
              laboratorios={visibleLaboratorios}
              filter="EXTENSAO"
              searchTerm={searchTerm}
              sortBy={sortBy}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              loading={isLoading}
            />
          </TabsContent>

        </Tabs>

        {/* Error States */}
        {error && visibleLaboratorios.length === 0 && (
          <motion.div
            className="text-center mt-12 p-8 bg-red-50 rounded-2xl border border-red-100"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Falha ao atualizar os laboratórios</h3>
            <p className="text-red-600">{error.message}</p>
            {initialLaboratorios === null && (
              <p className="text-red-500 text-sm mt-2">
                Os dados iniciais do servidor também não puderam ser carregados.
              </p>
            )}
          </motion.div>
        )}

        {!isLoading &&
          !error &&
          visibleLaboratorios.length === 0 &&
          ((laboratorios && laboratorios.length > 0) || (initialLaboratorios && initialLaboratorios.length > 0)) && (
            <motion.div
              className="text-center mt-12 p-8 bg-purple-50 rounded-2xl border border-purple-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum laboratório encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros ou termos de busca.</p>
            </motion.div>
          )}

        {!isLoading &&
          !error &&
          (!laboratorios || laboratorios.length === 0) &&
          (!initialLaboratorios || initialLaboratorios.length === 0) && (
            <motion.div
              className="text-center mt-12 p-8 bg-gray-50 rounded-2xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ainda não há laboratórios cadastrados</h3>
              <p className="text-gray-600">Seja o primeiro a cadastrar seu laboratório na plataforma!</p>
            </motion.div>
          )}
      </div>
    </div>
  )
}
