'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { btnSecundario, labelCls } from './ui';

/** Caminho + botões copiar (URL completa) e abrir. */
export default function CopiarLink({ rotulo, caminho }: { rotulo: string; caminho: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div>
      <p className={labelCls}>{rotulo}</p>
      <div className="flex gap-2">
        <code className="flex h-10 min-w-0 flex-1 items-center truncate rounded-lg border bg-background px-3 font-mono text-xs text-muted-foreground">{caminho}</code>
        <button
          type="button"
          className={`${btnSecundario} h-10 shrink-0`}
          onClick={() => {
            navigator.clipboard?.writeText(`${window.location.origin}${caminho}`).then(() => {
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1500);
            });
          }}
        >
          {copiado ? <Check className="size-4 text-brand" /> : <Copy className="size-4" />} {copiado ? 'Copiado' : 'Copiar'}
        </button>
        <a href={caminho} target="_blank" rel="noopener" className={`${btnSecundario} h-10 shrink-0`} aria-label={`Abrir ${rotulo}`}>
          <ExternalLink className="size-4" />
        </a>
      </div>
    </div>
  );
}
