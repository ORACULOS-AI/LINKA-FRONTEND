'use client'

import { useBusinessApi } from '@/lib/api/business'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion'
import { Sparkles, RotateCw, TrendingUp, Rocket, Users, Beaker, ArrowRight, MapPin, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { QuickLinksImproved } from './components/QuickLinksImproved'

// Animated Counter Component
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0
  })
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [motionValue, isInView, value])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toString()
      }
    })
    return unsubscribe
  }, [springValue])

  return <span ref={ref}>0</span>
}

export default function DashboardPageRedesigned() {
  const { useGetDashboardData } = useBusinessApi()
  const { data: dashboardData, isLoading, error, refetch } = useGetDashboardData()
  const [lastUpdate] = useState(new Date().toLocaleString('pt-BR'))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 text-white overflow-hidden">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Skeleton className="h-8 w-48 mx-auto bg-white/20" />
              <Skeleton className="h-16 w-full mx-auto bg-white/20" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12 space-y-6">
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-10 w-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum dado disponível</h3>
          <p className="text-gray-600 mb-6">Não há dados suficientes para exibir o dashboard no momento.</p>
          <Button onClick={() => refetch()} className="bg-gradient-to-r from-purple-600 to-violet-600">
            <RotateCw className="h-4 w-4 mr-2" />
            Atualizar dados
          </Button>
        </motion.div>
      </div>
    )
  }

  const stats = dashboardData.estatisticas_gerais || {
    total_negocios: 0,
    total_startups: 0,
    total_empresas_juniores: 0,
    total_laboratorios: 0,
  }

  // Calcular insights
  const totalNegocios = stats.total_negocios
  const totalStartups = stats.total_startups
  const totalEJs = stats.total_empresas_juniores
  const totalLabs = stats.total_laboratorios
  const percentualStartups = totalNegocios > 0 ? Math.round((totalStartups / totalNegocios) * 100) : 0

  // Top áreas
  const topAreas = Array.isArray(dashboardData.top_areas_estrategicas)
    ? dashboardData.top_areas_estrategicas.slice(0, 5)
    : Object.entries(dashboardData.top_areas_estrategicas || {})
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)

  // Laboratórios por campus/centro
  const labsPorCampus = Object.entries(dashboardData.laboratorios?.por_campus || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* HEADER HERO - IMPACTO IMEDIATO */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 pb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-base font-semibold">Ecossistema de Inovação UFC</span>
            </motion.div>

            {/* Headline impactante */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                Mais de <span className="text-yellow-300">{totalNegocios}</span> negócios
                <br />
                transformando ideias em realidade
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto">
                A maior plataforma de inovação da UFC conecta startups, laboratórios e empresas juniores em um só lugar
              </p>
            </motion.div>

            {/* Stats Hero - Números Gigantes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
            >
              {[
                { number: totalStartups, label: 'Startups Incubadas', icon: Rocket },
                { number: totalEJs, label: 'Empresas Juniores', icon: Users },
                { number: totalLabs, label: 'Laboratórios Ativos', icon: Beaker },
                { number: `${percentualStartups}%`, label: 'São Startups', icon: TrendingUp },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + idx * 0.1, duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <stat.icon className="h-8 w-8 mb-3 mx-auto text-yellow-300" />
                  <div className="text-4xl md:text-5xl font-black mb-2">
                    <AnimatedCounter value={stat.number} duration={5} />
                  </div>
                  <div className="text-sm md:text-base text-white/80 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white" fillOpacity="0.1"/>
            <path d="M0 40L60 46.7C120 53 240 67 360 73.3C480 80 600 80 720 73.3C840 67 960 53 1080 46.7C1200 40 1320 40 1380 40H1440V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V40Z" fill="rgb(249, 250, 251)"/>
          </svg>
        </div>
      </div>

      {/* CONTEÚDO - STORYTELLING COM DADOS */}
      <div className="container mx-auto px-4 -mt-8 pb-20 space-y-16">
        {/* Quick Links - Manter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickLinksImproved />
        </motion.div>

        {/* Seção: Por que nossa plataforma importa */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            O coração da inovação da UFC
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Conectamos empreendedores, pesquisadores e estudantes em um ecossistema que já impulsionou{' '}
            <span className="font-bold text-purple-600">{totalStartups} startups</span> e conta com{' '}
            <span className="font-bold text-purple-600">{totalLabs} laboratórios de pesquisa</span> espalhados pelos centros da universidade.
          </p>
        </motion.section>

        {/* Seção: Áreas mais inovadoras */}
        {topAreas.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 md:p-12 border-2 border-purple-100"
          >
            <div className="text-center mb-10">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Áreas mais inovadoras</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Veja onde nossa comunidade está concentrando esforços de inovação
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6 max-w-5xl mx-auto">
              {topAreas.map(([area, count], idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-purple-100 hover:border-purple-300">
                    <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                      <AnimatedCounter value={count as number} duration={5} />
                    </div>
                    <div className="text-sm font-semibold text-gray-700 leading-tight">{area}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Seção: Presença nos Centros */}
        {labsPorCampus.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Presença nos Centros da UFC</h3>
            <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
              Laboratórios espalhados estrategicamente pelos principais centros
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {labsPorCampus.map(([centro, quantidade], idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 transition-all border-2 border-purple-100 hover:border-purple-300"
                >
                  <div className="text-6xl font-black bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-3">
                    <AnimatedCounter value={quantidade as number} duration={10} />
                  </div>
                  <div className="text-lg font-bold text-gray-800 mb-1">{centro}</div>
                  <div className="text-sm text-gray-500">laboratórios ativos</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA Final */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

          <div className="relative z-10 text-center text-white py-20 px-6">
            <Rocket className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Pronto para fazer parte?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-light">
              Junte-se a centenas de empreendedores, pesquisadores e inovadores que já estão transformando o futuro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/negocios">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-bold shadow-2xl">
                  Explorar negócios
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/iniciativas">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl font-bold">
                  Ver iniciativas
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
