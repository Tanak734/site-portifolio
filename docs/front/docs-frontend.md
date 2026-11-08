# 💻 Documentação Oficial do Frontend (`@portfolio/client`)

> **Stack Definida:** Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, **shadcn/ui** e Lucide Icons.
> **Propósito deste Documento:** Servir como contexto completo e guia passo a passo para o desenvolvimento gradual do Frontend, cobrindo a Landing Page pública (Server Components para SEO máximo), o Portal do Cliente (`/status/[token]`) e o Painel Administrativo estilo SaaS/ERP (`/admin/*`).

---

## 1. Por que Next.js + React + shadcn/ui?

Como o projeto evoluiu de um simples portfólio estático para uma **Plataforma Completa de Gestão de Projetos, Engenharia de Requisitos, Avaliação Arquitetural (BI) e Calculadora de Custos**, o **Next.js (App Router)** oferece o melhor dos dois mundos usando **uma única sintaxe (`.tsx`)**:

1. **Na Página Pública (`/`):** Utiliza **React Server Components (RSC)** para renderizar a página no servidor lendo o `site-content.json` com zero JavaScript desnecessário, garantindo **SEO nota 100** e carregamento instantâneo.
2. **No Portal do Cliente (`/status/[token]`) e Painel Admin (`/admin/*`):** Utiliza **Client Components** ricos com navegação SPA fluida, gerenciamento de estado reativo e componentes prontos de alta qualidade do **shadcn/ui** (Tabs, Dialogs, Tables, Badges, Progress, Forms) para construir a Calculadora Júnior, a Matriz de BI e os Checklists em 2 níveis com máxima velocidade.

---

## 2. Arquitetura de Pastas e Rotas (`./client` — Next.js App Router)

```text
client/
├── package.json
├── next.config.ts
├── tsconfig.json
├── components.json                   # Configuração do shadcn/ui
├── .env.local                        # NEXT_PUBLIC_API_URL="http://localhost:3333"
└── src/
    ├── data/
    │   └── site-content.json         # Fonte única da verdade para textos, bio, objetivos e skills
    ├── lib/
    │   ├── api.ts                    # Cliente HTTP configurado com credentials: 'include'
    │   └── utils.ts                  # Helper cn() do Tailwind / shadcn
    ├── components/
    │   ├── ui/                       # Componentes base do shadcn/ui (button, card, tabs, dialog, etc.)
    │   ├── public/                   # Componentes da Landing Page (/)
    │   │   ├── Navbar.tsx
    │   │   ├── HeroSection.tsx
    │   │   ├── TextRotator.tsx       # ("use client") Efeito de palavras sequenciais
    │   │   ├── SkillMarquee.tsx      # Fita infinita de ícones (skillicons.dev)
    │   │   ├── SkillsCatalog.tsx     # Habilidades e conceitos separados por categoria
    │   │   ├── ObjectivesSection.tsx # Seção de objetivos profissionais e foco atual
    │   │   ├── ProjectCard.tsx       # Card com badges de stack, link direto e suporte a NDA
    │   │   ├── Testimonials.tsx
    │   │   └── TicketForm.tsx        # ("use client") Formulário de orçamento com Honeypot
    │   ├── portal/                   # Componentes do Portal do Cliente (/status/[token])
    │   │   ├── ProgressHeader.tsx
    │   │   ├── ClientTaskList.tsx
    │   │   ├── CostTransparencyTable.tsx
    │   │   └── ClientCommentBox.tsx  # ("use client") Chat de comentários do cliente
    │   └── admin/                    # Componentes do Painel SaaS (/admin/*)
    │       ├── AdminSidebar.tsx
    │       ├── TicketKanban.tsx      # Triagem, anotações de MVP e botão de conversão
    │       ├── ProjectHub.tsx        # Hub com 6 abas (Geral, Requisitos, BI/ADR, Calculadora, Tarefas, Custos)
    │       ├── JuniorCalculator.tsx  # Calculadora interativa em tempo real
    │       ├── TaskLevelManager.tsx  # Gestão de Tarefas (Nível 1) e Checklists (Nível 2)
    │       └── SiteConfigEditor.tsx  # Editor visual do site-content.json
    └── app/
        ├── globals.css               # @import "tailwindcss" + @keyframes marquee
        ├── layout.tsx                # Root Layout (Fontes, Metadata SEO)
        ├── page.tsx                  # 1. LANDING PAGE PÚBLICA (/)
        ├── status/
        │   └── [token]/
        │       └── page.tsx          # 2. PORTAL DO CLIENTE (/status/:token)
        └── admin/                    # 3. PAINEL ADMINISTRATIVO PRIVADO
            ├── login/
            │   └── page.tsx          # Tela de login (/admin/login)
            └── (painel)/             # Route Group protegido por autenticação
                ├── layout.tsx        # Layout com Sidebar do Admin e verificação de sessão
                ├── page.tsx          # Dashboard Geral (/admin)
                ├── tickets/
                │   └── page.tsx      # Funil de Tickets & MVP (/admin/tickets)
                ├── clientes/
                │   └── page.tsx      # CRM de Clientes (/admin/clientes)
                ├── projetos/
                │   ├── page.tsx      # Lista de Projetos (/admin/projetos)
                │   └── [id]/
                │       └── page.tsx  # Hub Central do Projeto (/admin/projetos/:id)
                └── config/
                    └── page.tsx      # Editor do site-content.json (/admin/config)
```

