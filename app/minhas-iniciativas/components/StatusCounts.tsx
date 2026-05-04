import { motion } from 'framer-motion'

interface StatusCountsProps {
  activeCount: number
  pausedCount: number
  completedCount: number
  pendingInvitesCount: number
}

export const StatusCounts = ({
  activeCount,
  pausedCount,
  completedCount,
  pendingInvitesCount,
}: StatusCountsProps) => {
  return (
    <div className="grid grid-cols-4 gap-8 w-full text-center">
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-green-600">Ativas</div>
        <div className="text-3xl font-bold">{activeCount}</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-yellow-600">Pausadas</div>
        <div className="text-3xl font-bold">{pausedCount}</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-blue-600">Concluídas</div>
        <div className="text-3xl font-bold">{completedCount}</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-sm font-medium text-purple-600">
          Convites Pendentes
        </div>
        <div className="text-3xl font-bold">{pendingInvitesCount}</div>
      </div>
    </div>
  )
} 