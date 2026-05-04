'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, TrendingUp, Beaker } from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardStatsProps {
  data: {
    estatisticas_gerais?: {
      total_negocios: number
      total_startups: number
      total_empresas_juniores: number
      total_laboratorios: number
    }
  }
}

export function DashboardStatsImproved({ data }: DashboardStatsProps) {
  const stats = data.estatisticas_gerais || {
    total_negocios: 0,
    total_startups: 0,
    total_empresas_juniores: 0,
    total_laboratorios: 0,
  }

  const cards = [
    {
      title: 'Total de Negócios',
      value: stats.total_negocios,
      icon: Briefcase,
      description: 'Negócios cadastrados',
    },
    {
      title: 'Startups',
      value: stats.total_startups,
      icon: TrendingUp,
      description: 'Startups incubadas',
    },
    {
      title: 'Empresas Juniores',
      value: stats.total_empresas_juniores,
      icon: Users,
      description: 'EJs ativas',
    },
    {
      title: 'Laboratórios',
      value: stats.total_laboratorios,
      icon: Beaker,
      description: 'Laboratórios ativos',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden bg-white border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 h-full">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100">
                <card.icon className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                {card.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
