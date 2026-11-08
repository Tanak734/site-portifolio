# 🛠️ Documentação Oficial do Backend (`@portfolio/server`)

> **Propósito deste Documento:** Servir como contexto completo e guia passo a passo para o desenvolvimento gradual da API Backend, modelagem do banco de dados PostgreSQL, regras de negócio, engenharia de requisitos, avaliação arquitetural e calculadora de custos.

---

## 1. Ideia do Projeto e Visão Geral

Esta plataforma não é apenas um site de portfólio estático, nem apenas um CRUD administrativo. Trata-se de uma **Plataforma Pessoal Integrada de Gestão de Projetos, Engenharia de Requisitos, Avaliação de Arquitetura de Software e Portfólio Comercial** para um desenvolvedor único (Admin Solo).

### Objetivos Centrais:
1. **Comercial (Portfólio & Captação):** Receber pedidos de orçamento (Tickets) de potenciais clientes com proteção anti-spam e notificações imediatas.
2. **Operacional (CRM & Gestão):** Gerenciar o ciclo de vida completo desde a ideia inicial até a entrega final, incluindo controle de custos, fontes de preço, parcelas de pagamento e portal de acompanhamento para o cliente.
3. **Engenharia de Software (Requisitos & Arquitetura):** Estruturar requisitos (RF, RNF, Regras de Negócio, Restrições), rodar um motor determinístico de recomendação de stack/arquitetura (BI) e documentar decisões técnicas via ADRs (*Architecture Decision Records*).

---

## 2. O Ciclo Completo de Funcionamento (As 7 Etapas)

O sistema opera em um fluxo cronológico de **7 etapas**, garantindo que o desenvolvedor não gaste horas fazendo engenharia pesada antes de o cliente validar a proposta inicial:

```mermaid
flowchart TD
    subgraph FASE 1: PRÉ-VENDA NO TICKET
        E1["Etapa 1: Entrada do Ticket\n(Lead envia ideia pelo formulário do site)"] --> E2["Etapa 2: Conversa Inicial\n(Alinhamento via WhatsApp/Reunião)"]
        E2 --> E3["Etapa 3: MVP de Validação\n(Esboço/protótipo rápido para validar a ideia com o lead)"]
    end

    E3 -->|Lead Aprovou a Ideia!| E4

    subgraph FASE 2: CONVERSÃO EM CLIENTE E PROJETO
        E4["Etapa 4: Conversão Atômica\n(Cria CLIENTE oficial + Cria PROJETO no banco)"]
    end

    E4 --> E5A

    subgraph FASE 3: ENGENHARIA E PRECIFICAÇÃO (DENTRO DO PROJETO)
        E5A["Etapa 5.1: Engenharia de Requisitos\n(RF, RNF, Regras de Negócio, MoSCoW e Dúvidas)"] --> E5B["Etapa 5.2: Avaliação Arquitetural (BI)\n(Matriz de pesos determinística, escolha de Stack e ADRs)"]
        E5B --> E5C["Etapa 5.3: Calculadora Júnior & Custos\n(Horas × Margem Jr × Complexidade + Custos de Infra com fontes)"]
    end

    E5C --> E6

    subgraph FASE 4: EXECUÇÃO, PORTAL DO CLIENTE E VITRINE
        E6["Etapa 6: Execução do Projeto\n(Status: EM_ANDAMENTO | INATIVO | CONCLUIDO)\nTarefas Nível 1 + Checklists Nível 2 + Portal (/status/:token)"] --> E7["Etapa 7: Publicação no Portfólio\n(Exibe case público ou confidencial sob NDA + Depoimento)"]
    end
```

---

## 3. Arquitetura Técnica do Servidor (`./server`)

