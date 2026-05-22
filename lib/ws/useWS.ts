'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import { useConfigStore } from '@/lib/stores/config'
import { applyTenantTheme } from '@/lib/theme/apply'

/**
 * Eventos consumidos pelo cliente. O backend emite via pubsub
 * em canais `user:{uid}`, `feed:{uid}`, `broadcast`.
 * Handoff D §4.1 — eventos esperados.
 */
type WSMessage =
  | { type: 'notification.new'; payload: { id: string; tipo: string; titulo?: string; mensagem?: string } }
  | { type: 'message.new'; payload: { thread_id: string; message_id: string } }
  | { type: 'message.read'; payload: { thread_id: string; user_uid: string } }
  | { type: 'presence.online'; payload: { user_uid: string } }
  | { type: 'presence.offline'; payload: { user_uid: string } }
  | { type: 'presence.typing'; payload: { thread_id: string; user_uid: string } }
  | { type: 'feed.new_post'; payload: { post_id: string; autor_uid: string } }
  | { type: 'meeting.invited'; payload: { meeting_id: string } }
  | { type: 'meeting.updated'; payload: { meeting_id: string; status?: string } }
  | { type: 'like.added' | 'like.removed'; payload: { target_type: string; target_id: string; count?: number } }
  | { type: 'follow.added'; payload: { follower_uid: string; target_type: string; target_id: string } }
  | { type: 'config.updated'; payload: { tenant_id?: string } }
  // legacy fallthrough
  | { type: string; payload?: unknown }

const WS_URL =
  process.env.NEXT_PUBLIC_LINKA_WS_URL ?? 'ws://localhost:8000/api/v1/ws'

const MAX_BACKOFF_MS = 30_000

async function fetchWsToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/ws-ticket', { credentials: 'same-origin' })
    if (!res.ok) return null
    const data = (await res.json()) as { token?: string }
    return data.token ?? null
  } catch {
    return null
  }
}

export type WSStatus = 'idle' | 'connecting' | 'open' | 'closed'

