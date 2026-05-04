import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header Skeleton */}
        <Card className="p-8 border border-purple-100">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <Skeleton className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-purple-100" />
            <div className="flex-1 space-y-6">
              <div>
                <Skeleton className="h-8 w-3/4 mb-3 bg-purple-100" />
                <Skeleton className="h-6 w-1/2 bg-purple-50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50">
                    <Skeleton className="w-10 h-10 rounded-lg bg-purple-100" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-1 bg-purple-100" />
                      <Skeleton className="h-4 w-2/3 bg-purple-50" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 flex-1 bg-purple-100" />
                <Skeleton className="h-10 flex-1 bg-purple-100" />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-6 border border-purple-100">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl bg-purple-100" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-1/2 mb-2 bg-purple-100" />
                  <Skeleton className="h-8 w-1/4 mb-1 bg-purple-50" />
                  <Skeleton className="h-4 w-3/4 bg-purple-50" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Actions Card Skeleton */}
        <Card className="p-6 border border-purple-100">
          <Skeleton className="h-6 w-1/4 mb-6 bg-purple-100" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 p-4">
                  <Skeleton className="w-8 h-8 rounded-lg bg-purple-100" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/3 mb-1 bg-purple-100" />
                    <Skeleton className="h-3 w-2/3 bg-purple-50" />
                  </div>
                </div>
                {i < 2 && <Skeleton className="h-px w-full bg-purple-50" />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
