'use client';

import type { ComponentType } from 'react';

export type Aba<T extends string> = { id: T; label: string; icon?: ComponentType<{ className?: string }>; contagem?: number };

/** Abas que quebram linha em telas estreitas (sem barra de rolagem lateral). */
export default function Abas<T extends string>({ abas, valor, onChange, rotulo }: { abas: Aba<T>[]; valor: T; onChange: (id: T) => void; rotulo: string }) {
  return (
    <div role="tablist" aria-label={rotulo} className="flex flex-wrap gap-1 border-b pb-px">
      {abas.map(({ id, label, icon: Icone, contagem }) => {
        const ativo = id === valor;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => onChange(id)}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition ${
              ativo ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {Icone && <Icone className={`size-4 ${ativo ? 'text-brand' : ''}`} />}
            {label}
            {contagem !== undefined && contagem > 0 && (
              <span className={`rounded-full px-1.5 text-[11px] font-medium ${ativo ? 'bg-primary/15 text-brand' : 'bg-secondary text-muted-foreground'}`}>{contagem}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
