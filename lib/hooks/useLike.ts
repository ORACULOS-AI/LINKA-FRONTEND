'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  like as apiLike,
  unlike as apiUnlike,
  hasLiked as apiHasLiked,
  getLikesCount,
  type LikeTargetType,
} from '@/lib/api/like'
import { toastApiError } from '@/lib/toast'

export function likeKeys(type: LikeTargetType, id: string) {
  return {
    has: ['like', 'has', type, id] as const,
    count: ['like', 'count', type, id] as const,
  }
}

export function useHasLiked(type: LikeTargetType, id: string, enabled = true) {
  return useQuery({
    queryKey: likeKeys(type, id).has,
    queryFn: () => apiHasLiked(type, id),
    enabled: enabled && !!id,
    staleTime: 30_000,
  })
}

export function useLikesCount(type: LikeTargetType, id: string, enabled = true) {
  return useQuery({
    queryKey: likeKeys(type, id).count,
    queryFn: () => getLikesCount(type, id),
    enabled: enabled && !!id,
    staleTime: 30_000,
  })
}

export function useLike(type: LikeTargetType, id: string) {
  const qc = useQueryClient()
  const keys = likeKeys(type, id)

  return useMutation({
    mutationFn: async (currentlyLiked: boolean) => {
      if (currentlyLiked) await apiUnlike(type, id)
      else await apiLike(type, id)
      return !currentlyLiked
    },
    onMutate: async (currentlyLiked) => {
      await qc.cancelQueries({ queryKey: keys.has })
      await qc.cancelQueries({ queryKey: keys.count })
      const prev = qc.getQueryData<boolean>(keys.has)
      const prevCount = qc.getQueryData<number>(keys.count)
      qc.setQueryData(keys.has, !currentlyLiked)
      if (typeof prevCount === 'number') {
        qc.setQueryData(keys.count, prevCount + (currentlyLiked ? -1 : 1))
      }
      return { prev, prevCount }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(keys.has, ctx.prev)
      if (ctx?.prevCount !== undefined) qc.setQueryData(keys.count, ctx.prevCount)
      toastApiError(err, 'Não foi possível curtir. Tente novamente.')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.has })
      qc.invalidateQueries({ queryKey: keys.count })
    },
  })
}
