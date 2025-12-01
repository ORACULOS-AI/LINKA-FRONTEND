import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'orange'
}

const colorMap = {
  purple: {
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
    trend: 'text-purple-600',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
    trend: 'text-blue-600',
  },
  green: {
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
    trend: 'text-green-600',
  },
  yellow: {
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-600',
    trend: 'text-yellow-600',
  },
  red: {
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
    trend: 'text-red-600',
  },
  orange: {
    icon: 'bg-orange-100 text-orange-600',
    text: 'text-orange-600',
    trend: 'text-orange-600',
  },
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'purple',
}: StatCardProps) {
  const colors = colorMap[color]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2.5 rounded-lg ${colors.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colors.text}`}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={`text-xs mt-2 font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs. mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  )
}
