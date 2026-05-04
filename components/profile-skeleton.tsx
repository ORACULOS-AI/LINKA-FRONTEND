import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function ProfileSkeleton() {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <Skeleton className="h-4 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/4" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/4" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    </div>
  )
}
