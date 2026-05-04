"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { LaboratorioCard } from "./laboratorio-card"
import { LaboratorioSkeleton } from "./laboratorio-skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { LaboratorioResponse } from "@/lib/types/laboratorioTypes"

interface LaboratorioListProps {
  laboratorios: LaboratorioResponse[]
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
  loading: boolean
}

export function LaboratorioListImproved({
  laboratorios,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  loading,
}: LaboratorioListProps) {
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return laboratorios.slice(indexOfFirstItem, indexOfLastItem)
  }, [laboratorios, currentPage, itemsPerPage])

  const totalPages = Math.ceil(laboratorios.length / itemsPerPage)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <LaboratorioSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((laboratorio) => (
          <LaboratorioCard key={laboratorio.uid} laboratorio={laboratorio} />
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
                      ? "pointer-events-none opacity-50"
                      : "border-purple-200 hover:border-purple-300 hover:bg-purple-50"
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
                            ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-600"
                            : "border-purple-200 hover:border-purple-300 hover:bg-purple-50"
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
                      ? "pointer-events-none opacity-50"
                      : "border-purple-200 hover:border-purple-300 hover:bg-purple-50"
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
