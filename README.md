# LINKA-FRONT-END

Frontend da plataforma **SeLinka** (rede de inovação da UFC).

## Stack

| Camada | Ferramenta |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript (strict + `noUncheckedIndexedAccess`) |
| Estilo | Tailwind CSS + tokens do Design System (`styles/design-tokens.css`) |
| UI base | shadcn/ui (Radix + Tailwind) adaptado aos tokens |
| Estado server | TanStack Query v5 |
| Estado client | Zustand |
| HTTP | axios (com refresh interceptor) |
| WebSocket | `lib/ws/useWS.ts` (native WS + backoff exponencial) |
| Forms | react-hook-form + Zod |
| Tipos API | openapi-typescript (gerado de `/openapi.json`) |
| Observabilidade | @sentry/nextjs + Web Vitals |
| Testes | Vitest + Testing Library + Playwright |

## Rodando

```bash
nvm use 22
npm install
cp .env.example .env.local
npm run dev
```

Checagens:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Gerar tipos a partir do backend:

```bash
LINKA_API_OPENAPI_URL=http://localhost:8000/openapi.json npm run gen:types
```

## Variáveis de ambiente

Ver `.env.example`. Principais:

- `NEXT_PUBLIC_LINKA_API_URL` — endpoint HTTP do backend
- `NEXT_PUBLIC_LINKA_WS_URL` — endpoint WebSocket
- `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_*` — opcionais em dev

## Estrutura

```
app/                       # Next App Router
  (auth)/entrar/           # tela pública
  (app)/                   # rotas autenticadas (shell + smoke)
components/
  shell/                   # TopNav, Sidebar, MobileTabBar
  ErrorBoundary.tsx
lib/
  api/                     # axios client + tipos gerados
  query/                   # QueryClient + Providers
  stores/                  # Zustand
  ws/                      # hook useWS
styles/                    # design tokens
public/selinka/            # grafismos, logo, patterns
```

## Branches e commits

```
feature/SLK-XX-...   fix/SLK-XX-...   refactor/SLK-XX-...   ci/SLK-XX-...
```

Commits: `[SLK-XX] tipo: descrição` (`feat|fix|ci|docs|refactor|chore`).

PRs vão para `develop`. `main` é deploy.

## Jira

Projeto **SLK**. Fluxo: `Tarefas pendentes → Em andamento → EM VALIDAÇÃO → (Ícaro) Concluído`. Comentário obrigatório em toda transição.
