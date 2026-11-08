// Fonte do conteúdo institucional (site-content.json), lida em tempo de execução.
//  - Sem backend (NEXT_PUBLIC_USE_MOCKS="true"): lê src/data/site-content.json.
//  - Com backend: GET /api/public/site-config (fallback para o arquivo local se a API falhar).
// Cache com tag 'site-content': o editor do admin chama updateTag() após salvar,
// então o site atualiza na hora, sem rebuild.
import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cacheLife, cacheTag } from 'next/cache';
import { USE_MOCKS } from './flags';
import { siteContentSchema, type SiteContent } from './content-schema';

export type { SiteContent } from './content-schema';
export * from './content-utils';

export const CONTENT_TAG = 'site-content';
export const CONTENT_FILE = path.join(process.cwd(), 'src', 'data', 'site-content.json');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

async function lerArquivo(): Promise<SiteContent> {
  return siteContentSchema.parse(JSON.parse(await readFile(CONTENT_FILE, 'utf8')));
}

// No GitHub Pages o site fica em /site-portifolio: links internos tipo "/docs/curriculo.pdf"
// precisam desse prefixo. Em dev o prefixo é vazio e nada muda.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const comBase = (url: string) => (BASE && url.startsWith('/') && !url.startsWith('//') ? BASE + url : url);
function aplicarBase(c: SiteContent): SiteContent {
  if (!BASE) return c;
  return {
    ...c,
    perfil: { ...c.perfil, avatar_url: c.perfil.avatar_url && comBase(c.perfil.avatar_url) },
    links_sociais: c.links_sociais.map((l) => ({ ...l, url: comBase(l.url) })),
  };
}

export async function getContent(): Promise<SiteContent> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('max');
  if (USE_MOCKS) return aplicarBase(await lerArquivo());
  try {
    const res = await fetch(`${API_URL}/api/public/site-config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return aplicarBase(siteContentSchema.parse(await res.json()));
  } catch (e) {
    console.error('[content] API indisponível, usando arquivo local:', e);
    return aplicarBase(await lerArquivo());
  }
}
