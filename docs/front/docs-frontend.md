# 💻 Documentação Oficial do Frontend (`site-pessoal-hub` · `./client`)

> **Stack Definida (100% Preservada):** Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, **shadcn/ui**, **React Bits** e Lucide Icons.
> **Integração Backend:** Consome a API REST do Monólito Modular em **TypeScript + NestJS 12 + Prisma** (`./app`, porta `3333`).
> **Propósito deste Documento:** Documentar toda a arquitetura da interface em React já construída e sua evolução para operar os **4 Pilares do Ecossistema**: (1) Configuração Visual & Feature Flags do Site, (2) Funil de Ideias de Projeto, (3) CRM de Clientes & Hub de Projetos com Calculadoras, e (4) Sistema de Chamados de Manutenção & Sustentação com links por projeto.

---

## 1. Visão Arquitetural: Next.js no Front + NestJS Modular no Back

Toda a base visual, animações e componentes interativos construídos em React dentro de `./client` são **integralmente mantidos**, compartilhando schemas de validação **Zod** e tipagem TypeScript de ponta a ponta com o servidor NestJS:

1. **Na Página Pública (`/`):** Renderiza a vitrine comercial com **React Server Components (RSC)** e ilhas interativas (`"use client"`) com **React Bits** (`LogoLoop`, `StarBorder`, `RotatingText`, `BlurText`, `Magnet`), respeitando em tempo real os interruptores de visibilidade (**Feature Flags**) definidos pelo Admin em `/admin/config`.
2. **No Portal do Cliente & Links de Chamados (`/status/[token]`):** Permite ao cliente acompanhar o progresso de 0% a 100%, conferir a transparência de custos operacionais com links de fonte e **abrir/acompanhar Chamados de Manutenção, Alteração ou Melhoria** diretamente vinculados ao projeto dele.
3. **No Painel Administrativo (`/admin/*`):** Funciona como uma **Torre de Controle (Portal de Operações)** protegida por login forte (Senha + 2FA TOTP ou **Passkeys / WebAuthn por Dispositivo Físico**), reunindo os 4 sistemas internos em uma interface coesa em React + `shadcn/ui`.

---

## 2. Arquitetura de Pastas e Rotas (`./client` — Next.js App Router)