export function useWS(enabled: boolean = true) {
  const [status, setStatus] = useState<WSStatus>('idle')
  const queryClient = useQueryClient()
  const setConfig = useConfigStore((s) => s.setConfig)
  const wsRef = useRef<WebSocket | null>(null)
  const attemptRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closedByUserRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    closedByUserRef.current = false

    const connect = async () => {
      setStatus('connecting')
      const token = await fetchWsToken()
      if (!token) {
        // sem token → não tenta conectar agora; aguarda próximo ciclo
        setStatus('closed')
        return
      }
      const sep = WS_URL.includes('?') ? '&' : '?'
      const ws = new WebSocket(`${WS_URL}${sep}token=${encodeURIComponent(token)}`)
      wsRef.current = ws

      ws.onopen = () => {
        attemptRef.current = 0
        setStatus('open')
      }

      ws.onmessage = (event) => {
        let msg: WSMessage
        try {
          msg = JSON.parse(event.data) as WSMessage
        } catch {
          return
        }

        switch (msg.type) {
          case 'notification.new':
          case 'notification': {
            const p = msg.payload as { titulo?: string; mensagem?: string } | undefined
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notif-unread'] })
            queryClient.invalidateQueries({ queryKey: ['unread-count'] })
            if (p?.titulo || p?.mensagem) {
              toast.info(p.titulo ?? p.mensagem ?? 'Nova notificação')
            }
            break
          }
          case 'message.new':
          case 'thread.message':
          case 'NOVA_MENSAGEM': {
            const p = (msg.payload ?? {}) as { thread_id?: string }
            queryClient.invalidateQueries({ queryKey: ['threads'] })
            queryClient.invalidateQueries({ queryKey: ['notif-unread'] })
            queryClient.invalidateQueries({ queryKey: ['unread-count'] })
            if (p?.thread_id) {
              queryClient.invalidateQueries({ queryKey: ['messages', p.thread_id] })
              queryClient.invalidateQueries({ queryKey: ['thread', p.thread_id, 'messages'] })
            }
            break
          }
          case 'message.read':
          case 'READ_RECEIPT': {
            const p = (msg.payload ?? {}) as { thread_id?: string }
            if (p?.thread_id) {
              queryClient.invalidateQueries({ queryKey: ['messages', p.thread_id] })
              queryClient.invalidateQueries({ queryKey: ['thread', p.thread_id, 'messages'] })
            }
            break
          }
          case 'NOVA_CONVERSA': {
            queryClient.invalidateQueries({ queryKey: ['threads'] })
            queryClient.invalidateQueries({ queryKey: ['notif-unread'] })
            break
          }
          case 'presence.online':
          case 'presence.offline': {
            const p = msg.payload as { user_uid?: string; nome?: string } | undefined
            if (p?.user_uid) {
              const wasOnline = queryClient.getQueryData<boolean>(['presence', p.user_uid])
              const isOnline = msg.type === 'presence.online'
              queryClient.setQueryData(['presence', p.user_uid], isOnline)
              // Mostra toast só na transição offline→online (evita repetir em reconexões)
              if (isOnline && !wasOnline) {
                // Verifica se é conexão mútua antes de notificar
                const mutual = queryClient.getQueryData<boolean>(['is-mutual', p.user_uid])
                if (mutual) {
                  const nome = p.nome ?? 'Uma conexão sua'
                  toast.info(`${nome} está online agora`)
                }
              }
            }
            break
          }
          case 'presence.typing': {
            const p = msg.payload as { thread_id?: string; user_uid?: string } | undefined
            if (p?.thread_id) {
              queryClient.setQueryData(['typing', p.thread_id], p.user_uid)
              setTimeout(() => {
                queryClient.setQueryData(['typing', p.thread_id], null)
              }, 4_000)
            }
            break
          }
          case 'feed.new_post':
          case 'feed.update':
          case 'POST_CREATED':
          case 'POST_DELETED': {
            queryClient.setQueryData(['feed', 'new-badge'], (prev: number = 0) => prev + 1)
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            break
          }
          case 'meeting.invited':
          case 'meeting.updated': {
            queryClient.invalidateQueries({ queryKey: ['meetings'] })
            if (msg.type === 'meeting.invited') {
              toast.info('Você foi convidado para uma reunião')
            }
            break
          }
          case 'like.added':
          case 'like.removed': {
            const p = msg.payload as { target_type?: string; target_id?: string } | undefined
            if (p?.target_type && p.target_id) {
              queryClient.invalidateQueries({
                queryKey: ['like', 'count', p.target_type, p.target_id],
              })
            }
            break
          }
          case 'follow.added': {
            const p = msg.payload as { target_type?: string; target_id?: string } | undefined
            if (p?.target_type && p.target_id) {
              queryClient.invalidateQueries({
                queryKey: ['follow', 'count', p.target_type, p.target_id],
              })
            }
            break
          }
          case 'config.updated': {
            queryClient.invalidateQueries({ queryKey: ['config'] }).then(() => {
              const cfg = queryClient.getQueryData<{ tenant: Parameters<typeof applyTenantTheme>[0] }>(
                ['config'],
              )
              if (cfg) {
                setConfig(cfg as Parameters<typeof setConfig>[0])
                applyTenantTheme(cfg.tenant)
              }
            })
            break
          }
        }
      }

      ws.onclose = () => {
        setStatus('closed')
        if (closedByUserRef.current) return
        const attempt = attemptRef.current + 1
        attemptRef.current = attempt
        const backoff = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** (attempt - 1))
        const jitter = Math.random() * 250
        timerRef.current = setTimeout(() => { void connect() }, backoff + jitter)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    void connect()

    return () => {
      closedByUserRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [enabled, queryClient, setConfig])

  return { status }
}
