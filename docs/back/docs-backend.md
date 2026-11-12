# 🛠️ Documentação Oficial do Backend (`site-pessoal-hub` · `./app` — NestJS Modular)

> **Propósito deste Documento:** Servir como contexto completo e guia passo a passo para o desenvolvimento gradual da API Backend em **TypeScript + NestJS 12 + Prisma ORM + PostgreSQL 17 (Arquitetura Modular Nativa)**, modelagem das 17 tabelas, segurança de Admin Solo com autenticação por dispositivo (Passkeys/WebAuthn + 2FA), gestão de configurações/Feature Flags do site, funil de Ideias de Projeto, Hub de Engenharia & Calculadoras e Sistema de Chamados de Manutenção por Projeto.

---

## 1. Ideia do Projeto e Visão Geral

Esta plataforma é um **Sistema Pessoal Integrado de Engenharia de Software, CRM, Portfólio Dinâmico e Sustentação de Projetos** para um único administrador (**Admin Solo**), alimentando o frontend em Next.js + React (`./client`).

### Os 4 Pilares Centrais do Sistema:
1. **Pilar 1 — Configuração do Site & Feature Flags (`SiteConfigModule`):** Controle total sobre o conteúdo do portfólio (`site-content.json`), validado com o mesmo schema **Zod** do frontend, permitindo reordenar, ocultar e escolher quais seções da Landing Page aparecem no menu (`secoes`: Projetos, Serviços, Como trabalho, Depoimentos, Sobre, FAQ) e criar novas categorias de tecnologias sem alterar código.
2. **Pilar 2 — Ideias de Projeto (`TicketsModule`):** Triagem de oportunidades comerciais e técnicas. Visitantes anônimos precisam enviar uma ideia pelo formulário público (com Honeypot + Rate Limit), enquanto o Admin pode criar ideias manualmente a qualquer momento. Ideias aprovadas convertem-se em **Clientes** e **Projetos** via transação atômica (`prisma.$transaction`).
3. **Pilar 3 — Clientes & Hub de Projetos (`ClientesModule`, `ProjetosModule`, `EngenhariaModule`, `CalculadoraModule`, `FinanceiroModule`, `TarefasModule`):** O Admin tem liberdade total para criar um **Cliente** e um **Projeto** diretamente quando quiser (sem depender de formulário prévio) ou converter uma Ideia existente. Dentro de cada projeto funcionam a **Engenharia de Requisitos**, a **Matriz de Avaliação Arquitetural (BI) + ADRs**, a **Calculadora de Precificação Júnior & Custos**, as **Tarefas em 2 Níveis** e o **Portal do Cliente (`/status/:token`)**.
4. **Pilar 4 — Chamados de Manutenção & Sustentação (`ChamadosModule`):** Quando um projeto já está estruturado ou entregue, ele passa a ter um canal próprio de **Chamados de Projeto** (`MANUTENCAO`, `ALTERACAO`, `MELHORIA`, `SUPORTE`). Cada projeto possui links exclusivos para abertura e acompanhamento de chamados, e o Admin pode transformar um chamado aprovado diretamente em uma **Tarefa do Projeto**.

---

## 2. O Ciclo Completo de Funcionamento

