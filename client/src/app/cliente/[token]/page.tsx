import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CalendarClock, LifeBuoy, Lock, Mail, Plus, Wallet } from 'lucide-react';
import AreaTopo from '@/components/portal/AreaTopo';
import StatusBadge from '@/components/admin/StatusBadge';
import { Barra } from '@/components/admin/ui';
import { brl, data } from '@/lib/admin-format';
import { getAreaCliente } from '@/lib/area-cliente-api';
import { emailLink, getContent } from '@/lib/content';

export const metadata: Metadata = { title: 'Meus projetos', robots: { index: false, follow: false } };

async function Area({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [area, content] = await Promise.all([getAreaCliente(token), getContent()]);
  if (!area) notFound();
  const email = emailLink(content);

  return (
    <div className="min-h-dvh">
      <AreaTopo marca={content.perfil.marca} />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        <div>
          <p className="text-sm text-muted-foreground">Olá, {area.nome.split(' ')[0]}!</p>
          <h1 className="text-2xl font-semibold tracking-tight">{area.empresa ?? 'Seus projetos'}</h1>
        </div>

        <ul className="space-y-4">
          {area.projetos.map((p) => (
            <li key={p.codigo_rastreio} className="rounded-2xl border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight">{p.nome}</h2>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Barra valor={p.progresso} className="h-2 flex-1" />
                <span className="w-10 text-right font-mono text-sm text-muted-foreground">{p.progresso}%</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {p.end_date && (
                  <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-4 text-subtle" /> {p.status === 'CONCLUIDO' ? 'Entregue em' : 'Entrega prevista'} {data(p.end_date)}</span>
                )}
                {p.proximo_pagamento && (
                  <span className="inline-flex items-center gap-1.5"><Wallet className="size-4 text-subtle" /> {brl(p.proximo_pagamento.valor)} vence {data(p.proximo_pagamento.data_vencimento)}</span>
                )}
                {p.chamados_abertos > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-foreground"><LifeBuoy className="size-4 text-brand" /> {p.chamados_abertos} chamado(s) em andamento</span>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                <Link href={`/status/${p.codigo_rastreio}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/85">
                  Acompanhar <ArrowRight className="size-4" />
                </Link>
                {p.aceita_chamados ? (
                  <Link href={`/status/${p.codigo_rastreio}#chamados`} className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground">
                    <Plus className="size-4" /> Abrir chamado
                  </Link>
                ) : (
                  <span className="inline-flex h-9 items-center gap-1.5 px-2 text-xs text-subtle">
                    <Lock className="size-3.5" /> Suporte encerrado — fale comigo para renovar
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <section className="grid gap-4 rounded-2xl border border-dashed p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <h2 className="font-medium">Precisa de algo fora desses projetos?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Uma ideia nova ou um sistema que já existe e precisa de ajuda.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Link href="/#contato" className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm transition hover:bg-accent">Enviar ideia</Link>
            {email && (
              <a href={email.url} className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm transition hover:bg-accent">
                <Mail className="size-4" /> E-mail
              </a>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-subtle">Este link é pessoal. Se ele vazar, peça um novo — o antigo para de funcionar.</p>
      </main>
    </div>
  );
}

/** Área do cliente: todos os projetos dele num lugar, com atalho para acompanhar e abrir chamados. */
export default function AreaClientePage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Carregando…</div>}>
      <Area params={params} />
    </Suspense>
  );
}
