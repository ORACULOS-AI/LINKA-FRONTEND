# Guia de Integração Backend → Frontend (SeLinka)

> **Status:** Fonte da verdade. Verificado endpoint a endpoint contra o código real do
> `linka_backend` (routers em `app/api/endpoints/`, registro em `app/main.py`).
> Tratar como guia **do zero, a ser seguido de forma restrita** — onde `lib/api/*.ts`
> divergir disto, o backend é a referência.
>
> **Convenção de nomenclatura:** `iniciativa` = **projeto**. O backend monta sob
> `/api/v1/initiatives` (tags `projetos`), mas conceitualmente é sempre "projeto".

---

## 0. Fundamentos (valem para TODA chamada)

### 0.1 Base URL e prefixo
- Todos os endpoints estão sob **`/api/v1`** (`settings.API_V1_STR`).
- Exceção de forma (não de prefixo): `GET /api/v1/config` declara o caminho completo no próprio endpoint.

### 0.2 Envelope de resposta
**Sucesso (item único)** — `app/schemas/response.py`:
```json
{ "message": "string", "data": { ... } | [ ... ] | true | null, "status_code": 200 }
```
**Sucesso (lista paginada)** — `PaginatedResponse[T]`:
```json
{ "items": [ ... ], "next_cursor": "string|null", "has_more": false, "total": null }
```
> **Nunca** assuma `T` cru. Sempre desembrulhe `data` (ou `items`).
> Exceções que retornam **dict cru** (sem envelope): `GET /api/v1/config`,
> e os endpoints de **admin/enums** (`/api/v1/admin/enums...`) que retornam `{ "ok": true, ... }`.

### 0.3 Paginação — dois modelos coexistem
| Modelo | Quem usa | Mecânica |
|---|---|---|
| **Cursor** (`next_cursor` opaco = Base64 de `created_at`) | feed, listagens de negócios/projetos/eventos/labs, notificações, threads, mensagens, meetings | mande `?cursor=<next_cursor>&limit=` |
| **Offset** | `showcase/*` (next_cursor = string do próximo offset) e `search` (`offset`/`next_offset`) | mande `?offset=&limit=` |

`limit` default 20, máx 100 (50 no search). 

### 0.4 Autenticação
- **JWT Bearer** (`Authorization: Bearer <access_token>`), HS256.
- Access token **30 min**; refresh **7 dias**. Rotação de JTI + blacklist no Redis.
- **Login:** `POST /api/v1/auth/login` com **OAuth2 form-urlencoded** (`username`=email, `password`). **Não** é JSON.
- **Cadastro NÃO é `/auth/register`** (esse endpoint não existe). Use **`POST /api/v1/users`**.
- Resposta de login (`data`): `{ access_token, refresh_token, token_type:"bearer", user_type, user_uid, is_admin }`.

### 0.5 Erros
- Forma padrão FastAPI: `{ "detail": "..." }` (string) ou `{ "detail": { ... } }` (dict).
- **Enum inválido** (validação dinâmica): `400` → `{ "detail": { "code":"INVALID_ENUM", "enum_key":"...", "value":"..." } }`.
- **Host inválido** (criação de projeto): `400` → `{ "detail": { "code":"INVALID_HOST_TYPE", "value":"..." } }`.
- **Duplicado** (enum create): `409` → `{ "detail": { "code":"DUPLICATE", ... } }`.
- Status usados: `200, 201, 204, 400, 401, 403, 404, 409, 410 (Gone — rotas legadas), 429`.
- `429` traz `Retry-After`. Rate-limit global: 100/min, 1000/h por IP + limites por-endpoint (anotados abaixo).

### 0.6 Permissões (RBAC)
- `check_permissions([...])` exige TODAS as permissões listadas. `is_admin=true` **fura** qualquer checagem (sempre buscado fresco do DB, nunca cacheado).
- Permissões variam por `tipo_usuario` (`estudante|pesquisador|tecnico_admin|externo`). Exemplos relevantes: `view_content`, `manage_own_content`, `create_business`, `manage_businesses`, `create_event`, `manage_events`, `participate_event`, `create_thread`, `manage_initiatives`, `manage_users` (admin), `create_laboratory`/`manage_laboratorios` (pesquisador/tecnico).
- **Laboratórios**: criar/editar exige `is_admin` **ou** `tipo_usuario == "pesquisador"` (regra `check_pesquisador_or_admin`).

### 0.7 CORS / Hosts
- Origens: `https://selinka.ufc.br`, `http://localhost:3000`, `http://localhost:3001`.
- **`selinka.ufc.br` é o único domínio válido.** `linka.ufc.br` está DEPRECATED — não referenciar.
- TrustedHost inclui service names internos do Docker (o BFF do Next chama o backend por service name).

### 0.8 Validação dinâmica de enums (white-label)
- Campos como `event_categoria`, `iniciativa_tipo`, `tipo_post`, `negocio_categoria` são validados contra a tabela `enum_values`.
- Frontend deve **hidratar opções no boot** via `GET /api/v1/config` (retorna `{ tenant, enums }`) — **não hard-codar** listas.

---

## 1. AUTH — `/api/v1/auth`