```text
client/
├── package.json
├── next.config.ts
├── tsconfig.json
├── components.json                        # Configuração do shadcn/ui
├── .env.local                             # NEXT_PUBLIC_API_URL="http://localhost:3333"
└── src/
    ├── data/
    │   ├── site-content.json              # Fonte única da verdade (Textos, Feature Flags e Categorias)
    │   ├── mock.ts                        # Mocks públicos para desenvolvimento offline
    │   └── mock-admin.ts                  # Mocks administrativos para desenvolvimento offline
    ├── lib/
    │   ├── api.ts                         # Cliente HTTP (credentials: 'include') conectado ao NestJS
    │   ├── auth.ts                        # Verificação de sessão do Admin + suporte a Passkeys
    │   ├── content.ts                     # Leitura/cache do site-content.json
    │   ├── content-schema.ts              # Validação Zod do site-content.json (seções, serviços, processo, FAQ, categorias)
    │   ├── content-utils.ts               # Helpers puros (secoesOrdenadas, links de e-mail/currículo)
    │   ├── tech-icons.ts                  # Catálogo de ícones de tecnologias
    │   ├── types.ts                       # Tipos públicos e do Portal do Cliente
    │   └── admin-types.ts                 # Tipos do Admin (Ideias, Clientes, Projetos, Calculadoras, Chamados)
    ├── components/
    │   ├── ui/                            # Componentes base do shadcn/ui (button, card, dialog, badge, progress...)
    │   ├── reactbits/                     # Animações React Bits (LogoLoop, StarBorder, RotatingText, BlurText, Magnet)
    │   ├── public/                        # Componentes da Landing Page (/) — 100% Preservados
    │   │   ├── Navbar.tsx                 # Marca + NavTicker em loop + redes + CTA
    │   │   ├── HeroSection.tsx            # Headline + RotatingText + StarBorder CTA
    │   │   ├── SkillMarquee.tsx           # Fita infinita de ícones de stacks
    │   │   ├── ProjectsSection.tsx        # Grid 3 colunas + ProjectCard + ProjectDialog (vídeo/NDA)
    │   │   ├── Testimonials.tsx           # Carrossel com avatares DiceBear Notionists
    │   │   ├── ServicesSection.tsx        # Cartões de serviço (ícone, entregas ✓ e tecnologias do catálogo)
    │   │   ├── ServiceIcon.tsx            # Mapa de ícones lucide dos serviços (usado também no admin)
    │   │   ├── ProcessSection.tsx         # "Como trabalho": etapas numeradas ligadas por linha
    │   │   ├── CareerSection.tsx          # Sobre: perfil (foto opcional), missão, números, experiência, formação e "Estudando agora"
    │   │   ├── FaqSection.tsx             # Acordeão <details> + JSON-LD FAQPage (SEO)
    │   │   ├── ContactSection.tsx         # Título centralizado + TicketForm (Envio de Ideia de Projeto com Honeypot)
    │   │   ├── Footer.tsx
    │   │   └── FloatingContact.tsx
    │   ├── portal/                        # O que o CLIENTE vê (nada de horas, valor-hora, seus custos ou notas internas)
    │   │   ├── PortalCliente.tsx          # Portal de 1 projeto (/status/[token]): abas Andamento · Chamados · Financeiro · Recados (aba pelo #hash)
    │   │   ├── EntrarForm.tsx             # /cliente: pede o link de acesso por e-mail (resposta sempre igual)
    │   │   └── AreaTopo.tsx
    │   └── admin/                         # Torre de Controle (/admin/*) — prévia funcional com dados de exemplo
    │       ├── AdminTopbar.tsx            # Barra superior: lançador de apps (grade), atalhos, selo "Prévia" e menu da conta
    │       ├── apps.ts                    # Registro único dos aplicativos (barra, lançador e dashboard)
    │       ├── ui.tsx · Abas.tsx · Modal.tsx  # Peças base: Painel, Kpi, Barra, campos; abas sem rolagem lateral; modal/gaveta lateral
    │       ├── StatusBadge.tsx            # Rótulo + cor de todos os enums (ideia, projeto, chamado, pagamento, ADR) + prioridade
    │       ├── LoginForm.tsx · PageHeader.tsx · SegurancaPainel.tsx
    │       ├── content-editor/            # PILAR 1: Editor do site (navegação lateral espelhando a página)
    │       │   ├── ContentEditor.tsx · EditorNav.tsx · tabs.tsx · fields.tsx · IconPicker.tsx
    │       ├── ideias/IdeiasBoard.tsx     # PILAR 2: Kanban arrastável, ficha lateral, nova ideia e conversão em cliente + projeto
    │       ├── clientes/ClientesLista.tsx # PILAR 3A: Lista com busca/filtros e cadastro direto
    │       ├── projetos/                  # PILAR 3B: Lista + Hub do projeto
    │       │   ├── ProjetosLista.tsx · ProjetoHub.tsx · calculos.ts (regras do §6 do backend)
    │       │   └── abas/                  # Geral, Requisitos (+dúvidas), Arquitetura (matriz BI + ADRs), Financeiro (Calculadora Jr, custos, pagamentos), Tarefas (2 níveis), Chamados, Vitrine (prévia com o ProjectCard real)
    │       └── chamados/                  # PILAR 4: Central de chamados + conversa com notas internas e conversão em tarefa
    │           ├── ChamadosCentral.tsx
    │           └── ChamadoDetalhe.tsx
    └── app/
        ├── globals.css
        ├── layout.tsx
        ├── page.tsx                       # 1. LANDING PAGE PÚBLICA (/) — Renderiza apenas seções ativas
        ├── cliente/
        │   ├── page.tsx                   # 2a. ÁREA DO CLIENTE — entrada por e-mail (link mágico, sem senha)
        │   └── [token]/page.tsx           # 2b. Todos os projetos do cliente, com "Acompanhar" e "Abrir chamado"
        ├── status/
        │   └── [token]/
        │       └── page.tsx               # 2c. PORTAL DE UM PROJETO & CHAMADOS (/status/:token)
        └── admin/                         # 3. TORRE DE CONTROLE ADMINISTRATIVA (/admin/*)
            ├── login/
            │   └── page.tsx               # Login seguro (/admin/login)
            └── (painel)/
                ├── layout.tsx             # Layout autenticado com AdminTopbar (barra superior + lançador de apps)
                ├── page.tsx               # Portal Central / Dashboard de Módulos (/admin)
                ├── config/
                │   └── page.tsx           # Pilar 1: Conteúdo do Site, Feature Flags & Categorias (/admin/config)
                ├── tickets/
                │   └── page.tsx           # Pilar 2: Ideias de Projeto (/admin/tickets)
                ├── clientes/
                │   └── page.tsx           # Pilar 3A: CRM de Clientes com criação livre (/admin/clientes)
                ├── projetos/
                │   ├── page.tsx           # Pilar 3B: Lista e criação livre de Projetos (/admin/projetos)
                │   └── [id]/
                │       └── page.tsx       # Hub Central do Projeto + Calculadoras + Chamados (/admin/projetos/:id)
                ├── chamados/
                │   └── page.tsx           # Pilar 4: Visão Global de Chamados de Manutenção (/admin/chamados)
                ├── clientes/[id]/page.tsx  # Ficha do cliente: dados, notas, projetos, chamados e ideias de origem
                ├── chamados/[id]/page.tsx  # Conversa do chamado + status, orçamento extra e conversão em tarefa
                └── seguranca/
                    └── page.tsx           # Gestão de Dispositivos Confiáveis (Passkeys) e 2FA (/admin/seguranca)
```

