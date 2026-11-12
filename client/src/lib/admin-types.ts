// Tipos do painel — espelham docs/back/schema.sql (colunas em snake_case, como a API devolve).

/* ───────────── Enums ───────────── */
export type StatusTicket = 'NOVO' | 'EM_CONVERSA' | 'MVP_EM_ELABORACAO' | 'MVP_APRESENTADO' | 'ACEITO_CONVERTIDO' | 'DESISTENCIA';
export type OrigemIdeia = 'PUBLICO_SITE' | 'MANUAL_ADMIN' | 'FILA_ESPERA';
export type StatusProjeto = 'EM_ANDAMENTO' | 'INATIVO' | 'CONCLUIDO';
/** Como a mão de obra é cobrada. GRATUITO = pro bono (cliente só arca com os custos dele). */
export type ModalidadeCobranca = 'PAGO' | 'DESCONTO' | 'GRATUITO';
export type Complexidade = 'BAIXA' | 'MEDIA' | 'ALTA';
export type TipoRequisito = 'FUNCIONAL' | 'NAO_FUNCIONAL' | 'REGRA_NEGOCIO' | 'RESTRICAO_TECNICA';
export type PrioridadeMoscow = 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
export type StatusDuvida = 'PENDENTE' | 'RESPONDIDA' | 'CANCELADA';
export type StatusAdr = 'PROPOSTO' | 'ACEITO' | 'REJEITADO' | 'SUBSTITUIDO';
export type CategoriaCusto =
  | 'INFRAESTRUTURA' | 'DOMINIO_DNS' | 'APIS_SERVICOS' | 'SEGURANCA_BACKUP' | 'ASSETS_DESIGN' | 'LICENCAS_SOFTWARE'
  | 'COMUNICACAO_EMAIL' | 'MARKETING_ANALYTICS' | 'TERCEIRIZACAO' | 'IMPOSTOS_TAXAS' | 'OUTROS';
export type Recorrencia = 'UNICO' | 'MENSAL' | 'ANUAL';
export type Responsavel = 'CLIENTE' | 'DESENVOLVEDOR';
export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'CANCELADO';
export type Autor = 'CLIENTE' | 'ADMIN';
export type TipoChamado = 'MANUTENCAO' | 'ALTERACAO' | 'MELHORIA' | 'SUPORTE';
export type PrioridadeChamado = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type StatusChamado = 'ABERTO' | 'EM_ANALISE' | 'EM_EXECUCAO' | 'AGUARDANDO_CLIENTE' | 'RESOLVIDO' | 'FECHADO';

/* ───────────── Ideias (tickets) ───────────── */
export interface TicketResumo {
  id: number;
  cliente_nome: string;
  empresa_nome: string | null;
  ideia_inicial: string;
  orcamento_previo_cliente: string | null;
  status: StatusTicket;
  created_at: string;
}

export interface Ticket extends TicketResumo {
  origem: OrigemIdeia;
  cliente_id: number | null;
  cliente_telefone: string;
  cliente_email: string | null;
  notas_conversa: string | null;
  resumo_mvp: string | null;
  link_prototipo_mvp: string | null;
  updated_at: string;
}

/* ───────────── Clientes ───────────── */
export interface Cliente {
  id: number;
  nome: string;
  empresa: string | null;
  telefone: string;
  email: string | null;
  documento: string | null;
  notas: string | null;
  /** Link da área do cliente (/cliente/:token) — reúne todos os projetos dele. Revogável. */
  token_portal: string;
  portal_ativo: boolean;
  created_at: string;
}

/** GET /api/admin/clientes — com contagens. */
export interface ClienteResumo extends Cliente {
  total_projetos: number;
  projetos_ativos: number;
  chamados_abertos: number;
}

/* ───────────── Projetos ───────────── */
export interface ProjetoResumo {
  id: number;
  nome: string;
  cliente_id?: number | null;
  cliente_nome: string | null;
  status: StatusProjeto;
  progresso: number; // 0..100
  end_date: string | null;
  horas_estimadas: number;
  horas_gastas: number;
  categoria_projeto?: string | null;
  chamados_abertos?: number;
  modalidade_cobranca?: ModalidadeCobranca;
}