- **Runtime & Linguagem:** Node.js + TypeScript
- **Framework HTTP:** Fastify
- **Banco de Dados:** PostgreSQL 17 (Container Docker na porta `15432` em dev)
- **ORM:** Prisma Client
- **Validação:** Zod
- **Segurança & Auth:** Argon2 (hash de senha), `@fastify/jwt` + `@fastify/cookie` (sessão em Cookie HTTP-only), `@fastify/cors`, `@fastify/rate-limit`.
- **Uploads:** `@fastify/multipart` + `@fastify/static` (disco local `./uploads` em dev ou Cloudflare R2 em produção).
- **Notificações:** Nodemailer (SMTP) + Webhook (Discord/Telegram).

### Estrutura de Pastas do Backend

```text
server/
├── package.json
├── tsconfig.json
├── .env
├── uploads/                      # Arquivos de imagem e comprovantes locais
├── prisma/
│   ├── schema.prisma             # Modelagem das 14 tabelas no PostgreSQL
│   └── seed.ts                   # Criação do Admin inicial
└── src/
    ├── env.ts                    # Validação de variáveis de ambiente com Zod
    ├── server.ts                 # Bootstrap do Fastify e registro de plugins
    ├── lib/
    │   └── prisma.ts             # Instância singleton do PrismaClient
    ├── middlewares/
    │   ├── verify-jwt.ts         # Proteção das rotas /api/admin/*
    │   └── honeypot.ts           # Anti-bot para o formulário público de tickets
    ├── services/
    │   ├── calculator.service.ts # Lógica da Calculadora de Esforço Jr e Progresso
    │   ├── mail.service.ts       # Disparo de e-mails (Nodemailer)
    │   ├── webhook.service.ts    # Notificação instantânea no Discord/Telegram
    │   └── storage.service.ts    # Upload de imagens e comprovantes
    └── routes/
        ├── index.ts
        ├── auth.routes.ts
        ├── public.routes.ts
        ├── portal.routes.ts
        ├── tickets.routes.ts
        ├── clientes.routes.ts
        ├── projetos.routes.ts
        ├── engenharia.routes.ts  # Requisitos, Dúvidas, Avaliação de Stack e ADRs
        ├── financeiro.routes.ts  # Custos e Pagamentos
        ├── tarefas.routes.ts     # Macro-tarefas (Nível 1) e Checklists (Nível 2)
        └── site-config.routes.ts # Leitura e gravação do site-content.json
```

---

## 4. Modelagem do Banco de Dados PostgreSQL (14 Tabelas)

> **Nota de Arquitetura:** As informações estáticas de apresentação do desenvolvedor (bio, textos da Home, objetivos profissionais e catálogo de skills categorizadas) ficam no arquivo `site-content.json`. O banco de dados PostgreSQL armazena **exclusivamente dados transacionais, operacionais e de engenharia**.

### Script SQL Completo (DDL PostgreSQL)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. ENUMS DO SISTEMA
-- ========================================================

CREATE TYPE status_ticket AS ENUM (
    'NOVO',
    'EM_CONVERSA',
    'MVP_EM_ELABORACAO',
    'MVP_APRESENTADO',
    'ACEITO_CONVERTIDO',
    'DESISTENCIA'
);

CREATE TYPE status_projeto AS ENUM (
    'EM_ANDAMENTO',
    'INATIVO',
    'CONCLUIDO'
);

CREATE TYPE complexidade_nivel AS ENUM (
    'BAIXA',
    'MEDIA',
    'ALTA'
);

CREATE TYPE tipo_requisito AS ENUM (
    'FUNCIONAL',
    'NAO_FUNCIONAL',
    'REGRA_NEGOCIO',
    'RESTRICAO_TECNICA'
);

CREATE TYPE prioridade_moscow AS ENUM (
    'MUST_HAVE',
    'SHOULD_HAVE',
    'COULD_HAVE',
    'WONT_HAVE'
);

CREATE TYPE status_duvida AS ENUM (
    'PENDENTE',
    'RESPONDIDA',
    'CANCELADA'
);

CREATE TYPE status_adr AS ENUM (
    'PROPOSTO',
    'ACEITO',
    'REJEITADO',
    'SUBSTITUIDO'
);

