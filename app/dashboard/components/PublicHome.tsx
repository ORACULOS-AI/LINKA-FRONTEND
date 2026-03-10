'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  Calendar,
  FlaskConical,
  Lightbulb,
  Briefcase,
  MapPin,
  ArrowRight,
  Link2,
  Network,
  Building2,
} from 'lucide-react'

import { usePublicDashboard } from '@/lib/api/dashboard'
import { isValidImageUrl, getInitials, formatDate, cn } from '@/lib/utils'

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@/components/ui/card'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Suppress unused-import lint for Link2 — used as icon alias
void Link2

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function PublicHomeSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero skeleton */}
      <div className="w-full bg-purple-200 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
          <Skeleton className="h-10 w-2/3 bg-purple-300/60 mx-auto" />
          <Skeleton className="h-5 w-1/2 bg-purple-300/50 mx-auto" />
          <Skeleton className="h-4 w-1/3 bg-purple-300/40 mx-auto" />
          <div className="flex justify-center gap-4 flex-wrap pt-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-32 rounded-2xl bg-purple-300/40" />
            ))}
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Skeleton className="h-10 w-40 rounded-lg bg-purple-300/50" />
            <Skeleton className="h-10 w-44 rounded-lg bg-purple-300/40" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Main grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <Skeleton className="h-5 w-36" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/5" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <Skeleton className="h-5 w-40" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-5 w-20 rounded-full shrink-0" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-14 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
              <Skeleton className="h-5 w-36" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
              <Skeleton className="h-5 w-28" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5 border-b pb-3 last:border-0 last:pb-0">
                  <Skeleton className="h-3.5 w-3/4" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Static Hero (shown on error) ─────────────────────────────────────────────

function StaticHero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-5">
          <p className="text-purple-200 text-sm font-medium tracking-widest uppercase">
            Sua rede de inovação começa aqui
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Ambiente Digital de Conexões
          </h1>
          <p className="text-purple-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Conectando pesquisadores, estudantes e empreendedores da UFC
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-md border-0 px-7"
              >
                Criar minha conta
              </Button>
            </Link>
            <Link href="/negocios">
              <Button
                size="lg"
                variant="outline"
                className="border-white/60 text-white hover:bg-white/10 hover:text-white font-semibold px-7 bg-transparent"
              >
                Explorar Ecossistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({
  value,
  label,
  icon: Icon,
}: {
  value: number
  label: string
  icon: React.ElementType
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center gap-1 rounded-2xl bg-white/15 border border-white/20 px-6 py-4 backdrop-blur-sm min-w-[110px]"
    >
      <Icon className="h-5 w-5 text-purple-200 mb-0.5" />
      <span className="text-white text-2xl font-bold leading-none">
        {value.toLocaleString('pt-BR')}
      </span>
      <span className="text-purple-200 text-xs font-medium">{label}</span>
    </motion.div>
  )
}

// ─── Ecosystem Stat Card ───────────────────────────────────────────────────────