| Método | Caminho | Auth | Corpo / Notas |
|---|---|---|---|
| POST | `/auth/login` | público | **form** `username`(email)+`password`. 5/min. → tokens. `401` credenciais, `403` email não verificado. |
| POST | `/auth/refresh` | refresh token no header | sem corpo. Rotaciona JTI, revoga sessão antiga. |
| POST | `/auth/logout` | access token | sem corpo. Blacklista token+JTI. |

---

## 2. USERS — `/api/v1/users`

| Método | Caminho | Auth | Notas |
|---|---|---|---|
| GET | `/users/me` | auth (`view_content`) | perfil completo. 15/min. |
| GET | `/users/all` | `manage_users` | todos. |
| GET | `/users/by-tipo/{tipo}` | `manage_users` | filtra por tipo. |
| GET | `/users/search` | `view_content` | query: `q, tipo_usuario, campus, area, limit, cursor`. **Paginado (cursor).** |
| GET | `/users/suggestions` | `view_content` | ~20 sugestões (cache 1h). |
| GET | `/users/stats` | `manage_users` | stats admin. |
| GET | `/users/{user_uid}` | `view_content` | perfil público. |
| POST | `/users` | **público** | **cadastro.** Corpo `{ user: {...} }` (ver 2.1). `409` email já existe. Envia email de verificação. |
| PUT | `/users` | `manage_own_content` | atualiza próprio perfil (campos opcionais). 3/min. |
| DELETE | `/users/{user_uid}` | `manage_users` | remove (cascade). |
| PATCH | `/users/{user_uid}/verify` | **admin** | corpo `{ is_verified: bool }`. |
| PATCH | `/users/{user_uid}/admin` | **admin** | corpo `{ is_admin: bool }`. Gera audit log. |
| POST | `/users/profile-image` | `manage_own_content` | **multipart** `file`. Máx 5MB, JPEG/PNG/WebP. → `{ foto_perfil: url }`. |
| DELETE | `/users/profile-image` | `manage_own_content` | remove foto. |
| POST | `/users/change-password` | `manage_own_content` | `{ old_password, new_password }`. Política: 8+ chars, 1 maiúscula, 1 número, 1 especial. |

### 2.1 Corpo de cadastro (`POST /users`)
`{ "user": { tipo_usuario, nome(2-100), email(domínio validado por tipo), senha(política forte), telefone?, ...campos por tipo } }`
- **estudante:** `curso, matricula, campus`
- **pesquisador:** `lattes, siape, campus, palavras_chave`
- **tecnico_admin:** `setor, cargo, siape, campus, telefone_ramal`
- **externo:** `empresa, cargo`
> `campus`/`curso` validados contra `enum_values` → `400 INVALID_ENUM` se inválido.

### 2.2 Modelo User (campos no GET)
`uid, nome, email, tipo_usuario, is_admin, is_verified, onboarding_complete, telefone, foto_perfil, campus, lattes, siape, palavras_chave, redes_sociais, curso, matricula, setor, cargo, telefone_ramal, empresa, publicacoes_count, followers_count, following_count, likes_count, comments_count, data_cadastro, created_at`.

---

## 3. VERIFICATION — `/api/v1/verification` (tudo público, 3/min)

| Método | Caminho | Corpo |
|---|---|---|
| POST | `/verification/send-code` | `{ email }` → código 6 dígitos, TTL 10min |
| POST | `/verification/verify-code` | `{ email, code }` → marca `is_verified=true` |
| POST | `/verification/password-reset/send-code` | `{ email }` (sempre 200, anti-enumeração) |
| POST | `/verification/password-reset/verify` | `{ email, code, new_password }` |

---

## 4. SESSIONS — `/api/v1/users/me/sessions`

| Método | Caminho | Notas |
|---|---|---|
| GET | `/users/me/sessions` | lista sessões ativas; cada uma: `{ id, device_label, ip_address, user_agent, created_at, last_used_at, is_current }`. |
| DELETE | `/users/me/sessions/{session_id}` | revoga uma sessão (blacklista refresh JTI). |
| DELETE | `/users/me/sessions` | revoga todas exceto a atual. |

## 5. PREFERENCES — `/api/v1/users/me/preferences`

| Método | Caminho | Notas |
|---|---|---|
| GET | `/users/me/preferences` | cria defaults se não existir. Campos: `notif_types_muted[], email_digest_optin, profile_public, searchable, sound_enabled, theme(light\|dark\|system), locale`. |
| PATCH | `/users/me/preferences` | atualização parcial. |

## 6. PRESENCE — `/api/v1/presence` (Redis, TTL 90s)

| Método | Caminho | Resposta |
|---|---|---|
| GET | `/presence/online` | `["uid", ...]` online agora |
| GET | `/presence?uids=u1,u2` | `{ u1: true, u2: false }` |
| GET | `/presence/{uid}` | `{ uid, online }` |

---

## 7. FEED & POSTS — `/api/v1/feed`