```mermaid
flowchart TD
    subgraph FASE 1: ENTRADA & IDEIAS DE PROJETO
        E1A["Entrada Anônima\n(Visitante envia ideia no site)"] --> E1["Funil de Ideias de Projeto\n(Status: NOVO → EM_CONVERSA → MVP)"]
        E1B["Entrada Manual\n(Admin cadastra ideia direto)"] --> E1
    end

    E1 -->|Ideia Aprovada: prisma.$transaction| E4
    E2M["Criação Direta pelo Admin\n(Sem precisar de Ideia prévia)"] --> E4

    subgraph FASE 2: CLIENTE & ESTRUTURAÇÃO DO PROJETO
        E4["Cliente (CRM) + Projeto Criado"] --> E5A["Engenharia de Requisitos\n(RF, RNF, Regras, MoSCoW e Dúvidas)"]
        E5A --> E5B["Avaliação Arquitetural (BI)\n(Matriz de pesos, Stack e ADRs)"]
        E5B --> E5C["Calculadora Júnior & Financeiro\n(Horas × Margem Jr × Complexidade + Custos)"]
    end

    E5C --> E6

    subgraph FASE 3: EXECUÇÃO, PORTAL & VITRINE
        E6["Execução & Portal do Cliente (/status/:token)\n(Tarefas Nível 1 + Checklists Nível 2)"] --> E7["Vitrine do Portfólio\n(Público ou Confidencial sob NDA + Depoimento)"]
    end

    E6 --> E8
    E7 --> E8

    subgraph FASE 4: SUSTENTAÇÃO & CHAMADOS DO PROJETO
        E8["Chamados de Manutenção & Alteração\n(Links exclusivos por projeto • Bug, Ajuste, Melhoria, Suporte)"] -->|1 clique se aprovado| E6
    end
```

---

## 3. Arquitetura Técnica do Servidor (`./app` — NestJS Modular)

- **Runtime & Linguagem:** Node.js + TypeScript (ESM, `"type": "module"`).
- **Framework:** NestJS 12, organizado nativamente em **módulos por domínio (`*.module.ts`)** com injeção de dependência.
- **Banco de Dados:** PostgreSQL 17 (Container Docker na porta `15432` em dev).
- **ORM:** Prisma 7 (`PrismaService` global estendendo `PrismaClient` com o driver adapter `@prisma/adapter-pg`), modelando as **17 tabelas** em um único arquivo `prisma/schema.prisma`.
  - A URL do banco fica em `prisma.config.ts` (lida do `app/.env`), não no schema; o client é gerado em `src/generated/prisma` (fora do git; `pnpm db:generate` / `postinstall`).
  - Colunas em `snake_case` (iguais aos DTOs do front); models em PascalCase com `@@map` para os nomes físicos de `schema.sql`.
  - CHECKs (`progresso` 0–100, `nota` 1–5) e o índice parcial `uq_fila_email_aguardando` ficam em SQL na migration `init`, pois o Prisma não os expressa.
  - Scripts: `db:migrate` (migrate dev), `db:deploy` (produção), `db:seed` (admin inicial, idempotente, senha em argon2id), `prisma:studio`.
- **Configuração & Validação:** `@nestjs/config` + validação de variáveis de ambiente e DTOs com **Zod** (`StandardSchemaValidationPipe` / `nestjs-zod`), reaproveitando os schemas do `site-content.json`.
- **Segurança & Auth Blindada (Admin Solo):**
  - `argon2` (hash de senha) + `@nestjs/jwt` + `cookie-parser` (sessão em Cookie HTTP-Only);
  - **Passkeys / WebAuthn (`@simplewebauthn/server`):** Login sem senha por dispositivo físico/biometria validado na tabela `admin_dispositivos`;
  - **Segundo Fator (2FA / TOTP):** Código temporário de 6 dígitos (`otplib`) em `admin.totp_secret`;
  - `JwtAuthGuard` global protegendo `/api/admin/*`, com decorator `@Public()` para liberar rotas públicas;
  - `PortalTokenGuard` validando o `:token` (`codigo_rastreio`) nas rotas `/api/portal/:token/*`;
  - `HoneypotGuard` + `@nestjs/throttler` descartando silenciosamente envios com o campo oculto `website` preenchido.
- **Uploads:** `FileInterceptor` (multer) + `@nestjs/serve-static` (disco local `./uploads` em dev ou Cloudflare R2 em produção).
- **Notificações:** `Nodemailer` (SMTP) + Webhook (Discord/Telegram) encapsulados em `NotificationsModule`.
- **Documentação da API:** `@nestjs/swagger` gerando o OpenAPI em `/api/docs`.
- **Testes & Qualidade:** Vitest (unitários e e2e com `supertest`), Oxlint e Prettier.
- **Porta & Prefixo:** Porta `3333` (`PORT=3333` no `.env`) e prefixo global `app.setGlobalPrefix('api')`.

### Estrutura de Pastas do Backend (`./app`)

