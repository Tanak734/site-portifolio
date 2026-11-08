'use client';

import { Lock, Play } from 'lucide-react';
import ProjectMedia from './ProjectMedia';
import { parseStacks } from '@/lib/tickets';
import type { ProjetoPublico } from '@/lib/types';

/** Card do grid. Clicar abre o modal de detalhes (ProjectDialog). */
export default function ProjectCard({ projeto: p, onOpen }: { projeto: ProjetoPublico; onOpen: () => void }) {
  const stacks = parseStacks(p.stacks_utilizadas);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left transition duration-300 hover:-translate-y-1 hover:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      aria-label={`Ver detalhes de ${p.nome}`}
    >
      <div className="relative h-44 overflow-hidden border-b">
        <div className="size-full transition-transform duration-500 group-hover:scale-[1.04]">
          <ProjectMedia projeto={p} />
        </div>
        {p.is_confidencial && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" /> Sob NDA
          </span>
        )}
        {p.video_url && !p.is_confidencial && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
            <Play className="size-3 fill-current" aria-hidden="true" /> Vídeo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {p.categoria_projeto && (
          <p className="mb-1 font-mono text-[11px] tracking-wide text-brand uppercase">{p.categoria_projeto}</p>
        )}
        <h3 className="font-medium">{p.nome}</h3>
        {p.descricao && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{p.descricao}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
          {stacks.slice(0, 4).map((s) => (
            <span key={s} className="rounded-full border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {s}
            </span>
          ))}
          <span className="ml-auto text-xs text-subtle transition group-hover:text-brand">Ver detalhes →</span>
        </div>
      </div>
    </button>
  );
}
