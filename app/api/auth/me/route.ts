import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/auth/backend'
import { ACCESS_COOKIE } from '@/lib/auth/cookies'

export async function GET() {
  const store = await cookies()
  const accessToken = store.get(ACCESS_COOKIE)?.value
  if (!accessToken) {
    return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 })
  }

  const backendRes = await backendFetch('/api/v1/users/me', { accessToken })
  const body = await backendRes.json().catch(() => ({}))
  if (!backendRes.ok) {
    return NextResponse.json(
      { detail: body?.detail ?? 'Falha ao buscar perfil.' },
      { status: backendRes.status },
    )
  }
  // Backend wraps in { data: {...} }; normalize fields for the frontend Me type
  const u = body?.data ?? body
  return NextResponse.json({
    id: u.uid,
    nome: u.nome,
    email: u.email,
    tipo: u.tipo_usuario,
    avatar_url: u.foto_perfil ?? null,
    verificado: u.is_verified ?? false,
    onboarding_complete: u.onboarding_complete ?? false,
    is_admin: u.is_admin ?? false,
  })
}
