export const BACKEND_URL =
  process.env.LINKA_API_URL ??
  process.env.NEXT_PUBLIC_LINKA_API_URL ??
  'http://localhost:8000'

export function backendUrl(path: string) {
  const base = BACKEND_URL.replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export async function backendFetch(
  path: string,
  init: RequestInit & { accessToken?: string } = {},
) {
  const { accessToken, headers, ...rest } = init
  const h = new Headers(headers)
  if (accessToken) h.set('Authorization', `Bearer ${accessToken}`)
  if (!h.has('Accept')) h.set('Accept', 'application/json')
  return fetch(backendUrl(path), { ...rest, headers: h, cache: 'no-store' })
}
