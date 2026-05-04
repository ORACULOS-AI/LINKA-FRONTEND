import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

export const InitiativeSkeleton = () => (
  <motion.div 
    className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-purple-500/10 transition-all duration-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="space-y-4">
      <Skeleton className="h-[200px] w-full rounded-xl bg-purple-100" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4 bg-purple-100" />
        <Skeleton className="h-4 w-full bg-purple-50" />
        <Skeleton className="h-4 w-2/3 bg-purple-50" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full bg-purple-100" />
        <Skeleton className="h-6 w-16 rounded-full bg-purple-100" />
        <Skeleton className="h-6 w-18 rounded-full bg-purple-100" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-24 bg-purple-50" />
        <Skeleton className="h-8 w-20 rounded-lg bg-purple-100" />
      </div>
    </div>
  </motion.div>
) 