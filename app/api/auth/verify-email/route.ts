import { NextResponse } from 'next/server'
import { z } from 'zod'
import { backendFetch } from '@/lib/auth/backend'

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export async function POST(request: Request) {
  let parsed
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ detail: 'Código inválido.' }, { status: 400 })
  }

  const qs = new URLSearchParams({ email: parsed.email, code: parsed.code })
  const backendRes = await backendFetch(`/api/v1/verification/verify-code?${qs}`, {
    method: 'POST',
  })
  const data = await backendRes.json().catch(() => ({}))
  if (!backendRes.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? 'Falha ao verificar.' },
      { status: backendRes.status },
    )
  }
  return NextResponse.json({ ok: true })
}
