'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ProjectCard from './ProjectCard';
import ProjectDialog from './ProjectDialog';
import type { ProjetoPublico } from '@/lib/types';

const LIMITE = 3;

/** Grid uniforme com 3 projetos visíveis; o resto aparece no "Ver mais". */
export default function ProjectsGrid({ projetos }: { projetos: ProjetoPublico[] }) {
  const [aberto, setAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<ProjetoPublico | null>(null);
  const visiveis = aberto ? projetos : projetos.slice(0, LIMITE);
  const restantes = projetos.length - LIMITE;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visiveis.map((p, i) => (
          <div
            key={p.id}
            className={i >= LIMITE ? 'animate-in fade-in-0 slide-in-from-bottom-2 duration-500' : undefined}
          >
            <ProjectCard projeto={p} onOpen={() => setSelecionado(p)} />
          </div>
        ))}
      </div>

      {restantes > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
          >
            {aberto ? 'Ver menos' : `Ver mais ${restantes} projeto${restantes > 1 ? 's' : ''}`}
            <ChevronDown className={`size-4 transition-transform ${aberto ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      <ProjectDialog projeto={selecionado} onClose={() => setSelecionado(null)} />
    </>
  );
}