export interface Requisito {
  id: number;
  codigo: string | null;
  tipo: TipoRequisito;
  titulo: string;
  descricao: string;
  prioridade: PrioridadeMoscow;
  complexidade: Complexidade;
  horas_estimadas: number;
  implementado: boolean;
}

export interface Duvida {
  id: number;
  duvida: string;
  resposta: string | null;
  status: StatusDuvida;
}

export interface AvaliacaoArquitetural {
  padrao_arquitetural: string | null;
  linguagem_escolhida: string | null;
  framework_escolhido: string | null;
  banco_escolhido: string | null;
  /** criterios_pesos (JSONB): critério → peso 1..5 */
  criterios_pesos: Record<string, number>;
  /** alternativas_comparadas (JSONB): nota 1..5 de cada alternativa por critério */
  alternativas_comparadas: { nome: string; notas: Record<string, number> }[];
  justificativa_escolha: string;
}

export interface Adr {
  id: number;
  numero: number;
  titulo: string;
  status: StatusAdr;
  contexto: string;
  decisao: string;
  consequencias: string;
}

export interface Custo {
  id: number;
  descricao: string;
  categoria_custo: CategoriaCusto;
  tipo_recorrencia: Recorrencia;
  pago_por: Responsavel;
  valor: number;
  link_fonte: string | null;
  data_custo: string;
}

export interface Pagamento {
  id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: StatusPagamento;
}

export interface ChecklistItem {
  id: number;
  item: string;
  concluido: boolean;
}

export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string | null;
  /** Horas previstas e realizadas — a soma das realizadas vira as horas gastas do projeto. */
  horas_estimadas: number;
  horas_gastas: number;
  concluida: boolean;
  visivel_cliente: boolean;
  requisito_codigo: string | null;
  checklist: ChecklistItem[];
}

export interface Comentario {
  id: number;
  autor: Autor;
  mensagem: string;
  created_at: string;
}

/** GET /api/admin/projetos/:id — visão 360º do Hub. */
export interface ProjetoDetalhe extends ProjetoResumo {
  cliente_id: number | null;
  ticket_id: number | null;
  categoria_projeto: string | null;
  complexidade_geral: Complexidade;
  fator_seguranca_jr: number;
  valor_hora_base: number;
  orcamento_cobrado: number | null;
  modalidade_cobranca: ModalidadeCobranca;
  /** 0..100 — só vale com modalidade DESCONTO. */
  desconto_percentual: number;
  /** 0..100 — alíquota sobre a mão de obra cobrada (ex.: Simples Nacional). */
  impostos_percentual: number;
  /** O que você recebe em troca num projeto gratuito/com desconto (depoimento, case, indicação…). */
  contrapartida: string | null;
  start_date: string | null;
  notas_internas: string | null;
  codigo_rastreio: string;
  cliente_pode_comentar: boolean;
  aceita_chamados: boolean;
  is_publico: boolean;
  is_confidencial: boolean;
  is_destaque: boolean;
  resumo_nome: string | null;
  descricao: string | null;
  stacks_utilizadas: string | null;
  imagem_url: string | null;
  live_url: string | null;
  github_url: string | null;
  video_url: string | null;
  requisitos: Requisito[];
  duvidas: Duvida[];
  avaliacao: AvaliacaoArquitetural | null;
  adrs: Adr[];
  custos: Custo[];
  pagamentos: Pagamento[];
  tarefas: Tarefa[];
  comentarios: Comentario[];
}

/* ───────────── Chamados ───────────── */
export interface Interacao {
  id: number;
  autor: Autor;
  mensagem: string;
  visivel_cliente: boolean;
  created_at: string;
}

export interface ChamadoResumo {
  id: number;
  protocolo: string;
  projeto_id: number;
  projeto_nome: string;
  cliente_nome: string | null;
  tipo: TipoChamado;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  titulo: string;
  created_at: string;
  updated_at: string;
}

export interface Chamado extends ChamadoResumo {
  aberto_por: Autor;
  solicitante_nome: string | null;
  solicitante_contato: string | null;
  descricao: string;
  horas_estimadas_chamado: number;
  valor_adicional_orcado: number;
  notas_internas_admin: string | null;
  tarefa_gerada_id: number | null;
  interacoes: Interacao[];
}

/* ───────────── Segurança ───────────── */
export interface Dispositivo {
  id: string;
  nome_dispositivo: string;
  transports: string | null;
  user_agent: string | null;
  ativo: boolean;
  ultimo_uso_em: string | null;
  created_at: string;
}

