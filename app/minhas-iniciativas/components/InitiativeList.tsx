import { motion } from 'framer-motion'
import { IniciativaBase } from '@/lib/types/initiativeTypes'
import { InitiativeCard } from './InitiativeCard'
import { getStatusBadge, getTipoIniciativaBadge } from './StatusBadges'
import { formatDate } from './DateFormatter'

interface InitiativeListProps {
  initiatives: IniciativaBase[]
  handleDeleteInitiative: (initiativeId: string) => Promise<void>
}

export const InitiativeList = ({
  initiatives,
  handleDeleteInitiative
}: InitiativeListProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {initiatives.map((initiative: IniciativaBase, index: number) => (
        <InitiativeCard
          key={initiative.uid}
          initiative={initiative}
          index={index}
          getStatusBadge={getStatusBadge}
          getTipoIniciativaBadge={getTipoIniciativaBadge}
          formatDate={formatDate}
          handleDeleteInitiative={handleDeleteInitiative}
        />
      ))}
    </motion.div>
  )
} 