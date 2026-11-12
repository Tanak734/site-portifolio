'use client';

import { Dialog as D } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Modal centralizado ou gaveta lateral (lado="direita") do painel.
 * Controlado: `aberto` + `onFechar`.
 */
export default function Modal({
  aberto,
  onFechar,
  titulo,
  descricao,
  children,
  rodape,
  lado,
  className = '',
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  children: ReactNode;
  rodape?: ReactNode;
  lado?: 'direita';
  className?: string;
}) {
  const gaveta = lado === 'direita';
  return (
    <D.Root open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <D.Portal>
        <D.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm" />
        <D.Popup
          className={`fixed z-50 flex flex-col bg-card text-sm shadow-2xl outline-none ring-1 ring-foreground/10 transition duration-200 ${
            gaveta
              ? 'inset-y-0 right-0 w-full max-w-xl data-ending-style:translate-x-8 data-ending-style:opacity-0 data-starting-style:translate-x-8 data-starting-style:opacity-0'
              : 'top-1/2 left-1/2 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0'
          } ${className}`}
        >
          <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div className="min-w-0">
              <D.Title className="text-base font-semibold tracking-tight">{titulo}</D.Title>
              {descricao && <D.Description className="mt-0.5 text-sm text-muted-foreground">{descricao}</D.Description>}
            </div>
            <D.Close className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="Fechar">
              <X className="size-4" />
            </D.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {rodape && <footer className={`flex flex-wrap items-center justify-end gap-2 border-t px-5 py-3.5 ${gaveta ? '' : 'rounded-b-2xl'}`}>{rodape}</footer>}
        </D.Popup>
      </D.Portal>
    </D.Root>
  );
}