---

## 3. Fonte de Verdade dos Textos e Skills (`src/data/site-content.json`)

Todo o conteúdo institucional, frases rotativas, objetivos de carreira e catálogo de habilidades ficam neste arquivo (sem duplicar no banco de dados):

```json
{
  "perfil": {
    "nome": "Seu Nome Completo",
    "cargo": "Desenvolvedor Full Stack & Engenheiro de Software",
    "headline": "Transformo sua ideia em",
    "palavras_rotativas": [
      "sistemas escaláveis",
      "sites de alta conversão",
      "MVPs rápidos e funcionais",
      "soluções web sob medida"
    ],
    "subheadline": "Construo aplicações web modernas aliando rigor técnico de engenharia de software a resultados práticos de negócio.",
    "disponivel_para_novos_projetos": true,
    "texto_disponibilidade": "Disponível para novos projetos neste mês",
    "avatar_url": "/images/avatar.jpg",
    "localizacao": "Brasil",
    "cta_principal": {
      "texto": "Solicitar Orçamento / Iniciar Projeto",
      "url": "#contato"
    }
  },

  "objetivos_profissionais": {
    "titulo": "Meus Objetivos & Foco Atual",
    "subtitulo": "Minha visão de carreira e as frentes técnicas em que estou aprofundando minha engenharia.",
    "missao": "Construir software sustentável de alta performance aplicando padrões de projeto, arquitetura limpa e entrega contínua.",
    "metas_atuais": [
      "Aprofundamento em Arquitetura em Camadas, Modularidade e Sistemas Distribuídos",
      "Especialização em ecossistemas de alta produtividade e performance (TypeScript/Fastify e Go)",
      "Aplicação de Engenharia de Requisitos estruturada no ciclo de vida do cliente"
    ],
    "interesses_tecnicos": [
      "Modelagem Relacional Avançada (PostgreSQL)",
      "Processamento Assíncrono e Mensageria",
      "DevOps, Docker e Deploy Automatizado"
    ]
  },

  "links_sociais": [
    { "nome": "GitHub", "url": "https://github.com/seu-user", "icone": "github" },
    { "nome": "LinkedIn", "url": "https://linkedin.com/in/seu-user", "icone": "linkedin" },
    { "nome": "WhatsApp", "url": "https://wa.me/5500000000000", "icone": "message-circle" },
    { "nome": "Currículo PDF", "url": "/docs/curriculo.pdf", "icone": "file-text" }
  ],

  "categorias_skills": [
    {
      "categoria": "Backend & APIs",
      "descricao": "Serviços rápidos, seguros e escaláveis.",
      "items": [
        { "nome": "Fastify", "slug_icone": "fastify", "marquee": true },
        { "nome": "Node.js", "slug_icone": "nodejs", "marquee": true },
        { "nome": "FastAPI", "slug_icone": "fastapi", "marquee": true },
        { "nome": "TypeScript", "slug_icone": "ts", "marquee": true }
      ]
    },
    {
      "categoria": "Bancos de Dados & Persistência",
      "descricao": "Modelagem íntegra e consultas otimizadas.",
      "items": [
        { "nome": "PostgreSQL", "slug_icone": "postgres", "marquee": true },
        { "nome": "SQLite", "slug_icone": "sqlite", "marquee": false },
        { "nome": "Prisma ORM", "slug_icone": "prisma", "marquee": true }
      ]
    },
    {
      "categoria": "Frontend & Interfaces",
      "descricao": "Interfaces modernas com foco em performance e SEO.",
      "items": [
        { "nome": "Next.js", "slug_icone": "nextjs", "marquee": true },
        { "nome": "React", "slug_icone": "react", "marquee": true },
        { "nome": "Tailwind CSS", "slug_icone": "tailwind", "marquee": true }
      ]
    },
    {
      "categoria": "Engenharia & Conceitos",
      "descricao": "Fundamentos que aplico na estruturação das soluções.",
      "items": [
        { "nome": "Arquitetura em Camadas", "slug_icone": null, "marquee": false },
        { "nome": "Engenharia de Requisitos", "slug_icone": null, "marquee": false },
        { "nome": "APIs RESTful & Webhooks", "slug_icone": null, "marquee": false },
        { "nome": "Modelagem Relacional (SQL)", "slug_icone": null, "marquee": false }
      ]
    }
  ],

  "textos_secoes": {
    "skills": {
      "titulo": "Competências & Tecnologias",
      "descricao": "Ferramentas e conceitos que domino e como cada um deles gera valor real para o seu projeto."
    },
    "projetos": {
      "titulo": "Estudos de Caso & Portfólio",
      "descricao": "Sistemas desenvolvidos, decisões arquiteturais tomadas e resultados entregues."
    },
    "depoimentos": {
      "titulo": "Depoimentos & Validações",
      "descricao": "O que clientes reais dizem sobre a entrega dos projetos."
    },
    "ticket_form": {
      "titulo": "Vamos tirar sua ideia do papel?",
      "descricao": "Preencha o formulário abaixo com os detalhes da sua demanda e retornarei em até 24 horas."
    }
  }
}
```