CREATE TYPE categoria_custo AS ENUM (
    'INFRAESTRUTURA',
    'DOMINIO_DNS',
    'APIS_SERVICOS',
    'SEGURANCA_BACKUP',
    'ASSETS_DESIGN',
    'LICENCAS_SOFTWARE',
    'COMUNICACAO_EMAIL',
    'MARKETING_ANALYTICS',
    'TERCEIRIZACAO',
    'IMPOSTOS_TAXAS',
    'OUTROS'
);

CREATE TYPE tipo_recorrencia_custo AS ENUM ('UNICO', 'MENSAL', 'ANUAL');
CREATE TYPE responsavel_custo AS ENUM ('CLIENTE', 'DESENVOLVEDOR');
CREATE TYPE status_pagamento AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');
CREATE TYPE autor_comentario AS ENUM ('CLIENTE', 'ADMIN');

-- ========================================================
-- 2. TABELAS DO SISTEMA (14 TABELAS)
-- ========================================================

-- 2.1. Administrador (Conta Única)
CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2. Clientes (CRM — Criados na Etapa 4 após aceite do Ticket)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    empresa VARCHAR(255),
    telefone VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    documento VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3. Tickets (Etapas 1 a 3 — Entrada do Lead, Conversa e MVP)
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    empresa_nome VARCHAR(255),
    cliente_telefone VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255),
    ideia_inicial TEXT NOT NULL,
    orcamento_previo_cliente VARCHAR(100),
    status status_ticket DEFAULT 'NOVO',
    notas_conversa TEXT,
    resumo_mvp TEXT,
    link_prototipo_mvp VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.4. Projetos (Etapas 4 a 7 — Hub Central de Gestão, BI e Portfólio)
CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    ticket_id INTEGER UNIQUE REFERENCES tickets(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    categoria_projeto VARCHAR(100),

    -- Parâmetros da Calculadora Júnior & Esforço (Etapa 5.3)
    complexidade_geral complexidade_nivel DEFAULT 'MEDIA',
    fator_seguranca_jr NUMERIC(4, 2) DEFAULT 1.30,
    valor_hora_base NUMERIC(10, 2) DEFAULT 50.00,
    horas_estimadas NUMERIC(6, 2) DEFAULT 0,
    horas_gastas NUMERIC(6, 2) DEFAULT 0,
    orcamento_calculado NUMERIC(10, 2),
    orcamento_cobrado NUMERIC(10, 2),

    -- Execução & Portal do Cliente (Etapa 6)
    status status_projeto DEFAULT 'EM_ANDAMENTO',
    progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    start_date DATE,
    end_date DATE,
    notas_internas TEXT,
    codigo_rastreio VARCHAR(64) UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text),
    cliente_pode_comentar BOOLEAN DEFAULT TRUE,

    -- Vitrine Pública no Portfólio & Sigilo (Etapa 7)
    is_publico BOOLEAN DEFAULT FALSE,
    is_confidencial BOOLEAN DEFAULT FALSE,
    is_destaque BOOLEAN DEFAULT FALSE,
    resumo_nome VARCHAR(255),
    descricao TEXT,
    stacks_utilizadas VARCHAR(255),
    imagem_url VARCHAR(500),
    live_url VARCHAR(500),
    github_url VARCHAR(500),
    figma_url VARCHAR(500),
    video_url VARCHAR(500), -- vídeo de demonstração no modal do portfólio (MP4 ou YouTube)
    ordem INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.5. Engenharia de Requisitos (Etapa 5.1)
CREATE TABLE requisitos_projetos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    codigo VARCHAR(20),
    tipo tipo_requisito NOT NULL DEFAULT 'FUNCIONAL',
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    prioridade prioridade_moscow DEFAULT 'MUST_HAVE',
    complexidade complexidade_nivel DEFAULT 'MEDIA',
    horas_estimadas NUMERIC(5, 2) DEFAULT 0,
    implementado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.6. Dúvidas e Alinhamentos do Projeto (Etapa 5.1)
CREATE TABLE duvidas_projetos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    requisito_id INTEGER REFERENCES requisitos_projetos(id) ON DELETE SET NULL,
    duvida TEXT NOT NULL,
    resposta TEXT,
    status status_duvida DEFAULT 'PENDENTE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.7. Avaliação Arquitetural & BI de Stack (Etapa 5.2)
