"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { InitiativeCard } from "@/components/initiatives/InitiativeCard"
import { InitiativeSkeleton } from "./InitiativeSkeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { IniciativaBase } from "@/lib/types/initiativeTypes"

interface InitiativeListProps {
  initiatives: IniciativaBase[]
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
  loading: boolean
  onFavorite?: (initiativeId: string) => void
  onUnfavorite?: (initiativeId: string) => void
  isInitiativeFavorited?: (initiativeId: string) => boolean
  currentUserId?: string
}

export function InitiativeListImproved({
  initiatives,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  loading,
  onFavorite,
  onUnfavorite,
  isInitiativeFavorited,
  currentUserId,
}: InitiativeListProps) {
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return initiatives.slice(indexOfFirstItem, indexOfLastItem)
  }, [initiatives, currentPage, itemsPerPage])

  const totalPages = Math.ceil(initiatives.length / itemsPerPage)

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <InitiativeSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentItems.map((initiative) => (
          <InitiativeCard
            key={initiative.uid}
            initiative={initiative}
            onClick={() => {
              window.location.href = `/iniciativas/${initiative.uid}`
            }}
            onFavorite={onFavorite ? () => onFavorite(initiative.uid) : undefined}
            onUnfavorite={onUnfavorite ? () => onUnfavorite(initiative.uid) : undefined}
            isFavorited={isInitiativeFavorited ? isInitiativeFavorited(initiative.uid) : false}
            currentUserId={currentUserId}
          />
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