Cada módulo de domínio segue o padrão nativo do NestJS (`*.module.ts` + `*.controller.ts` + `*.service.ts` + `dto/` com schemas Zod):

```text
app/
├── package.json
├── nest-cli.json
├── tsconfig.json
├── vitest.config.ts / vitest.config.e2e.ts
├── .env / .env.example                     # PORT=3333, DATABASE_URL (localhost:15432), CORS_ORIGIN, JWT_SECRET, ADMIN_SEED_*
├── prisma.config.ts                        # Config do Prisma CLI: schema, migrations, seed e DATABASE_URL
├── uploads/                                # Imagens de projetos, anexos de chamados e comprovantes
├── prisma/
│   ├── schema.prisma                       # Modelagem única das 17 tabelas no PostgreSQL
│   ├── migrations/                         # Histórico do Prisma Migrate (init + CHECKs/índice parcial)
│   └── seed.ts                             # Criação da conta única de Admin inicial
├── test/                                   # Testes e2e (supertest + Vitest)
└── src/
    ├── main.ts                             # Bootstrap: prefixo /api, CORS (credentials: true), cookie-parser, Swagger
    ├── app.module.ts                       # Módulo raiz: importa Config, Prisma e todos os módulos de domínio
    ├── env.ts                              # Schema Zod das variáveis de ambiente
    ├── generated/prisma/                   # Prisma Client gerado (não versionado)
    ├── common/
    │   ├── validation.ts                   # Erros de validação → { message, campos } (formato do editor do admin)
    │   ├── decorators/
    │   │   └── public.decorator.ts         # @Public() para liberar rotas sem JWT
    │   └── guards/
    │       ├── jwt-auth.guard.ts           # Proteção global das rotas /api/admin/*
    │       ├── portal-token.guard.ts       # Validação de :token nas rotas /api/portal/:token/*
    │       └── honeypot.guard.ts           # Anti-bot nos formulários públicos (campo "website")
    └── module/
        ├── prisma/                         # PrismaModule (@Global) + PrismaService
        ├── health/                         # GET /api/health (API + banco)
        ├── auth/                           # Módulo 1: Login JWT/Cookie, Passkeys WebAuthn (admin_dispositivos) e 2FA TOTP
        ├── site-config/                    # Módulo 2: Leitura/gravação do site-content.json, Feature Flags e Categorias
        ├── public/                         # Módulo 3: Vitrine pública (projetos, depoimentos e captura de ideias)
        ├── tickets/                        # Módulo 4: Funil de Ideias de Projeto (anônimas + manuais) e conversão atômica
        ├── clientes/                       # Módulo 5: CRM de Clientes (criação direta ou via conversão)
        ├── projetos/                       # Módulo 6: Hub 360º do Projeto e criação livre de projetos
        ├── engenharia/                     # Módulo 7: Requisitos, Dúvidas, Matriz de Avaliação Arquitetural (BI) e ADRs
        ├── calculadora/                    # Módulo 8: CalculadoraService (Esforço Jr, rentabilidade e progresso 2 níveis)
        ├── financeiro/                     # Módulo 9: Custos operacionais (com link_fonte) e Parcelas de pagamento
        ├── tarefas/                        # Módulo 10: Macro-tarefas (Nível 1) e Checklists (Nível 2)
        ├── portal/                         # Módulo 11: Portal do Cliente (/api/portal/:token) e comentários
        ├── chamados/                       # Módulo 12: Chamados de Manutenção/Alteração do projeto e conversão em Tarefa
        ├── fila-espera/                    # Módulo 13: Fila de Espera FIFO ("Avise-me") e disparo controlado
        ├── notifications/                  # Módulo 14: MailService (Nodemailer) + WebhookService (Discord/Telegram)
        └── storage/                        # Módulo 15: Upload de imagens, vídeos e comprovantes
```

---

## 4. Resumo da Modelagem do Banco de Dados PostgreSQL (17 Tabelas)