| Método | Caminho | Auth | Notas |
|---|---|---|---|
| GET | `/feed` | auth | timeline cronológica+ranqueada (seguidos + próprios). **Cursor.** Cache 30s. 60/min. |
| POST | `/feed/posts` | auth | criar post (ver 7.1). 201. 20/min + 30/min por-usuário. |
| GET | `/feed/posts/{post_id}` | auth | 404 se não visível. |
| PATCH | `/feed/posts/{post_id}` | autor | edição parcial. |
| DELETE | `/feed/posts/{post_id}` | autor | **soft-hide** (`visivel=false`), não apaga. |
| POST | `/feed/posts/{post_id}/comments` | auth | `{ conteudo(1-2000), parent_comment_id? }`. 201. Notifica autor. |
| GET | `/feed/posts/{post_id}/comments` | auth | `?limit=50`. Lista raízes (envelope `data:[]`, **não** paginado). |
| POST | `/feed/posts/{post_id}/shares` | auth | `{ comentario? }`. 201. Único por (post,user). |
| DELETE | `/feed/posts/{post_id}/shares` | auth | **sem** `user_uid` no path. |
| POST | `/feed/posts/{post_id}/bookmark` | auth | salva post. |
| DELETE | `/feed/posts/{post_id}/bookmark` | auth | |
| GET | `/feed/users/{user_uid}/posts` | auth | posts de um usuário (respeita visibilidade). **Cursor.** |
| GET | `/feed/bookmarks` | auth | `?limit=50`. Posts salvos (envelope `data:[]`). |

> **Reactions foram removidas (SLK-269 R3).** Curtir post = `POST /api/v1/like/post/{post_id}` (seção 9).

### 7.1 Corpo de post (`POST /feed/posts`)
`{ tipo, conteudo?(<=5000), midia?[{url,tipo:"image"|"video",legenda?}], ref_id?, ref_tipo?, visivel?(true), visibility: public|followers|private }`

**`tipo` = contexto de quem posta** (NÃO formato de mídia):
| Valor | Significado | `ref_id` | Quem pode |
|---|---|---|---|
| `PESSOAL` | Post pessoal do user | opcional | qualquer autenticado |
| `NEGOCIO` | Postando como negócio | **obrigatório** (ID do negócio) | uid_admin ou membro ACEITO |
| `LABORATORIO` | Postando como laboratório | **obrigatório** (uid do lab) | uid_admin ou pesquisador vinculado |
| `PROJETO` | Postando sobre um projeto | **obrigatório** (uid da iniciativa) | uid_owner ou participante ACEITO |
| `EVENTO` | Postando como evento | **obrigatório** (uid do evento) | uid_owner do evento |

- `ref_tipo` é **auto-derivado** do `tipo` (ex.: `NEGOCIO→"negocio"`). Não precisa enviar.
- Todo post pode ter **texto** (`conteudo`) + **mídia** (`midia[]`: imagens, vídeos) + **links** (no texto). Não existem mais os antigos `TEXT`/`IMAGE`/`LINK` — eram redundantes.
- `403` se o user não tem vínculo com a entidade. `400` se `ref_id` ausente em post não-pessoal.
- `tipo` validado contra `enum_values:tipo_post`.

### 7.2 Posts por entidade (vitrine)
`GET /api/v1/feed/entities/{target_type}/{target_id}/posts`
- `target_type ∈ negocio|laboratorio|iniciativa|evento`. `400` se inválido.
- **Público (sem auth).** Retorna apenas posts `visivel=true` + `visibility=public`.
- **Cursor-based.** Response: `PaginatedResponse[FeedPostResponse]`.
- Serve a aba "Publicações" na vitrine de cada entidade.

---

## 8. FOLLOW (polimórfico) — `/api/v1/follow`
`target_type ∈ {user, negocio, laboratorio, iniciativa, evento}` (**não** inclui `post`). **Path-based, sem corpo.**

| Método | Caminho | Notas |
|---|---|---|
| POST | `/follow/{target_type}/{target_id}` | seguir. → `{ follower_uid, target_type, target_id, created_at }`. 60/min. |
| DELETE | `/follow/{target_type}/{target_id}` | deixar de seguir. 404 se não seguia. |
| GET | `/follow/{target_type}/{target_id}/followers` | `[{ uid, nome, foto_perfil }]`. |
| GET | `/follow/{target_type}/{target_id}/count` | `{ followers_count }`. |
| GET | `/follow/{target_type}/{target_id}/is-following` | `{ following: bool }`. |
| GET | `/follow/me/following?target_type=` | `[{ target_type, target_id, created_at }]`. |
| GET | `/follow/mutual/{user_uid}` | `{ mutual_uids: [] }` (habilitados p/ DM). |
| GET | `/follow/is-mutual/{user_uid}` | `{ mutual: bool }`. |

## 9. LIKE (polimórfico) — `/api/v1/like`
`target_type ∈ {user, negocio, laboratorio, iniciativa, evento, post}`. **Path-based, sem corpo.** 120/min.

| Método | Caminho | Resposta |
|---|---|---|
| POST | `/like/{target_type}/{target_id}` | `{ user_uid, target_type, target_id, created_at }`. Idempotente. |
| DELETE | `/like/{target_type}/{target_id}` | 404 se não curtira. |
| GET | `/like/{target_type}/{target_id}/has` | `{ liked: bool }`. |
| GET | `/like/{target_type}/{target_id}/count` | `{ likes_count }`. |
| GET | `/like/{target_type}/{target_id}/likers` | `?limit=50` → `[{ uid, nome, foto_perfil }]`. |

## 10. COMMENTS (polimórfico) — `/api/v1/comments`
`target_type ∈ {user, negocio, laboratorio, iniciativa, evento, post}` (`post` delega ao feed).

