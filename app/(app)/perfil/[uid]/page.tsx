'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, MessageCircle, Heart } from 'lucide-react'
import { fetchUser, TIPO_LABEL } from '@/lib/api/users'
import { isMutual } from '@/lib/api/follow'
import { useFollowersCount } from '@/lib/hooks/useFollow'
import { FeedTimeline } from '@/components/feed/FeedTimeline'
import { FollowButton } from '@/components/social/FollowButton'
import { LikeButton } from '@/components/social/LikeButton'
import { Avatar } from '@/components/ui/avatar'
import { SkeletonCard, EmptyState } from '@/components/primitives'
import { useAuth } from '@/lib/stores/auth'

export default function PublicProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params)
  const me = useAuth((s) => s.me)
  const isMe = me?.id === uid

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', uid],
    queryFn: () => fetchUser(uid),
    staleTime: 5 * 60_000,
  })

  const { data: mutual = false } = useQuery({
    queryKey: ['is-mutual', uid],
    queryFn: () => isMutual(uid),
    enabled: !!me && !isMe,
    staleTime: 30_000,
  })

  const { data: followers = 0 } = useFollowersCount('user', uid, !!profile)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
        <SkeletonCard lines={3} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <EmptyState
          title="Usuário não encontrado"
          description="Esse perfil pode ter sido removido ou o link está incorreto."
          action={{ label: 'Voltar ao feed', href: '/feed' }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <div className="mb-6 rounded-lg border border-border bg-paper p-6">
        <div className="flex items-start gap-4">
          <Avatar
            nome={profile.nome}
            src={profile.foto_perfil ?? profile.foto_url ?? undefined}
            size={72}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold">{profile.nome}</h1>
              {profile.is_verified && (
                <BadgeCheck
                  className="h-5 w-5 shrink-0 text-selinka-blue"
                  aria-label="Verificado"
                />
              )}
            </div>
            <p className="text-sm text-ink/60">{TIPO_LABEL[profile.tipo_usuario]}</p>
            {profile.campus && <p className="text-sm text-ink/50">{profile.campus}</p>}
            {mutual && (
              <p className="mt-1 inline-flex items-center gap-1 rounded-sm bg-[var(--color-mint-15)] px-2 py-0.5 text-xs text-[var(--color-fg-2)]">
                Vocês se seguem mutuamente
              </p>
            )}
          </div>

          {!isMe && me && (
            <div className="flex flex-col items-end gap-2">
              <FollowButton type="user" id={uid} size="sm" />
              <LikeButton type="user" id={uid} size="sm" showCount={false} />
              <MessageCTA targetUid={uid} mutual={mutual} />
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{profile.bio}</p>
        )}

        <div className="mt-4 flex gap-6 border-t border-border pt-4 text-sm">
          <div className="text-ink/70">
            <strong className="text-ink tabular-nums">{followers}</strong> seguidores
          </div>
        </div>
      </div>

      <h2 className="mb-3 font-display font-semibold text-ink/70">Publicações</h2>
      <FeedTimeline userUid={uid} emptyText="Nenhuma publicação ainda." />
    </div>
  )
}

function MessageCTA({ targetUid, mutual }: { targetUid: string; mutual: boolean }) {
  if (!mutual) {
    return (
      <span
        className="inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 text-xs text-[var(--color-fg-3)]"
        title="Disponível após follow mútuo"
      >
        <MessageCircle className="h-4 w-4" />
        Mensagem
      </span>
    )
  }
  return (
    <Link
      href={`/mensagens?novo=1&para=${targetUid}`}
      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90"
    >
      <MessageCircle className="h-4 w-4" />
      Mensagem
    </Link>
  )
}
