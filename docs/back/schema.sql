-- ============================================================================
-- BANCO DE DADOS: PORTFÓLIO, CMS, IDEIAS, PROJETOS, ENGENHARIA & CHAMADOS
-- Engine: PostgreSQL 17+ | Backend: NestJS Modular + Prisma ORM (TypeScript)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS DO SISTEMA
-- ============================================================================

-- 1.1. Funil de Ideias de Projeto (antigos Tickets de Pré-venda)
CREATE TYPE status_ticket AS ENUM (
    'NOVO',
    'EM_CONVERSA',
    'MVP_EM_ELABORACAO',
    'MVP_APRESENTADO',
    'ACEITO_CONVERTIDO',
    'DESISTENCIA'
);

CREATE TYPE origem_ideia AS ENUM (
    'PUBLICO_SITE',
    'MANUAL_ADMIN',
    'FILA_ESPERA'
);

-- 1.2. Projetos & Engenharia de Software
CREATE TYPE status_projeto AS ENUM (
    'EM_ANDAMENTO',
    'INATIVO',
    'CONCLUIDO'
);

-- Como a mão de obra é cobrada (GRATUITO = pro bono: o cliente arca só com os custos dele)
CREATE TYPE modalidade_cobranca AS ENUM (
    'PAGO',
    'DESCONTO',
    'GRATUITO'
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

-- 1.3. Financeiro & Calculadora Júnior
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

-- 1.4. Chamados de Manutenção, Alteração e Sustentação (Pós-Estruturação do Projeto)
CREATE TYPE tipo_chamado_projeto AS ENUM (
    'MANUTENCAO',      -- Correção de bug / erro em funcionalidade existente
    'ALTERACAO',       -- Mudança de escopo ou ajuste fino solicitado
    'MELHORIA',        -- Nova feature ou evolução do sistema
    'SUPORTE'          -- Dúvida operacional / infraestrutura / auxílio
);

CREATE TYPE prioridade_chamado AS ENUM (
    'BAIXA',
    'MEDIA',
    'ALTA',
    'CRITICA'
);

CREATE TYPE status_chamado_projeto AS ENUM (
    'ABERTO',
    'EM_ANALISE',
    'EM_EXECUCAO',
    'AGUARDANDO_CLIENTE',
    'RESOLVIDO',
    'FECHADO'
);

-- 1.5. Fila de Espera ("Avise-me")
CREATE TYPE status_fila AS ENUM ('AGUARDANDO', 'NOTIFICADO', 'CONVERTIDO', 'CANCELADO');

-- ============================================================================
-- 2. TABELAS DO SISTEMA (17 TABELAS)
-- ============================================================================

-- 2.1. Administrador Único (Bounded Context: Identity)
CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    totp_secret VARCHAR(255),                     -- Chave 2FA (TOTP Authenticator) opcional/ativa
    totp_enabled BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT TRUE,
    ultimo_login_em TIMESTAMP WITH TIME ZONE,
    ultimo_login_ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2. Dispositivos Confiáveis & Passkeys WebAuthn do Admin (Bounded Context: Identity)
CREATE TABLE admin_dispositivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin(id) ON DELETE CASCADE,
    nome_dispositivo VARCHAR(255) NOT NULL,       -- Ex: "Notebook Linux Tanaka", "YubiKey 5C", "Celular Pessoal"
    credential_id TEXT NOT NULL UNIQUE,           -- Identificador WebAuthn / Passkey (FIDO2)
    public_key TEXT NOT NULL,                     -- Chave pública criptográfica do dispositivo
    sign_count BIGINT DEFAULT 0,                  -- Contador anti-clonagem WebAuthn
    transports VARCHAR(255),                      -- Ex: "internal,usb,nfc,ble"
    user_agent VARCHAR(500),
    ip_registro VARCHAR(45),
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_uso_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.3. Clientes / CRM (Bounded Context: Clients — Criados diretamente pelo Admin ou via conversão de Ideia)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    empresa VARCHAR(255),
    telefone VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    documento VARCHAR(50),
    notas TEXT,
    token_portal VARCHAR(64) NOT NULL UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text), -- Link da área do cliente (revogável)
    portal_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.4. Ideias de Projeto / Funil de Pré-Venda (Bounded Context: ProjectIdeas)
-- Nota: Mantém o nome físico "tickets" para retrocompatibilidade com os DTOs do frontend,
-- representando as Ideias de Projeto (anônimas via site ou criadas manualmente pelo Admin).
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    origem origem_ideia NOT NULL DEFAULT 'PUBLICO_SITE',
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

