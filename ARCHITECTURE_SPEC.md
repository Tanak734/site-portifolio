# 🏛️ Especificação Geral da Arquitetura (`site-portifolio`)

> **Fonte Única da Verdade:** Este repositório utiliza uma arquitetura híbrida em Monorepo PNPM (`server` e `client`), unificando **Portfólio Comercial**, **CRM & Gestão de Projetos**, **Engenharia de Requisitos** e **Avaliação Arquitetural (BI)**.

---

## 📂 Mapa da Documentação Organizada

Toda a documentação técnica detalhada foi dividida nas pastas [`docs/back/`](file:///home/tanaka/dev/projetos/personal/site-portifolio/docs/back) e [`docs/front/`](file:///home/tanaka/dev/projetos/personal/site-portifolio/docs/front):

### 1. Backend (`./server` — Fastify + Prisma + PostgreSQL 17)
- 📄 **[Documentação Completa do Backend (`docs/back/docs-backend.md`)](file:///home/tanaka/dev/projetos/personal/site-portifolio/docs/back/docs-backend.md)**
  - Visão geral das 7 etapas do fluxo de negócio.
  - Estrutura de diretórios do servidor Fastify (porta `3333`).
  - Modelagem das 14 tabelas no PostgreSQL (porta `15432`).
  - Especificação completa de todos os endpoints REST (Públicos, Portal do Cliente e Admin).
  - Fórmulas da Calculadora de Precificação Júnior e cálculo automático de progresso em 2 níveis.
- 🗄️ **[Script SQL DDL (`docs/back/schema.sql`)](file:///home/tanaka/dev/projetos/personal/site-portifolio/docs/back/schema.sql)**
  - Script SQL puro com `ENUM`s, `CREATE TABLE`, chaves estrangeiras e índices de performance.

### 2. Frontend (`./client` — Next.js + React + Tailwind CSS + shadcn/ui)
- 📄 **[Documentação Completa do Frontend (`docs/front/docs-frontend.md`)](file:///home/tanaka/dev/projetos/personal/site-portifolio/docs/front/docs-frontend.md)**
  - Arquitetura das 3 camadas em Next.js App Router (porta `3000`): Landing Page Pública (`/`), Portal do Cliente (`/status/[token]`) e Painel Admin (`/admin/*`).
  - Especificação dos componentes (Hero com texto rotativo, Marquee infinito de ícones, Catálogo de Skills por categoria, Cards de projeto com suporte a sigilo/NDA).
  - Hub Central de Gestão do Projeto com `shadcn/ui` (Requisitos, BI de Stack, ADRs, Calculadora Jr e Tarefas em 2 níveis).
- 📋 **[JSON Base de Conteúdo e Skills (`docs/front/site-content.json`)](file:///home/tanaka/dev/projetos/personal/site-portifolio/docs/front/site-content.json)**
  - Estrutura pronta contendo perfil, frases rotativas, objetivos profissionais, links sociais e catálogo categorizado de tecnologias e conceitos.
