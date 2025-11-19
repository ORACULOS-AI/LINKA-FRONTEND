'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardChartsProps {
  data: {
    negocios_por_categoria?: Record<string, number>
    negocios_por_tipo?: Record<string, number>
    startups_por_campus?: Record<string, number>
    modalidade_instalacao?: Record<string, number>
    top_areas_estrategicas?: Record<string, number> | Array<[string, number]>
    modelo_negocio?: Record<string, number>
    laboratorios?: {
      total: number
      por_tipo: Record<string, number>
      por_status: Record<string, number>
      por_unidade: Record<string, number>
      por_campus: Record<string, number>
    }
  }
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Converter dados de categoria para formato de gráfico
  const categoriaData = Object.entries(data.negocios_por_categoria || {}).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }))

  // Converter dados de campus
  const campusData = Object.entries(data.startups_por_campus || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 campus

  // Converter top áreas estratégicas
  const areasData = Array.isArray(data.top_areas_estrategicas)
    ? data.top_areas_estrategicas.map(([name, value]) => ({ name, value })).slice(0, 10)
    : Object.entries(data.top_areas_estrategicas || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

  // Modalidade de instalação
  const modalidadeData = Object.entries(data.modalidade_instalacao || {}).map(([name, value]) => ({
    name,
    value,
  }))

  // Dados de laboratórios
  const laboratoriosPorTipo = Object.entries(data.laboratorios?.por_tipo || {}).map(([name, value]) => ({
    name,
    value,
  }))

  const laboratoriosPorCampus = Object.entries(data.laboratorios?.por_campus || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 campus

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribuição por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
          <CardDescription>Tipos de negócios na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoriaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Áreas Estratégicas */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top 10 Áreas Estratégicas</CardTitle>
          <CardDescription>Principais áreas de atuação dos negócios</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={areasData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={200} />
              <Tooltip />
              <Bar dataKey="value" fill="#06b6d4" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Modalidade de Instalação */}
      {modalidadeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Modalidade de Instalação</CardTitle>
            <CardDescription>Como os negócios estão instalados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modalidadeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modalidadeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Laboratórios por Campus */}
      {laboratoriosPorCampus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Laboratórios por Campus</CardTitle>
            <CardDescription>Distribuição geográfica dos laboratórios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={laboratoriosPorCampus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
