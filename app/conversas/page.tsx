'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageCircle, Search, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useMessagesApi } from '@/lib/api/messages'
import { useAllUsers } from '@/hooks/allUsers'
import { useAuth } from '@/lib/context/AuthContext'
import PrivateRoute from '@/components/private_route'
import { LoadingState } from './components/LoadingState'
import { ThreadList } from './components/ThreadList'
import { CommunityHero } from '@/components/comunidade/shared/CommunityHero'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Conversas Page - Simplified Full-Screen View
 *
 * Purpose: Power-user view for managing all conversations in one place
 * Features: Advanced search, complete history, full-screen layout
 *
 * Note: For quick chat access, use the global chat overlay (click bell icon)
 */
export default function ConversasPage() {
  const router = useRouter()
  const { userId } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const { useThreads } = useMessagesApi()
  const { data: allUsers } = useAllUsers()

  const { data: threadsData, fetchNextPage, hasNextPage, isLoading } = useThreads()
  const threads = threadsData?.pages.flatMap((page: any) => page.threads) ?? []

  // Search filter
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads
    const q = searchQuery.toLowerCase()
    return threads.filter((thread: any) => {
      const otherId = thread.participantes?.find((pid: string) => pid !== userId)
      const otherUser = allUsers?.find((u: any) => u.uid === otherId)
      return (
        otherUser?.nome?.toLowerCase().includes(q) ||
        otherUser?.email?.toLowerCase().includes(q) ||
        thread.last_message?.toLowerCase().includes(q)
      )
    })
  }, [threads, searchQuery, allUsers, userId])

  const handleThreadClick = (threadId: string, otherUserId: string) => {
    router.push(`/conversas/${threadId}?uid=${otherUserId}`)
  }

  if (isLoading) return <LoadingState />

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-white">
        <CommunityHero
          icon={MessageCircle}
          badge="Visualização Completa"
          title="Histórico de Conversas"
          stats={[{ icon: MessageCircle, value: threads.length, label: 'Total' }]}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Info Alert */}
          <Alert className="mb-6 border-purple-200 bg-purple-50">
            <Info className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-900">
              <strong>Dica:</strong> Use o ícone de chat no canto inferior direito para acesso rápido às conversas.
            </AlertDescription>
          </Alert>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou mensagem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* Thread List */}
          {filteredThreads.length === 0 && searchQuery ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-12 bg-gray-50 rounded-xl"
            >
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Nenhum resultado</h3>
              <p className="text-sm text-gray-600">Tente outro termo de busca</p>
            </motion.div>
          ) : (
            <ThreadList
              threads={filteredThreads}
              allUsers={allUsers || []}
              userId={userId}
              onThreadClick={handleThreadClick}
              hasNextPage={hasNextPage}
              onLoadMore={fetchNextPage}
              isLoadingMore={false}
            />
          )}
        </div>
      </div>
    </PrivateRoute>
  )
}
