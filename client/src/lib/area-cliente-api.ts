// Área do cliente (/cliente/[token]) — tudo o que é do cliente, em todos os projetos dele.
// Prévia: monta a partir de src/data/mock-admin.ts; com backend: GET /api/cliente/:token.
// Só dados que o cliente pode ver: nada de horas, valor-hora, custos seus ou notas internas.
import 'server-only';
import { USE_MOCKS } from './flags';
import { mockChamados, mockClientes, mockProjetos } from '@/data/mock-admin';
import { progresso } from './calculadora';
import { CHAMADO_ABERTO, type StatusProjeto } from './admin-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export type ProjetoDoCliente = {
  nome: string;
  status: StatusProjeto;
  progresso: number;
  end_date: string | null;
  /** Link do portal deste projeto (/status/:codigo_rastreio). */
  codigo_rastreio: string;
  aceita_chamados: boolean;
  chamados_abertos: number;
  proximo_pagamento: { descricao: string; valor: number; data_vencimento: string } | null;
};

export type AreaCliente = { nome: string; empresa: string | null; projetos: ProjetoDoCliente[] };

export async function getAreaCliente(token: string): Promise<AreaCliente | null> {
  if (!USE_MOCKS) {
    const res = await fetch(`${API_URL}/api/cliente/${encodeURIComponent(token)}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Erro HTTP ${res.status} na área do cliente`);
    return res.json();
  }
  const c = mockClientes.find((x) => x.token_portal === token && x.portal_ativo);
  if (!c) return null;
  const ordem: Record<StatusProjeto, number> = { EM_ANDAMENTO: 0, INATIVO: 1, CONCLUIDO: 2 };
  return {
    nome: c.nome,
    empresa: c.empresa,
    projetos: mockProjetos
      .filter((p) => p.cliente_id === c.id)
      .sort((a, b) => ordem[a.status] - ordem[b.status])
      .map((p) => {
        const prox = p.pagamentos.filter((x) => x.status === 'PENDENTE').sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento))[0];
        return {
          nome: p.nome,
          status: p.status,
          progresso: progresso(p),
          end_date: p.end_date,
          codigo_rastreio: p.codigo_rastreio,
          aceita_chamados: p.aceita_chamados,
          chamados_abertos: mockChamados.filter((ch) => ch.projeto_id === p.id && CHAMADO_ABERTO.includes(ch.status)).length,
          proximo_pagamento: prox ? { descricao: prox.descricao, valor: prox.valor, data_vencimento: prox.data_vencimento } : null,
        };
      }),
  };
}
