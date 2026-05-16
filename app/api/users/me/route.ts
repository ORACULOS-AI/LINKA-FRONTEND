import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/auth/backend'
import { ACCESS_COOKIE } from '@/lib/auth/cookies'

export async function PUT(request: Request) {
  const store = await cookies()
  const accessToken = store.get(ACCESS_COOKIE)?.value
  if (!accessToken) {
    return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 })
  }

  const payload = await request.json().catch(() => ({}))

  const backendRes = await backendFetch('/api/v1/users/', {
    method: 'PUT',
    accessToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: payload }),
  })
  const data = await backendRes.json().catch(() => ({}))
  if (!backendRes.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? 'Falha ao atualizar perfil.' },
      { status: backendRes.status },
    )
  }
  return NextResponse.json(data)
}
