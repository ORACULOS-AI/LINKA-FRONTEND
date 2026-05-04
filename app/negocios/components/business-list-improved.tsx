"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { BusinessCardImproved } from "@/components/business-card-improved"
import { BusinessCardSkeleton } from "./business-card-skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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

export function BusinessListImproved({
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
    const result = [...businesses]

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
  }, [businesses, sortBy])

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredAndSortedBusinesses.slice(indexOfFirstItem, indexOfLastItem)
  }, [filteredAndSortedBusinesses, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedBusinesses.length / itemsPerPage)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <BusinessCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((business, index) => (
          <BusinessCardImproved key={business.id} business={business} index={index} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={`rounded-xl border-2 ${
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className={`rounded-xl border-2 ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-600'
                            : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={`rounded-xl border-2 ${
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      )}
    </>
  )
}
