'use client';

import { useState, type ComponentType, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical } from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  erros: number;
  alterado: boolean;
  /** Só nas seções reordenáveis. */
  visivel?: boolean;
};

type Props = {
  ativo: string;
  onSelect: (id: string) => void;
  topo: NavItem[];
  secoes: NavItem[];
  fim: NavItem[];
  geral: NavItem[];
  onMover: (de: number, para: number) => void;
  onToggleVisivel: (id: string) => void;
};

/**
 * Navegação do editor espelhando a página: topo fixo, seções do meio (arraste ou use as setas
 * para mudar a ordem no site; o olho oculta), fim fixo e configurações gerais.
 */
export default function EditorNav({ ativo, onSelect, topo, secoes, fim, geral, onMover, onToggleVisivel }: Props) {
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [sobre, setSobre] = useState<number | null>(null);

  const soltar = (e: DragEvent, para: number) => {
    e.preventDefault();
    if (arrastando !== null && arrastando !== para) onMover(arrastando, para);
    setArrastando(null);
    setSobre(null);
  };

  return (
    <nav aria-label="Partes do site" className="grid gap-x-4 gap-y-5 rounded-2xl border bg-card p-3 sm:grid-cols-2 xl:sticky xl:top-36 xl:grid-cols-1">
      <Grupo titulo="Topo da página">
        {topo.map((it) => <Item key={it.id} item={it} ativo={ativo === it.id} onSelect={onSelect} />)}
      </Grupo>

      <Grupo titulo="Seções" dica="Arraste para reordenar" className="sm:row-span-3 xl:row-span-1">
        <ol className="space-y-0.5">
          {secoes.map((it, i) => (
            <li
              key={it.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', it.id);
                setArrastando(i);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setSobre(i);
              }}
              onDragLeave={() => setSobre((s) => (s === i ? null : s))}
              onDrop={(e) => soltar(e, i)}
              onDragEnd={() => {
                setArrastando(null);
                setSobre(null);
              }}
              className={`group/item relative flex items-center rounded-lg transition ${arrastando === i ? 'opacity-40' : ''} ${
                sobre === i && arrastando !== null && arrastando !== i
                  ? arrastando < i
                    ? 'after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary'
                    : 'before:absolute before:inset-x-2 before:-top-px before:h-0.5 before:rounded-full before:bg-primary'
                  : ''
              }`}
            >
              <GripVertical className="ml-0.5 size-4 shrink-0 cursor-grab text-subtle/60 group-hover/item:text-subtle active:cursor-grabbing" aria-hidden="true" />
              <Item item={it} ativo={ativo === it.id} onSelect={onSelect} numero={i + 1} />
              <div className="absolute right-1 flex items-center gap-0.5 rounded-md bg-card/95 opacity-0 transition group-focus-within/item:opacity-100 group-hover/item:opacity-100 has-[button[aria-pressed=false]]:opacity-100">
                <MiniBtn label={`Mover ${it.label} para cima`} disabled={i === 0} onClick={() => onMover(i, i - 1)}>
                  <ArrowUp className="size-3.5" />
                </MiniBtn>
                <MiniBtn label={`Mover ${it.label} para baixo`} disabled={i === secoes.length - 1} onClick={() => onMover(i, i + 1)}>
                  <ArrowDown className="size-3.5" />
                </MiniBtn>
                <MiniBtn
                  label={it.visivel ? `Ocultar ${it.label} no site` : `Mostrar ${it.label} no site`}
                  pressed={it.visivel}
                  onClick={() => onToggleVisivel(it.id)}
                >
                  {it.visivel ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 text-subtle" />}
                </MiniBtn>
              </div>
            </li>
          ))}
        </ol>
      </Grupo>

      <Grupo titulo="Fim da página">
        {fim.map((it) => <Item key={it.id} item={it} ativo={ativo === it.id} onSelect={onSelect} />)}
      </Grupo>

      <Grupo titulo="Geral">
        {geral.map((it) => <Item key={it.id} item={it} ativo={ativo === it.id} onSelect={onSelect} />)}
      </Grupo>
    </nav>
  );
}

function Grupo({ titulo, dica, className = '', children }: { titulo: string; dica?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <p className="mb-1.5 flex items-baseline justify-between gap-2 px-2.5 text-[11px] font-medium tracking-wider text-subtle uppercase">
        {titulo}
        {dica && <span className="font-normal tracking-normal normal-case">{dica}</span>}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Item({ item, ativo, onSelect, numero }: { item: NavItem; ativo: boolean; onSelect: (id: string) => void; numero?: number }) {
  const Icone = item.icon;
  const oculto = item.visivel === false;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={ativo ? 'page' : undefined}
      className={`flex w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
        ativo ? 'bg-primary/12 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      } ${oculto ? 'opacity-55' : ''}`}
    >
      <Icone className={`size-4 shrink-0 ${ativo ? 'text-brand' : ''}`} />
      <span className={`truncate ${oculto ? 'line-through decoration-subtle/60' : ''}`}>{item.label}</span>
      {numero !== undefined && <span className="sr-only">, posição {numero}{oculto ? ', oculta' : ''}</span>}
      <span className="ml-auto flex shrink-0 items-center gap-1.5 pr-1">
        {item.erros > 0 && (
          <span className="rounded-full bg-destructive/15 px-1.5 text-[11px] font-medium text-destructive" title={`${item.erros} campo(s) com erro`}>
            {item.erros}
          </span>
        )}
        {item.alterado && <span className="size-1.5 rounded-full bg-brand" title="Alterações não salvas" />}
      </span>
    </button>
  );
}

function MiniBtn({
  label,
  onClick,
  disabled,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className="grid size-6 place-items-center rounded text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
