import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/auth/backend'

export async function GET() {
  try {
    const res = await backendFetch('/api/v1/dashboard/public')
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  } catch {
    return NextResponse.json({ detail: 'Erro ao buscar dados públicos.' }, { status: 502 })
  }
}