| Método | Caminho | Corpo / Notas |
|---|---|---|
| POST | `/comments/{target_type}/{target_id}` | `{ conteudo, parent_comment_id? }`. 201. |
| GET | `/comments/{target_type}/{target_id}` | raízes + replies (1 nível). |
| PATCH | `/comments/{comment_id}` | `{ conteudo }`. Só autor. `editado=true`. |
| DELETE | `/comments/{comment_id}` | autor ou admin. |

Serialização do comentário: `{ id, target_type, target_id, autor_uid, conteudo, editado, parent_comment_id, created_at, replies:[] }`.

## 11. BOOKMARKS (polimórfico) — `/api/v1/bookmarks`
`target_type ∈ {user, negocio, laboratorio, iniciativa, evento, post}`.

| Método | Caminho | Notas |
|---|---|---|
| GET | `/bookmarks?target_type=` | lista salvos: `[{ target_type, target_id, created_at }]`. 60/min. |
| POST | `/bookmarks/{target_type}/{target_id}` | salvar. 120/min. |
| DELETE | `/bookmarks/{target_type}/{target_id}` | 404 se não salvo. |
| GET | `/bookmarks/{target_type}/{target_id}/has` | `{ has: bool }`. |

---

## 12. NEGÓCIOS — `/api/v1/business`

| Método | Caminho | Auth | Notas |
|---|---|---|---|
| GET | `/business/` | público | `?categoria&tipo_negocio&status&limit&cursor`. Público vê só `aprovado`+`visivel`. **Cursor.** |
| GET | `/business/me` | `view_content` | meus negócios. |
| GET | `/business/showcase` | público | só `aprovado`+`visivel`. **Cursor.** |
| GET | `/business/user/{user_id}` | `view_content` | negócios de um user. |
| GET | `/business/dashboard` | público | agregados. |
| GET | `/business/{business_id}` | público/opcional | matriz de visibilidade (dono/membro/admin veem tudo). |
| POST | `/business/` | `create_business` | cria `status=pendente, visivel=false`. |
| PUT | `/business/{business_id}` | dono/admin (`manage_own_content`) | não edita `uid_admin`. |
| DELETE | `/business/{business_id}` | dono/admin | |
| **PUT** | `/business/{business_id}/approve` | `manage_businesses` (admin) | `pendente→aprovado`. Notifica + email. |
| **PUT** | `/business/{business_id}/reject` | `manage_businesses` | `{ motivo_rejeicao? }`. `pendente→recusado`. |
| POST | `/business/{business_id}/publish` | dono | exige `aprovado`; `visivel=true`. `409` se não aprovado. |
| POST | `/business/{business_id}/unpublish` | dono | `visivel=false`. |
| PUT | `/business/{business_id}/fotos` | dono | **multipart** `foto_perfil?`, `foto_capa?`. |
| GET | `/business/admin/` | `manage_businesses` | agrupado por status. |
| PUT | `/business/admin/{business_id}/visibility` | `manage_businesses` | toggle visibilidade. |

**Membros** (sub-router):
| Método | Caminho | Notas |
|---|---|---|
| GET | `/business/{business_id}/members` | dono/membro/admin. `[{ user_uid, papel, status }]`. |
| POST | `/business/{business_id}/members` | dono. corpo `{ user_uid, papel?(MEMBRO) }`. |
| PUT | `/business/{business_id}/members/{member_uid}` | dono. corpo `{ status }`. |
| DELETE | `/business/{business_id}/members/{member_uid}` | dono ou auto-saída. |

> **Legado 410 Gone:** `/business/{id}/like` e `/business/{id}/comment` foram removidos → usar `/like/negocio/{id}` e `/comments/negocio/{id}`.

**Modelo Negócio (GET):** `id, nome, email, uid_admin, telefone, tipo_negocio, descricao, area_atuacao, estagio, palavras_chave, categoria, descricao_problema, solucao_proposta, status, visivel, claimed, foto_perfil, foto_capa, website, midias_sociais, cnpj, razao_social, cnae, modelo_negocio, diferencial, publico_alvo, metricas, campus, endereco, data_fundacao, likes_count, followers_count, comments_count, created_at, updated_at`.

### 12.1 Business Claims — montados em `/api/v1/business/...`
| Método | Caminho | Notas |
|---|---|---|
| POST | `/business/{negocio_id}/claim` | `{ justificativa }`. **Auto-aprova se email do user == email do negócio** (senão `403`). |
| GET | `/business/{negocio_id}/claim/status` | `{ has_claim, status?, claim_id?, created_at? }`. |
| GET | `/business/claims` | **admin** (`manage_users`). Lista pendentes. |
| POST | `/business/claims/{claim_id}/approve` | admin. |
| POST | `/business/claims/{claim_id}/reject` | admin. `{ justificativa_rejeicao }`. |

---

## 13. LABORATÓRIOS — `/api/v1/laboratorios`
> ⚠️ **Atenção à divergência de prefixo:** CRUD de lab é `/laboratorios`, mas **CLAIMS de lab usam `/labs`** (seção 13.1). São prefixos diferentes.

