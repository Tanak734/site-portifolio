// Logos de tecnologias (simple-icons, licença CC0) — só no servidor: o pacote completo tem ~4,6 MB de SVG.
// Os componentes recebem apenas { path, hex } do ícone já resolvido.
import 'server-only';
import * as simpleIcons from 'simple-icons';
import type { TechIconData } from './tech-icon-color';
import { CATEGORIAS_ICONES, type CategoriaIcone } from './tech-icons-catalogo';

export type { TechIconData } from './tech-icon-color';
export type { CategoriaIcone } from './tech-icons-catalogo';

type SimpleIcon = { title: string; slug: string; path: string; hex: string };
export type IconeBusca = TechIconData & { slug: string; title: string; categoria: CategoriaIcone };

const ICONES = new Map<string, SimpleIcon>();
for (const v of Object.values(simpleIcons) as unknown[]) {
  const i = v as Partial<SimpleIcon>;
  if (i && typeof i.slug === 'string' && typeof i.path === 'string') ICONES.set(i.slug, i as SimpleIcon);
}

// Ícones extras que o simple-icons não tem.
// Java: a xícara foi removida a pedido da Oracle; usamos o Duke (mascote oficial, desenho do OpenJDK) na cor do Java.
const openjdk = ICONES.get('openjdk');
if (openjdk) ICONES.set('java', { title: 'Java', slug: 'java', path: openjdk.path, hex: 'E76F00' });

// Slugs antigos (padrão skillicons.dev) que já estão salvos no conteúdo → slug do simple-icons.
const ALIASES: Record<string, string> = {
  nodejs: 'nodedotjs',
  ts: 'typescript',
  js: 'javascript',
  postgres: 'postgresql',
  tailwind: 'tailwindcss',
  nextjs: 'nextdotjs',
  vue: 'vuedotjs',
  py: 'python',
  mongo: 'mongodb',
};

// Catálogo do seletor: só os slugs liberados em tech-icons-catalogo.ts (slug → categoria).
const CATALOGO = new Map<string, CategoriaIcone>();
for (const [cat, { slugs }] of Object.entries(CATEGORIAS_ICONES) as [CategoriaIcone, { slugs: readonly string[] }][])
  for (const s of slugs) if (ICONES.has(s)) CATALOGO.set(s, cat);

/** Categorias com contagem, para os filtros do seletor. */
export const categoriasIcones = () =>
  (Object.entries(CATEGORIAS_ICONES) as [CategoriaIcone, { nome: string; slugs: readonly string[] }][]).map(
    ([id, c]) => ({ id, nome: c.nome, total: c.slugs.length }),
  );

// O resolver aceita qualquer slug do simple-icons: um ícone já salvo continua aparecendo mesmo se sair do catálogo.
const resolver = (slug: string) => ICONES.get(slug) ?? ICONES.get(ALIASES[slug] ?? '');

export function techIcon(slug: string | null | undefined): TechIconData | null {
  const i = slug ? resolver(slug) : undefined;
  return i ? { path: i.path, hex: `#${i.hex}` } : null;
}

/** Ícones de todos os slugs informados (para as prévias do editor). */
export function techIconsFor(slugs: (string | null)[]): Record<string, TechIconData> {
  const out: Record<string, TechIconData> = {};
  for (const s of slugs) {
    const icon = techIcon(s);
    if (s && icon) out[s] = icon;
  }
  return out;
}

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Sugestões quando a busca está vazia.
const POPULARES = [
  'typescript', 'javascript', 'java', 'react', 'nextdotjs', 'nodedotjs', 'tailwindcss', 'postgresql', 'docker',
  'python', 'fastapi', 'fastify', 'prisma', 'astro', 'vuedotjs', 'mongodb', 'redis', 'git', 'github',
  'figma', 'vite', 'sqlite', 'mysql', 'linux', 'nginx',
];

const paraBusca = (i: SimpleIcon): IconeBusca => ({
  slug: i.slug,
  title: i.title,
  path: i.path,
  hex: `#${i.hex}`,
  categoria: CATALOGO.get(i.slug) ?? 'especificos',
});

/** Busca por nome ou slug dentro do catálogo (opcionalmente numa categoria). Ordem: igual > começa com > contém. */
export function buscarIcones(
  termo: string,
  categoria: CategoriaIcone | null = null,
  limite = 60,
): { itens: IconeBusca[]; total: number } {
  const q = normalizar(termo);
  if (categoria) {
    const lista = CATEGORIAS_ICONES[categoria].slugs
      .map((s) => ICONES.get(s))
      .filter((i): i is SimpleIcon => !!i)
      .filter((i) => !q || normalizar(i.title).includes(q) || i.slug.includes(q));
    return { itens: lista.slice(0, 200).map(paraBusca), total: lista.length };
  }
  if (!q) {
    const itens = POPULARES.map((s) => ICONES.get(s)).filter((i): i is SimpleIcon => !!i).map(paraBusca);
    return { itens, total: itens.length };
  }
  const achados: { i: SimpleIcon; nota: number }[] = [];
  for (const slug of CATALOGO.keys()) {
    const i = ICONES.get(slug)!;
    const t = normalizar(i.title);
    const s = i.slug;
    const nota =
      t === q || s === q ? 0 : t.startsWith(q) || s.startsWith(q) ? 1 : t.includes(q) || s.includes(q) ? 2 : -1;
    if (nota >= 0) achados.push({ i, nota });
  }
  achados.sort((a, b) => a.nota - b.nota || a.i.title.length - b.i.title.length || a.i.title.localeCompare(b.i.title));
  return { itens: achados.slice(0, limite).map(({ i }) => paraBusca(i)), total: achados.length };
}
