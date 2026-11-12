# 📦 Blueprint Mestre de Transferência, Arquitetura Completa e Prompt de Replicação (`site-pessoal-hub`)

> **Objetivo deste Documento:** Permitir que você transfira, clone ou replique **100% da interface React construída em `./client`** e implemente **toda a arquitetura de negócio e o Backend em TypeScript + NestJS 12 + Prisma ORM + PostgreSQL 17 (Arquitetura Modular Nativa)** em qualquer outro repositório ou sessão de IA, sem perder nenhum detalhe visual ou regra de negócio.

---

## PARTE 1 — Como Renomear ou Transferir o Projeto para `site-pessoal-hub`

### 1.1. Comandos no Terminal
```bash
# Opção A: Se quiser apenas renomear a pasta atual para site-pessoal-hub
mv /home/tanaka/dev/projetos/personal/site-portifolio /home/tanaka/dev/projetos/personal/site-pessoal-hub

# Opção B: Se quiser copiar para uma nova pasta mantendo a antiga intacta
mkdir -p /home/tanaka/dev/projetos/personal/site-pessoal-hub

rsync -av --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude 'tsconfig.tsbuildinfo' \
  /home/tanaka/dev/projetos/personal/site-portifolio/ \
  /home/tanaka/dev/projetos/personal/site-pessoal-hub/
```

### 1.2. Comandos Nativos do NestJS para Gerar os Módulos (`./app`)
Como o NestJS já vem com Arquitetura Modular de fábrica, basta rodar dentro de `./app`:
```bash
cd app
pnpm dlx @nestjs/cli g module module/prisma
pnpm dlx @nestjs/cli g module module/auth
pnpm dlx @nestjs/cli g module module/site-config
pnpm dlx @nestjs/cli g module module/public
pnpm dlx @nestjs/cli g module module/tickets
pnpm dlx @nestjs/cli g module module/clientes
pnpm dlx @nestjs/cli g module module/projetos
pnpm dlx @nestjs/cli g module module/engenharia
pnpm dlx @nestjs/cli g module module/calculadora
pnpm dlx @nestjs/cli g module module/financeiro
pnpm dlx @nestjs/cli g module module/tarefas
pnpm dlx @nestjs/cli g module module/portal
pnpm dlx @nestjs/cli g module module/chamados
pnpm dlx @nestjs/cli g module module/fila-espera
```

### 1.3. O que já está construído em `./client` (Inventário Completo)
- **Design System & Tema Sálvia (`src/app/globals.css` & `src/app/layout.tsx`):**
  - Fontes `Geist` e `Geist_Mono`;
  - Tema plano sem degradês (Verde-Sálvia `#3f6e51` no claro e `#7aa98b` no escuro, superfícies em camadas `--tone-1/2/3`, selos `--ok` e `--wait`, e ajuste automático de contraste de logos `.tech-cor`);
  - Script inline anti-flicker de tema (`localStorage.getItem('tema')`).
- **Componentes React Bits Customizados (`src/components/reactbits/*`):**
  - `StarBorder.tsx`, `LogoLoop.tsx`, `RotatingText.tsx`, `BlurText.tsx` e `Magnet.tsx`.
- **Landing Page Pública Completa (`src/components/public/*`):**
  - `Navbar.tsx` + `ThemeToggle.tsx`, `HeroSection.tsx` + `Rotator.tsx`, `SkillMarquee.tsx` + `TechIcon.tsx` (`simple-icons`), `ProjectsSection.tsx` + `ProjectsGrid.tsx` + `ProjectCard.tsx` + `ProjectDialog.tsx` (com suporte a vídeo MP4/YouTube e modo confidencial `[🔒 Sob NDA]`), `Testimonials.tsx` + `TestimonialsCarousel.tsx` (avatares `@dicebear/collection` estilo *Notionists*), `ServicesSection.tsx` + `ServiceIcon.tsx`, `ProcessSection.tsx`, `CareerSection.tsx`, `FaqSection.tsx`, `ContactSection.tsx` + `TicketForm.tsx` (com Honeypot no campo `website`), `Footer.tsx` e `FloatingContact.tsx`.
