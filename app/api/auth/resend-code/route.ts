import { NextResponse } from 'next/server'
import { z } from 'zod'
import { backendFetch } from '@/lib/auth/backend'

const bodySchema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  let parsed
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ detail: 'E-mail inválido.' }, { status: 400 })
  }
  const qs = new URLSearchParams({ email: parsed.email })
  const backendRes = await backendFetch(`/api/v1/verification/send-code?${qs}`, {
    method: 'POST',
  })
  const data = await backendRes.json().catch(() => ({}))
  if (!backendRes.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? 'Falha ao reenviar código.' },
      { status: backendRes.status },
    )
  }
  return NextResponse.json({ ok: true })
}
