// Leitura de dados do painel (servidor). Repassa o cookie do admin para a API NestJS.
// Chame somente dentro de componentes já protegidos por requireAdmin() + <Suspense>.
// NEXT_PUBLIC_USE_MOCKS="true" → dados de src/data/mock-admin.ts (prévia sem backend).
import 'server-only';
import { cookies } from 'next/headers';
import { USE_MOCKS } from './flags';
import { requireAdmin } from './auth';
import { mockChamados, mockClientes, mockDispositivos, mockProjetos, mockTickets, progressoDe, horasEstimadasDe, horasGastasDe, resumoProjeto } from '@/data/mock-admin';
import { CHAMADO_ABERTO } from './admin-types';
import type { Chamado, ChamadoResumo, Cliente, ClienteResumo, Dispositivo, ProjetoDetalhe, ProjetoResumo, Ticket } from './admin-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

async function adminFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Erro HTTP ${res.status} em ${endpoint}`);
  return res.json();
}

/** Busca autorizada: mock na prévia, API no resto. Retorna null em 404. */
async function dado<T>(mock: () => T, endpoint: string): Promise<T> {
  await requireAdmin(); // DAL: autoriza junto do dado, não só no layout
  if (USE_MOCKS) return structuredClone(mock());
  return adminFetch<T>(endpoint);
}

const resumoChamado = (c: Chamado): ChamadoResumo => ({
  id: c.id, protocolo: c.protocolo, projeto_id: c.projeto_id, projeto_nome: c.projeto_nome, cliente_nome: c.cliente_nome,
  tipo: c.tipo, prioridade: c.prioridade, status: c.status, titulo: c.titulo, created_at: c.created_at, updated_at: c.updated_at,
});

/* ── Ideias ── */
export const getTickets = () => dado<Ticket[]>(() => mockTickets, '/api/admin/tickets');

/* ── Clientes ── */
export const getClientes = () =>
  dado<ClienteResumo[]>(
    () =>
      mockClientes.map((c) => {
        const projetos = mockProjetos.filter((p) => p.cliente_id === c.id);
        return {
          ...c,
          total_projetos: projetos.length,
          projetos_ativos: projetos.filter((p) => p.status === 'EM_ANDAMENTO').length,
          chamados_abertos: mockChamados.filter((ch) => projetos.some((p) => p.id === ch.projeto_id) && CHAMADO_ABERTO.includes(ch.status)).length,
        };
      }),
    '/api/admin/clientes',
  );

export type ClienteFicha = { cliente: Cliente; projetos: ProjetoResumo[]; chamados: ChamadoResumo[]; ideias: Ticket[] };
export const getCliente = (id: number) =>
  dado<ClienteFicha | null>(() => {
    const cliente = mockClientes.find((c) => c.id === id);
    if (!cliente) return null;
    const projetos = mockProjetos.filter((p) => p.cliente_id === id);
    return {
      cliente,
      projetos: projetos.map(resumoProjeto),
      chamados: mockChamados.filter((c) => projetos.some((p) => p.id === c.projeto_id)).map(resumoChamado),
      ideias: mockTickets.filter((t) => t.cliente_id === id),
    };
  }, `/api/admin/clientes/${id}`);

/* ── Projetos ── */
export const getProjetosAdmin = () => dado<ProjetoResumo[]>(() => mockProjetos.map(resumoProjeto), '/api/admin/projetos');

export const getProjeto = (id: number) =>
  dado<{ projeto: ProjetoDetalhe; chamados: ChamadoResumo[] } | null>(() => {
    const p = mockProjetos.find((x) => x.id === id);
    if (!p) return null;
    return {
      projeto: { ...p, progresso: progressoDe(p), horas_estimadas: horasEstimadasDe(p), horas_gastas: horasGastasDe(p) },
      chamados: mockChamados.filter((c) => c.projeto_id === id).map(resumoChamado),
    };
  }, `/api/admin/projetos/${id}`);

/* ── Chamados ── */
export const getChamados = () => dado<ChamadoResumo[]>(() => mockChamados.map(resumoChamado), '/api/admin/chamados');
export const getChamado = (id: number) => dado<Chamado | null>(() => mockChamados.find((c) => c.id === id) ?? null, `/api/admin/chamados/${id}`);

/* ── Segurança ── */
export const getDispositivos = () => dado<Dispositivo[]>(() => mockDispositivos, '/api/admin/dispositivos');
