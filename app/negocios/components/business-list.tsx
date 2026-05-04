"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { BusinessCard } from "@/components/business-card"
import { BusinessCardSkeleton } from "./business-card-skeleton"
import { Pagination } from "@/components/ui/pagination"
import type { NegocioResponse, NegocioType, CategoriaNegocio } from "@/lib/types/businessTypes"

interface BusinessListProps {
  businesses: NegocioResponse[]
  filter: NegocioType | "all"
  categoriaFilter?: CategoriaNegocio | "all"
  searchTerm: string
  sortBy: "recent" | "oldest" | "alphabetical"
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
  loading: boolean
}

export function BusinessList({
  businesses,
  filter,
  categoriaFilter = "all",
  searchTerm,
  sortBy,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  loading,
}: BusinessListProps) {
  const filteredAndSortedBusinesses = useMemo(() => {
    const result = businesses.filter((business) => {
      const matchesTipo = filter === "all" || business.tipo_negocio === filter
      const matchesCategoria = categoriaFilter === "all" || business.categoria === categoriaFilter
      const matchesSearch =
        business.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.palavras_chave.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesTipo && matchesCategoria && matchesSearch
    })

    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.data_cadastro).getTime() - new Date(b.data_cadastro).getTime())
        break
      case "alphabetical":
        result.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        break
      default: // 'recent'
        result.sort((a, b) => new Date(b.data_cadastro).getTime() - new Date(a.data_cadastro).getTime())
    }

    return result
  }, [businesses, filter, categoriaFilter, searchTerm, sortBy])

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredAndSortedBusinesses.slice(indexOfFirstItem, indexOfLastItem)
  }, [filteredAndSortedBusinesses, currentPage, itemsPerPage])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <BusinessCardSkeleton />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentItems.map((business, index) => (
          <motion.div
            key={business.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <BusinessCard business={business} />
          </motion.div>
        ))}
      </div>

      {filteredAndSortedBusinesses.length > itemsPerPage && (
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Pagination
            currentPage={currentPage}
            totalCount={filteredAndSortedBusinesses.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      )}
    </>
  )
}
