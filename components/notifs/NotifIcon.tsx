import {
  Heart, MessageCircle, AtSign, BadgeCheck, UserCheck, Calendar,
  Lightbulb, ShieldAlert, Share2, Bell,
} from 'lucide-react'

export const NOTIF_ICON: Record<string, typeof Heart> = {
  POST_REACTION: Heart,
  POST_COMMENT: MessageCircle,
  SHARE_CREATED: Share2,
  POST_MENTION: AtSign,
  CONNECTION_REQUEST: UserCheck,
  CONNECTION_ACCEPTED: UserCheck,
  CLAIM_APPROVED: BadgeCheck,
  CLAIM_REJECTED: BadgeCheck,
  EVENT_REMINDER: Calendar,
  INICIATIVA_PARTICIPATION: Lightbulb,
  INICIATIVA_APPROVED: Lightbulb,
  INICIATIVA_REJECTED: Lightbulb,
  ADMIN_ALERT: ShieldAlert,
  THREAD_MESSAGE: MessageCircle,
}

export const NOTIF_COLOR: Record<string, string> = {
  POST_REACTION: 'text-purple',
  POST_COMMENT: 'text-selinka-blue',
  SHARE_CREATED: 'text-mint',
  POST_MENTION: 'text-purple',
  CONNECTION_REQUEST: 'text-mint',
  CONNECTION_ACCEPTED: 'text-mint',
  CLAIM_APPROVED: 'text-mint',
  CLAIM_REJECTED: 'text-orange',
  EVENT_REMINDER: 'text-orange',
  INICIATIVA_PARTICIPATION: 'text-mint',
  INICIATIVA_APPROVED: 'text-mint',
  INICIATIVA_REJECTED: 'text-orange',
  ADMIN_ALERT: 'text-orange',
  THREAD_MESSAGE: 'text-selinka-blue',
}

export function iconFor(tipo: string) {
  return NOTIF_ICON[tipo] ?? Bell
}

export function colorFor(tipo: string) {
  return NOTIF_COLOR[tipo] ?? 'text-ink/70'
}