CREATE TABLE avaliacoes_arquiteturais (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL UNIQUE REFERENCES projetos(id) ON DELETE CASCADE,
    padrao_arquitetural VARCHAR(100),
    linguagem_escolhida VARCHAR(100),
    framework_escolhido VARCHAR(100),
    banco_escolhido VARCHAR(100),
    criterios_pesos JSONB DEFAULT '{}'::jsonb,
    alternativas_comparadas JSONB DEFAULT '[]'::jsonb,
    justificativa_escolha TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.8. ADRs — Architecture Decision Records (Etapa 5.2)
CREATE TABLE adrs (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    status status_adr DEFAULT 'ACEITO',
    contexto TEXT NOT NULL,
    decisao TEXT NOT NULL,
    consequencias TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_adrs_projeto_numero UNIQUE (projeto_id, numero)
);

-- 2.9. Custos de Infraestrutura & Fontes de Preço (Etapa 5.3)
CREATE TABLE custos_projetos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    categoria_custo categoria_custo NOT NULL,
    tipo_recorrencia tipo_recorrencia_custo DEFAULT 'UNICO',
    pago_por responsavel_custo DEFAULT 'CLIENTE',
    valor NUMERIC(10, 2) NOT NULL,
    link_fonte VARCHAR(500),
    comprovante_url VARCHAR(500),
    data_custo DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.10. Pagamentos & Parcelas (Etapa 5.3)
CREATE TABLE pagamentos_projetos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status status_pagamento DEFAULT 'PENDENTE',
    comprovante_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.11. Tarefas do Projeto — Nível 1 Macro (Etapa 6)
CREATE TABLE tarefas_projetos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    requisito_id INTEGER REFERENCES requisitos_projetos(id) ON DELETE SET NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    concluida BOOLEAN DEFAULT FALSE,
    visivel_cliente BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.12. Checklist de Tarefas — Nível 2 Micro (Etapa 6)
CREATE TABLE checklist_tarefas (
    id SERIAL PRIMARY KEY,
    tarefa_id INTEGER NOT NULL REFERENCES tarefas_projetos(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    concluido BOOLEAN DEFAULT FALSE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.13. Comentários do Portal do Cliente (Etapa 6)
CREATE TABLE comentarios_projetos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    tarefa_id INTEGER REFERENCES tarefas_projetos(id) ON DELETE SET NULL,
    autor autor_comentario NOT NULL,
    mensagem TEXT NOT NULL,
    anexo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.14. Avaliações & Depoimentos (Etapa 7 — 1 por Projeto)
CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    projeto_id INTEGER UNIQUE REFERENCES projetos(id) ON DELETE SET NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_cargo VARCHAR(255),
    empresa_nome VARCHAR(255),
    depoimento TEXT NOT NULL,
    nota INTEGER DEFAULT 5 CHECK (nota >= 1 AND nota <= 5),
    is_publicado BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_cliente ON tickets(cliente_id);
CREATE INDEX idx_projetos_status ON projetos(status);
CREATE INDEX idx_projetos_cliente ON projetos(cliente_id);
CREATE INDEX idx_projetos_rastreio ON projetos(codigo_rastreio);
CREATE INDEX idx_requisitos_projeto ON requisitos_projetos(projeto_id);
CREATE INDEX idx_duvidas_projeto ON duvidas_projetos(projeto_id);
CREATE INDEX idx_adrs_projeto ON adrs(projeto_id);
CREATE INDEX idx_custos_projeto ON custos_projetos(projeto_id);
CREATE INDEX idx_pagamentos_projeto ON pagamentos_projetos(projeto_id);
CREATE INDEX idx_tarefas_projeto ON tarefas_projetos(projeto_id);
CREATE INDEX idx_tarefas_requisito ON tarefas_projetos(requisito_id);
CREATE INDEX idx_checklist_tarefa ON checklist_tarefas(tarefa_id);
CREATE INDEX idx_comentarios_projeto ON comentarios_projetos(projeto_id);
```

---

## 5. Especificação dos Endpoints da API REST

### 5.1. Autenticação (`/api/auth`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público | Valida credenciais (`argon2`) e seta Cookie HTTP-only com token JWT. |
| `POST` | `/api/auth/logout` | Admin | Limpa o cookie de autenticação. |
| `GET` | `/api/auth/me` | Admin | Retorna os dados do admin logado: `{ id, nome, email }` (o frontend usa essa rota para validar a sessão no servidor). |

> **Cookie da sessão:** `HttpOnly`, `SameSite=Lax`, `Secure` em produção e `Domain=.tanaka.dev` quando site e API estiverem em subdomínios diferentes. O frontend repassa os cookies recebidos para `/api/auth/me` e `/api/admin/*`.

### 5.2. Rotas Públicas (`/api/public`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/projetos` | Público | Lista projetos com `is_publico = true` ordenados por `ordem ASC`. Para `is_confidencial = true`, **não retornar** `live_url`, `github_url`, `figma_url`, `imagem_url` nem `video_url`. |
| `GET` | `/api/public/avaliacoes`| Público | Lista depoimentos com `is_publicado = true`, mais recentes primeiro. Retorna `id, cliente_nome, cliente_cargo, empresa_nome, depoimento, nota, created_at` + **JOIN** com `projetos`: `projeto_nome` (`projetos.nome`) e `projeto_entrega` (`projetos.end_date`). |
| `POST` | `/api/public/tickets` | Público | **(Rate limit + Honeypot)** Cria ticket como `NOVO` e dispara e-mail/webhook. Campo honeypot: **`website`** (preenchido → descartar silenciosamente). |

> **Coluna nova usada pelo modal de projeto:** `projetos.video_url VARCHAR(500)` (MP4 ou link do YouTube). Ver `schema.sql`.

### 5.3. Portal do Cliente (`/api/portal/:token`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/portal/:token` | Token | Retorna progresso, tarefas com `visivel_cliente = true`, custos com `link_fonte`, parcelas e comentários (oculta notas internas e margem). |
| `POST` | `/api/portal/:token/comentarios` | Token | Cliente adiciona comentário/dúvida sobre o projeto ou tarefa específica. |

### 5.4. Gestão de Tickets & Conversão (`/api/admin/tickets`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/tickets` | Admin | Lista todos os tickets ordenados por mais recente (filtro por `status`). |
| `PATCH`| `/api/admin/tickets/:id` | Admin | Atualiza `notas_conversa`, `resumo_mvp`, `link_prototipo_mvp` e `status`. |
| `POST` | `/api/admin/tickets/:id/converter` | Admin | **Transação Atômica:** Cria o `Cliente`, cria o `Projeto` vinculado e muda o ticket para `ACEITO_CONVERTIDO`. |

### 5.5. Clientes & Projetos (`/api/admin`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/clientes` | Admin | Lista clientes cadastrados e histórico de projetos de cada um. |
| `POST` | `/api/admin/clientes` | Admin | Cadastra cliente manualmente. |
| `GET` | `/api/admin/projetos` | Admin | Lista projetos (`EM_ANDAMENTO`, `INATIVO`, `CONCLUIDO`). |
| `POST` | `/api/admin/projetos` | Admin | Cria novo projeto (pessoal ou de cliente). |
| `GET` | `/api/admin/projetos/:id` | Admin | Retorna visão 360º do projeto com todos os módulos relacionados. |
| `PATCH`| `/api/admin/projetos/:id` | Admin | Atualiza status, calculadora Jr, datas, links e visibilidade pública/NDA. |

### 5.6. Engenharia de Requisitos, Arquitetura & BI (`/api/admin/projetos/:id`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/requisitos` | Admin | Cadastra requisito (`FUNCIONAL`, `NAO_FUNCIONAL`, `REGRA_NEGOCIO`, `RESTRICAO_TECNICA`) e recalcula `horas_estimadas` do projeto. |
| `PATCH`| `/requisitos/:reqId` | Admin | Edita requisito ou marca `implementado = true`. |
| `DELETE`| `/requisitos/:reqId` | Admin | Remove requisito. |
| `POST` | `/duvidas` | Admin | Registra dúvida técnica vinculada ao projeto/requisito. |
| `PATCH`| `/duvidas/:duvId` | Admin | Registra a resposta do cliente e muda status para `RESPONDIDA`. |
| `PUT` | `/avaliacao-arquitetural`| Admin | Cria ou atualiza a matriz de avaliação de stack e justificativa técnica. |
| `POST` | `/adrs` | Admin | Registra nova decisão arquitetural (ADR-001, ADR-002...). |

### 5.7. Custos, Pagamentos e Tarefas em 2 Níveis (`/api/admin`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/projetos/:id/custos` | Admin | Adiciona custo com categoria, recorrência, pagador e `link_fonte`. |
| `POST` | `/projetos/:id/pagamentos`| Admin | Cadastra parcela de pagamento. |
| `PATCH`| `/pagamentos/:pagId` | Admin | Marca parcela como `PAGO` e salva comprovante. |
| `POST` | `/projetos/:id/tarefas` | Admin | Cria macro-tarefa (Nível 1) vinculada opcionalmente a um requisito. |
| `POST` | `/tarefas/:tarefaId/checklists` | Admin | Cria item de checklist (Nível 2) dentro da macro-tarefa. |
| `PATCH`| `/checklists/:itemId/toggle` | Admin | Alterna `concluido` e atualiza automaticamente o `progresso` (0-100%) do projeto. |

### 5.8. Configuração JSON & Uploads (`/api/admin`)
| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/site-config` | Admin | Lê o arquivo `site-content.json`. |
| `PUT` | `/site-config` | Admin | Valida com Zod e atualiza o arquivo `site-content.json`. |
| `POST` | `/upload` | Admin | Recebe arquivo multipart e retorna `{ url }`. |

### 5.9. Fila de Espera "Avise-me" (🕒 Planejado)
> Usada quando `disponivel_para_novos_projetos = false`. Frontend descrito em `docs/front/docs-frontend.md` §4.4.

**Tabela (15ª, planejada) — `fila_espera`:**
```sql
CREATE TYPE status_fila AS ENUM ('AGUARDANDO', 'NOTIFICADO', 'CONVERTIDO', 'CANCELADO');

CREATE TABLE fila_espera (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    ideia_resumo VARCHAR(500),
    status status_fila DEFAULT 'AGUARDANDO',
    consentimento_lgpd BOOLEAN NOT NULL DEFAULT FALSE,
    token_cancelamento VARCHAR(64) UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text),
    ticket_id INTEGER UNIQUE REFERENCES tickets(id) ON DELETE SET NULL, -- preenchido ao converter
    notificado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Um e-mail só pode estar uma vez aguardando (pode voltar depois de notificado/cancelado)
CREATE UNIQUE INDEX uq_fila_email_aguardando ON fila_espera (lower(email)) WHERE status = 'AGUARDANDO';
CREATE INDEX idx_fila_status_ordem ON fila_espera (status, created_at);
```

| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/public/fila-espera` | Público | **(Rate limit + Honeypot)** Entra na fila. Exige `consentimento_lgpd = true`. E-mail já aguardando → retorna a posição atual em vez de duplicar. Responde `{ posicao }`. |
| `GET` | `/api/public/fila-espera/cancelar/:token` | Token | Sai da fila (`CANCELADO`). Link enviado em todo e-mail. |
| `GET` | `/api/admin/fila-espera` | Admin | Lista a fila por `created_at ASC`, com filtro por `status`. |
| `POST` | `/api/admin/fila-espera/notificar` | Admin | Body `{ quantidade: N }`. Envia e-mail às **N primeiras** `AGUARDANDO` e marca `NOTIFICADO` + `notificado_em`. |
| `POST` | `/api/admin/fila-espera/:id/converter` | Admin | Cria um `ticket` (`NOVO`) com os dados da fila e marca `CONVERTIDO`. |

---

## 6. Regras de Cálculo Automatizadas no Backend

### 6.1. Calculadora de Precificação para Desenvolvedor Júnior
Sempre que requisitos ou parâmetros do projeto forem atualizados, o serviço calcula:
- **Multiplicador de Complexidade:** `BAIXA` = `1.0`, `MEDIA` = `1.25`, `ALTA` = `1.50`
- **Fórmula:**
  $$\text{Orçamento Calculado} = \Big(\text{Horas Estimadas} \times \text{Fator Segurança Jr (1.30)} \times \text{Valor Hora Base}\Big) \times \text{Multiplicador de Complexidade}$$

### 6.2. Rentabilidade Real por Hora
- **Lucro Líquido do Dev:** $\text{Orçamento Cobrado} - \sum \text{Custos pagos pelo DESENVOLVEDOR}$
- **Valor da Hora Real:** $\frac{\text{Lucro Líquido}}{\text{Horas Gastas}}$

### 6.3. Progresso Automático por Níveis
- O progresso do projeto é a razão entre itens concluídos em `checklist_tarefas` pelo total de itens do projeto (ou razão de macro-tarefas concluídas caso não haja sub-itens).

### 6.4. Notificação da Fila de Espera (🕒 Planejado)
- **Posição na fila:** `COUNT(*)` de registros `AGUARDANDO` com `created_at` menor ou igual ao do inscrito (não é armazenada, é calculada).
- **Disparo FIFO controlado:** o admin informa quantas vagas abriu (`N`) e só as N primeiras pessoas recebem o e-mail, evitando mais pedidos do que é possível atender.
- **Envio:** `mail.service.ts` (Nodemailer), um e-mail por pessoa, com link para o formulário de orçamento (`/#contato`) e o link de cancelamento (`/fila/cancelar/:token`).
- **Idempotência:** a atualização para `NOTIFICADO` e o envio rodam dentro de uma transação com `SELECT ... FOR UPDATE SKIP LOCKED`, para que dois cliques não notifiquem a mesma pessoa duas vezes.
- **LGPD:** só guarda o necessário; quem cancela ou é convertido pode ter `nome`/`ideia_resumo` anonimizados depois de X dias.

---

## 7. Roteiro Gradual de Construção do Backend (Passo a Passo)

- [ ] **Passo 1:** Inicializar `server/package.json`, `tsconfig.json` e `.env` apontando para o container PostgreSQL (`localhost:15432`).
- [ ] **Passo 2:** Criar `server/prisma/schema.prisma` com as 14 tabelas e rodar `pnpm db:push` / `pnpm db:migrate`.
- [ ] **Passo 3:** Criar `server/prisma/seed.ts` para popular a conta única de Admin.
- [ ] **Passo 4:** Criar `src/env.ts`, `src/lib/prisma.ts` e subir o servidor básico em `src/server.ts` com rota `/api/health`.
- [ ] **Passo 5:** Implementar autenticação JWT via Cookie HTTP-only (`auth.routes.ts` e `verify-jwt.ts`).
- [ ] **Passo 6:** Implementar rotas públicas e captura de Tickets com Honeypot e envio de e-mail (`public.routes.ts`).
- [ ] **Passo 7:** Implementar gestão de Tickets e a rota de conversão atômica em Cliente + Projeto (`tickets.routes.ts`).
- [ ] **Passo 8:** Implementar rotas de Engenharia (Requisitos, Dúvidas, Avaliação Arquitetural, ADRs e Calculadora Jr).
- [ ] **Passo 9:** Implementar rotas de Tarefas em 2 níveis, Custos, Pagamentos e Portal do Cliente (`/api/portal/:token`).
- [ ] **Passo 10:** Implementar leitura/escrita do `site-content.json` e upload de arquivos.
- [ ] **Passo 11 (planejado):** Implementar a Fila de Espera (§5.9 e §6.4): tabela `fila_espera`, rotas públicas com rate limit/honeypot, disparo FIFO de e-mails e conversão em ticket.
