'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  follow as apiFollow,
  unfollow as apiUnfollow,
  isFollowing as apiIsFollowing,
  getFollowersCount,
  type FollowTargetType,
} from '@/lib/api/follow'
import { toastApiError } from '@/lib/toast'

export function followKeys(type: FollowTargetType, id: string) {
  return {
    isFollowing: ['follow', 'is-following', type, id] as const,
    count: ['follow', 'count', type, id] as const,
  }
}

export function useIsFollowing(type: FollowTargetType, id: string, enabled = true) {
  return useQuery({
    queryKey: followKeys(type, id).isFollowing,
    queryFn: () => apiIsFollowing(type, id),
    enabled: enabled && !!id,
    staleTime: 30_000,
  })
}

export function useFollowersCount(type: FollowTargetType, id: string, enabled = true) {
  return useQuery({
    queryKey: followKeys(type, id).count,
    queryFn: () => getFollowersCount(type, id),
    enabled: enabled && !!id,
    staleTime: 30_000,
  })
}

export function useFollow(type: FollowTargetType, id: string) {
  const qc = useQueryClient()
  const keys = followKeys(type, id)

  return useMutation({
    mutationFn: async (currentlyFollowing: boolean) => {
      if (currentlyFollowing) await apiUnfollow(type, id)
      else await apiFollow(type, id)
      return !currentlyFollowing
    },
    onMutate: async (currentlyFollowing) => {
      await qc.cancelQueries({ queryKey: keys.isFollowing })
      await qc.cancelQueries({ queryKey: keys.count })
      const prev = qc.getQueryData<boolean>(keys.isFollowing)
      const prevCount = qc.getQueryData<number>(keys.count)
      qc.setQueryData(keys.isFollowing, !currentlyFollowing)
      if (typeof prevCount === 'number') {
        qc.setQueryData(keys.count, prevCount + (currentlyFollowing ? -1 : 1))
      }
      return { prev, prevCount }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(keys.isFollowing, ctx.prev)
      if (ctx?.prevCount !== undefined) qc.setQueryData(keys.count, ctx.prevCount)
      toastApiError(err, 'Não foi possível atualizar. Tente novamente.')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.isFollowing })
      qc.invalidateQueries({ queryKey: keys.count })
    },
  })
}
