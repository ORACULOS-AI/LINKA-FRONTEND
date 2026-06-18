import { NextResponse } from 'next/server'
import { z } from 'zod'
import { backendFetch } from '@/lib/auth/backend'
import { setAuthCookies } from '@/lib/auth/cookies'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember_me: z.boolean().optional().default(true),
})

export async function POST(request: Request) {
  let parsed
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ detail: 'Dados inválidos.' }, { status: 400 })
  }

  const form = new URLSearchParams()
  form.set('username', parsed.email)
  form.set('password', parsed.password)
  form.set('grant_type', 'password')
  form.set('scope', 'any')

  const backendRes = await backendFetch('/api/v1/auth/login', {
    method: 'POST',
    body: form,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const data = await backendRes.json().catch(() => ({}))
  if (!backendRes.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? 'Falha na autenticação.' },
      { status: backendRes.status },
    )
  }

  // Backend wraps responses in { data: { ... } }
  const payload = data?.data ?? data
  const accessToken = payload?.access_token
  const refreshToken = payload?.refresh_token
  if (!accessToken || !refreshToken) {
    return NextResponse.json({ detail: 'Resposta inválida do servidor.' }, { status: 502 })
  }

  const res = NextResponse.json({
    user_uid: payload.user_uid ?? null,
    user_type: payload.user_type ?? null,
    is_admin: payload.is_admin ?? false,
  })
  setAuthCookies(res, { accessToken, refreshToken, rememberMe: parsed.remember_me })
  return res
}
