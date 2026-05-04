'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useEventApi } from '@/lib/api/event'
import {
  EventStatus,
  EventCategoria,
  EventCategoriaLabels,
  EventStatusLabels,
  EventStatusColors,
  EventSearchFilters,
  EventListItem,
  formatEventDateRange,
  getVacanciesText,
  canParticipate,
} from '@/lib/types/eventTypes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  ChevronDown,
  RotateCw,
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Video,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const ITEMS_PER_PAGE = 9

export default function EventosPage() {
  const { useSearchEvents } = useEventApi()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [categoriaFilter, setCategoriaFilter] = useState<EventCategoria | 'all'>('all')
  const [sortBy, setSortBy] = useState<'data_inicio' | 'created_at' | 'titulo'>('data_inicio')
  const [currentPage, setCurrentPage] = useState(1)

  const searchParams = useMemo<EventSearchFilters>(() => ({
    q: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    categoria: categoriaFilter !== 'all' ? categoriaFilter : undefined,
    limit: 100,
    offset: 0,
  }), [searchTerm, statusFilter, categoriaFilter])

  const { data: eventos = [], isLoading, refetch } = useSearchEvents(searchParams)

  // Sort + paginate
  const sortedEvents = useMemo(() => {
    const sorted = [...eventos].sort((a, b) => {
      if (sortBy === 'titulo') return a.titulo.localeCompare(b.titulo)
      if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
    })
    return sorted
  }, [eventos, sortBy])

  const totalPages = Math.ceil(sortedEvents.length / ITEMS_PER_PAGE)
  const paginatedEvents = sortedEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const hasActiveFilters = statusFilter !== 'all' || categoriaFilter !== 'all' || searchTerm !== ''

  const clearFilters = () => {
    setStatusFilter('all')
    setCategoriaFilter('all')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const getStatusLabel = (s: EventStatus | 'all') =>
    s === 'all' ? 'Todos os status' : EventStatusLabels[s]

  const getCategoriaLabel = (c: EventCategoria | 'all') =>
    c === 'all' ? 'Todas as categorias' : EventCategoriaLabels[c]

  const getSortLabel = (s: string) => {
    const map: Record<string, string> = {
      data_inicio: 'Data do evento',
      created_at: 'Mais recentes',
      titulo: 'A-Z',
    }
    return map[s]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* HERO */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 text-white overflow-hidden">
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Ambiente Digital de Conexões</span>
            </motion.div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Vitrine de Eventos</h1>
              <p className="text-white/90 text-lg">
                Descubra e participe de {eventos.length} eventos acadêmicos e profissionais
              </p>
            </div>

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
                  placeholder="Buscar eventos por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  className="w-full pl-12 pr-4 h-14 text-base bg-white/95 backdrop-blur-sm border-0 focus:bg-white focus:ring-2 focus:ring-white/50 rounded-2xl shadow-xl placeholder:text-gray-500 text-gray-900"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
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

      {/* STICKY FILTER BAR */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <span className="text-sm font-medium text-gray-700">{getStatusLabel(statusFilter)}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => { setStatusFilter(v as EventStatus | 'all'); setCurrentPage(1) }}>
                  <DropdownMenuRadioItem value="all" className="rounded-lg">Todos os status</DropdownMenuRadioItem>
                  {Object.values(EventStatus).map((s) => (
                    <DropdownMenuRadioItem key={s} value={s} className="rounded-lg">{EventStatusLabels[s]}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Categoria */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <span className="text-sm font-medium text-gray-700">{getCategoriaLabel(categoriaFilter)}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup value={categoriaFilter} onValueChange={(v) => { setCategoriaFilter(v as EventCategoria | 'all'); setCurrentPage(1) }}>
                  <DropdownMenuRadioItem value="all" className="rounded-lg">Todas as categorias</DropdownMenuRadioItem>
                  {Object.values(EventCategoria).map((c) => (
                    <DropdownMenuRadioItem key={c} value={c} className="rounded-lg">{EventCategoriaLabels[c]}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">{getSortLabel(sortBy)}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-purple-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 rounded-xl border-purple-200">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <DropdownMenuRadioItem value="data_inicio" className="rounded-lg">Data do evento</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="created_at" className="rounded-lg">Mais recentes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="titulo" className="rounded-lg">A-Z</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1" />

            {/* Stats + Refresh */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl">
                <span className="text-sm text-gray-600">
                  <strong className="text-purple-600">{sortedEvents.length}</strong> resultado{sortedEvents.length !== 1 ? 's' : ''}
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

          {/* Active Filters */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <span className="text-xs text-gray-500 font-medium">Filtros ativos:</span>
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  {getStatusLabel(statusFilter)}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-purple-900">×</button>
                </span>
              )}
              {categoriaFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  {getCategoriaLabel(categoriaFilter)}
                  <button onClick={() => setCategoriaFilter('all')} className="hover:text-purple-900">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                  &quot;{searchTerm}&quot;
                  <button onClick={() => setSearchTerm('')} className="hover:text-purple-900">×</button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-purple-600 hover:text-purple-700 font-medium underline">
                Limpar tudo
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : paginatedEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-600 mb-6">Tente ajustar os filtros ou termos de busca.</p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Limpar filtros
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {paginatedEvents.map((evento, index) => (
                  <EventShowcaseCard key={evento.uid} event={evento} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-purple-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((page, idx, arr) => (
                    <span key={page} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-xl ${currentPage === page ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-200'}`}
                      >
                        {page}
                      </Button>
                    </span>
                  ))}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-purple-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EventShowcaseCard({ event, index }: { event: EventListItem; index: number }) {
  const isOnline = event.is_online

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/eventos/${event.uid}`}>
        <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-br from-purple-100 to-violet-50">
            {event.imagem_capa ? (
              <Image
                src={event.imagem_capa}
                alt={event.titulo}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="w-16 h-16 text-purple-300" />
              </div>
            )}

            <Badge className={`absolute top-3 right-3 ${EventStatusColors[event.status]}`}>
              {EventStatusLabels[event.status]}
            </Badge>
            <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm">
              {EventCategoriaLabels[event.categoria]}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
              {event.titulo}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{event.descricao}</p>

            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span>{formatEventDateRange(event.data_inicio, event.data_fim)}</span>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? <Video className="w-4 h-4 text-purple-500" /> : <MapPin className="w-4 h-4 text-purple-500" />}
                <span className="truncate">{isOnline ? 'Evento Online' : event.local}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span>
                  {event.total_participantes} participante{event.total_participantes !== 1 ? 's' : ''}
                  {event.capacidade_maxima && ` / ${event.capacidade_maxima}`}
                </span>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {event.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs border-purple-200 text-purple-600">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {event.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                    +{event.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Vacancies indicator */}
            {event.capacidade_maxima && (
              <div className="pt-1">
                <span className={`text-xs font-medium ${canParticipate(event) ? 'text-green-600' : 'text-red-500'}`}>
                  {getVacanciesText(event)}
                </span>
              </div>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