/* ───────────── Rótulos ───────────── */
export const STATUS_TICKET_LABEL: Record<StatusTicket, string> = {
  NOVO: 'Novo',
  EM_CONVERSA: 'Em conversa',
  MVP_EM_ELABORACAO: 'MVP em elaboração',
  MVP_APRESENTADO: 'MVP apresentado',
  ACEITO_CONVERTIDO: 'Convertido',
  DESISTENCIA: 'Desistência',
};

export const STATUS_PROJETO_LABEL: Record<StatusProjeto, string> = {
  EM_ANDAMENTO: 'Em andamento',
  INATIVO: 'Inativo',
  CONCLUIDO: 'Concluído',
};

export const STATUS_CHAMADO_LABEL: Record<StatusChamado, string> = {
  ABERTO: 'Aberto',
  EM_ANALISE: 'Em análise',
  EM_EXECUCAO: 'Em execução',
  AGUARDANDO_CLIENTE: 'Aguardando cliente',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
};

export const TIPO_CHAMADO_LABEL: Record<TipoChamado, string> = {
  MANUTENCAO: 'Manutenção / bug',
  ALTERACAO: 'Alteração',
  MELHORIA: 'Melhoria',
  SUPORTE: 'Suporte / dúvida',
};

export const PRIORIDADE_LABEL: Record<PrioridadeChamado, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

export const ORIGEM_LABEL: Record<OrigemIdeia, string> = {
  PUBLICO_SITE: 'Site',
  MANUAL_ADMIN: 'Manual',
  FILA_ESPERA: 'Fila de espera',
};

export const TIPO_REQUISITO_LABEL: Record<TipoRequisito, string> = {
  FUNCIONAL: 'RF',
  NAO_FUNCIONAL: 'RNF',
  REGRA_NEGOCIO: 'Regra',
  RESTRICAO_TECNICA: 'Restrição',
};

export const MOSCOW_LABEL: Record<PrioridadeMoscow, string> = {
  MUST_HAVE: 'Must',
  SHOULD_HAVE: 'Should',
  COULD_HAVE: 'Could',
  WONT_HAVE: "Won't",
};

export const COMPLEXIDADE_LABEL: Record<Complexidade, string> = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta' };
export const MULTIPLICADOR_COMPLEXIDADE: Record<Complexidade, number> = { BAIXA: 1, MEDIA: 1.25, ALTA: 1.5 };

export const CATEGORIA_CUSTO_LABEL: Record<CategoriaCusto, string> = {
  INFRAESTRUTURA: 'Infraestrutura',
  DOMINIO_DNS: 'Domínio / DNS',
  APIS_SERVICOS: 'APIs e serviços',
  SEGURANCA_BACKUP: 'Segurança / backup',
  ASSETS_DESIGN: 'Assets / design',
  LICENCAS_SOFTWARE: 'Licenças',
  COMUNICACAO_EMAIL: 'E-mail / comunicação',
  MARKETING_ANALYTICS: 'Marketing / analytics',
  TERCEIRIZACAO: 'Terceirização',
  IMPOSTOS_TAXAS: 'Impostos / taxas',
  OUTROS: 'Outros',
};

export const MODALIDADE_LABEL: Record<ModalidadeCobranca, string> = { PAGO: 'Pago', DESCONTO: 'Com desconto', GRATUITO: 'Gratuito (pro bono)' };

export const STATUS_PAGAMENTO_LABEL: Record<StatusPagamento, string> = { PENDENTE: 'Pendente', PAGO: 'Pago', CANCELADO: 'Cancelado' };
export const RECORRENCIA_LABEL: Record<Recorrencia, string> = { UNICO: 'Único', MENSAL: 'Mensal', ANUAL: 'Anual' };
export const STATUS_ADR_LABEL: Record<StatusAdr, string> = { PROPOSTO: 'Proposto', ACEITO: 'Aceito', REJEITADO: 'Rejeitado', SUBSTITUIDO: 'Substituído' };

/** Chamados que ainda pedem ação. */
export const CHAMADO_ABERTO: StatusChamado[] = ['ABERTO', 'EM_ANALISE', 'EM_EXECUCAO', 'AGUARDANDO_CLIENTE'];
