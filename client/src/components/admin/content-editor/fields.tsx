'use client';

import { createContext, useContext, useId, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

/** Erros de validação por caminho ("perfil.nome", "carreira.experiencias.0.cargo"…). */
export const ErrosContext = createContext<Record<string, string>>({});
const useErro = (path: string) => useContext(ErrosContext)[path];

const base =
  'w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-subtle outline-none transition focus:border-primary/70 focus:ring-3 focus:ring-primary/15 aria-invalid:border-destructive/70';

export function Field({
  label,
  hint,
  path,
  children,
  id,
}: {
  label: string;
  hint?: string;
  path: string;
  children: ReactNode;
  id: string;
}) {
  const erro = useErro(path);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {erro ? (
        <p className="text-xs text-destructive">{erro}</p>
      ) : (
        hint && <p className="text-xs text-subtle">{hint}</p>
      )}
    </div>
  );
}

export function TextField({
  label,
  hint,
  path,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  hint?: string;
  path: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const id = useId();
  const erro = useErro(path);
  return (
    <Field label={label} hint={hint} path={path} id={id}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!erro || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} h-10`}
      />
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  path,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  hint?: string;
  path: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const id = useId();
  const erro = useErro(path);
  return (
    <Field label={label} hint={hint} path={path} id={id}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        aria-invalid={!!erro || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} resize-y leading-relaxed`}
      />
    </Field>
  );
}

export function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border bg-background p-4">
      <div>
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
        {hint && <p className="mt-0.5 text-xs text-subtle">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-primary' : 'bg-secondary ring-1 ring-border'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-foreground transition-transform ${checked ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  );
}

/** Botões de mover/remover usados nas listas. */
function ItemActions({
  index,
  total,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onRemove: (i: number) => void;
  label: string;
}) {
  const btn =
    'grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30';
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Mover ${label} para cima`}>
        <ArrowUp className="size-4" />
      </button>
      <button type="button" className={btn} disabled={index === total - 1} onClick={() => onMove(index, index + 1)} aria-label={`Mover ${label} para baixo`}>
        <ArrowDown className="size-4" />
      </button>
      <button type="button" className={`${btn} hover:text-destructive`} onClick={() => onRemove(index)} aria-label={`Remover ${label}`}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

const mover = <T,>(arr: T[], from: number, to: number) => {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Lista de textos simples (frases, metas, interesses). */
export function StringList({
  label,
  hint,
  path,
  value,
  onChange,
  addLabel = 'Adicionar',
  placeholder,
}: {
  label: string;
  hint?: string;
  path: string;
  value: string[];
  onChange: (v: string[]) => void;
  addLabel?: string;
  placeholder?: string;
}) {
  const erros = useContext(ErrosContext);
  const erroLista = erros[path];
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-subtle">{hint}</p>}
      </div>
      <ul className="space-y-2">
        {value.map((v, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-right font-mono text-xs text-subtle">{i + 1}</span>
            <input
              value={v}
              placeholder={placeholder}
              aria-label={`${label} ${i + 1}`}
              aria-invalid={!!erros[`${path}.${i}`] || undefined}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              className={`${base} h-10`}
            />
            <ItemActions
              index={i}
              total={value.length}
              label={`item ${i + 1}`}
              onMove={(a, b) => onChange(mover(value, a, b))}
              onRemove={(j) => onChange(value.filter((_, k) => k !== j))}
            />
          </li>
        ))}
      </ul>
      {erroLista && <p className="text-xs text-destructive">{erroLista}</p>}
      <AddButton onClick={() => onChange([...value, ''])}>{addLabel}</AddButton>
    </div>
  );
}

/** Lista de objetos (experiências, formações, links, categorias…) renderizados em cartões. */
export function ObjectList<T>({
  items,
  onChange,
  novo,
  titulo,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  novo: () => T;
  titulo: (item: T, i: number) => string;
  addLabel: string;
  render: (item: T, i: number, set: (patch: Partial<T>) => void) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border bg-background">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
            <p className="truncate text-sm font-medium">{titulo(item, i) || <span className="text-subtle">Sem título</span>}</p>
            <ItemActions
              index={i}
              total={items.length}
              label={titulo(item, i) || `item ${i + 1}`}
              onMove={(a, b) => onChange(mover(items, a, b))}
              onRemove={(j) => onChange(items.filter((_, k) => k !== j))}
            />
          </div>
          <div className="space-y-4 p-4">
            {render(item, i, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
          </div>
        </div>
      ))}
      <AddButton onClick={() => onChange([...items, novo()])}>{addLabel}</AddButton>
    </div>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground transition hover:border-brand/50 hover:text-foreground"
    >
      <Plus className="size-4" /> {children}
    </button>
  );
}

/** Bloco com título dentro de uma aba. */
export function Bloco({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <h2 className="font-medium">{titulo}</h2>
      {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