---

## 4. Detalhamento dos Componentes e Telas

### 4.1. Camada Pública (`src/app/page.tsx`)
1. **Hero com Texto Sequencial (`HeroSection.tsx` + `TextRotator.tsx`):**
   - Exibe `perfil.headline` seguido da palavra ativa de `perfil.palavras_rotativas` alternando com transição suave a cada 2.5s.
2. **Barra Animada de Tecnologias (`SkillMarquee.tsx`):**
   - Filtra todos os itens de `categorias_skills` onde `marquee === true`.
   - Renderiza os ícones usando `https://skillicons.dev/icons?i=${slug_icone}` em um carrossel horizontal infinito via CSS `@keyframes`.
3. **Catálogo de Habilidades por Categoria (`SkillsCatalog.tsx`):**
   - Exibe um grid com os grupos (*Backend & APIs*, *Bancos de Dados*, *Frontend*, *Engenharia & Conceitos*).
   - Quando `slug_icone` é `null` (conceitos teóricos), exibe uma `Badge` estilizada do shadcn/ui.
4. **Seção de Objetivos (`ObjectivesSection.tsx`):**
   - Mostra sua missão, metas atuais e interesses técnicos de forma estruturada para recrutadores e clientes.
5. **Vitrine de Projetos (`ProjectsGrid.tsx` + `ProjectCard.tsx` + `ProjectDialog.tsx`):**
   - Busca projetos de `GET /api/public/projetos` (`"use cache"` + `cacheLife('minutes')`).
   - Grid uniforme (3 colunas no desktop): **3 projetos visíveis** e o restante no botão **"Ver mais"**.
   - Transforma a string `stacks_utilizadas` (ex: `"Fastify, PostgreSQL, Docker"`) em badges visuais no card.
   - **Clique no card abre um modal** (`Dialog` do shadcn/ui, fundo com blur) com vídeo (`video_url`: MP4 ou YouTube), descrição, stack e o botão **"Ver projeto ao vivo ↗"** (`live_url`, nova aba). *(Substitui o comportamento anterior de abrir o `live_url` direto pelo card.)*
   - **Modo Confidencial (`is_confidencial = true`):** Exibe o selo `[🔒 Sob NDA]`, oculta imagem, vídeo e links privados, e o modal mostra um aviso de NDA.