---

## 3. Os 4 Pilares de Operação no Painel Admin (`/admin`)

### 3.0. Navegação: barra superior + lançador de aplicativos
O painel não tem mais barra lateral. A **barra superior** (`AdminTopbar`) traz a marca, o **lançador** (ícone de grade, estilo "apps") com todos os aplicativos, atalhos diretos para os principais e o menu da conta (Segurança, Ver site, Sair). A lista de aplicativos vive em `components/admin/apps.ts` e alimenta barra, lançador e dashboard ao mesmo tempo.

**Prévia sem backend:** com `NEXT_PUBLIC_USE_MOCKS="true"` todas as telas usam `src/data/mock-admin.ts` (via `lib/admin-api.ts`, que já aponta para os endpoints reais quando o mock é desligado). As interações (arrastar, marcar, responder, converter) funcionam só no estado do navegador, e a barra mostra o selo **“Prévia · dados de exemplo”**. O portal do cliente de exemplo fica em `/status/demo`.

### 3.0.1. O que é seu × o que é do cliente
- **Área do cliente** (`/cliente/[token]`, link no rodapé do site): um link por cliente com todos os projetos dele. Gerado e revogado na ficha do cliente (painel “Área do cliente”, com “Ver como o cliente”).
- **Portal do projeto** (`/status/[token]`): um link por projeto, que pode ser repassado à equipe do cliente sem expor os outros projetos.
- No Hub, tudo que aparece para o cliente leva o selo **“Cliente vê”** (etapas visíveis, parcelas, custos do cliente, recados, link do portal); o resto é marcado como **“Só você”** ou fica sem selo.
- Chamados: com “Aceita chamados” desligado, o portal mostra o histórico e um botão de contato (“o período de suporte terminou”).

### 3.1. O Dashboard como "Portal de Operações" (`src/app/admin/(painel)/page.tsx`)
Ao entrar em `/admin`, o administrador visualiza:
1. **Lançador de aplicativos:** um cartão por app (Ideias, Clientes, Projetos, Chamados, Conteúdo do site, Portal do cliente, Segurança) com uma métrica curta e contador de pendências.
2. **Precisa de atenção:** chamados críticos/altos, parcelas vencendo em até 7 dias, ideias novas, chamados sem resposta e dúvidas pendentes — cada item leva direto à tela certa (ex.: `?aba=financeiro` no Hub).
3. **Projetos ativos** (progresso, prazo, horas) e **A receber** (próximos 30 dias e total pendente).
4. Atalhos **+ Ideia**, **+ Cliente** e **+ Projeto** (abrem os formulários via `?nova=1` / `?novo=1`).

---

### 3.2. Pilar 1: Configuração do Site, Feature Flags & Categorias (`/admin/config`)
Baseado no `ContentEditor.tsx` já implementado, com suporte a **Feature Flags Visuais** no `site-content.json`:

