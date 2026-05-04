# CLAUDE.md — LINKA-FRONT-END

Repositório do frontend da plataforma **SeLinka** (ex-Linka), rede de inovação da UFC.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilo**: Tailwind CSS + shadcn/ui
- **Estado**: React hooks + Context (sem Redux)
- **HTTP**: fetch nativo com helpers em `lib/api/`
- **Deploy**: Docker + Nginx na Prointer via self-hosted runner `frontend-runner`
- **CI/CD**: GitHub Actions → eslint + tsc no CI, deploy automático no push para main

## Estrutura

```
app/                    # Next.js App Router (cada pasta = rota)
  login/
  cadastro/
  negocios/
  laboratorios/
  iniciativas/
  eventos/
  rede/
  feed/
  admin/
components/             # Componentes reutilizáveis
  ui/                   # shadcn/ui base components
lib/
  api/                  # Funções de chamada à API (auth, users, business…)
  utils.ts
public/
```

## Convenção de branches e commits

```
feature/SLK-XX-descricao-curta   ← nova tela ou funcionalidade
fix/SLK-XX-descricao             ← correção de bug
ci/SLK-XX-descricao              ← CI/CD
refactor/SLK-XX-descricao        ← refatoração sem mudança de comportamento
```

Formato de commit:
```
[SLK-XX] tipo: descrição curta em português

- detalhe 1
- detalhe 2
```

Tipos: `feat`, `fix`, `ci`, `docs`, `refactor`, `chore`.

Todo PR vai para `main`.

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local   # preencher NEXT_PUBLIC_API_URL
npm run dev                        # http://localhost:3000
```

Checagens:
```bash
npm run lint      # eslint
npx tsc --noEmit  # type check
npm run build     # build de produção
```

## Variáveis de ambiente

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Jira

Projeto: **SLK** — mesmo projeto do backend.
Fluxo de status: Tarefas pendentes → Em andamento → EM VALIDAÇÃO → (Ícaro) Concluído.