| Método | Caminho | Auth | Notas |
|---|---|---|---|
| GET | `/laboratorios/` | público | `?unidade&campus&tipo&visivel(true)&limit&cursor`. **Cursor.** |
| GET | `/laboratorios/stats` | público | stats globais. |
| GET | `/laboratorios/me` | pesquisador/admin | meus labs. |
| GET | `/laboratorios/admin/all` | `admin` | agrupado por status. |
| GET | `/laboratorios/{laboratorio_uid}` | público/opcional | só `visivel` p/ anônimo; dono/admin veem tudo. |
| POST | `/laboratorios/` | pesquisador/admin | cria `status=PENDENTE` implícito, `visivel=false`. |
| PUT | `/laboratorios/{laboratorio_uid}` | dono/admin | |
| DELETE | `/laboratorios/{laboratorio_uid}` | dono/admin | |
| **PUT** | `/laboratorios/{laboratorio_uid}/approve` | `admin` | `→APROVADO` (NÃO publica). |
| **PUT** | `/laboratorios/{laboratorio_uid}/reject` | `admin` | `→RECUSADO, visivel=false`. |
| POST | `/laboratorios/{laboratorio_uid}/publish` | dono | exige `APROVADO`; `visivel=true`. `409` caso contrário. |
| POST | `/laboratorios/{laboratorio_uid}/unpublish` | dono | |
| PUT | `/laboratorios/{laboratorio_uid}/fotos` | dono | **multipart** `foto_perfil?`, `foto_capa?`. |
| POST | `/laboratorios/{laboratorio_uid}/pesquisadores/{pesquisador_uid}` | dono/admin | adiciona pesquisador. |
| DELETE | `/laboratorios/{laboratorio_uid}/pesquisadores/{pesquisador_uid}` | dono/admin | remove. |

**Status do lab:** `PENDENTE → APROVADO | RECUSADO`. Visibilidade é eixo separado (`visivel`).
**Modelo Lab (GET):** `uid, nome, unidade, subunidade, responsavel, telefone, email, tipo, status, endereco, campus, sala, descricao, areas_pesquisa, equipamentos, website, redes_sociais, foto_perfil, foto_capa, documentos, uid_admin, visivel, claimed, likes_count, followers_count, comments_count, created_at, updated_at`.

### 13.1 Lab Claims — montados em `/api/v1/labs/...` (prefixo `/labs`, NÃO `/laboratorios`)
| Método | Caminho | Notas |
|---|---|---|
| POST | `/labs/{lab_uid}/claim` | `{ justificativa }`. **Auto-aprova se email do user == email do lab** (senão `403`). |
| GET | `/labs/{lab_uid}/claim/status` | `{ has_claim, status?, claim_id?, created_at? }`. |
| GET | `/labs/claims` | **admin**. Pendentes. |
| POST | `/labs/claims/{claim_id}/approve` | admin. |
| POST | `/labs/claims/{claim_id}/reject` | admin. `{ justificativa_rejeicao }`. |

---

## 14. PROJETOS (Iniciativas) — `/api/v1/initiatives`

| Método | Caminho | Auth | Notas |
|---|---|---|---|
| GET | `/initiatives/` | público/opcional | `?host_type&host_id&tipo&status&cursor&limit`. Anônimo vê só `visivel`. **Cursor.** |
| GET | `/initiatives/me` | auth | meus projetos. |
| GET | `/initiatives/host/{host_type}/{host_id}` | público | projetos por host. |
| GET | `/initiatives/user/{user_id}` | público | projetos de um user. |
| GET | `/initiatives/business/{business_id}` | público | legado (use host). |
| GET | `/initiatives/admin` | admin | agrupado por status. |
| GET | `/initiatives/{initiative_id}` | público/opcional | |
| POST | `/initiatives/` | auth | cria `status=PENDENTE, visivel=false`. Corpo ver 14.1. |
| PUT | `/initiatives/{initiative_id}` | dono/admin | |
| DELETE | `/initiatives/{initiative_id}` | dono/admin | |
| PUT | `/initiatives/{initiative_id}/fotos` | dono/admin | **multipart** `foto_perfil?`, `foto_capa?`. |
| POST | `/initiatives/{initiative_id}/publish` | dono | exige `ATIVA`; `visivel=true`. `409` caso contrário. |
| POST | `/initiatives/{initiative_id}/unpublish` | dono | |
| **PUT** | `/initiatives/{initiative_id}/approve` | `manage_initiatives` (admin) | `PENDENTE→ATIVA`. Notifica+email. |
| **PUT** | `/initiatives/{initiative_id}/reject` | `manage_initiatives` | `PENDENTE→RECUSADA`. |
| PUT | `/initiatives/{initiative_id}/status` | admin | `{ status }` direto. |

**Participantes diretos (dono adiciona/remove):**
| Método | Caminho | Notas |
|---|---|---|
| POST | `/initiatives/{initiative_id}/participantes/{user_uid}?papel=MEMBRO` | dono/admin adiciona. |
| DELETE | `/initiatives/{initiative_id}/participantes/{user_uid}` | dono/admin/auto. |

