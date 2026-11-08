// Tipos do painel — espelham docs/back/schema.sql

export type StatusTicket =
  | 'NOVO'
  | 'EM_CONVERSA'
  | 'MVP_EM_ELABORACAO'
  | 'MVP_APRESENTADO'
  | 'ACEITO_CONVERTIDO'
  | 'DESISTENCIA';

export type StatusProjeto = 'EM_ANDAMENTO' | 'INATIVO' | 'CONCLUIDO';

export interface TicketResumo {
  id: number;
  cliente_nome: string;
  empresa_nome: string | null;
  ideia_inicial: string;
  orcamento_previo_cliente: string | null;
  status: StatusTicket;
  created_at: string;
}

export interface ProjetoResumo {
  id: number;
  nome: string;
  cliente_nome: string | null;
  status: StatusProjeto;
  progresso: number; // 0..100
  end_date: string | null;
  horas_estimadas: number;
  horas_gastas: number;
}

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