function EcoStatCard({
  value,
  label,
  sublabel,
  icon: Icon,
}: {
  value: number
  label: string
  sublabel: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50">
        <Icon className="h-6 w-6 text-purple-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-800 leading-none mt-0.5">
          {value.toLocaleString('pt-BR')}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PublicHome() {
  const { data, isLoading, isError } = usePublicDashboard()

  if (isLoading) return <PublicHomeSkeleton />
  if (isError || !data) return <StaticHero />

  const { comunidade, destaques, numeros } = data

  const proximos_eventos = destaques.proximos_eventos.slice(0, 5)
  const iniciativas_abertas = destaques.iniciativas_abertas.slice(0, 4)
  const negocios_destaque = destaques.negocios_destaque.slice(0, 4)
  const laboratorios_destaque = destaques.laboratorios_destaque.slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 text-center space-y-5">
          {/* Tagline */}
          <p className="text-purple-200 text-sm font-medium tracking-widest uppercase">
            Sua rede de inovação começa aqui
          </p>

          {/* Main title */}
          <h1 className="text-white text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Ambiente Digital de Conexões
          </h1>

          {/* Subtitle */}
          <p className="text-purple-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Conectando pesquisadores, estudantes e empreendedores da UFC
          </p>

          {/* Animated stat pills */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-3 pt-4"
          >
            <StatPill
              value={comunidade.total_usuarios}
              label="Membros"
              icon={Users}
            />
            <StatPill
              value={comunidade.total_conexoes}
              label="Conexões"
              icon={Network}
            />
            <StatPill
              value={comunidade.total_eventos_realizados}
              label="Eventos"
              icon={Calendar}
            />
          </motion.div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-md border-0 px-7 h-11"
              >
                Criar minha conta
              </Button>
            </Link>
            <Link href="/negocios">
              <Button
                size="lg"
                variant="outline"
                className="border-white/60 text-white hover:bg-white/10 hover:text-white font-semibold px-7 h-11 bg-transparent"
              >
                Explorar Ecossistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Page Body ────────────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16"
      >
        {/* ── Ecosystem Stats Row ─────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <EcoStatCard
            value={numeros.total_negocios}
            label="Negócios"
            sublabel="cadastrados"
            icon={Briefcase}
          />
          <EcoStatCard
            value={numeros.total_laboratorios}
            label="Laboratórios"
            sublabel="disponíveis"
            icon={FlaskConical}
          />
          <EcoStatCard
            value={numeros.total_iniciativas}
            label="Iniciativas"
            sublabel="abertas"
            icon={Lightbulb}
          />
          <EcoStatCard
            value={numeros.total_eventos}
            label="Eventos"
            sublabel="programados"
            icon={Calendar}
          />
        </motion.div>

        {/* ── Main Content Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Próximos Eventos */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Próximos Eventos
                    </CardTitle>
                    <Link href="/eventos">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs h-7 px-2"
                      >
                        Ver todos
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-5 pb-5">
                  {proximos_eventos.length > 0 ? (
                    <ul className="space-y-4">
                      {proximos_eventos.map((evento, index) => (
                        <li
                          key={evento.uid}
                          className={cn(
                            'group pb-4',
                            index < proximos_eventos.length - 1 &&
                              'border-b border-gray-100',
                          )}
                        >
                          <Link href={`/eventos/${evento.uid}`} className="block">
                            <p className="font-medium text-gray-800 group-hover:text-purple-700 transition-colors line-clamp-1 leading-snug">
                              {evento.titulo}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(
                                evento.data_inicio,
                                "dd 'de' MMM 'às' HH:mm",
                              )}
                            </p>
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{evento.local}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-100 capitalize"
                              >
                                {evento.categoria}
                              </Badge>
                              {evento.is_online && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 border-green-100"
                                >
                                  Online
                                </Badge>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Calendar className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Nenhum evento programado
                      </p>
                      <p className="text-xs text-gray-400">
                        Acompanhe a plataforma para novidades.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Iniciativas Abertas */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-purple-500" />
                      Iniciativas Abertas
                    </CardTitle>
                    <Link href="/iniciativas">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs h-7 px-2"
                      >
                        Ver todas
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-5 pb-5">
                  {iniciativas_abertas.length > 0 ? (
                    <ul className="space-y-4">
                      {iniciativas_abertas.map((iniciativa, index) => (
                        <li
                          key={iniciativa.uid}
                          className={cn(
                            'group pb-4',
                            index < iniciativas_abertas.length - 1 &&
                              'border-b border-gray-100',
                          )}
                        >
                          <Link href={`/iniciativas/${iniciativa.uid}`} className="block">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-gray-800 group-hover:text-purple-700 transition-colors leading-snug line-clamp-1">
                                {iniciativa.titulo}
                              </p>
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-[10px] px-2 py-0.5 bg-violet-50 text-violet-700 border-violet-100 capitalize"
                              >
                                {iniciativa.tipo}
                              </Badge>
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {iniciativa.descricao}
                            </p>
                            {iniciativa.palavras_chave.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {iniciativa.palavras_chave.slice(0, 4).map((kw) => (
                                  <span
                                    key={kw}
                                    className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 font-medium"
                                  >
                                    {kw}
                                  </span>
                                ))}
                                {iniciativa.palavras_chave.length > 4 && (
                                  <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">
                                    +{iniciativa.palavras_chave.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Lightbulb className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Nenhuma iniciativa aberta no momento
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ── Right Column ────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Negócios em Destaque */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-500" />
                      Negócios em Destaque
                    </CardTitle>
                    <Link href="/negocios">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs h-7 px-2"
                      >
                        Ver todos
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-5 pb-5">
                  {negocios_destaque.length > 0 ? (
                    <ul className="space-y-3">
                      {negocios_destaque.map((negocio) => (
                        <li key={negocio.id}>
                          <Link
                            href={`/negocios/${negocio.id}`}
                            className="group flex items-center gap-3 rounded-lg p-1.5 -mx-1.5 hover:bg-purple-50 transition-colors"
                          >
                            <Avatar className="h-10 w-10 shrink-0 border border-gray-100">
                              {isValidImageUrl(negocio.foto_perfil) ? (
                                <AvatarImage
                                  src={negocio.foto_perfil!}
                                  alt={negocio.nome}
                                />
                              ) : null}
                              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                                {getInitials(negocio.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 group-hover:text-purple-700 transition-colors truncate leading-snug">
                                {negocio.nome}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-100 capitalize"
                                >
                                  {negocio.categoria}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-600 border-gray-200 capitalize"
                                >
                                  {negocio.estagio}
                                </Badge>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-6 text-center space-y-1">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Briefcase className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Nenhum negócio em destaque
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Laboratórios */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-purple-500" />
                      Laboratórios
                    </CardTitle>
                    <Link href="/laboratorios">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs h-7 px-2"
                      >
                        Ver todos
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-5 pb-5">
                  {laboratorios_destaque.length > 0 ? (
                    <ul className="space-y-3">
                      {laboratorios_destaque.map((lab, index) => (
                        <li
                          key={lab.uid}
                          className={cn(
                            'group pb-3',
                            index < laboratorios_destaque.length - 1 &&
                              'border-b border-gray-100',
                          )}
                        >
                          <Link href={`/laboratorios/${lab.uid}`} className="block">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-purple-700 transition-colors leading-snug line-clamp-1">
                              {lab.nome}
                            </p>
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                              <Building2 className="h-3 w-3 shrink-0" />
                              <span className="truncate">{lab.campus}</span>
                            </div>
                            <div className="mt-1.5">
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-100 capitalize"
                              >
                                {lab.tipo}
                              </Badge>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-6 text-center space-y-1">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <FlaskConical className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Nenhum laboratório em destaque
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ── CTA Footer Banner ────────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <div className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 shadow-lg px-6 py-10 text-center space-y-4">
            <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
              Faça parte do ecossistema de inovação da UFC
            </h2>
            <p className="text-purple-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Crie sua conta gratuita e conecte-se com pesquisadores, startups e
              laboratórios
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-md border-0 px-8 h-11"
                >
                  Criar minha conta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