-- 2.5. Projetos (Bounded Context: Projects — Criados diretamente pelo Admin ou convertidos de uma Ideia)
CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    ticket_id INTEGER UNIQUE REFERENCES tickets(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    categoria_projeto VARCHAR(100),

    -- Calculadora Júnior & Esforço (Etapa de Precificação)
    complexidade_geral complexidade_nivel DEFAULT 'MEDIA',
    fator_seguranca_jr NUMERIC(4, 2) DEFAULT 1.30,
    valor_hora_base NUMERIC(10, 2) DEFAULT 50.00,
    horas_estimadas NUMERIC(6, 2) DEFAULT 0,
    horas_gastas NUMERIC(6, 2) DEFAULT 0,
    orcamento_calculado NUMERIC(10, 2),
    orcamento_cobrado NUMERIC(10, 2),
    modalidade_cobranca modalidade_cobranca NOT NULL DEFAULT 'PAGO',
    desconto_percentual NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (desconto_percentual >= 0 AND desconto_percentual <= 100),
    impostos_percentual NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (impostos_percentual >= 0 AND impostos_percentual < 100),
    contrapartida TEXT,                            -- O que se recebe em troca (depoimento, case, indicação…)

    -- Execução, Portal do Cliente & Chamados de Manutenção
    status status_projeto DEFAULT 'EM_ANDAMENTO',
    progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    start_date DATE,
    end_date DATE,
    notas_internas TEXT,
    codigo_rastreio VARCHAR(64) UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text),
    cliente_pode_comentar BOOLEAN DEFAULT TRUE,
    aceita_chamados BOOLEAN DEFAULT TRUE,         -- Habilita o link de abertura de chamados para este projeto

    -- Vitrine Pública no Portfólio & Sigilo (NDA)
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
    video_url VARCHAR(500),
    ordem INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.6. Engenharia de Requisitos
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

-- 2.7. Dúvidas e Alinhamentos de Requisitos
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

-- 2.8. Avaliação Arquitetural & BI de Stack
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

-- 2.9. ADRs — Architecture Decision Records
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

-- 2.10. Custos de Infraestrutura & Fontes de Preço
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

-- 2.11. Pagamentos & Parcelas
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

-- 2.12. Tarefas do Projeto — Nível 1 Macro
CREATE TABLE tarefas_projetos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    requisito_id INTEGER REFERENCES requisitos_projetos(id) ON DELETE SET NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    horas_estimadas NUMERIC(6, 2) NOT NULL DEFAULT 0,
    horas_gastas NUMERIC(6, 2) NOT NULL DEFAULT 0,  -- A soma vira projetos.horas_gastas
    concluida BOOLEAN DEFAULT FALSE,
    visivel_cliente BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.13. Checklist de Tarefas — Nível 2 Micro
CREATE TABLE checklist_tarefas (
    id SERIAL PRIMARY KEY,
    tarefa_id INTEGER NOT NULL REFERENCES tarefas_projetos(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    concluido BOOLEAN DEFAULT FALSE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.14. Comentários Gerais do Portal do Cliente
CREATE TABLE comentarios_projetos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    tarefa_id INTEGER REFERENCES tarefas_projetos(id) ON DELETE SET NULL,
    autor autor_comentario NOT NULL,
    mensagem TEXT NOT NULL,
    anexo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.15. Chamados de Manutenção, Alteração e Sustentação do Projeto (Bounded Context: MaintenanceTickets)
CREATE TABLE chamados_projetos (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    tarefa_gerada_id INTEGER REFERENCES tarefas_projetos(id) ON DELETE SET NULL, -- Preenchido se o chamado virar uma Tarefa
    protocolo VARCHAR(30) NOT NULL UNIQUE,        -- Ex: "CHM-2026-0001"
    tipo tipo_chamado_projeto NOT NULL DEFAULT 'MANUTENCAO',
    prioridade prioridade_chamado NOT NULL DEFAULT 'MEDIA',
    status status_chamado_projeto NOT NULL DEFAULT 'ABERTO',
    aberto_por autor_comentario NOT NULL DEFAULT 'CLIENTE',
    solicitante_nome VARCHAR(255),
    solicitante_contato VARCHAR(255),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    anexo_url VARCHAR(500),
    horas_estimadas_chamado NUMERIC(5, 2) DEFAULT 0,
    valor_adicional_orcado NUMERIC(10, 2) DEFAULT 0,
    notas_internas_admin TEXT,
    resolvido_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.16. Histórico de Mensagens / Interações dentro de um Chamado de Projeto
CREATE TABLE interacoes_chamados (
    id SERIAL PRIMARY KEY,
    chamado_id INTEGER NOT NULL REFERENCES chamados_projetos(id) ON DELETE CASCADE,
    autor autor_comentario NOT NULL,
    mensagem TEXT NOT NULL,
    anexo_url VARCHAR(500),
    visivel_cliente BOOLEAN DEFAULT TRUE,         -- Permite registrar notas técnicas ocultas ou respostas públicas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.17. Avaliações & Depoimentos + Fila de Espera
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

CREATE TABLE fila_espera (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    ideia_resumo VARCHAR(500),
    status status_fila DEFAULT 'AGUARDANDO',
    consentimento_lgpd BOOLEAN NOT NULL DEFAULT FALSE,
    token_cancelamento VARCHAR(64) UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text),
    ticket_id INTEGER UNIQUE REFERENCES tickets(id) ON DELETE SET NULL,
    notificado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. ÍNDICES DE PERFORMANCE
-- ============================================================================

CREATE INDEX idx_admin_dispositivos_admin ON admin_dispositivos(admin_id);
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
CREATE INDEX idx_chamados_projeto ON chamados_projetos(projeto_id);
CREATE INDEX idx_chamados_status ON chamados_projetos(status);
CREATE INDEX idx_chamados_prioridade ON chamados_projetos(prioridade);
CREATE INDEX idx_interacoes_chamado ON interacoes_chamados(chamado_id);
CREATE UNIQUE INDEX uq_fila_email_aguardando ON fila_espera (lower(email)) WHERE status = 'AGUARDANDO';
CREATE INDEX idx_fila_status_ordem ON fila_espera (status, created_at);