**Convites e solicitações (fluxo social):**
| Método | Caminho | Notas |
|---|---|---|
| POST | `/initiatives/{initiative_id}/invite/{user_id}/{papel}` | dono convida. `papel ∈ COORDENADOR\|MEMBRO\|COLABORADOR\|CONSULTOR`. `409` se já existe. Notifica+email. |
| POST | `/initiatives/{initiative_id}/accept-invite` | convidado aceita → `ACEITO`. |
| POST | `/initiatives/{initiative_id}/reject-invite` | convidado recusa → `RECUSADO`. |
| POST | `/initiatives/{initiative_id}/request-join` | user solicita entrada (`origem=SOLICITACAO`). |
| GET | `/initiatives/{initiative_id}/requests` | dono/admin lista pendentes. |
| POST | `/initiatives/{initiative_id}/requests/{user_id}/approve` | dono aprova → `ACEITO`. |
| POST | `/initiatives/{initiative_id}/requests/{user_id}/reject` | dono recusa. |
| POST | `/initiatives/{initiative_id}/leave` | participante sai (dono não pode). |
| DELETE | `/initiatives/{initiative_id}/remove-participant/{user_id}` | dono/admin remove. |

> **Legado 410 Gone:** `/initiatives/{id}/follow` removido → usar `/follow/iniciativa/{id}`.

### 14.1 Corpo de criação de projeto (`POST /initiatives/`)
`{ host_type: user|negocio|laboratorio, host_id, titulo, descricao, tipo, data_inicio?, data_fim?, ...campos opcionais }`.
- `host_type=user` → `host_id` deve ser o próprio `uid` (exceto admin).
- `host_type=negocio` → precisa ser dono/admin/membro-ADMIN do negócio.
- `host_type=laboratorio` → precisa ser admin ou pesquisador vinculado ao lab.
- `tipo` validado contra `enum_values:iniciativa_tipo`.

**Status do projeto:** `PENDENTE, ATIVA, PAUSADA, CONCLUIDA, CANCELADA, RECUSADA`.
**Vínculo de participante (`status_vinculo`):** `PENDENTE, ACEITO, RECUSADO`; `origem ∈ CONVITE|SOLICITACAO`.
**Modelo Projeto (GET, campos principais):** `uid, uid_owner, host_type, host_id, titulo, descricao, tipo, status, visivel, data_inicio, data_fim, nivel_maturidade, areas_conhecimento[], tecnologias_utilizadas[], ods_relacionados[], aceita_colaboradores, colaboracao_internacional, palavras_chave[], orcamento_previsto, moeda, tem_propriedade_intelectual, foto_perfil, foto_capa, participantes:[{ uid, papel, status_vinculo }], created_at, updated_at`.

> ⚠️ **Bug latente conhecido:** `GET /initiatives/user/{user_id}` filtra públicos por `status == "APROVADA"`, mas o status real aprovado é `ATIVA`. Para terceiros, a lista pode vir vazia. Não depender desse endpoint para terceiros até correção no backend.

---

## 15. EVENTOS — `/api/v1/events`

| Método | Caminho | Auth | Notas |
|---|---|---|---|
| GET | `/events/` | público/opcional | `?status&categoria&host_type&host_id&limit&cursor`. Anônimo só `ativo`. **Cursor.** `host_type` e `host_id` devem vir juntos. |
| GET | `/events/me` | auth | meus eventos. |
| GET | `/events/participating?status=` | auth | minhas participações. |
| GET | `/events/business/{business_id}` | público | legado. |
| GET | `/events/initiative/{iniciativa_id}` | público | legado. |
| GET | `/events/{event_id}` | público/opcional | |
| POST | `/events/` | `create_event` | cria `status=rascunho`. `categoria` validada (`enum_values:event_categoria`). 5/min. |
| PUT | `/events/{event_id}` | dono (`manage_own_content`) | |
| PUT | `/events/{event_id}/fotos` | dono | **multipart** `logo?`, `imagem_capa?`. |
| DELETE | `/events/{event_id}` | dono | soft-delete. |
| POST | `/events/{event_id}/publish` | dono | `rascunho→ativo`. |
| POST | `/events/{event_id}/cancel?reason=` | dono | `→cancelado`. |
| POST | `/events/{event_id}/conclude` | dono | `→concluido`. |
| POST | `/events/{event_id}/approve` | `manage_events` (admin) | `pendente_aprovacao→ativo`. |
| POST | `/events/{event_id}/reject?reason=` | `manage_events` | `→cancelado`. |

**Participação / presença:**
| Método | Caminho | Notas |
|---|---|---|
| POST | `/events/{event_id}/participar` | `participate_event`. **Inscrição** (não `/inscrever`). |
| DELETE | `/events/{event_id}/participar` | cancela própria participação. |
| GET | `/events/{event_id}/participantes?status=` | lista inscritos. |
| POST | `/events/{event_id}/check-in` | **auto** check-in do próprio usuário. |
| GET | `/events/{event_id}/qr` | organizador gera QR de check-in (SLK-77). |
| POST | `/events/{event_id}/check-in/qr?token=` | participante faz check-in via token do QR. |
| POST | `/events/{event_id}/validar-presenca?uid_usuario=` | organizador valida presença (uid via **query**, não path). |
| POST | `/events/{event_id}/validar-presencas-lote` | organizador. Corpo `{ participantes:[], status }`. (**plural** `presencas`.) |
| GET | `/events/{event_id}/stats` | dono/admin. |
| GET | `/events/{event_id}/certificado` | participante baixa o próprio (idempotente) → `{ event_id, participant_id, certificate_url }`. |
| POST | `/events/{event_id}/gerar-certificados-lote` | organizador gera p/ todos PRESENTES. |