- **Base do Painel Admin (`src/app/admin/*` e `src/components/admin/*`):**
  - Login (`/admin/login`) com suporte a modo dev/mock (`ADMIN_DEV_BYPASS` e `NEXT_PUBLIC_USE_MOCKS`);
  - `AdminTopbar.tsx` (barra superior + lançador de apps), `apps.ts`, `PageHeader.tsx`, `StatusBadge.tsx`, `ui.tsx`, `Modal.tsx`, `Abas.tsx`;
  - Prévias funcionais com dados de exemplo: Ideias (kanban), Clientes (lista + ficha), Projetos (lista + Hub com 7 abas), Chamados (central + conversa), Segurança e Portal do cliente (`/status/demo`);
  - Dashboard (`/admin`) e Editor Visual completo do `site-content.json` (`/admin/config` com `ContentEditor.tsx`, `IconPicker.tsx`, `tabs.tsx` e `fields.tsx`).

---

## PARTE 2 — Especificação Completa do Projeto (Visão Ponta a Ponta)

### 2.1. Os 4 Pilares de Negócio do Sistema

1. **Pilar 1 — Configuração do Site & Feature Flags (`SiteConfigModule` / `/admin/config`):**
   - Edição completa dos textos do portfólio (`site-content.json`) validado com **Zod**;
   - **Seções da Home (`secoes`):** Reordenar, ocultar e escolher quais seções entram no menu (`projetos`, `servicos`, `processo`, `depoimentos`, `sobre`, `faq`); Hero e Contato são fixos;
   - **Gestão Dinâmica de Categorias:** Criar, editar, ordenar e remover categorias de skills e tecnologias com seletor de ícones.
2. **Pilar 2 — Ideias de Projeto (`TicketsModule` / `/admin/tickets`):**
   - Antigos "tickets de pré-venda" agora tratados claramente como **Ideias de Projeto**;
   - **Entrada Dupla:** Visitantes anônimos do site preenchem o formulário público (`origem = 'PUBLICO_SITE'`), enquanto o Admin pode cadastrar ideias manualmente no painel a qualquer momento (`origem = 'MANUAL_ADMIN'`);
   - **Funil:** `NOVO` $\to$ `EM_CONVERSA` $\to$ `MVP_EM_ELABORACAO` $\to$ `MVP_APRESENTADO` $\to$ `ACEITO_CONVERTIDO` (ou `DESISTENCIA`).
3. **Pilar 3 — Clientes & Hub de Projetos com Calculadoras (`ClientesModule`, `ProjetosModule`, `EngenhariaModule`, `CalculadoraModule`, `FinanceiroModule`, `TarefasModule`):**
   - **Liberdade de Criação Direta:** O Admin pode criar um **Cliente** e criar um **Projeto** diretamente a qualquer momento, sem precisar que tenha vindo de uma ideia/ticket (ou converter uma ideia aprovada em 1 clique via `prisma.$transaction`);
   - **Hub Central do Projeto (`/admin/projetos/[id]`):** Dividido em 7 abas:
     1. *Visão Geral & Links* (Status, datas, link do Portal do Cliente `/status/[token]` e toggle `aceita_chamados`);
     2. *Engenharia de Requisitos & Dúvidas* (RF, RNF, Regras de Negócio, Restrições, MoSCoW e horas estimadas);
     3. *Avaliação Arquitetural (BI) & ADRs* (Matriz de pesos determinísticos para escolha de stack e registro de ADRs);
     4. *Calculadora Júnior & Financeiro* ($\text{Orçamento} = (\text{Horas} \times 1.30 \times \text{Valor Hora}) \times \text{Complexidade}$, comparativo de horas reais vs. estimadas, rentabilidade real por hora, Custos de Infra com `link_fonte` e Parcelas de Pagamento);
     5. *Tarefas & Checklists em 2 Níveis* (Macro-tarefas Nível 1 + sub-itens Nível 2 que calculam o progresso de $0\%$ a $100\%$);
     6. *Chamados deste Projeto* (Lista e gestão dos chamados vinculados ao projeto);
     7. *Publicação no Portfólio & Sigilo (NDA)* (`is_publico`, `is_confidencial`, `is_destaque`, mídia e links).
