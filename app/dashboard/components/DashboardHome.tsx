'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  Calendar,
  Search,
  FlaskConical,
  Lightbulb,
  UserPlus,
  Settings,
  Compass,
  Link2,
  Briefcase,
  Bell,
  MapPin,
  ArrowRight,
  Sparkles,
  RotateCw,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useHomeDashboard } from '@/lib/api/dashboard'
import { isValidImageUrl, getInitials, formatDate, cn } from '@/lib/utils'

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  calendar: Calendar,
  search: Search,
  flask: FlaskConical,
  lightbulb: Lightbulb,
  'user-plus': UserPlus,
  settings: Settings,
  compass: Compass,
  link: Link2,
  briefcase: Briefcase,
}

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

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header banner skeleton */}
      <div className="w-full h-32 bg-purple-200 animate-pulse rounded-b-2xl mb-6" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {/* Stats row skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
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
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <Skeleton className="h-5 w-44" />
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
              <Skeleton className="h-5 w-36" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center shadow-md">
        <CardHeader>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <RotateCw className="h-7 w-7 text-red-500" />
          </div>
          <CardTitle className="text-lg text-gray-800">
            Erro ao carregar o dashboard
          </CardTitle>
          <CardDescription className="text-gray-500">
            Não foi possível carregar suas informações. Verifique sua conexão e
            tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onRetry}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { data, isLoading, isError, refetch } = useHomeDashboard()

  if (isLoading) return <DashboardSkeleton />
  if (isError || !data) return <DashboardError onRetry={() => refetch()} />

  const {
    usuario,
    minha_rede,
    meus_recursos,
    proximos_eventos,
    atalhos,
    notificacoes_nao_lidas,
    sugestoes,
  } = data

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ── Header Banner ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 rounded-b-2xl shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
          {/* Left: Avatar + greeting + campus */}
          <div className="flex items-center gap-4 min-w-0">
            <Avatar className="h-14 w-14 border-2 border-white/40 shadow-md shrink-0">
              {isValidImageUrl(usuario.foto_url) ? (
                <AvatarImage src={usuario.foto_url!} alt={usuario.nome} />
              ) : null}
              <AvatarFallback className="bg-purple-300 text-purple-900 font-semibold text-lg">
                {getInitials(usuario.nome)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="text-white/80 text-sm font-medium leading-none mb-1">
                Bem-vindo de volta
              </p>
              <h1 className="text-white text-xl sm:text-2xl font-bold truncate leading-tight">
                Olá, {usuario.nome.split(' ')[0]}!
              </h1>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs capitalize">
                  {usuario.tipo}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs">
                  {usuario.campus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right: Notification bell */}
          <div className="shrink-0">
            <Link href="/notificacoes" aria-label="Notificações">
              <div className="relative inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/15 hover:bg-white/25 transition-colors cursor-pointer border border-white/20">
                <Bell className="h-5 w-5 text-white" />
                {notificacoes_nao_lidas > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow">
                    {notificacoes_nao_lidas > 99 ? '99+' : notificacoes_nao_lidas}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Page Body ──────────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12"
      >
        {/* ── Pending Requests Banner ──────────────────────────────────────── */}
        {minha_rede.solicitacoes_pendentes > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <UserPlus className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-amber-800 font-medium text-sm sm:text-base leading-snug">
                  Você tem{' '}
                  <span className="font-bold">
                    {minha_rede.solicitacoes_pendentes}
                  </span>{' '}
                  {minha_rede.solicitacoes_pendentes === 1
                    ? 'solicitação de conexão pendente'
                    : 'solicitações de conexão pendentes'}
                </p>
              </div>
              <Link href="/rede" className="shrink-0">
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm"
                >
                  Ver
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Quick Stats Row ───────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Minha Rede */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Minha Rede
              </p>
              <p className="text-3xl font-bold text-gray-800 leading-none mt-0.5">
                {minha_rede.total_conexoes}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">conexões</p>
            </div>
          </div>

          {/* Meus Negócios */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Meus Negócios
              </p>
              <p className="text-3xl font-bold text-gray-800 leading-none mt-0.5">
                {meus_recursos.negocios}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">cadastrados</p>
            </div>
          </div>

          {/* Eventos Inscritos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Eventos Inscritos
              </p>
              <p className="text-3xl font-bold text-gray-800 leading-none mt-0.5">
                {meus_recursos.eventos_inscritos}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">próximos</p>
            </div>
          </div>
        </motion.div>

        {/* ── Main Content Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column ───────────────────────────────────────────────── */}
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
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs h-7 px-2">
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
                              {formatDate(evento.data_inicio, "dd 'de' MMM 'às' HH:mm")}
                            </p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
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
                        Nenhum evento próximo
                      </p>
                      <p className="text-xs text-gray-400">
                        Explore novos eventos na plataforma.
                      </p>
                      <Link href="/eventos">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          Explorar eventos
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sugestões de Iniciativas */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Sugestões de Iniciativas
                    </CardTitle>
                    <Link href="/iniciativas">
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs h-7 px-2">
                        Ver todas
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                  <CardDescription className="text-xs text-gray-400 mt-1">
                    Iniciativas recomendadas com base no seu perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 px-5 pb-5">
                  {sugestoes.iniciativas.length > 0 ? (
                    <ul className="space-y-4">
                      {sugestoes.iniciativas.map((iniciativa, index) => (
                        <li
                          key={iniciativa.uid}
                          className={cn(
                            'group pb-4',
                            index < sugestoes.iniciativas.length - 1 &&
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
                        <TrendingUp className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Nenhuma sugestão no momento
                      </p>
                      <p className="text-xs text-gray-400">
                        Complete seu perfil para receber sugestões personalizadas.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ── Right Column ──────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Atalhos Rápidos */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Compass className="h-4 w-4 text-purple-500" />
                    Atalhos Rápidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-4 pb-4">
                  {atalhos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1.5">
                      {atalhos.map((atalho) => {
                        const IconComponent = iconMap[atalho.icone] ?? Sparkles
                        return (
                          <Link key={atalho.rota} href={atalho.rota}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors h-10 px-3 rounded-lg font-medium text-sm"
                            >
                              <IconComponent className="h-4 w-4 text-purple-500 shrink-0" />
                              <span className="truncate">{atalho.label}</span>
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-xs text-gray-400">
                      Nenhum atalho configurado.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Conexões Recentes */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      Conexões Recentes
                    </CardTitle>
                    <Link href="/rede">
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs h-7 px-2">
                        Ver rede
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-5 pb-5">
                  {minha_rede.conexoes_recentes.length > 0 ? (
                    <ul className="space-y-3">
                      {minha_rede.conexoes_recentes.map((conexao) => (
                        <li key={conexao.uid}>
                          <Link
                            href={`/perfil/${conexao.uid}`}
                            className="group flex items-center gap-3 rounded-lg p-1.5 -mx-1.5 hover:bg-purple-50 transition-colors"
                          >
                            <Avatar className="h-9 w-9 shrink-0 border border-gray-100">
                              {isValidImageUrl(conexao.foto_url) ? (
                                <AvatarImage
                                  src={conexao.foto_url!}
                                  alt={conexao.nome}
                                />
                              ) : null}
                              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                                {getInitials(conexao.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors truncate">
                              {conexao.nome}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-6 text-center space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <UserPlus className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Comece a se conectar!
                      </p>
                      <p className="text-xs text-gray-400">
                        Encontre pessoas e expanda sua rede.
                      </p>
                      <Link href="/rede">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          Explorar rede
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