```json
"secoes": [
  { "id": "projetos",    "visivel": true, "no_menu": true },
  { "id": "servicos",    "visivel": true, "no_menu": true },
  { "id": "processo",    "visivel": true, "no_menu": false },
  { "id": "depoimentos", "visivel": true, "no_menu": true },
  { "id": "sobre",       "visivel": true, "no_menu": true },
  { "id": "faq",         "visivel": true, "no_menu": false }
]
```

- **Ordem, visibilidade e menu das seções (navegação lateral do editor):** arraste as seções (ou use as setas) para mudar a ordem no site e o olho para ocultar; “Link no menu superior” fica no topo do painel de cada seção. O Hero (com a fita `SkillMarquee`) fica sempre no topo e o Contato sempre no fim. As seções do meio são renderizadas por `src/app/page.tsx` **na ordem do array** e só quando `visivel = true`; a `Navbar` monta os links a partir das seções visíveis com `no_menu = true`. `secoesOrdenadas()` completa ids ausentes, então conteúdo antigo continua válido.
- **Seções de conteúdo editáveis:**
  - **Serviços (`servicos[]`):** `icone` (lista fixa `ICONES_SERVICO`), `titulo`, `descricao`, `entregas[]` e `tecnologias[]` — nomes escolhidos do catálogo `categorias_skills` (o ícone vem do `slug_icone` do item).
  - **Como trabalho (`processo[]`):** `titulo`, `descricao` e `duracao` opcional.
  - **FAQ (`faq[]`):** `pergunta` e `resposta`; também gera dados estruturados `FAQPage`.
  - **Sobre:** `carreira` (+ `numeros[]`, até 4), `objetivos_profissionais.missao` e `interesses_tecnicos` (“Estudando agora”); foto opcional via `perfil.avatar_url` + `perfil.exibir_foto`.
  - **Contato (`formulario_contato`):** texto do botão, nota abaixo dele, faixas de investimento (vazio esconde o campo) e a mensagem de sucesso. Os campos do formulário são fixos porque alimentam o funil de Ideias.
  - Seções vazias (ex.: sem depoimentos aprovados ou sem itens) não aparecem.
- **Gestão Dinâmica de Categorias:** Permite criar, renomear, reordenar e excluir categorias de tecnologias (`categorias_skills`) e adicionar itens com seletor visual de ícones (`IconPicker.tsx`). O catálogo alimenta a fita animada (itens com `marquee = true`) e os cartões de serviço — não há mais seção “Stack” separada.

---

### 3.3. Pilar 2: Ideias de Projeto (`/admin/tickets`)
Separa claramente as oportunidades em estágio inicial dos projetos já contratados:
- **Duas Fontes de Entrada:**
  1. **Visitante Anônimo (Site Público):** Preenche o `TicketForm` na Home (`origem = 'PUBLICO_SITE'`).
  2. **Criação Manual pelo Admin:** Botão **"Nova Ideia de Projeto"** dentro de `/admin/tickets` para anotar ideias próprias ou conversas informais (`origem = 'MANUAL_ADMIN'`).
- **Ciclo de Maturação:** `NOVO` $\to$ `EM_CONVERSA` $\to$ `MVP_EM_ELABORACAO` $\to$ `MVP_APRESENTADO`.
- **Conversão em 1 Clique:** O botão **"Converter em Cliente + Projeto"** dispara `POST /api/admin/tickets/:id/converter` no NestJS, criando o Cliente e o Projeto em transação atômica (`prisma.$transaction`) e redirecionando para o Hub do novo projeto.

---

### 3.4. Pilar 3: Clientes & Hub de Projetos com Calculadoras (`/admin/clientes` e `/admin/projetos`)
- **Liberdade de Criação Direta:** O administrador **não depende** de uma ideia/ticket prévio para cadastrar um cliente ou iniciar um projeto.
  - Em `/admin/clientes`, o botão **"Novo Cliente"** cadastra um cliente diretamente.
  - Em `/admin/projetos`, o botão **"Novo Projeto"** cria um projeto diretamente (associado a um cliente existente, criando um cliente na hora, ou como projeto pessoal/autoral).
