import { Card, CardContent } from "@/components/ui/card"

export function SkeletonCard() {
  return (
    <Card className="border border-purple-100 bg-white h-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 mb-4">
          <div className="h-14 w-14 rounded-xl bg-purple-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-purple-100 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-purple-50 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-purple-50 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-20 bg-purple-100 rounded-full animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-full bg-purple-100 rounded animate-pulse" />
          <div className="h-8 w-full bg-purple-50 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}
