import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function BusinessCardSkeleton() {
  return (
    <Card className="w-full h-[400px] border border-purple-100 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl animate-pulse"></div>
          <div className="flex-1">
            <div className="h-5 bg-purple-100 rounded-lg w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-purple-50 rounded-lg w-1/2 animate-pulse"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-purple-50 rounded-lg w-full animate-pulse"></div>
          <div className="h-4 bg-purple-50 rounded-lg w-full animate-pulse"></div>
          <div className="h-4 bg-purple-50 rounded-lg w-3/4 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-purple-100 rounded-full w-16 animate-pulse"></div>
          <div className="h-6 bg-purple-100 rounded-full w-20 animate-pulse"></div>
        </div>
        <div className="pt-4 border-t border-purple-50">
          <div className="h-10 bg-purple-100 rounded-lg w-full animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )
}
