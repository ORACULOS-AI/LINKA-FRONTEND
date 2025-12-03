'use client'

import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Cores do tema
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c']
const PURPLE_GRADIENT = ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff']

interface DashboardData {
  por_campus?: Record<string, number>
  modalidade_instalacao?: Record<string, number>
  status_contrato?: Record<string, number>
  top_areas_estrategicas?: Record<string, number>
  regularizacao_prex?: Record<string, number>
  faturamento_anual?: Record<string, number>
  top_competencias?: Record<string, number>
  evolucao_cadastros?: Record<string, number>
  evolucao_fundacao?: Record<string, number>
  negocios_por_categoria?: Record<string, number>
  negocios_por_tipo?: Record<string, number>
}

interface ChartsSectionProps {
  data: DashboardData
}

export function ChartsSection({ data }: ChartsSectionProps) {
  
  // Transformar dados para formato do Recharts
  const campusData = (() => {
    const rawCampusData = Object.entries(data.por_campus || {});
    const aggregatedCampusMap = new Map<string, number>();

    rawCampusData.forEach(([name, value]) => {
      const standardizedName = name.replace('UFC - ', '');
      aggregatedCampusMap.set(standardizedName, (aggregatedCampusMap.get(standardizedName) || 0) + value);
    });

    return Array.from(aggregatedCampusMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  })();

  const tipoNegocioData = Object.entries(data.negocios_por_tipo || {})
    .map(([name, value]) => ({ 
      name: name
        .replace('PRE_INCUBADO', 'Pré-incubada')
        .replace('INCUBADO', 'Incubada')
        .replace('PARCEIRO', 'Parceira'), 
      value 
    }))

  const faturamentoData = Object.entries(data.faturamento_anual || {})
    .map(([name, value]) => ({ name, value }))

  const areasData = Object.entries(data.top_areas_estrategicas || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const competenciasData = Object.entries(data.top_competencias || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    
  let accFoundation = 0
  const evolucaoFundacaoData = Object.entries(data.evolucao_fundacao || {})
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([name, value]) => {
      accFoundation += value
      return { year: Number(name), value: accFoundation }
    })

  const regularizacaoData = Object.entries(data.regularizacao_prex || {})
    .map(([name, value]) => ({ name, value }))

  // Gerar ticks de 5 em 5 anos para o eixo X
  const currentYear = new Date().getFullYear()
  const endYear = Math.ceil(currentYear / 5) * 5
  const foundationTicks = []
  for (let year = 1995; year <= endYear; year += 5) {
    foundationTicks.push(year)
  }

  return (
    <div className="space-y-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Análise Detalhada do Ecossistema</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore os dados que mostram o crescimento e a diversidade da inovação na UFC
        </p>
      </motion.div>

      <Tabs defaultValue="geral" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="startups">Startups</TabsTrigger>
            <TabsTrigger value="ejs">Empresas Juniores</TabsTrigger>
            <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          </TabsList>
        </div>

        {/* TAB GERAL */}
        <TabsContent value="geral" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Campus</CardTitle>
                <CardDescription>Onde estão localizados os negócios</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campusData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#9333ea" radius={[0, 4, 4, 0]} name="Negócios" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Áreas Estratégicas</CardTitle>
                <CardDescription>Principais setores de atuação</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areasData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Ocorrências" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB STARTUPS */}
        <TabsContent value="startups" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estágio do Negócio</CardTitle>
                <CardDescription>Distribuição entre Pré-incubadas, Incubadas e Parceiras</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tipoNegocioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tipoNegocioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Startups por Campus</CardTitle>
                <CardDescription>Onde as startups estão localizadas</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-15} textAnchor="end" height={60}/>
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Startups" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB EJs */}
        <TabsContent value="ejs" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competências Desenvolvidas</CardTitle>
                <CardDescription>Habilidades mais trabalhadas nas EJs</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={competenciasData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 11}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} name="EJs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faturamento Anual</CardTitle>
                <CardDescription>Faixas de faturamento das Empresas Juniores</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={faturamentoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" height={60}/>
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="EJs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Status de Regularização (PREX)</CardTitle>
                <CardDescription>Situação das EJs junto à Pró-Reitoria de Extensão</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regularizacaoData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {regularizacaoData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" align="left" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB EVOLUÇÃO */}
        <TabsContent value="evolucao" className="space-y-6">
          <div className="flex justify-center">
            <Card className="w-3/4">
              <CardHeader>
                <CardTitle>Crescimento do Ecossistema (EJs)</CardTitle>
                <CardDescription>Total acumulado de empresas juniores ao longo dos anos</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolucaoFundacaoData}>
                    <defs>
                      <linearGradient id="colorFundacao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      type="number" 
                      domain={[1995, 'dataMax']} 
                      ticks={foundationTicks}
                      tickFormatter={(tick) => tick.toString()}
                    />
                    <YAxis domain={[0, 'dataMax']} ticks={[5, 10, 15, 20, 25]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="linear" dataKey="value" stroke="#ec4899" fillOpacity={1} fill="url(#colorFundacao)" name="Total Acumulado" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
