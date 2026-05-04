import { NextRequest, NextResponse } from 'next/server';

// O endereço do backend, acessível apenas de dentro da rede Docker.
const BACKEND_URL = process.env.INTERNAL_API_URL || 'http://backend:8000';

export async function handler(req: NextRequest) {
  // Remove o prefixo /api/v1 do caminho da requisição original
  const originalPath = req.nextUrl.pathname;
  const pathWithoutApiPrefix = originalPath.startsWith('/api/v1')
    ? originalPath.substring('/api/v1'.length)
    : originalPath;

  const url = new URL(pathWithoutApiPrefix, BACKEND_URL);

  // Copia os parâmetros de busca da requisição original
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  try {
    // Cria novos headers, encaminhando apenas os necessários.
    const headersToForward = new Headers();

    // Encaminha o Content-Type original da requisição.
    const contentType = req.headers.get('Content-Type');
    if (contentType) {
      headersToForward.set('Content-Type', contentType);
    }

    // Encaminha o token de autorização, se existir.
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      headersToForward.set('Authorization', authHeader);
    }

    const response = await fetch(url.toString(), {
      method: req.method,
      headers: headersToForward,
      body:
        req.method !== 'GET' && req.method !== 'HEAD' ? (req as any).body : undefined,
      cache: 'no-store',
      // Necessário pelo Edge runtime quando há body
      duplex: 'half',
    } as RequestInit);

    return response;
  } catch (error) {
    console.error('Erro ao fazer proxy da requisição:', error);
    return new NextResponse('Proxy error', { status: 500 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH }; 