4. **Pilar 4 — Chamados de Manutenção, Alteração e Sustentação (`ChamadosModule` / `/admin/chamados` e `/status/[token]`):**
   - Exclusivo para projetos já estruturados ou entregues;
   - **Tipos:** `MANUTENCAO` (Bug/Erro), `ALTERACAO` (Ajuste de escopo), `MELHORIA` (Nova feature) e `SUPORTE` (Dúvida);
   - **Prioridades:** `BAIXA`, `MEDIA`, `ALTA`, `CRITICA`;
   - **Status:** `ABERTO` $\to$ `EM_ANALISE` $\to$ `EM_EXECUCAO` $\to$ `AGUARDANDO_CLIENTE` $\to$ `RESOLVIDO` $\to$ `FECHADO`;
   - **Abertura por Link Exclusivo:** O cliente acessa `/status/[token]` e abre o chamado diretamente vinculado ao projeto dele (gerando protocolo `CHM-YYYY-NNNN`). O Admin pode converter um chamado aprovado em uma **Tarefa do Projeto** (`tarefa_gerada_id`).

---

## PARTE 3 — Prompt Mestre para a IA Replicar o Frontend e Construir o Projeto

Copie e cole o prompt abaixo na IA quando quiser iniciar ou continuar a implementação:

````markdown
# PROMPT MESTRE — REPLICAÇÃO DO FRONTEND REACT E IMPLEMENTAÇÃO DO ECOSSISTEMA COMPLETO (`site-pessoal-hub` · NEXT.JS + NESTJS MODULAR)

Você vai atuar como Arquiteto de Software Sênior e Desenvolvedor Full Stack TypeScript para construir e evoluir a plataforma `site-pessoal-hub` (Marca: `tanaka.dev`).

## 1. CONTEXTO E ARQUITETURA GERAL
Este projeto é um Monorepo PNPM 100% em TypeScript composto por duas pastas principais:
1. `./client`: Frontend em **Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + React Bits + Lucide Icons + Simple Icons + DiceBear** (porta `3000`).
2. `./app`: Backend em **Node.js + TypeScript + NestJS 12 + Prisma ORM + PostgreSQL 17** utilizando a **Arquitetura Modular Nativa do NestJS (`src/module/*`)** (porta `3333`, prefixo `/api`, autenticação via Cookie HTTP-Only com JWT, 2FA TOTP e Passkeys WebAuthn).

Leia obrigatoriamente os documentos de referência na pasta `./docs` antes de escrever qualquer código:
- `ARCHITECTURE_SPEC.md` (Visão geral dos 4 pilares)
- `docs/back/docs-backend.md` (Especificação completa dos módulos NestJS em `src/module/*`, Guards, endpoints REST e regras de cálculo)
- `docs/back/schema.sql` (DDL completo das 17 tabelas no PostgreSQL 17 para espelhar no `prisma/schema.prisma`)
- `docs/front/docs-frontend.md` (Especificação completa das telas e componentes React)
- `docs/front/site-content.json` (Estrutura JSON de conteúdo, categorias e ordem/visibilidade das seções `secoes`)

---

## 2. ESPECIFICAÇÃO EXATA PARA REPLICAR/MANTER O FRONTEND ATUAL (`./client`)

Se os arquivos de `./client` ainda não existirem no projeto, você deve criá-los seguindo **exatamente** estas especificações visuais e técnicas (se já existirem em `./client`, preserve 100% da interface construída):

### 2.1. Identidade Visual e Tema (`src/app/globals.css` e `src/app/layout.tsx`)
- **Estilo Visual:** Tema plano, elegante e autoral (Verde-Sálvia), **sem degradês e sem sombras pesadas**, com cantos arredondados (`--radius: 0.75rem`) e bordas sutis.
- **Tipografia:** `Geist` (`--font-geist-sans`) e `Geist_Mono` (`--font-geist-mono`) via `next/font/google`.
- **Paleta Light (`:root`):**
  - `--background: #f5f7f5` | `--foreground: #141b16` | `--card: #ffffff`
  - `--primary: #3f6e51` | `--primary-foreground: #f2fbf5` | `--brand: #355f45`
  - `--secondary: #e8eee9` | `--muted: #e8eee9` | `--muted-foreground: #526157`
  - `--accent: #dce6df` | `--border: #d8e1da` | `--subtle: #718076`
  - `--tone-1: #eef3ef` | `--tone-2: #e6ede8` | `--tone-3: #dce6df`
  - `--ok: #047857` | `--wait: #b45309` | `--destructive: #c43a2b`
