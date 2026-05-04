# LINK@ — Descrição Completa da Plataforma (360°)
## Documento de referência para agentes de desenvolvimento

> Use este documento como contexto completo ao implementar ou modificar qualquer módulo do LINK@.
> Sempre validar com a API em `http://localhost:8000/docs` para confirmar campos e enums.

---

## 1. O Que É o LINK@

O LINK@ é o **Ambiente Digital de Inovação da Universidade Federal do Ceará (UFC)**. É uma plataforma web que conecta todos os atores do ecossistema de inovação da universidade: pesquisadores, estudantes, laboratórios, negócios, empreendedores e gestores.

**Missão:** concentrar em um único ambiente o que hoje está fragmentado — cadastro de labs, vitrine de negócios, gestão de eventos, networking e reuniões.

**Acesso:** `linka.ufc.br`
**API base:** `http://localhost:8000` (FastAPI + DynamoDB)
**Documentação interativa:** `http://localhost:8000/docs`

---

## 2. Tipos de Usuário

O sistema detecta automaticamente o tipo de usuário pelo domínio do e-mail no cadastro.

| Tipo | Domínio | Perfil |
|---|---|---|
| **Estudante** | `@alu.ufc.br` | Acesso à vitrine, eventos, rede e iniciativas |
| **Pesquisador** | `@ufc.br` | Idem + pode gerenciar laboratórios |
| **Técnico Administrativo** | `@ufc.br` | Idem + acesso ao painel admin |
| **Externo** | outros | Acesso restrito à vitrine pública |

**Cadastro em 5 passos:**
1. Informações básicas (nome, e-mail — detecção automática de tipo)
2. Verificação de e-mail (confirmação de identidade)
3. Criar senha (com indicador de força)
4. Dados do perfil (campus, curso, áreas de interesse)
5. Pronto — acesso liberado

---

## 3. Módulos da Plataforma

### 3.1 Laboratórios

**Objetivo:** Vitrine pública dos laboratórios da UFC com suas competências e serviços.

**Campos principais de um Laboratório:**
```
sigla            string   — ex: "MDCC", "GREat"
nome             string   — nome completo
campus           string   — ex: "Pici", "Benfica", "Sobral"
descricao        string   — descrição do laboratório
areas_pesquisa   list     — tags de áreas (ex: ["IA", "Robótica", "Saúde"])
servicos         list     — serviços oferecidos
coordenador      string   — nome do coordenador
contato          string   — e-mail ou site
```

**Filtros disponíveis na vitrine:**
- Pesquisa, Ensino, Extensão, Multidisciplinar

**Endpoint:** `GET /api/v1/labs/`

**Regras de negócio:**
- Qualquer usuário (inclusive externo) pode visualizar a vitrine
- Apenas pesquisadores vinculados podem editar as informações do lab
- Labs sem descrição não aparecem na vitrine pública

---

### 3.2 Negócios

**Objetivo:** Vitrine pública de negócios inovadores vinculados à UFC (startups, empresas juniores, spin-offs).

**Campos principais de um Negócio:**
```
nome             string   — nome do negócio
categoria        enum     — STARTUP | EMPRESA_JUNIOR | SPIN_OFF
descricao        string   — pitch curto
estagio          enum     — IDEACAO | MVP | VALIDACAO | OPERACAO | EXPANSAO
areas            list     — áreas de atuação
responsavel      string   — nome do responsável
campus           string   — campus de origem
```

**Filtros disponíveis na vitrine:**
- Startup, Empresa Jr., Spin-off

**Endpoint:** `GET /api/v1/businesses/`

**Regras de negócio:**
- Vitrine pública, visível sem login
- Negócios em IDEACAO podem não aparecer na vitrine padrão (validar)
- Campo `estagio` é enum — sempre usar valores exatos

---

### 3.3 Iniciativas

**Objetivo:** Projetos de inovação, extensão ou pesquisa em andamento que buscam colaboradores.

**Campos principais de uma Iniciativa:**
```
titulo               string   — nome da iniciativa
descricao            string   — descrição detalhada
tipo                 enum     — PESQUISA | EXTENSAO | INOVACAO | EMPREENDEDORISMO
status               enum     — ATIVA | CONCLUIDA | PAUSADA
nivel_maturidade     string   — estágio de maturidade
areas_conhecimento   list     — áreas envolvidas
aceita_colaboradores bool     — se está aberta a novos membros
```

