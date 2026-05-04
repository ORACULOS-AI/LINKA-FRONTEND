import { Skeleton } from '@/components/ui/skeleton'

export function BusinessSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative">
        <Skeleton className="h-64 w-full" />
        <div className="container mx-auto px-4">
          <div className="relative -mt-24 mb-8 flex items-end">
            <Skeleton className="w-48 h-48 rounded-lg" />
            <div className="ml-8 pb-4 space-y-4">
              <Skeleton className="h-10 w-64" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            {[1, 2, 3].map((i) => (
              <section key={i} className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-24 w-full" />
              </section>
            ))}
          </div>
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <section key={i} className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
