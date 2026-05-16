'use client'

import { use } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, UserCheck, UserMinus, UserPlus, Clock } from 'lucide-react'
import { fetchUser, TIPO_LABEL } from '@/lib/api/users'
import {
  getConnectionBetween, sendConnectionRequest, cancelConnectionRequest,
  acceptConnectionRequest, getFollowCounts, isFollowing, followUser, unfollowUser,
} from '@/lib/api/connections'
import { FeedTimeline } from '@/components/feed/FeedTimeline'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/stores/auth'

export default function PublicProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params)
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()
  const isMe = me?.id === uid

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', uid],
    queryFn: () => fetchUser(uid),
    staleTime: 5 * 60_000,
  })

  const { data: conn } = useQuery({
    queryKey: ['connection-between', uid],
    queryFn: () => getConnectionBetween(uid),
    enabled: !!me && !isMe,
  })

  const { data: counts } = useQuery({
    queryKey: ['follow-counts', uid],
    queryFn: () => getFollowCounts(uid),
    enabled: !!profile,
  })

  const { data: following } = useQuery({
    queryKey: ['is-following', uid],
    queryFn: () => isFollowing(uid),
    enabled: !!me && !isMe,
  })

  const connM = useMutation({
    mutationFn: async () => {
      if (!conn) return
      if (conn.status === 'none') await sendConnectionRequest(uid)
      else if (conn.status === 'following') await unfollowUser(uid)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connection-between', uid] }),
  })

  const followM = useMutation({
    mutationFn: async () => {
      if (following) await unfollowUser(uid)
      else await followUser(uid)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['is-following', uid] })
      qc.invalidateQueries({ queryKey: ['follow-counts', uid] })
    },
  })

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <div className="mb-6 rounded-lg border border-border bg-paper p-6">
        <div className="flex items-start gap-4">
          <Avatar nome={profile.nome} src={profile.foto_perfil ?? profile.foto_url ?? undefined} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold">{profile.nome}</h1>
              {profile.is_verified && (
                <BadgeCheck className="h-5 w-5 shrink-0 text-selinka-blue" aria-label="Verificado" />
              )}
            </div>
            <p className="text-sm text-ink/60">{TIPO_LABEL[profile.tipo_usuario]}</p>
            {profile.campus && <p className="text-sm text-ink/50">{profile.campus}</p>}
          </div>

          {!isMe && me && (
            <div className="flex flex-col gap-2">
              <ConnectButton status={conn?.status ?? 'none'} loading={connM.isPending} onAction={() => connM.mutate()} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => followM.mutate()}
                disabled={followM.isPending}
              >
                {following ? (
                  <><UserMinus className="h-4 w-4" /> Deixar de seguir</>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Seguir</>
                )}
              </Button>
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm text-ink/80 leading-relaxed">{profile.bio}</p>
        )}

        <div className="mt-4 flex gap-6 border-t border-border pt-4 text-sm">
          <div className="text-ink/70">
            <strong className="text-ink">{counts?.followers ?? 0}</strong> seguidores
          </div>
          <div className="text-ink/70">
            <strong className="text-ink">{counts?.following ?? 0}</strong> seguindo
          </div>
        </div>
      </div>

      <h2 className="mb-3 font-display font-semibold text-ink/70">Publicações</h2>
      <FeedTimeline userUid={uid} emptyText="Nenhuma publicação ainda." />
    </div>
  )
}

function ConnectButton({
  status, loading, onAction,
}: {
  status: string
  loading: boolean
  onAction: () => void
}) {
  const map: Record<string, { label: string; icon: React.ReactNode; variant: 'primary' | 'outline' }> = {
    none: { label: 'Conectar', icon: <UserPlus className="h-4 w-4" />, variant: 'primary' },
    following: { label: 'Seguindo', icon: <Clock className="h-4 w-4" />, variant: 'outline' },
    connected: { label: 'Conectado', icon: <UserCheck className="h-4 w-4" />, variant: 'outline' },
  }
  const cfg = map[status] ?? map['none']!

  return (
    <Button variant={cfg.variant} size="sm" onClick={onAction} disabled={loading || status === 'connected'}>
      {cfg!.icon} {cfg!.label}
    </Button>
  )
}
