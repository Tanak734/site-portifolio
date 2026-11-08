// Envio do formulário (roda no navegador).
import { apiFetch } from './api';
import { USE_MOCKS } from './flags';
import type { NovoTicket } from './types';

export async function enviarTicket(ticket: NovoTicket): Promise<void> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 900));
    console.info('[mock] POST /api/public/tickets', ticket);
    return;
  }
  await apiFetch('/api/public/tickets', { method: 'POST', body: JSON.stringify(ticket) });
}

/** "Fastify, PostgreSQL, Docker" -> ["Fastify", "PostgreSQL", "Docker"] */
export const parseStacks = (s: string | null) =>
  (s ?? '').split(',').map((x) => x.trim()).filter(Boolean);
