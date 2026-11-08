// Leitura de dados do painel (servidor). Repassa o cookie do admin para a API Fastify.
// Chame somente dentro de componentes já protegidos por requireAdmin() + <Suspense>.
import 'server-only';
import { cookies } from 'next/headers';
import { USE_MOCKS } from './flags';
import { requireAdmin } from './auth';
import { mockProjetosAdmin, mockTickets } from '@/data/mock-admin';
import type { ProjetoResumo, TicketResumo } from './admin-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

async function adminFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Erro HTTP ${res.status} em ${endpoint}`);
  return res.json();
}

export async function getTickets(): Promise<TicketResumo[]> {
  await requireAdmin(); // DAL: autoriza junto do dado, não só no layout
  if (USE_MOCKS) return mockTickets;
  return adminFetch<TicketResumo[]>('/api/admin/tickets');
}

export async function getProjetosAdmin(): Promise<ProjetoResumo[]> {
  await requireAdmin();
  if (USE_MOCKS) return mockProjetosAdmin;
  return adminFetch<ProjetoResumo[]>('/api/admin/projetos');
}