6. **Navbar (`Navbar.tsx` + `NavTicker.tsx`):** marca `perfil.marca` (tanaka.dev), faixa com os links das seções e as frases de `perfil.navbar_rotativo` **correndo em loop** (React Bits · LogoLoop, pausa no hover), ícones das redes e CTA "Orçamento".
7. **CTA principal com [Star Border](https://reactbits.dev/c/animations/star-border)** (React Bits) no Hero.
8. **Depoimentos (`Testimonials.tsx` + `TestimonialsCarousel.tsx`):** faixa horizontal com rolagem/snap e setas. Cada card mostra **projeto + data de entrega · data da avaliação**, o depoimento, o **nome em destaque** e uma **ilustração cartoon** gerada no servidor a partir do nome (DiceBear "Notionists", CC0). **Sem nota/estrelas e sem foto.** Consome `created_at`, `projeto_nome` e `projeto_entrega` (ver `docs-backend.md` §5.2).
9. **Contato (`ContactSection.tsx`):** canais diretos (e-mail, LinkedIn, GitHub; **sem WhatsApp público**) + `TicketForm` com honeypot no campo `website`.

### 4.2. Portal do Cliente (`src/app/status/[token]/page.tsx`)
- Consome `GET /api/portal/:token`.
- **Progresso Visual:** Componente `Progress` do shadcn/ui de 0% a 100% refletindo os checklists concluídos.
- **Etapas do Projeto:** Lista as macro-tarefas (`visivel_cliente = true`).
- **Transparência de Custos:** Lista os custos operacionais (servidor, domínio, APIs) com o botão **"Conferir Fonte de Preço ↗"** (`link_fonte`) e resumo do custo único vs. custo mensal.
- **Comentários:** Permite ao cliente enviar feedbacks diretamente para o painel do desenvolvedor (`POST /api/portal/:token/comentarios`).

### 4.3. Painel Administrativo (`src/app/admin/(painel)/projetos/[id]/page.tsx`)
Construído com o componente `Tabs` do **shadcn/ui**, dividindo o Hub Central do projeto em **6 abas**:
1. **Visão Geral & Status:** Altera status (`EM_ANDAMENTO`, `INATIVO`, `CONCLUIDO`), datas e copia o link do Portal do Cliente.
2. **Engenharia de Requisitos & Dúvidas:** Lista e cadastra RFs, RNFs, Regras de Negócio e Restrições com horas estimadas, além da tabela de dúvidas pendentes/respondidas.
3. **Avaliação de Stack (BI) & ADRs:** Formulário de pesos determinísticos para justificar a escolha da linguagem/banco e listagem dos ADRs (*Architecture Decision Records*).
4. **Calculadora Júnior & Financeiro:** Calcula em tempo real o orçamento sugerido ($\text{Horas} \times 1.30 \times \text{Valor Hora} \times \text{Complexidade}$), compara horas estimadas vs. horas reais trabalhadas e gerencia Custos e Parcelas de pagamento.
5. **Tarefas & Checklists (2 Níveis):** Gerencia as Macro-tarefas (Nível 1) e seus Micro-checklists (Nível 2) que atualizam a barra de progresso ao serem marcados.
6. **Publicação no Portfólio:** Preenche `stacks_utilizadas`, `imagem_url`, `live_url`, `video_url`, alterna `is_publico` e `is_confidencial`.

### 4.5. Autenticação do Admin e Acesso em Desenvolvimento (✅ Implementado)
- **Data Access Layer** em `src/lib/auth.ts` (`server-only`): `getAdmin()` / `requireAdmin()`. A sessão é lida dentro de `<Suspense>` (exigência do Cache Components) e **cada leitura de dado do admin chama `requireAdmin()`** (`src/lib/admin-api.ts`), porque layouts não protegem páginas no App Router.
- **Produção:** `POST /api/auth/login` (Fastify) grava o cookie HTTP-only com o JWT; o Next valida repassando os cookies para `GET /api/auth/me`. Logout via `POST /api/auth/logout`. **Requisito de deploy:** site e API no mesmo domínio-pai (ex.: `tanaka.dev` + `api.tanaka.dev`) com cookie `Domain=.tanaka.dev`, para o Next enxergar o cookie. Em `localhost` isso funciona sem configuração (cookies não dependem da porta).
- **Atalhos de desenvolvimento** (só com `NODE_ENV === 'development'`, isto é, `next dev`; ignorados em `next build`/`next start` mesmo com as variáveis setadas):
  - `ADMIN_DEV_BYPASS="true"` no `.env.local` → entra no `/admin` direto, sem tela de login;
  - Botão **"Entrar sem login"** na tela `/admin/login`;
  - **Login mock** (quando `NEXT_PUBLIC_USE_MOCKS="true"`) com `ADMIN_DEV_EMAIL` / `ADMIN_DEV_PASSWORD`.
- A segurança real fica no backend: toda rota `/api/admin/*` deve validar o JWT (`verify-jwt.ts`), independentemente do que o frontend mostra.

### 4.4. Fila de Espera — "Avise-me quando abrir vaga" (🕒 Planejado)

> **Status:** ideia documentada para implementação futura. Nada disso existe no código ainda.

**Problema:** quando não há disponibilidade para novos projetos, o visitante que chega ao site hoje só tem o formulário de orçamento, e o lead se perde. A fila de espera captura esse interesse e o devolve automaticamente quando abrir vaga.

**Gatilho:** `perfil.disponivel_para_novos_projetos = false` no `site-content.json` (editado em `/admin/config`).

**Comportamento na Landing Page (`/`):**
1. **Badge do Hero** troca de "Disponível para novos projetos" para algo como *"Agenda cheia no momento"*.
2. **Botão "Avise-me"** com o componente **[Bell Toggle](https://reactbits.dev/c/micro/bell-toggle)** (React Bits), ao lado ou no lugar do CTA principal. O sino "toca" ao ativar, reforçando a ideia de notificação.
3. O CTA de destaque recebe o **[Star Border](https://reactbits.dev/c/animations/star-border)** (React Bits) para chamar atenção sem poluir a página. *(O Star Border já é usado hoje no CTA principal do Hero.)*
4. Ao clicar, abre um `Dialog` (shadcn/ui) com um mini-formulário:
   - **E-mail** (obrigatório), **Nome** (opcional) e **Resumo da ideia** (opcional, 1 linha);
   - **Consentimento LGPD** (checkbox obrigatório): *"Aceito receber um único e-mail quando houver vaga."*;
   - **Honeypot** igual ao do `TicketForm`.
5. Confirmação: *"Você é o nº **7** da fila. Assim que abrir vaga, você recebe um e-mail."*
6. A seção de contato continua visível: quem quiser pode mandar o ticket mesmo assim.

**Painel Admin (`/admin/fila`):**
- Lista ordenada por chegada (FIFO) com status `AGUARDANDO` · `NOTIFICADO` · `CONVERTIDO` · `CANCELADO`.
- Ação **"Abrir N vagas"**: dispara o e-mail para as **N primeiras** pessoas aguardando (não para a fila inteira, para não receber mais pedidos do que dá para atender).
- Ao virar `disponivel_para_novos_projetos = true` em `/admin/config`, sugerir o disparo ("Há 12 pessoas na fila. Notificar quantas?").
- Botão **"Converter em Ticket"**: cria o ticket com os dados da fila, como no fluxo normal.

**Componentes previstos:**
```text
src/components/public/WaitlistButton.tsx   # ("use client") BellToggle + StarBorder + Dialog
src/components/public/WaitlistForm.tsx     # ("use client") e-mail, nome, ideia, LGPD, honeypot
src/components/admin/WaitlistTable.tsx     # ("use client") lista FIFO + "Abrir N vagas"
src/app/admin/(painel)/fila/page.tsx       # /admin/fila
src/app/fila/cancelar/[token]/page.tsx     # Página de saída da fila (link do e-mail)
```

**Dependências do Bell Toggle:** `motion`, `@hugeicons/react` e `@hugeicons/core-free-icons` (o Star Border não tem dependências).

**API consumida:** ver `docs/back/docs-backend.md` §5.9 (`POST /api/public/fila-espera`, `GET /api/admin/fila-espera`, `POST /api/admin/fila-espera/notificar`).

---

## 5. Wrapper de Conexão com a API (`src/lib/api.ts`)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Envia e recebe o Cookie HTTP-only com o JWT
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Erro de comunicação com o servidor' }));
    throw new Error(err.message || `Erro HTTP ${response.status}`);
  }

  return response.json();
}
```

---

## 6. Roteiro Gradual de Construção do Frontend (Passo a Passo)

- [ ] **Passo 1:** Inicializar o projeto Next.js em `./client` (`pnpm create next-app`), configurar Tailwind CSS e inicializar o **shadcn/ui**.
- [ ] **Passo 2:** Copiar `src/data/site-content.json` e criar o cliente HTTP `src/lib/api.ts`.
- [ ] **Passo 3:** Construir a Home Pública (`Navbar`, `HeroSection` com `TextRotator`, `SkillMarquee`, `SkillsCatalog` e `ObjectivesSection`).
- [ ] **Passo 4:** Construir a seção de Projetos (`ProjectCard` com suporte a NDA e links diretos), Depoimentos e o formulário `TicketForm` com Honeypot.
- [ ] **Passo 5:** Construir a página do Portal do Cliente (`/status/[token]/page.tsx`).
- [ ] **Passo 6:** Construir a tela de Login (`/admin/login/page.tsx`) e o layout protegido `/admin/(painel)/layout.tsx`.
- [ ] **Passo 7:** Construir a tela de Funil de Tickets (`/admin/tickets/page.tsx`) com edição de MVP e botão de conversão em Cliente + Projeto.
- [ ] **Passo 8:** Construir o Hub Central do Projeto (`/admin/projetos/[id]/page.tsx`) com as 6 abas interativas em shadcn/ui.
- [ ] **Passo 9:** Construir o editor visual do `site-content.json` (`/admin/config/page.tsx`).
- [ ] **Passo 10 (planejado):** Implementar a Fila de Espera "Avise-me" (§4.4): `WaitlistButton` com Bell Toggle + Star Border, formulário com LGPD/Honeypot, página `/fila/cancelar/[token]` e painel `/admin/fila`.
