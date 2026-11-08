'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import TechIcon from '@/components/public/TechIcon';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { buscarIcones } from '@/app/admin/(painel)/config/actions';
import type { TechIconData } from '@/lib/tech-icon-color';

type Resultado = Awaited<ReturnType<typeof buscarIcones>>;
export type CategoriaIconeInfo = { id: string; nome: string; total: number };
type Item = Resultado['itens'][number];

/**
 * Campo de ícone: mostra o atual e abre um seletor com busca no catálogo de tecnologias (simple-icons filtrado).
 * A busca roda no servidor (Server Action) com debounce.
 */
export default function IconPicker({
  id,
  slug,
  icone,
  sugestao,
  categorias,
  onSelect,
}: {
  id: string;
  slug: string | null;
  icone: TechIconData | null;
  /** Termo inicial da busca (ex.: nome da tecnologia). */
  sugestao?: string;
  categorias: CategoriaIconeInfo[];
  onSelect: (slug: string | null, icone: TechIconData | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);
  const [res, setRes] = useState<Resultado | null>(null);
  const [carregando, startTransition] = useTransition();
  const pedido = useRef(0);
  const filtros = useRef<HTMLDivElement | null>(null);

  // Roda do mouse na linha de categorias rola para os lados (como Shift + roda), sem barra visível.
  // Listener nativo porque o onWheel do React é passivo e não permite preventDefault.
  const refFiltros = useCallback((el: HTMLDivElement | null) => {
    filtros.current = el;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // trackpad horizontal já funciona sozinho
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Busca com debounce; descarta respostas atrasadas.
  useEffect(() => {
    if (!aberto) return;
    const n = ++pedido.current;
    const t = setTimeout(() => {
      startTransition(async () => {
        const r = await buscarIcones(termo, categoria);
        if (n === pedido.current) setRes(r);
      });
    }, 180);
    return () => clearTimeout(t);
  }, [termo, categoria, aberto]);

  const abrir = () => {
    setTermo(sugestao?.trim() ?? '');
    setCategoria(null);
    setAberto(true);
  };
  const escolher = (i: Item | null) => {
    onSelect(i?.slug ?? null, i ? { path: i.path, hex: i.hex } : null);
    setAberto(false);
  };

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={abrir}
        className="flex h-10 w-full items-center gap-2.5 rounded-lg border bg-background px-2 text-left text-sm transition hover:border-primary/50 focus-visible:border-primary/70 focus-visible:outline-none"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted">
          <TechIcon path={icone?.path ?? null} hex={icone?.hex} slug={slug} colorido className="size-4" />
        </span>
        <span className={`min-w-0 flex-1 truncate ${slug ? '' : 'text-muted-foreground'}`}>{slug ?? 'Escolher ícone…'}</span>
        <Search className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="flex max-h-[85dvh] flex-col gap-4 rounded-2xl border bg-card p-5 ring-0 sm:max-w-2xl">
          <div className="space-y-1 pr-8">
            <DialogTitle className="text-lg font-semibold">Escolher ícone</DialogTitle>
            <DialogDescription>
              Logos de tecnologia (Simple Icons). A cor é a oficial da marca e aparece na faixa animada.
            </DialogDescription>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id={`${id}-busca`}
              autoFocus
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Buscar: react, docker, figma…"
              className="h-11 w-full rounded-lg border bg-background pr-10 pl-9 text-sm outline-none focus:border-primary/70"
            />
            {carregando ? (
              <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : termo ? (
              <button type="button" onClick={() => setTermo('')} aria-label="Limpar busca" className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent">
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div
            ref={refFiltros}
            className="-mx-1 flex shrink-0 gap-1.5 overflow-x-auto overscroll-x-contain px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Categorias (role o mouse para ver mais)"
          >
            {[{ id: null, nome: 'Todos', total: 0 }, ...categorias].map((c) => (
              <button
                key={c.id ?? 'todos'}
                type="button"
                onClick={() => setCategoria(c.id)}
                aria-pressed={categoria === c.id}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs leading-none whitespace-nowrap transition ${
                  categoria === c.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {c.nome}
                {c.id && <span className="ml-1 opacity-60">{c.total}</span>}
              </button>
            ))}
          </div>

          <p className="text-xs text-subtle">
            {!res ? 'Carregando…' : categoria && !termo.trim() ? `${res.total} ícones nesta categoria.` : !termo.trim() ? 'Sugestões populares. Digite para buscar em todos.' : res.total === 0 ? `Nada encontrado para “${termo}”.` : res.total > res.itens.length ? `Mostrando ${res.itens.length} de ${res.total}. Refine a busca para ver outros.` : `${res.total} encontrado${res.total > 1 ? 's' : ''}.`}
          </p>

          <ul className="-mx-1 grid min-h-0 flex-1 grid-cols-3 content-start gap-2 overflow-y-auto px-1 pb-1 sm:grid-cols-5">
            {res?.itens.map((i) => (
              <li key={i.slug}>
                <button
                  type="button"
                  onClick={() => escolher(i)}
                  title={`${i.title} (${i.slug})`}
                  className={`flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border px-2 text-center transition hover:border-primary/60 hover:bg-accent ${i.slug === slug ? 'border-primary bg-accent' : 'bg-background'}`}
                >
                  <TechIcon path={i.path} hex={i.hex} colorido className="size-7" />
                  <span className="line-clamp-2 text-xs leading-tight text-muted-foreground">{i.title}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-3 border-t pt-4">
            <button type="button" onClick={() => escolher(null)} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Sem ícone (conceito)
            </button>
            <a href="https://simpleicons.org" target="_blank" rel="noopener" className="text-xs text-subtle hover:text-foreground">
              simpleicons.org ↗
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