- **Paleta Dark (`.dark`):**
  - `--background: #0f1311` | `--foreground: #e8eee9` | `--card: #151a17`
  - `--primary: #7aa98b` | `--primary-foreground: #0b1a11` | `--brand: #a9d1b5`
  - `--secondary: #1c231f` | `--muted: #1c231f` | `--muted-foreground: #9aa89f`
  - `--accent: #1e2721` | `--border: #252e29` | `--subtle: #6c7a71`
  - `--tone-1: #18201b` | `--tone-2: #1e2721` | `--tone-3: #252f28`
  - `--ok: #34d399` | `--wait: #fbbf24` | `--destructive: #dc4a3a`
- **Anti-Flicker de Tema:** Script inline no `<head>` do `layout.tsx` lendo `localStorage.getItem('tema')` e aplicando a classe `light` ou `dark` no `<html>` antes da primeira pintura.

### 2.2. Componentes da Landing Page Pública (`src/app/page.tsx` e `src/components/public/*`)
Hero + fita de ícones no topo e Contato no fim são fixos; as seções do meio seguem a ordem e a visibilidade de `content.secoes` (`secoesOrdenadas()`):
1. **`Navbar.tsx` + `ThemeToggle.tsx`:** Barra superior flutuante (`rounded-full border bg-background/85 backdrop-blur-md`) com a marca dividida pelo ponto (`tanaka` + `.dev` em `text-brand`), links de âncora centralizados gerados a partir das seções visíveis com `no_menu = true` + `#contato`, ícones das redes sociais, alternador de tema claro/escuro e botão CTA "Orçamento".
2. **`HeroSection.tsx` + `Rotator.tsx` (`RotatingText.tsx`) + `StarBorder.tsx`:**
   - Badge superior de status com ponto pulsante (`animate-ping`): verde (`bg-ok`) quando `disponivel_para_novos_projetos === true`, ou âmbar (`bg-wait`) chamando para a fila de espera quando `false`.
   - `<h1>` de grande impacto (`text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight`) com `perfil.headline` + frase rotativa animada (`RotatingText` em um pill `bg-primary/15 text-brand`).
   - Botão CTA principal envolvido pelo componente **`StarBorder`** (React Bits) com trilha luminosa animada (`color="#d4ecdb"`, `trailColor="#a9d1b5"`, `radius={999}`).
3. **`SkillMarquee.tsx` + `LogoLoop.tsx` + `TechIcon.tsx`:**
   - Faixa horizontal (`border-y py-6`) exibindo em loop contínuo (`speed={75}`) os ícones oficiais do pacote `simple-icons` com suas cores originais ajustadas por tema (`.tech-cor`) para todos os itens onde `marquee === true`.
4. **`ProjectsSection.tsx` + `ProjectsGrid.tsx` + `ProjectCard.tsx` + `ProjectDialog.tsx`:**
   - Grid uniforme de 3 colunas no desktop exibindo inicialmente 3 projetos e botão "Ver mais".
   - Cards com imagem/capa, título, descrição curta, badges das `stacks_utilizadas` e selo `[🔒 Sob NDA]` quando `is_confidencial === true`.
   - Clique no card abre o `ProjectDialog` (`Dialog` do shadcn/ui com blur) exibindo vídeo de demonstração (`video_url` em MP4 ou YouTube), detalhes completos e botão "Ver projeto ao vivo ↗" (ocultando links e mídias sensíveis caso `is_confidencial === true`).
5. **`Testimonials.tsx` + `TestimonialsCarousel.tsx`:**
   - Carrossel horizontal com snap e controles de seta, exibindo depoimentos reais com **ilustração cartoon gerada no servidor via DiceBear (`@dicebear/collection` estilo `notionists`)** a partir do nome do cliente, nome do projeto e mês/ano de entrega.
6. **`ServicesSection.tsx` + `ProcessSection.tsx`:**
   - Cartões de serviço (ícone, descrição, entregas com ✓ e tecnologias escolhidas do catálogo `categorias_skills`) e etapas numeradas "Como trabalho" ligadas por linha.
7. **`CareerSection.tsx` + `FaqSection.tsx`:**
   - Sobre: nome/cargo/localização (foto opcional via `perfil.exibir_foto`), resumo, missão, números de destaque, experiências, formação e "Estudando agora". FAQ em acordeão `<details>` com JSON-LD `FAQPage`.