**Endpoint:** `GET /api/v1/initiatives/`

**Regras de negócio:**
- Iniciativas com `aceita_colaboradores: true` são destacadas
- Status `CONCLUIDA` aparece com visual diferenciado (opacidade reduzida)

---

### 3.4 Eventos

**Objetivo:** Sistema completo de eventos da UFC — cadastro, inscrição, check-in e certificados.

**Campos principais de um Evento:**
```
titulo        string   — nome do evento
categoria     enum     — workshop | palestra | conferencia | hackathon |
                         networking | curso | seminario | mesa_redonda | outro
data_inicio   date     — data de início
data_fim      date     — data de fim (opcional)
local         string   — local físico ou "Virtual"
is_online     bool     — se é online
descricao     string   — descrição
vagas         int      — número de vagas (null = ilimitado)
```

**Enums de categoria (lowercase, conforme backend):**
```
workshop | palestra | conferencia | hackathon | networking | curso | seminario | mesa_redonda | outro
```

**Labels para exibição (português):**
```
workshop     → Workshop
palestra     → Palestra
conferencia  → Conferência
hackathon    → Hackathon
networking   → Networking
curso        → Curso
seminario    → Seminário
mesa_redonda → Mesa Redonda
outro        → Outro
```

**Endpoint:** `GET /api/v1/events/` (ou `/api/v1/initiatives/events/` — validar)

**Fluxo do usuário:**
1. Descobre o evento na vitrine pública
2. Faz inscrição (requer login)
3. Recebe confirmação por e-mail
4. No dia: check-in (QR code ou presença manual)
5. Após o evento: certificado gerado automaticamente

---

### 3.5 Rede e Networking

**Objetivo:** Conectar os membros da comunidade de inovação da UFC.

**Perfil de usuário (campos visíveis na rede):**
```
nome          string   — nome completo
tipo          enum     — Estudante | Pesquisador | Técnico Administrativo | Externo
campus        string   — campus de origem
areas         list     — áreas de interesse/atuação
curso         string   — curso (para estudantes)
laboratorio   ref      — lab vinculado (para pesquisadores)
negocios      list     — negócios associados ao perfil
bio           string   — apresentação curta
contato       string   — e-mail (pode ser ocultado)
```

**Funcionalidades:**
- Busca por nome, área, tipo, campus
- Botão "Conectar" — envio de solicitação de conexão
- Feed de conexões
- Perfil expandido com informações de contato (após conexão aceita)

**Regras de negócio:**
- E-mails só visíveis após conexão mútua aceita
- Pesquisadores aparecem com lab vinculado em destaque
- Empreendedores aparecem com negócio associado

---

### 3.6 Reuniões

**Objetivo:** Videochamadas integradas diretamente na plataforma, com agendamento e sala virtual.

**Campos de uma Reunião:**
```
titulo        string   — assunto da reunião
data          date     — data
horario       time     — horário de início
duracao       int      — duração em minutos
participantes list     — usuários convidados
sala_id       string   — ID da sala (gerado automaticamente)
status        enum     — AGENDADA | EM_ANDAMENTO | CONCLUIDA
```

**Tecnologia subjacente:** LiveKit (não mencionar publicamente — usar apenas "reuniões integradas")

**Funcionalidades:**
- Calendário de reuniões do dia na tela inicial da área
- Agendamento com seleção de participantes da rede
- Entrada na sala com 1 clique
- Controles: câmera, microfone, compartilhamento de tela, encerrar

**Regras de negócio:**
- Reunião só pode ser criada por usuários com login
- Participantes recebem notificação/e-mail com link
- Sala expira após o horário previsto + 30 min

---

### 3.7 Painel Administrativo

**Objetivo:** Gestão centralizada para técnicos administrativos e gestores da UFC INOVA.

**Módulos do painel:**
```
Negócios        — aprovar/reprovar cadastros, gerenciar listagem
Laboratórios    — aprovar/reprovar, gerenciar informações
Pendências      — fila de itens aguardando aprovação
Aprovações      — histórico de decisões
Métricas        — dados gerais da plataforma (quantidade de labs, negócios, eventos, usuários)
```

