"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThreadCard } from "./ThreadCard"

interface ThreadListProps {
  threads: any[]
  allUsers: any[]
  userId: string | null
  onThreadClick: (threadId: string, otherUserId: string) => void
  hasNextPage?: boolean
  onLoadMore?: () => void
  isLoadingMore?: boolean
}

export function ThreadList({
  threads,
  allUsers,
  userId,
  onThreadClick,
  hasNextPage,
  onLoadMore,
  isLoadingMore,
}: ThreadListProps) {
  return (
    <div className="space-y-2">
      {threads.map((thread: any) => {
        const otherId = (thread.participantes || []).find((pid: string) => pid !== userId)
        const otherUser = allUsers?.find((u: any) => u.uid === otherId)

        return (
          <ThreadCard
            key={thread.id}
            thread={thread}
            otherUser={otherUser}
            onClick={() => onThreadClick(thread.id, otherId)}
          />
        )
      })}
      {hasNextPage && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full sm:w-auto"
          >
            {isLoadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Carregando...
              </>
            ) : (
              "Carregar mais conversas"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
