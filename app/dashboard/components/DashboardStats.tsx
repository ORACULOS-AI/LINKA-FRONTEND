'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, Award, TrendingUp, Beaker } from 'lucide-react'

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

export function DashboardStats({ data }: DashboardStatsProps) {
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
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      title: 'Startups',
      value: stats.total_startups,
      icon: TrendingUp,
      description: 'Startups incubadas',
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      title: 'Empresas Juniores',
      value: stats.total_empresas_juniores,
      icon: Users,
      description: 'EJs ativas',
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      title: 'Laboratórios',
      value: stats.total_laboratorios,
      icon: Beaker,
      description: 'Laboratórios ativos',
      gradient: 'from-purple-500 to-violet-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient}`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {card.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
