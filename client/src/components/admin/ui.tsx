// Peças visuais do painel (Server e Client Components).
import Link from 'next/link';
import { ArrowLeft, Eye, Info } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

export const inputCls =
  'h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-subtle focus:border-primary/70 focus:ring-4 focus:ring-primary/15';
export const textareaCls = `${inputCls} h-auto py-2.5 leading-relaxed resize-y`;
export const labelCls = 'mb-1.5 block text-sm font-medium';
export const btnPrimario =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/85 disabled:opacity-50';
export const btnSecundario =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-3.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50';

/** Cartão com cabeçalho opcional (título + ação à direita). */
export function Painel({
  titulo,
  descricao,
  acao,
  children,
  className = '',
  semPadding = false,
}: {
  titulo?: ReactNode;
  descricao?: ReactNode;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
  semPadding?: boolean;
}) {
  return (
    <section className={`rounded-2xl border bg-card ${className}`}>
      {(titulo || acao) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="min-w-0">
            {titulo && <h2 className="font-medium">{titulo}</h2>}
            {descricao && <p className="text-xs text-subtle">{descricao}</p>}
          </div>
          {acao}
        </header>
      )}
      <div className={semPadding ? '' : 'p-5'}>{children}</div>
    </section>
  );
}

export function Kpi({
  label,
  valor,
  detalhe,
  icon: Icone,
  destaque = false,
}: {
  label: string;
  valor: ReactNode;
  detalhe?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  destaque?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${destaque ? 'border-primary/50 bg-primary/10' : 'bg-card'}`}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        {label}
        {Icone && <Icone className={`size-4 ${destaque ? 'text-brand' : 'text-subtle'}`} />}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{valor}</p>
      {detalhe && <p className="mt-0.5 text-xs text-subtle">{detalhe}</p>}
    </div>
  );
}

export function Vazio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed px-5 py-8 text-center">
      <p className="text-sm font-medium">{titulo}</p>
      {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function Aviso({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 rounded-xl border border-dashed bg-background px-4 py-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function Avatar({ nome, className = 'size-9 text-xs' }: { nome: string; className?: string }) {
  const ini = nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
  return <span className={`grid shrink-0 place-items-center rounded-full bg-secondary font-semibold text-muted-foreground ring-1 ring-border ${className}`}>{ini}</span>;
}

/** Linha "rótulo: valor" usada em fichas. */
export function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="min-w-0 truncate text-right">{children ?? <span className="text-subtle">—</span>}</dd>
    </div>
  );
}

export function Voltar({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
      <ArrowLeft className="size-4" /> {children}
    </Link>
  );
}

/** Barra de progresso simples (sem JS). */
export function Barra({ valor, className = '' }: { valor: number; className?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-muted ${className}`} role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, valor))}%` }} />
    </div>
  );
}

/** Selo padrão para o que aparece no portal do cliente (o resto do painel é só seu). */
export function VisivelCliente({ texto = 'Cliente vê' }: { texto?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-500/12 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:text-teal-300" title="Aparece no portal do cliente">
      <Eye className="size-3" /> {texto}
    </span>
  );
}