**Status do evento:** `rascunho, pendente_aprovacao, ativo, cancelado, concluido`.
**Status do participante:** `inscrito, confirmado, check_in, presente, ausente, cancelado`.
**Categorias (`event_categoria`, dinâmico):** `workshop, palestra, conferencia, hackathon, networking, curso, seminario, mesa_redonda, outro`.

---

## 16. MENSAGENS (DM) — `/api/v1/messages`
> DM **não persiste notificação** por mensagem (só pub/sub realtime + inbox stream). `NOVA_CONVERSA` é notificada na criação da thread.

| Método | Caminho | Notas |
|---|---|---|
| POST | `/messages/threads` | `create_thread`. `{ participantes:[2..20], mensagem_inicial }`. Auto-inclui você. Notifica `NOVA_CONVERSA`. |
| GET | `/messages/threads` | `view_content`. **Cursor.** `[{ id, last_message, last_message_at }]`. |
| POST | `/messages/threads/{thread_id}/messages` | participante. `{ conteudo(<=5000) }`. 30/min + 60/min por-user. |
| GET | `/messages/threads/{thread_id}/messages` | participante. **Cursor.** `[{ id, conteudo, remetente_id, created_at }]`. |
| POST | `/messages/threads/{thread_id}/read` | participante. `{ message_id }`. Emite `READ_RECEIPT`. Idempotente. |
| POST | `/messages/threads/{thread_id}/start-meeting` | só threads 1:1 (`400` em grupo). → `{ meeting_id, location_link }`. |

## 17. REUNIÕES — `/api/v1/meetings` (Jitsi)
**Status:** `pending, accepted, declined, cancelled, completed`.
**Transições:** `pending→{accepted,declined,cancelled}`; `accepted→{cancelled,completed}`; demais terminais.

| Método | Caminho | Notas |
|---|---|---|
| POST | `/meetings/` | `{ participant_id, scheduled_start(ISO,futuro), scheduled_end(>start), location_link?, message? }`. 201. Notifica `MEETING_CREATED`. |
| POST | `/meetings/instant` | `{ participant_id, duration_minutes(5-480,60), location_link? }`. |
| GET | `/meetings/` | `?status&limit&cursor`. **Cursor.** Itens: `{ id, status, creator_id, participant_id, scheduled_start, scheduled_end }` — **`location_link` OMITIDO da lista.** |
| GET | `/meetings/{meeting_id}` | creator ou participant. |
| PATCH | `/meetings/{meeting_id}` | creator/participant. `{ status?, scheduled_start?, scheduled_end?, location_link? }`. |
| POST | `/meetings/{meeting_id}/accept` | participant. `pending→accepted`. |
| POST | `/meetings/{meeting_id}/decline` | participant. `pending→declined`. |
| POST | `/meetings/{meeting_id}/cancel` | creator/participant. |
| GET | `/meetings/{meeting_id}/join` | **único lugar que retorna `location_link`.** Exige `accepted` + dentro da janela `[início-10min, fim]`. |

## 18. NOTIFICAÇÕES — `/api/v1/notifications`

| Método | Caminho | Notas |
|---|---|---|
| GET | `/notifications/unread-count` | `{ count }`. Cache 10s. 60/min. |
| GET | `/notifications` | `?unread_only&limit&cursor`. **Cursor.** Item: `{ id, tipo, titulo, mensagem, lida, data, created_at }`. |
| POST | `/notifications/{id}/read` | dono. `{ id, lida }`. |
| POST | `/notifications/read-all` | marca todas. |
| DELETE | `/notifications/{id}` | dono. |

**Tipos (`TipoNotificacao`):** `CONVITE_INICIATIVA, CONVITE_NEGOCIO, CONVITE_ACEITO, CONVITE_RECUSADO, NOVO_SEGUIDOR, REMOCAO_INICIATIVA, REMOCAO_NEGOCIO, NOVO_MEMBRO, INICIATIVA_APROVADA, INICIATIVA_RECUSADA, NEGOCIO_APROVADO, NEGOCIO_RECUSADO, CONVITE_CONEXAO, CONEXAO_ACEITA, CONEXAO_RECUSADA, NOVA_MENSAGEM, MEETING_CREATED, MEETING_UPDATED, LAB_CLAIM_APROVADO, LAB_CLAIM_RECUSADO, BUSINESS_CLAIM_APROVADO, BUSINESS_CLAIM_RECUSADO, NOVA_CONVERSA`.
> O backend também emite via pub/sub strings extras de fluxo de projeto (`SOLICITACAO_PARTICIPACAO`, `SOLICITACAO_APROVADA`, `SOLICITACAO_RECUSADA`, `SAIDA_PARTICIPANTE`). Trate tipos desconhecidos com fallback genérico.

---

## 19. SEARCH — `/api/v1/search` (offset-based)

| Método | Caminho | Notas |
|---|---|---|
| GET | `/search` | `?q(2-120)&type(user\|laboratorio\|negocio\|iniciativa\|evento\|all)&area&institution&campus&verified&limit(<=50)&offset`. → `{ items:[SearchHit], total, next_offset, has_more }`. |
| GET | `/search/autocomplete` | `?q(2-60)&limit(<=20)`. → `[AutocompleteHit]`. |

## 20. SHOWCASE (vitrine pública, materialized views) — `/api/v1/showcase` (offset-based, cache 60s)

