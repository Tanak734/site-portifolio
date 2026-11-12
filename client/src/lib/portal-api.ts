// Dados do Portal do Cliente (/status/[token]) — só o que o cliente pode ver.
// Prévia: monta a partir de src/data/mock-admin.ts; com backend: GET /api/portal/:token.
import 'server-only';
import { USE_MOCKS } from './flags';
import { mockChamados, mockProjetos, progressoDe } from '@/data/mock-admin';
import type { Chamado, Comentario, Custo, Pagamento, ProjetoDetalhe, Tarefa } from './admin-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export type PortalDados = {
  projeto: Pick<ProjetoDetalhe, 'nome' | 'cliente_nome' | 'status' | 'progresso' | 'start_date' | 'end_date' | 'aceita_chamados' | 'cliente_pode_comentar'>;
  tarefas: Tarefa[];
  custos: Custo[];
  pagamentos: Pagamento[];
  comentarios: Comentario[];
  chamados: Pick<Chamado, 'id' | 'protocolo' | 'tipo' | 'status' | 'titulo' | 'created_at' | 'updated_at' | 'interacoes'>[];
};

export async function getPortal(token: string): Promise<PortalDados | null> {
  if (!USE_MOCKS) {
    const res = await fetch(`${API_URL}/api/portal/${encodeURIComponent(token)}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Erro HTTP ${res.status} no portal`);
    return res.json();
  }
  const p = mockProjetos.find((x) => x.codigo_rastreio === token);
  if (!p) return null;
  return structuredClone({
    projeto: {
      nome: p.nome,
      cliente_nome: p.cliente_nome,
      status: p.status,
      progresso: progressoDe(p),
      start_date: p.start_date,
      end_date: p.end_date,
      aceita_chamados: p.aceita_chamados,
      cliente_pode_comentar: p.cliente_pode_comentar,
    },
    tarefas: p.tarefas.filter((t) => t.visivel_cliente),
    custos: p.custos.filter((c) => c.pago_por === 'CLIENTE'),
    pagamentos: p.pagamentos,
    comentarios: p.comentarios,
    chamados: mockChamados
      .filter((c) => c.projeto_id === p.id)
      .map(({ id, protocolo, tipo, status, titulo, created_at, updated_at, interacoes }) => ({
        id, protocolo, tipo, status, titulo, created_at, updated_at,
        interacoes: interacoes.filter((i) => i.visivel_cliente),
      })),
  });
}