> 📄 **DDL Completo:** O script SQL integral com todos os `ENUM`s, `CREATE TABLE` e índices encontra-se em [`docs/back/schema.sql`](file:///home/tanaka/dev/projetos/personal/site-portifolio/docs/back/schema.sql).

| # | Tabela | Módulo NestJS (`src/module/*`) | Papel no Sistema |
| :--- | :--- | :--- | :--- |
| **1** | `admin` | `auth` | Conta única do administrador com hash `argon2` e segredo 2FA (`totp_secret`). |
| **2** | `admin_dispositivos` | `auth` | Chaves públicas **WebAuthn / Passkeys (FIDO2)** e dispositivos confiáveis autorizados pelo Admin. |
| **3** | `clientes` | `clientes` | Base cadastral de clientes (CRM). Pode ser criado manualmente a qualquer momento ou via conversão de Ideia. `token_portal` + `portal_ativo` controlam o acesso à área do cliente. |
| **4** | `tickets` | `tickets` | **Ideias de Projeto** (origem `PUBLICO_SITE`, `MANUAL_ADMIN` ou `FILA_ESPERA`), notas de conversa e MVP. |
| **5** | `projetos` | `projetos` | Registro central do projeto (criado manualmente ou via conversão), parâmetros da Calculadora Jr, token do portal (`codigo_rastreio`), flag `aceita_chamados` e dados da vitrine pública/NDA. |
| **6** | `requisitos_projetos` | `engenharia` | Requisitos Funcionais, Não Funcionais, Regras de Negócio e Restrições com horas e prioridade MoSCoW. |
| **7** | `duvidas_projetos` | `engenharia` | Dúvidas técnicas e alinhamentos pendentes ou respondidos durante o levantamento de requisitos. |
| **8** | `avaliacoes_arquiteturais` | `engenharia` | Matriz determinística de BI justificando a escolha de arquitetura, linguagem, framework e banco. |
| **9** | `adrs` | `engenharia` | *Architecture Decision Records* (ADR-001, ADR-002...) numerados por projeto. |
| **10** | `custos_projetos` | `financeiro` | Custos de infraestrutura, domínio, APIs e licenças com recorrência e `link_fonte` para transparência. |
| **11** | `pagamentos_projetos` | `financeiro` | Controle de parcelas, vencimentos, status de pagamento e comprovantes. |
| **12** | `tarefas_projetos` | `tarefas` | Tarefas de Nível 1 (Macro) vinculadas opcionalmente a requisitos, com flag `visivel_cliente`. |
| **13** | `checklist_tarefas` | `tarefas` | Sub-itens de Nível 2 (Micro) dentro de cada tarefa que calculam automaticamente o progresso (0–100%). |
| **14** | `comentarios_projetos` | `portal` | Comentários gerais enviados pelo cliente ou pelo admin no Portal de Acompanhamento. |
| **15** | `chamados_projetos` | `chamados` | **Chamados pós-estruturação do projeto** (`MANUTENCAO`, `ALTERACAO`, `MELHORIA`, `SUPORTE`), protocolo único (`CHM-YYYY-NNNN`), prioridade, horas adicionais e vínculo opcional com `tarefa_gerada_id`. |
| **16** | `interacoes_chamados` | `chamados` | Histórico de mensagens, respostas técnicas e anexos dentro de cada chamado de manutenção. |
| **17** | `avaliacoes` & `fila_espera` | `projetos` / `fila-espera` | Depoimentos públicos vinculados aos projetos entregues e fila FIFO "Avise-me quando abrir vaga". |

---

## 5. Especificação Completa dos Endpoints da API REST (`/api`)

### 5.1. Módulo `auth`: Autenticação & Segurança por Dispositivo (`/api/auth`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público | Valida e-mail, senha (`argon2`) e código 2FA (se `totp_enabled = true`), gravando Cookie HTTP-Only com JWT. |
| `POST` | `/api/auth/passkey/challenge` | Público | Gera desafio criptográfico WebAuthn (`@simplewebauthn/server`) para login direto com dispositivo/biometria. |
| `POST` | `/api/auth/passkey/verify` | Público | Valida a assinatura do dispositivo em `admin_dispositivos` e grava o Cookie HTTP-Only sem precisar digitar senha. |
| `POST` | `/api/auth/logout` | Admin | Limpa o cookie HTTP-Only de autenticação. |
| `GET` | `/api/auth/me` | Admin | Retorna os dados do admin logado: `{ id, nome, email, totp_enabled }`. |
| `GET` | `/api/admin/dispositivos` | Admin | Lista os dispositivos/Passkeys cadastrados pelo Admin. |
| `POST` | `/api/admin/dispositivos` | Admin | Registra um novo dispositivo confiável / Passkey (WebAuthn) ou ativa o 2FA TOTP. |
| `DELETE`| `/api/admin/dispositivos/:id`| Admin | Revoga o acesso de um dispositivo específico. |

### 5.2. Módulo `public`: Rotas Públicas da Vitrine (`/api/public`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/projetos` | Público | Lista projetos com `is_publico = true` ordenados por `ordem ASC`. Se `is_confidencial = true`, omite URLs sensíveis e mídia privada. |
| `GET` | `/api/public/avaliacoes`| Público | Lista depoimentos com `is_publicado = true` com `JOIN` em `projetos` (`projeto_nome`, `projeto_entrega`). |
| `POST` | `/api/public/tickets` | Público | **(Rate limit + `HoneypotGuard` no campo `website`)** Registra uma nova **Ideia de Projeto** com `origem = 'PUBLICO_SITE'` e `status = 'NOVO'`, disparando e-mail/webhook. |
| `POST` | `/api/public/fila-espera` | Público | **(Rate limit + `HoneypotGuard`)** Inscreve visitante na fila de espera quando a agenda está cheia e retorna `{ posicao }`. |

### 5.3. Módulos `portal` & `chamados`: Portal do Cliente & Links de Chamados (`/api/portal/:token`)
Protegido pelo `PortalTokenGuard` (onde `:token` é o `codigo_rastreio` único do projeto):

| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portal/:token` | Token | Retorna progresso (0–100%), tarefas (`visivel_cliente = true`), custos com `link_fonte`, parcelas, comentários e status de `aceita_chamados`. |
| `POST` | `/api/portal/:token/comentarios` | Token | Cliente envia comentário rápido sobre o andamento do projeto. |
| `GET` | `/api/portal/:token/chamados` | Token | Lista todos os **Chamados de Manutenção/Alteração** daquele projeto e suas interações visíveis ao cliente. |
| `POST` | `/api/portal/:token/chamados` | Token | **(Se `aceita_chamados = true`)** Cliente abre um novo chamado (`MANUTENCAO`, `ALTERACAO`, `MELHORIA`, `SUPORTE`) para o projeto, gerando protocolo `CHM-YYYY-NNNN` e notificando o Admin. |
| `POST` | `/api/portal/:token/chamados/:chamadoId/interacoes` | Token | Cliente responde ou anexa evidência dentro de um chamado específico do projeto. |

### 5.3.1. Área do Cliente (`/api/public/cliente` e `/api/cliente/:token`)
Um cliente pode ter vários projetos. A área do cliente (`/cliente/:token` no front) reúne todos eles; cada projeto continua com seu próprio link (`/status/:codigo_rastreio`), que pode ser repassado a alguém da equipe do cliente **sem** expor os outros projetos.

| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/public/cliente/acesso` | Público | **(Rate limit + `HoneypotGuard`)** Recebe `{ email }`. Se existir cliente com esse e-mail e `portal_ativo = true`, envia o link `/cliente/:token_portal` por e-mail. **Responde sempre `202`**, exista ou não, para não revelar quem é cliente. |
| `GET` | `/api/cliente/:token` | Token | `ClienteTokenGuard` (token = `clientes.token_portal`, exige `portal_ativo`). Retorna `{ nome, empresa, projetos: [{ nome, status, progresso, end_date, codigo_rastreio, aceita_chamados, chamados_abertos, proximo_pagamento }] }` — **sem** horas, valor-hora, custos do desenvolvedor ou notas internas. |
| `POST` | `/api/admin/clientes/:id/portal` | Admin | `{ ativo?: boolean, regenerar?: boolean }` — liga/desliga o acesso ou gera um `token_portal` novo (o antigo deixa de valer); opcionalmente reenvia o link por e-mail. |

**Regras dos chamados no portal:** com `aceita_chamados = false` o portal mostra o histórico e um botão de contato (“o período de suporte terminou”) em vez do formulário. Chamados que chegam por WhatsApp/e-mail são registrados pelo admin (`POST /api/admin/projetos/:id/chamados`, `aberto_por = ADMIN`) e aparecem para o cliente no mesmo lugar.

### 5.4. Módulo `tickets`: Funil de Ideias de Projeto (`/api/admin/tickets`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/tickets` | Admin | Lista todas as Ideias de Projeto (anônimas do site ou criadas pelo Admin), filtráveis por `status` e `origem`. |
| `POST` | `/api/admin/tickets` | Admin | **Criação Manual de Ideia:** Permite ao Admin registrar uma ideia de projeto diretamente no painel (`origem = 'MANUAL_ADMIN'`). |
| `PATCH`| `/api/admin/tickets/:id` | Admin | Atualiza `notas_conversa`, `resumo_mvp`, `link_prototipo_mvp` e `status`. |
| `POST` | `/api/admin/tickets/:id/converter` | Admin | **Transação Atômica (`prisma.$transaction`):** Cria o `Cliente` (ou vincula a um existente), cria o `Projeto` e marca a ideia como `ACEITO_CONVERTIDO`. |

### 5.5. Módulos `clientes` & `projetos`: Criação Livre e Gestão (`/api/admin`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/clientes` | Admin | Lista todos os clientes cadastrados com contagem de projetos e chamados. |
| `POST` | `/api/admin/clientes` | Admin | **Criação Direta:** Cria um cliente a qualquer momento, sem precisar de ticket/ideia prévia. |
| `PATCH`| `/api/admin/clientes/:id` | Admin | Atualiza dados cadastrais e notas do cliente. |
| `GET` | `/api/admin/projetos` | Admin | Lista todos os projetos (`EM_ANDAMENTO`, `INATIVO`, `CONCLUIDO`). |
| `POST` | `/api/admin/projetos` | Admin | **Criação Direta:** Cria um projeto a qualquer momento (vinculado a um cliente ou projeto próprio/pessoal). |
| `GET` | `/api/admin/projetos/:id` | Admin | Retorna a visão 360º do Hub do Projeto (Requisitos, Dúvidas, BI, ADRs, Calculadora, Custos, Pagamentos, Tarefas e Chamados). |
| `PATCH`| `/api/admin/projetos/:id` | Admin | Atualiza status, parâmetros da Calculadora Jr, `aceita_chamados`, datas e publicação no portfólio (incluindo NDA). |

### 5.6. Módulos `engenharia`, `calculadora`, `financeiro` & `tarefas` (`/api/admin`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/projetos/:id/requisitos` | Admin | Cadastra requisito (`FUNCIONAL`, `NAO_FUNCIONAL`, `REGRA_NEGOCIO`, `RESTRICAO_TECNICA`) e recalcula automaticamente as horas e o orçamento via `CalculadoraService`. |
| `PATCH`| `/api/admin/requisitos/:reqId` | Admin | Edita requisito ou marca `implementado = true`. |
| `DELETE`| `/api/admin/requisitos/:reqId` | Admin | Remove requisito e recalcula estimativa. |
| `POST` | `/api/admin/projetos/:id/duvidas` | Admin | Registra dúvida de requisito/escopo. |
| `PATCH`| `/api/admin/duvidas/:duvId` | Admin | Registra resposta e muda status para `RESPONDIDA`. |
| `PUT` | `/api/admin/projetos/:id/avaliacao-arquitetural` | Admin | Salva matriz de avaliação de stack (BI) e justificativa. |
| `POST` | `/api/admin/projetos/:id/adrs` | Admin | Registra nova decisão arquitetural (ADR). |
| `POST` | `/api/admin/projetos/:id/custos` | Admin | Adiciona custo operacional/infra com `link_fonte`. |
| `POST` | `/api/admin/projetos/:id/pagamentos` | Admin | Cadastra parcela de pagamento do projeto. |
| `PATCH`| `/api/admin/pagamentos/:pagId` | Admin | Marca parcela como `PAGO` e anexa comprovante. |
| `POST` | `/api/admin/projetos/:id/tarefas` | Admin | Cria macro-tarefa (Nível 1). |
| `POST` | `/api/admin/tarefas/:tarefaId/checklists` | Admin | Cria item de checklist (Nível 2) e recalcula progresso do projeto. |
| `PATCH`| `/api/admin/checklists/:itemId/toggle` | Admin | Alterna conclusão do item e atualiza a barra de progresso (0–100%). |

### 5.7. Módulo `chamados`: Manutenção, Alteração e Sustentação (`/api/admin/chamados`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/chamados` | Admin | Visão global de todos os chamados de todos os projetos (filtrável por `projeto_id`, `tipo`, `prioridade` e `status`). |
| `POST` | `/api/admin/projetos/:id/chamados` | Admin | Permite ao próprio Admin registrar um chamado técnico/manutenção em nome do projeto. |
| `PATCH`| `/api/admin/chamados/:id` | Admin | Atualiza `status`, `prioridade`, `horas_estimadas_chamado`, `valor_adicional_orcado` e `notas_internas_admin`. |
| `POST` | `/api/admin/chamados/:id/interacoes` | Admin | Envia resposta ao cliente ou registra nota técnica interna (`visivel_cliente = false`). |
| `POST` | `/api/admin/chamados/:id/converter-tarefa` | Admin | **Integração Automática (`prisma.$transaction`):** Cria uma Macro-Tarefa (Nível 1) no projeto a partir do chamado e preenche `tarefa_gerada_id`. |

### 5.8. Módulo `site-config` & `storage`: Configuração do Site, Feature Flags & Uploads (`/api/admin`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/site-config` | Admin | Lê o `site-content.json` completo (incluindo `secoes`, serviços, processo, FAQ e categorias). |
| `PUT` | `/api/admin/site-config` | Admin | Valida com Zod e grava atomicamente o `site-content.json`, atualizando seções ativas/desativadas, textos e categorias. |
| `POST` | `/api/admin/upload` | Admin | Recebe arquivo multipart e retorna `{ url }`. |

---

## 6. Regras de Cálculo Automatizadas (`CalculadoraService`)

### 6.1. Calculadora de Preço (Júnior, com modalidades)
Sempre que requisitos, tarefas, custos ou parâmetros do projeto mudam, o `CalculadoraService` recalcula. A regra é implementada como funções puras em `client/src/lib/calculadora.ts` (a ser movida para um pacote compartilhado front/back, como o schema Zod).

1. **Horas ajustadas** — cada requisito pesa pela **sua própria** complexidade; `WONT_HAVE` fica fora do escopo:
   $$H_{aj} = \sum_{r \notin \text{Won't}} \text{horas}_r \times m(\text{complexidade}_r) \qquad m: \text{BAIXA}=1{,}00,\ \text{MEDIA}=1{,}25,\ \text{ALTA}=1{,}50$$
   Sem requisitos cadastrados, usa `projetos.horas_estimadas × m(complexidade_geral)`.
   *Mudança em relação à versão anterior:* o multiplicador global era aplicado sobre horas que já refletiam a complexidade de cada requisito, contando-a duas vezes.
2. **Margem para imprevistos** (fator de segurança Jr, padrão `1.30` = +30%): $H_{prev} = H_{aj} \times \text{fator}$
3. **Mão de obra (valor de mercado):** $M = H_{prev} \times \text{valor\_hora\_base}$
4. **Modalidade de cobrança** (`modalidade_cobranca`):
   - `PAGO` → cobrada $= M$
   - `DESCONTO` → cobrada $= M \times (1 - \text{desconto\_percentual}/100)$
   - `GRATUITO` (pro bono) → cobrada $= 0$; **valor doado** $= M$. `contrapartida` registra o que se recebe em troca.
5. **Impostos "por dentro"** (`impostos_percentual`, padrão 0 — MEI paga DAS fixo): $\text{Preço} = \text{cobrada} / (1 - t)$, para que o líquido fique igual à mão de obra cobrada.
6. **Custos do cliente** (`custos_projetos.pago_por = CLIENTE`) ficam **fora** do preço da mão de obra e aparecem separados: implantação (únicos) e recorrente mensal (mensais + anuais ÷ 12).
   **Total para começar** $= \text{Preço} + \text{custos únicos do cliente}$. Num projeto gratuito, o cliente paga só os custos dele.
7. `orcamento_calculado` guarda o Preço; `orcamento_cobrado` é o valor fechado de fato (o admin pode aceitar o sugerido, arredondado a R$ 10).

### 6.2. Resultado Real
- **Horas gastas:** soma de `tarefas_projetos.horas_gastas` (se houver lançamentos); senão, `projetos.horas_gastas`.
- **Receita líquida:** $\text{orcamento\_cobrado} \times (1 - t)$
- **Resultado:** receita líquida $- \sum$ custos pagos pelo `DESENVOLVEDOR`
- **Valor-hora real:** resultado ÷ horas gastas (comparado ao valor-hora base)
- **Valor doado até agora** (`GRATUITO`/`DESCONTO`): $\max(0,\ \text{horas gastas} \times \text{valor\_hora\_base} - \text{receita líquida})$
- Em projeto gratuito, o painel mostra **horas doadas**, **valor doado** e **seu investimento** (custos pagos por você) no lugar de lucro.

### 6.3. Progresso Automático por Níveis
- O progresso do projeto é a razão percentual ($0\%$ a $100\%$) entre itens marcados como `concluido = true` em `checklist_tarefas` pelo total de itens do projeto (ou razão de macro-tarefas concluídas caso não haja sub-itens).

---

## 7. Roteiro Gradual de Construção do Backend em NestJS Modular

- [x] **Passo 1:** Inicializar o projeto NestJS em `./app` (`nest new`), com Vitest, Oxlint e Prettier.
- [x] **Passo 2:** Configurar `@nestjs/config` + `env.ts` (Zod), `PORT=3333`, prefixo global `/api`, CORS (`credentials: true`) e `cookie-parser` no `main.ts`; `.env` apontando para o container PostgreSQL (`localhost:15432`).
- [x] **Passo 3:** Criar `prisma/schema.prisma` com as **17 tabelas** baseadas em [`docs/back/schema.sql`](file:///home/tanaka/dev/projetos/personal/site-portifolio/docs/back/schema.sql), rodar `prisma migrate dev` e criar o `PrismaModule` global + `prisma/seed.ts`.
- [ ] **Passo 4:** Implementar o `AuthModule`: JWT em cookie HTTP-Only, `JwtAuthGuard` global, decorator `@Public()`, suporte a 2FA TOTP e registro/login via **Passkeys / WebAuthn (`admin_dispositivos`)**.
- [ ] **Passo 5:** Implementar `SiteConfigModule` (`/api/admin/site-config` com o schema Zod compartilhado do `site-content.json`) e `StorageModule` (`/api/admin/upload`).
- [ ] **Passo 6:** Implementar `PublicModule`, `TicketsModule` (Ideias anônimas com `HoneypotGuard` + Ideias manuais do Admin + conversão atômica `prisma.$transaction`) e `ClientesModule` (criação direta de clientes).
- [ ] **Passo 7:** Implementar `ProjetosModule`, `EngenhariaModule`, `CalculadoraModule`, `FinanceiroModule`, `TarefasModule` e `PortalModule` (`/api/portal/:token` com `PortalTokenGuard`).
- [ ] **Passo 8:** Implementar `ChamadosModule` (`/api/admin/chamados` e `/api/portal/:token/chamados`): abertura de chamados de manutenção/alteração pelo link do projeto, interações e conversão em Tarefa.
- [ ] **Passo 9:** Implementar `FilaEsperaModule` e documentação OpenAPI com `@nestjs/swagger` em `/api/docs`.
