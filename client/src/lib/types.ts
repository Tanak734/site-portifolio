// Tipos espelhando as tabelas públicas de docs/back/schema.sql

/** Retorno de GET /api/public/projetos (somente campos públicos de `projetos`). */
export interface ProjetoPublico {
  id: number;
  nome: string;
  resumo_nome: string | null;
  categoria_projeto: string | null;
  descricao: string | null;
  stacks_utilizadas: string | null; // "Fastify, PostgreSQL, Docker"
  imagem_url: string | null;
  live_url: string | null;
  github_url: string | null;
  figma_url: string | null;
  /** Vídeo de demonstração exibido no modal. MP4 ou link do YouTube. */
  video_url: string | null;
  is_confidencial: boolean;
  is_destaque: boolean;
  ordem: number;
}

/** Retorno de GET /api/public/avaliacoes (tabela `avaliacoes`). */
export interface AvaliacaoPublica {
  id: number;
  cliente_nome: string;
  cliente_cargo: string | null;
  empresa_nome: string | null;
  depoimento: string;
  nota: number; // 1..5 (mantido no banco, não exibido no site)
  /** Data da avaliação (avaliacoes.created_at). */
  created_at: string;
  /** JOIN com projetos: nome e data de entrega do projeto avaliado. */
  projeto_nome: string | null;
  projeto_entrega: string | null;
}

/** Corpo de POST /api/public/tickets (tabela `tickets`). */
export interface NovoTicket {
  cliente_nome: string;
  empresa_nome?: string;
  cliente_telefone: string;
  cliente_email?: string;
  ideia_inicial: string;
  orcamento_previo_cliente?: string;
  /** Honeypot: campo invisível. Se vier preenchido, o backend descarta (bot). */
  website: string;
}