**Fluxo de aprovação:**
1. Pesquisador/empreendedor submete cadastro de lab ou negócio
2. Item vai para fila de "Pendências" no painel admin
3. Admin revisa e aprova ou rejeita (com justificativa)
4. Item aprovado aparece na vitrine pública

**Regras de negócio:**
- Apenas usuários com role `ADMIN` ou `TECNICO_ADM` acessam este painel
- Aprovações ficam registradas com autor e timestamp
- Métricas são calculadas em tempo real da base

---

## 4. Estrutura Técnica

### 4.1 Stack

| Camada | Tecnologia |
|---|---|
| Backend | FastAPI (Python) |
| Banco de dados | Amazon DynamoDB |
| Autenticação | JWT (Bearer token) |
| Videochamadas | LiveKit |
| Frontend | React (TypeScript) |
| Hospedagem | AWS (inferido pela escolha do DynamoDB) |

### 4.2 Convenções da API

- **Base URL:** `http://localhost:8000` (dev) / `https://api.linka.ufc.br` (prod)
- **Prefixo:** `/api/v1/`
- **Autenticação:** `Authorization: Bearer <token>`
- **Formato:** JSON
- **Enums:** sempre lowercase com underscore (ex: `mesa_redonda`, não `MesaRedonda`)
- **Datas:** ISO 8601 (`YYYY-MM-DD`)
- **Documentação:** `/docs` (Swagger UI automático do FastAPI)

### 4.3 Endpoints Conhecidos

```
GET    /api/v1/labs/                  — lista laboratórios
GET    /api/v1/labs/{id}              — detalhe de um lab
POST   /api/v1/labs/                  — cadastrar lab (autenticado)

GET    /api/v1/businesses/            — lista negócios
GET    /api/v1/businesses/{id}        — detalhe de um negócio
POST   /api/v1/businesses/            — cadastrar negócio (autenticado)

GET    /api/v1/initiatives/           — lista iniciativas
POST   /api/v1/initiatives/           — criar iniciativa (autenticado)

GET    /api/v1/events/                — lista eventos
POST   /api/v1/events/                — criar evento (autenticado)

POST   /api/v1/auth/login             — autenticação, retorna JWT
POST   /api/v1/auth/register          — cadastro de usuário
POST   /api/v1/auth/verify-email      — verificação por token

GET    /api/v1/users/me               — perfil do usuário atual
GET    /api/v1/users/{id}             — perfil público de outro usuário
```

---

## 5. Regras Gerais de Negócio

1. **Vitrine pública** (Labs, Negócios, Eventos, Iniciativas): acessível sem login — qualquer pessoa pode ver
2. **Área logada** (Rede, Reuniões, Admin): requer autenticação
3. **Aprovação necessária** para Labs e Negócios aparecerem na vitrine (admin deve aprovar)
4. **Detecção de tipo** no cadastro: feita pelo domínio do e-mail — não é campo editável pelo usuário
5. **Enums são rígidos**: sempre validar contra os valores aceitos pelo backend antes de submeter
6. **Sem dados fictícios em produção**: todos os dados de labs e negócios vêm da API — nunca hardcodar em produção

---

## 6. Identidade Visual e Tom

- **Nome do produto:** LINK@ (com @ — não "Linka", não "LINKA" apenas)
- **Cor primária:** roxo/violeta (#6D28D9 e variações)
- **Tom de voz:** profissional mas acolhedor, sem jargão técnico para o usuário final
- **Termos corretos:**
  - "Reuniões integradas" (não "LiveKit")
  - "Ambiente Digital de Inovação" (tagline oficial)
  - "Vitrine Pública" (seção de labs/negócios/eventos aberta ao público)
  - "Área Logada" (seções que requerem login)

---

## 7. Contexto Institucional

- **Instituição:** Universidade Federal do Ceará (UFC)
- **Gestora do projeto:** UFC INOVA (agência de inovação da UFC)
- **Programa:** PROINTER
- **Registro de software:** INPI RPC 512025002475-4
- **Equipe de desenvolvimento:** Oráculos (CNPJ 58.707.586/0001-09)
- **URL pública:** linka.ufc.br

---

*Atualizar este documento sempre que novos módulos forem implementados ou endpoints mudarem.*
