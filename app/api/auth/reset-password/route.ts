import { NextResponse } from 'next/server'
import { z } from 'zod'
import { backendFetch } from '@/lib/auth/backend'

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  new_password: z.string().min(8),
})

export async function POST(request: Request) {
  let parsed
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ detail: 'Dados inválidos.' }, { status: 400 })
  }
  const backendRes = await backendFetch('/api/v1/verification/password-reset/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  })
  const data = await backendRes.json().catch(() => ({}))
  if (!backendRes.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? 'Falha ao redefinir senha.' },
      { status: backendRes.status },
    )
  }
  return NextResponse.json({ ok: true })
}
