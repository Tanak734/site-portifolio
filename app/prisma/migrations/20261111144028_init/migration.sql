-- CreateEnum
CREATE TYPE "status_ticket" AS ENUM ('NOVO', 'EM_CONVERSA', 'MVP_EM_ELABORACAO', 'MVP_APRESENTADO', 'ACEITO_CONVERTIDO', 'DESISTENCIA');

-- CreateEnum
CREATE TYPE "origem_ideia" AS ENUM ('PUBLICO_SITE', 'MANUAL_ADMIN', 'FILA_ESPERA');

-- CreateEnum
CREATE TYPE "status_projeto" AS ENUM ('EM_ANDAMENTO', 'INATIVO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "complexidade_nivel" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "tipo_requisito" AS ENUM ('FUNCIONAL', 'NAO_FUNCIONAL', 'REGRA_NEGOCIO', 'RESTRICAO_TECNICA');

-- CreateEnum
CREATE TYPE "prioridade_moscow" AS ENUM ('MUST_HAVE', 'SHOULD_HAVE', 'COULD_HAVE', 'WONT_HAVE');

-- CreateEnum
CREATE TYPE "status_duvida" AS ENUM ('PENDENTE', 'RESPONDIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "status_adr" AS ENUM ('PROPOSTO', 'ACEITO', 'REJEITADO', 'SUBSTITUIDO');

-- CreateEnum
CREATE TYPE "categoria_custo" AS ENUM ('INFRAESTRUTURA', 'DOMINIO_DNS', 'APIS_SERVICOS', 'SEGURANCA_BACKUP', 'ASSETS_DESIGN', 'LICENCAS_SOFTWARE', 'COMUNICACAO_EMAIL', 'MARKETING_ANALYTICS', 'TERCEIRIZACAO', 'IMPOSTOS_TAXAS', 'OUTROS');

-- CreateEnum
CREATE TYPE "tipo_recorrencia_custo" AS ENUM ('UNICO', 'MENSAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "responsavel_custo" AS ENUM ('CLIENTE', 'DESENVOLVEDOR');

-- CreateEnum
CREATE TYPE "status_pagamento" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "autor_comentario" AS ENUM ('CLIENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "tipo_chamado_projeto" AS ENUM ('MANUTENCAO', 'ALTERACAO', 'MELHORIA', 'SUPORTE');

-- CreateEnum
CREATE TYPE "prioridade_chamado" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "status_chamado_projeto" AS ENUM ('ABERTO', 'EM_ANALISE', 'EM_EXECUCAO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO');

-- CreateEnum
CREATE TYPE "status_fila" AS ENUM ('AGUARDANDO', 'NOTIFICADO', 'CONVERTIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "admin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "totp_secret" VARCHAR(255),
    "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_login_em" TIMESTAMPTZ,
    "ultimo_login_ip" VARCHAR(45),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_dispositivos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_id" UUID NOT NULL,
    "nome_dispositivo" VARCHAR(255) NOT NULL,
    "credential_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "sign_count" BIGINT NOT NULL DEFAULT 0,
    "transports" VARCHAR(255),
    "user_agent" VARCHAR(500),
    "ip_registro" VARCHAR(45),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_uso_em" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "empresa" VARCHAR(255),
    "telefone" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "documento" VARCHAR(50),
    "notas" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "origem" "origem_ideia" NOT NULL DEFAULT 'PUBLICO_SITE',
    "cliente_nome" VARCHAR(255) NOT NULL,
    "empresa_nome" VARCHAR(255),
    "cliente_telefone" VARCHAR(255) NOT NULL,
    "cliente_email" VARCHAR(255),
    "ideia_inicial" TEXT NOT NULL,
    "orcamento_previo_cliente" VARCHAR(100),
    "status" "status_ticket" NOT NULL DEFAULT 'NOVO',
    "notas_conversa" TEXT,
    "resumo_mvp" TEXT,
    "link_prototipo_mvp" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "ticket_id" INTEGER,
    "nome" VARCHAR(255) NOT NULL,
    "categoria_projeto" VARCHAR(100),
    "complexidade_geral" "complexidade_nivel" NOT NULL DEFAULT 'MEDIA',
    "fator_seguranca_jr" DECIMAL(4,2) NOT NULL DEFAULT 1.30,
    "valor_hora_base" DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    "horas_estimadas" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "horas_gastas" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "orcamento_calculado" DECIMAL(10,2),
    "orcamento_cobrado" DECIMAL(10,2),
    "status" "status_projeto" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "start_date" DATE,
    "end_date" DATE,
    "notas_internas" TEXT,
    "codigo_rastreio" VARCHAR(64) NOT NULL DEFAULT md5((random())::text || (clock_timestamp())::text),
    "cliente_pode_comentar" BOOLEAN NOT NULL DEFAULT true,
    "aceita_chamados" BOOLEAN NOT NULL DEFAULT true,
    "is_publico" BOOLEAN NOT NULL DEFAULT false,
    "is_confidencial" BOOLEAN NOT NULL DEFAULT false,
    "is_destaque" BOOLEAN NOT NULL DEFAULT false,
    "resumo_nome" VARCHAR(255),
    "descricao" TEXT,
    "stacks_utilizadas" VARCHAR(255),
    "imagem_url" VARCHAR(500),
    "live_url" VARCHAR(500),
    "github_url" VARCHAR(500),
    "figma_url" VARCHAR(500),
    "video_url" VARCHAR(500),
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisitos_projetos" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "codigo" VARCHAR(20),
    "tipo" "tipo_requisito" NOT NULL DEFAULT 'FUNCIONAL',
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT NOT NULL,
    "prioridade" "prioridade_moscow" NOT NULL DEFAULT 'MUST_HAVE',
    "complexidade" "complexidade_nivel" NOT NULL DEFAULT 'MEDIA',
    "horas_estimadas" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "implementado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisitos_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duvidas_projetos" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "requisito_id" INTEGER,
    "duvida" TEXT NOT NULL,
    "resposta" TEXT,
    "status" "status_duvida" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duvidas_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes_arquiteturais" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "padrao_arquitetural" VARCHAR(100),
    "linguagem_escolhida" VARCHAR(100),
    "framework_escolhido" VARCHAR(100),
    "banco_escolhido" VARCHAR(100),
    "criterios_pesos" JSONB NOT NULL DEFAULT '{}',
    "alternativas_comparadas" JSONB NOT NULL DEFAULT '[]',
    "justificativa_escolha" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_arquiteturais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adrs" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "status" "status_adr" NOT NULL DEFAULT 'ACEITO',
    "contexto" TEXT NOT NULL,
    "decisao" TEXT NOT NULL,
    "consequencias" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custos_projetos" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "categoria_custo" "categoria_custo" NOT NULL,
    "tipo_recorrencia" "tipo_recorrencia_custo" NOT NULL DEFAULT 'UNICO',
    "pago_por" "responsavel_custo" NOT NULL DEFAULT 'CLIENTE',
    "valor" DECIMAL(10,2) NOT NULL,
    "link_fonte" VARCHAR(500),
    "comprovante_url" VARCHAR(500),
    "data_custo" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custos_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_projetos" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "descricao" VARCHAR(255) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data_vencimento" DATE NOT NULL,
    "data_pagamento" DATE,
    "status" "status_pagamento" NOT NULL DEFAULT 'PENDENTE',
    "comprovante_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas_projetos" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "requisito_id" INTEGER,
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "visivel_cliente" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarefas_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_tarefas" (
    "id" SERIAL NOT NULL,
    "tarefa_id" INTEGER NOT NULL,
    "item" VARCHAR(255) NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios_projetos" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "tarefa_id" INTEGER,
    "autor" "autor_comentario" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "anexo_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamados_projetos" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "tarefa_gerada_id" INTEGER,
    "protocolo" VARCHAR(30) NOT NULL,
    "tipo" "tipo_chamado_projeto" NOT NULL DEFAULT 'MANUTENCAO',
    "prioridade" "prioridade_chamado" NOT NULL DEFAULT 'MEDIA',
    "status" "status_chamado_projeto" NOT NULL DEFAULT 'ABERTO',
    "aberto_por" "autor_comentario" NOT NULL DEFAULT 'CLIENTE',
    "solicitante_nome" VARCHAR(255),
    "solicitante_contato" VARCHAR(255),
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT NOT NULL,
    "anexo_url" VARCHAR(500),
    "horas_estimadas_chamado" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "valor_adicional_orcado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notas_internas_admin" TEXT,
    "resolvido_em" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamados_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacoes_chamados" (
    "id" SERIAL NOT NULL,
    "chamado_id" INTEGER NOT NULL,
    "autor" "autor_comentario" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "anexo_url" VARCHAR(500),
    "visivel_cliente" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacoes_chamados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "projeto_id" INTEGER,
    "cliente_nome" VARCHAR(255) NOT NULL,
    "cliente_cargo" VARCHAR(255),
    "empresa_nome" VARCHAR(255),
    "depoimento" TEXT NOT NULL,
    "nota" INTEGER NOT NULL DEFAULT 5,
    "is_publicado" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fila_espera" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "ideia_resumo" VARCHAR(500),
    "status" "status_fila" NOT NULL DEFAULT 'AGUARDANDO',
    "consentimento_lgpd" BOOLEAN NOT NULL DEFAULT false,
    "token_cancelamento" VARCHAR(64) NOT NULL DEFAULT md5((random())::text || (clock_timestamp())::text),
    "ticket_id" INTEGER,
    "notificado_em" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fila_espera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_dispositivos_credential_id_key" ON "admin_dispositivos"("credential_id");

-- CreateIndex
CREATE INDEX "idx_admin_dispositivos_admin" ON "admin_dispositivos"("admin_id");

-- CreateIndex
CREATE INDEX "idx_tickets_status" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "idx_tickets_cliente" ON "tickets"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "projetos_ticket_id_key" ON "projetos"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "projetos_codigo_rastreio_key" ON "projetos"("codigo_rastreio");

-- CreateIndex
CREATE INDEX "idx_projetos_status" ON "projetos"("status");

-- CreateIndex
CREATE INDEX "idx_projetos_cliente" ON "projetos"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_requisitos_projeto" ON "requisitos_projetos"("projeto_id");

-- CreateIndex
CREATE INDEX "idx_duvidas_projeto" ON "duvidas_projetos"("projeto_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_arquiteturais_projeto_id_key" ON "avaliacoes_arquiteturais"("projeto_id");

-- CreateIndex
CREATE INDEX "idx_adrs_projeto" ON "adrs"("projeto_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_adrs_projeto_numero" ON "adrs"("projeto_id", "numero");

-- CreateIndex
CREATE INDEX "idx_custos_projeto" ON "custos_projetos"("projeto_id");

-- CreateIndex
CREATE INDEX "idx_pagamentos_projeto" ON "pagamentos_projetos"("projeto_id");

-- CreateIndex
CREATE INDEX "idx_tarefas_projeto" ON "tarefas_projetos"("projeto_id");

-- CreateIndex
CREATE INDEX "idx_tarefas_requisito" ON "tarefas_projetos"("requisito_id");

-- CreateIndex
CREATE INDEX "idx_checklist_tarefa" ON "checklist_tarefas"("tarefa_id");

-- CreateIndex
CREATE INDEX "idx_comentarios_projeto" ON "comentarios_projetos"("projeto_id");

-- CreateIndex
CREATE UNIQUE INDEX "chamados_projetos_protocolo_key" ON "chamados_projetos"("protocolo");

-- CreateIndex
CREATE INDEX "idx_chamados_projeto" ON "chamados_projetos"("projeto_id");

-- CreateIndex
CREATE INDEX "idx_chamados_status" ON "chamados_projetos"("status");

-- CreateIndex
CREATE INDEX "idx_chamados_prioridade" ON "chamados_projetos"("prioridade");

-- CreateIndex
CREATE INDEX "idx_interacoes_chamado" ON "interacoes_chamados"("chamado_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_projeto_id_key" ON "avaliacoes"("projeto_id");

-- CreateIndex
CREATE UNIQUE INDEX "fila_espera_token_cancelamento_key" ON "fila_espera"("token_cancelamento");

-- CreateIndex
CREATE UNIQUE INDEX "fila_espera_ticket_id_key" ON "fila_espera"("ticket_id");

-- CreateIndex
CREATE INDEX "idx_fila_status_ordem" ON "fila_espera"("status", "created_at");

-- AddForeignKey
ALTER TABLE "admin_dispositivos" ADD CONSTRAINT "admin_dispositivos_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_projetos" ADD CONSTRAINT "requisitos_projetos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duvidas_projetos" ADD CONSTRAINT "duvidas_projetos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duvidas_projetos" ADD CONSTRAINT "duvidas_projetos_requisito_id_fkey" FOREIGN KEY ("requisito_id") REFERENCES "requisitos_projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes_arquiteturais" ADD CONSTRAINT "avaliacoes_arquiteturais_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adrs" ADD CONSTRAINT "adrs_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custos_projetos" ADD CONSTRAINT "custos_projetos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_projetos" ADD CONSTRAINT "pagamentos_projetos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas_projetos" ADD CONSTRAINT "tarefas_projetos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas_projetos" ADD CONSTRAINT "tarefas_projetos_requisito_id_fkey" FOREIGN KEY ("requisito_id") REFERENCES "requisitos_projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_tarefas" ADD CONSTRAINT "checklist_tarefas_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefas_projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_projetos" ADD CONSTRAINT "comentarios_projetos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_projetos" ADD CONSTRAINT "comentarios_projetos_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefas_projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados_projetos" ADD CONSTRAINT "chamados_projetos_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados_projetos" ADD CONSTRAINT "chamados_projetos_tarefa_gerada_id_fkey" FOREIGN KEY ("tarefa_gerada_id") REFERENCES "tarefas_projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes_chamados" ADD CONSTRAINT "interacoes_chamados_chamado_id_fkey" FOREIGN KEY ("chamado_id") REFERENCES "chamados_projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fila_espera" ADD CONSTRAINT "fila_espera_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- Regras de docs/back/schema.sql que o schema.prisma não expressa
-- ============================================================================

-- Progresso do projeto sempre entre 0 e 100
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_progresso_check" CHECK ("progresso" >= 0 AND "progresso" <= 100);

-- Nota do depoimento entre 1 e 5
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_nota_check" CHECK ("nota" >= 1 AND "nota" <= 5);

-- Um mesmo e-mail só pode estar uma vez na fila enquanto AGUARDANDO (sem diferenciar maiúsculas)
CREATE UNIQUE INDEX "uq_fila_email_aguardando" ON "fila_espera" (lower("email")) WHERE "status" = 'AGUARDANDO';