- **Hub Central do Projeto (`/admin/projetos/[id]`) — Dividido em 7 Abas (`Tabs` do shadcn/ui):**
  1. **Visão Geral & Links:** Status (`EM_ANDAMENTO`, `INATIVO`, `CONCLUIDO`), datas, link copiável do **Portal do Cliente (`/status/[token]`)** e link direto para **Abertura de Chamados (`/status/[token]#chamados`)** com toggle `aceita_chamados`.
  2. **Engenharia de Requisitos & Dúvidas:** Cadastro de Requisitos Funcionais (RF), Não Funcionais (RNF), Regras de Negócio e Restrições com prioridade MoSCoW, complexidade e horas estimadas.
  3. **Avaliação Arquitetural (BI) & ADRs:** Matriz de pesos determinísticos para documentar o porquê da escolha da linguagem/framework/banco e registro de ADRs (*Architecture Decision Records*).
  4. **Calculadora Júnior & Financeiro:** Calcula em tempo real:
     $$\text{Orçamento Calculado} = (\text{Horas Estimadas} \times \text{Fator Segurança Jr} \times \text{Valor Hora}) \times \text{Complexidade}$$
     Compara horas estimadas vs. horas gastas, calcula a rentabilidade real por hora e gerencia Custos Operacionais (com `link_fonte`) e Parcelas de Pagamento.
  5. **Tarefas & Checklists (2 Níveis):** Macro-tarefas (Nível 1) e sub-checklists (Nível 2) que atualizam automaticamente a barra de progresso de $0\%$ a $100\%$.
  6. **Chamados deste Projeto:** Lista todos os chamados de manutenção, alteração e suporte vinculados especificamente a este projeto.
  7. **Publicação no Portfólio & Sigilo (NDA):** Configura `is_publico`, `is_confidencial` (exibe selo `[🔒 Sob NDA]` e oculta links sensíveis), `stacks_utilizadas`, `imagem_url`, `video_url` e `live_url`.

---

### 3.5. Pilar 4: Chamados de Manutenção, Alteração e Sustentação (`/admin/chamados` e `/status/[token]`)
Quando um projeto está bem estruturado ou já entregue, toda solicitação pós-escopo inicial passa a ser tratada como **Chamado de Projeto** (sem jamais se misturar com as Ideias de Projeto da pré-venda):

- **Como o Cliente Abre um Chamado:**
  - Através do link exclusivo do projeto (`/status/[token]`), quando `aceita_chamados = true`, o cliente tem a área **"Chamados & Solicitações do Projeto"**.
  - Ele escolhe o tipo:
    - 🛠️ **Manutenção / Bug:** Algo que parou de funcionar;
    - 🔄 **Alteração:** Ajuste em uma tela ou regra existente;
    - ✨ **Melhoria / Nova Funcionalidade:** Evolução pós-entrega;
    - 💬 **Suporte / Dúvida:** Auxílio operacional.
  - O sistema gera um protocolo único (ex: `CHM-2026-0001`) e permite acompanhar o status (`ABERTO` $\to$ `EM_ANALISE` $\to$ `EM_EXECUCAO` $\to$ `AGUARDANDO_CLIENTE` $\to$ `RESOLVIDO`) e trocar mensagens com anexos.
- **Como o Admin Gerencia:**
  - Tanto na aba **Chamados** dentro do projeto (`/admin/projetos/[id]`) quanto na visão consolidada (`/admin/chamados`).
  - Pode orçar horas adicionais (`horas_estimadas_chamado` e `valor_adicional_orcado`) e clicar em **"Converter em Tarefa"**, inserindo o chamado diretamente na esteira de execução do projeto.

---

## 4. Segurança Blindada de Admin Solo (`/admin/login` e `/admin/seguranca`)

Para garantir que apenas o administrador único tenha acesso aos projetos, calculadoras e configurações:
1. **Autenticação por Dispositivo Físico (Passkeys / WebAuthn):**
   - Na tela `/admin/login`, além do formulário tradicional, há o botão **"Entrar com Chave de Dispositivo / Passkey"**, que aciona a biometria ou chave criptográfica do computador/celular autorizado (`navigator.credentials.get`) validada no backend NestJS (`@simplewebauthn/server`).
2. **Autenticação de Dois Fatores (2FA / TOTP):**
   - Suporte a código de 6 dígitos temporário via app autenticador quando o login for feito por senha.
3. **Atalhos Seguros de Desenvolvimento Local (`NODE_ENV === 'development'`):**
   - Mantém os modos `ADMIN_DEV_BYPASS` e `NEXT_PUBLIC_USE_MOCKS` exclusivamente durante o `next dev` para permitir testar e estilizar a interface mesmo com o backend desligado.
