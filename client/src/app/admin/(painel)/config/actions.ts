'use server';

import { rename, writeFile } from 'node:fs/promises';
import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';
import { IS_DEMO, IS_DEV, requireAdmin } from '@/lib/auth';
import { USE_MOCKS } from '@/lib/flags';
import { CONTENT_FILE, CONTENT_TAG } from '@/lib/content';
import { siteContentSchema } from '@/lib/content-schema';
import { buscarIcones as buscar, type CategoriaIcone, type IconeBusca } from '@/lib/tech-icons';
import { CATEGORIAS_ICONES } from '@/lib/tech-icons-catalogo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export type SalvarResultado =
  | { ok: true; salvoEm: string }
  | { ok: false; erro: string; campos?: Record<string, string> };

/**
 * Salva o conteúdo do site.
 * Server Actions são endpoints POST públicos: autoriza e valida aqui, sem confiar no layout.
 *  - Sem backend (NEXT_PUBLIC_USE_MOCKS="true"): grava src/data/site-content.json (escrita atômica).
 *  - Com backend: PUT /api/admin/site-config repassando o cookie do admin.
 */
export async function salvarConteudo(payload: unknown): Promise<SalvarResultado> {
  await requireAdmin();

  const parsed = siteContentSchema.safeParse(payload);
  if (!parsed.success) {
    const campos: Record<string, string> = {};
    for (const issue of parsed.error.issues) campos[issue.path.join('.')] ??= issue.message;
    return { ok: false, erro: 'Há campos inválidos. Revise os destacados em vermelho.', campos };
  }

  try {
    if (IS_DEMO && !IS_DEV) {
      // Demonstração: valida e responde como salvo, mas não grava (o disco da Vercel é somente leitura).
      return { ok: true, salvoEm: new Date().toISOString() };
    } else if (USE_MOCKS) {
      const tmp = `${CONTENT_FILE}.tmp`;
      await writeFile(tmp, JSON.stringify(parsed.data, null, 2) + '\n', 'utf8');
      await rename(tmp, CONTENT_FILE);
    } else {
      const res = await fetch(`${API_URL}/api/admin/site-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', cookie: (await cookies()).toString() },
        body: JSON.stringify(parsed.data),
        cache: 'no-store',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Erro HTTP ${res.status}`);
      }
    }
  } catch (e) {
    console.error('[config] falha ao salvar:', e);
    return { ok: false, erro: e instanceof Error ? e.message : 'Não foi possível salvar.' };
  }

  updateTag(CONTENT_TAG); // o site passa a mostrar o conteúdo novo na próxima requisição
  return { ok: true, salvoEm: new Date().toISOString() };
}

/** Busca no catálogo do simple-icons (roda no servidor para não enviar ~4,6 MB de SVG ao navegador). */
export async function buscarIcones(termo: unknown, categoria?: unknown): Promise<{ itens: IconeBusca[]; total: number }> {
  await requireAdmin();
  const cat = typeof categoria === 'string' && categoria in CATEGORIAS_ICONES ? (categoria as CategoriaIcone) : null;
  return buscar(typeof termo === 'string' ? termo.slice(0, 60) : '', cat);
}
