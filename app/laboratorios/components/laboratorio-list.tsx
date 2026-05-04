"use client"

import { motion } from "framer-motion"
import { LaboratorioCard } from "./laboratorio-card"
import { LaboratorioSkeleton } from "./laboratorio-skeleton"
import type { TipoLaboratorio, LaboratorioResponse } from "@/lib/types/laboratorioTypes"

interface LaboratorioListProps {
  laboratorios: LaboratorioResponse[]
  filter: TipoLaboratorio | "all"
  searchTerm: string
  sortBy: "recent" | "oldest" | "alphabetical"
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
  loading: boolean
}

export default function LaboratorioList({
  laboratorios,
  filter,
  searchTerm,
  sortBy,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  loading,
}: LaboratorioListProps) {
  // Filtrar por tipo
  const filteredByType = laboratorios.filter((laboratorio) => {
    if (filter === "all") return true
    return laboratorio.tipo === filter
  })

  // Filtrar por termo de busca
  const filteredBySearch = filteredByType.filter((laboratorio) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const nome = laboratorio.nome?.toLowerCase() || ""
    const responsavel = laboratorio.responsavel?.toLowerCase() || ""
    const unidade = laboratorio.unidade?.toLowerCase() || ""
    const areasPesquisa = Array.isArray(laboratorio.areas_pesquisa)
      ? laboratorio.areas_pesquisa.map(area => (area?.toLowerCase() || "")).join(" ")
      : ""

    return (
      nome.includes(searchLower) ||
      responsavel.includes(searchLower) ||
      unidade.includes(searchLower) ||
      areasPesquisa.includes(searchLower)
    )
  })

  // Ordenar
  const sortedLaboratorios = [...filteredBySearch].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      case "alphabetical":
        return (a.nome || "").localeCompare(b.nome || "", "pt-BR")
      case "recent":
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    }
  })

  // Paginação
  const totalItems = sortedLaboratorios.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = sortedLaboratorios.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <LaboratorioSkeleton />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  if (currentItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum laboratório encontrado</h3>
        <p className="text-gray-600">
          {searchTerm
            ? "Tente ajustar os filtros ou termos de busca."
            : "Não há laboratórios disponíveis neste momento."}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Results count */}
      <div className="text-sm text-gray-600">
        Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} laboratórios
      </div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {currentItems.map((laboratorio, index) => (
          <motion.div
            key={laboratorio.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LaboratorioCard laboratorio={laboratorio} />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center items-center gap-2 mt-8"
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === pageNumber
                    ? "bg-purple-600 text-white"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </button>
            )
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próximo
          </button>
        </motion.div>
      )}
    </div>
  )
}