| Método | Caminho | Colunas retornadas |
|---|---|---|
| GET | `/showcase/negocios` | `?limit&offset&categoria`. `id, nome, tipo_negocio, descricao, area_atuacao, categoria, foto_perfil, foto_capa, website, created_at`. |
| GET | `/showcase/laboratorios` | `uid, nome, unidade, subunidade, tipo, descricao, areas_pesquisa, foto_perfil, website, created_at`. |
| GET | `/showcase/eventos` | `uid, titulo, descricao, categoria, local, is_online, data_inicio, data_fim, imagem_capa, host_type, host_id, created_at` (ordenado por `data_inicio ASC`). |
| GET | `/showcase/iniciativas` | `uid, titulo, descricao, tipo, host_type, host_id, uid_owner, areas_conhecimento, palavras_chave, created_at`. |
| GET | `/showcase/highlights` | `?per_section(1-10,3)`. → `{ laboratorios, negocios, iniciativas, eventos, counts:{...} }`. Cache 5min. |
| POST | `/showcase/refresh` | **admin** (`manage_users`). `?concurrently`. Atualiza MVs + limpa cache. |

## 21. DASHBOARD — `/api/v1/dashboard`
| Método | Caminho | Auth |
|---|---|---|
| GET | `/dashboard/` | público (BI agregado) |
| GET | `/dashboard/public` | público (overview do ecossistema) |
| GET | `/dashboard/home` | auth (home personalizada) |

## 22. ADMIN

### 22.1 Claim Tokens — `/api/v1/admin/claim-tokens` (admin)
| Método | Caminho | Notas |
|---|---|---|
| POST | `/admin/claim-tokens/` | `{ resource_type:negocio\|laboratorio, resource_id, resource_name, email, expires_in_days(1-365,30) }`. 201. Token = UUID. |
| GET | `/admin/claim-tokens/?status=ativo\|usado\|expirado&limit` | lista (paginado por `limit+1`/`has_more`, sem cursor). |
| DELETE | `/admin/claim-tokens/{token}` | revoga (expira agora; `400` se já usado). |

### 22.2 Enums — `/api/v1/admin/enums` (admin, retornam dict cru `{ ok }`)
| Método | Caminho | Notas |
|---|---|---|
| GET | `/admin/enums` | todos do tenant. |
| POST | `/admin/enums/{enum_key}/values/{value}` | `{ label, description?, order(0), active(true), metadata? }`. 201. `409 DUPLICATE`. |
| PUT | `/admin/enums/{enum_key}/values/{value}` | atualiza. |
| DELETE | `/admin/enums/{enum_key}/values/{value}` | soft-delete (`active=false`). 204. |

### 22.3 Audit Log — `/api/v1/audit-log` (admin)
| Método | Caminho | Notas |
|---|---|---|
| GET | `/audit-log` | `?actor&resource_type&resource_id&action&limit(<=200)&before_id`. Paginação por `id < before_id`. |

## 23. CONFIG & TENANT
| Método | Caminho | Auth | Notas |
|---|---|---|---|
| GET | `/api/v1/config` | **público** | Header opcional `X-Tenant`. → **dict cru** `{ tenant:{ id, name, logo_url, favicon_url, primary_color, secondary_color, accent_color, font_family, contact_email, features }, enums }`. Chamar no boot. |
| — | `/api/v1/tenant-config` | (router `tenant`) | configuração de tenant (B-FE6). |
| — | `/api/v1/claim` | (router `claim`) | fluxo legado de claim por token público. |

## 24. REALTIME — `/api/v1` (WebSocket)
- Router `websocket` montado em `/api/v1`. Canais pub/sub: `user:{uid}` (notificações), `thread:{thread_id}` (`READ_RECEIPT`), `broadcast` (`config.updated`).
- Presença marcada online ao conectar; heartbeat ~30s; expira 90s.

---

## 25. Gaps frontend↔backend a corrigir (ação no `lib/api/`)
1. **`connections.ts`** — ✅ **já migrado.** É um wrapper de compatibilidade sobre o grafo de follow polimórfico (SLK-269 R3): `conexão = follow mútuo`. Chama `/follow/...` e `/users/suggestions`, não há referência a `/connections` morto. Para código novo, prefira `follow.ts` diretamente.
2. **`claim.ts` vs `claims.ts`**: `claim` = fluxo legado por token (`/api/v1/claim`); `claims` = claims de negócio/lab (`/business/.../claim`, `/labs/.../claim`). Não confundir.
3. **Lab claims usam `/labs`**, lab CRUD usa `/laboratorios`. Garantir que `labs.ts`/`claims.ts` apontem ao prefixo certo.
4. **Reactions de post não existem** — usar `like.ts` (`/like/post/{id}`).
   - **Compartilhamento** existe: `POST /feed/posts/{id}/shares` (com `comentario?` opcional, unique por user+post), `DELETE /feed/posts/{id}/shares`. Counter `shares_count` denormalizado.
   - **Mídia** é JSONB `midia: [{url, tipo:"image"|"video", legenda?}]` — imagem/vídeo são **anexos**, não tipos de post.
5. **`validar-presenca`** usa `uid_usuario` em **query**; lote é `validar-presencas-lote` (plural).
6. **Cadastro** é `POST /users` (não `/auth/register`).
7. Login é **form-urlencoded**, não JSON.