8. **`ContactSection.tsx` + `TicketForm.tsx` + `FloatingContact.tsx` + `Footer.tsx`:**
   - Formulário público para envio de **Ideia de Projeto** com proteção anti-spam Honeypot (campo oculto `website`) e canais diretos de contato.

---

## 3. ARQUITETURA MODULAR NO NESTJS (`./app`) E OS 4 PILARES DO PAINEL ADMIN (`/admin/*`)

No backend NestJS (`./app`), organize o código em módulos nativos dentro de `src/module/` (`prisma`, `auth`, `site-config`, `public`, `tickets`, `clientes`, `projetos`, `engenharia`, `calculadora`, `financeiro`, `tarefas`, `portal`, `chamados`, `fila-espera`, `notifications`, `storage`) com as 17 tabelas modeladas em `prisma/schema.prisma`.

Implemente os 4 pilares conectando `./client` e `./app`:

1. **Dashboard "Torre de Controle" (`/admin`):**
   - Cards de KPIs no topo + **Portal de Módulos de Operação** (acesso direto a *Configuração do Site*, *Ideias de Projeto*, *Clientes & Projetos* e *Chamados de Manutenção*), além de ações rápidas para criar Projeto, Cliente ou Ideia.
2. **Pilar 1 — `SiteConfigModule` (`/admin/config`):**
   - Manter o `ContentEditor.tsx` (abas Perfil, Seções, Serviços & processo, Sobre & carreira, FAQ, Redes, Tecnologias e Textos), validado pelo mesmo schema Zod no `SiteConfigModule`.
3. **Pilar 2 — `TicketsModule` (`/admin/tickets`):**
   - Quadro Kanban/Lista das ideias enviadas por anônimos no site (`PUBLICO_SITE`) + botão para o Admin criar ideias manualmente (`MANUAL_ADMIN`).
   - Edição de notas de conversa, resumo de MVP, link do protótipo e botão **"Converter em Cliente + Projeto"** (transação atômica via `prisma.$transaction`).
4. **Pilar 3 — `ClientesModule`, `ProjetosModule`, `EngenhariaModule` & `CalculadoraModule` (`/admin/clientes` e `/admin/projetos`):**
   - Permitir criar **Clientes** e **Projetos** diretamente a qualquer momento (sem precisar de ticket prévio).
   - No Hub do Projeto (`/admin/projetos/[id]`), implementar as 7 abas:
     1. *Visão Geral & Links* (Status, datas, link do Portal do Cliente `/status/[token]` e toggle `aceita_chamados`);
     2. *Engenharia de Requisitos & Dúvidas* (RF, RNF, Regras de Negócio, Restrições, MoSCoW e horas);
     3. *Avaliação Arquitetural (BI) & ADRs*;
     4. *Calculadora Júnior & Financeiro* (`CalculadoraService`: $\text{Orçamento} = (\text{Horas} \times 1.30 \times \text{Valor Hora}) \times \text{Complexidade}$, Custos com `link_fonte` e Pagamentos);
     5. *Tarefas (Nível 1) & Checklists (Nível 2)* com barra de progresso automática;
     6. *Chamados deste Projeto*;
     7. *Publicação no Portfólio & Sigilo (NDA)*.
5. **Pilar 4 — `ChamadosModule` (`/admin/chamados` e `/status/[token]`):**
   - Permitir que o cliente abra chamados de `MANUTENCAO`, `ALTERACAO`, `MELHORIA` ou `SUPORTE` diretamente pelo link do projeto (`/status/[token]`) quando `aceita_chamados = true`, gerando protocolo `CHM-YYYY-NNNN`.
   - Permitir ao Admin responder chamados, orçar horas adicionais e clicar em **"Converter em Tarefa"** (`prisma.$transaction`) para criar automaticamente uma tarefa na aba de execução do projeto.
6. **`AuthModule` — Segurança Admin Solo (`/admin/login` e `/admin/seguranca`):**
   - Autenticação com Cookie HTTP-Only (`@nestjs/jwt` + `argon2`), suporte a **2FA (TOTP)** e login por dispositivo físico via **Passkeys / WebAuthn (`@simplewebauthn/server` + `admin_dispositivos`)**.
````
