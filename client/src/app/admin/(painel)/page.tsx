import Link from 'next/link';
import { AlertTriangle, ArrowRight, ArrowUpRight, CalendarClock, HelpCircle, Inbox, LifeBuoy, Plus, Wallet } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge, { PrioridadeBadge } from '@/components/admin/StatusBadge';
import { APPS, type AppId } from '@/components/admin/apps';
import { Barra, Painel } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { getChamados, getClientes, getProjeto, getProjetosAdmin, getTickets } from '@/lib/admin-api';
import { brl, data, dataCurta, diasAte } from '@/lib/admin-format';
import { CHAMADO_ABERTO } from '@/lib/admin-types';

const NEGOCIACAO = ['EM_CONVERSA', 'MVP_EM_ELABORACAO', 'MVP_APRESENTADO'];

function saudacao() {
  const h = Number(new Date().toLocaleString('pt-BR', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }));
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

type Alerta = { href: string; icon: typeof Inbox; titulo: string; detalhe: string; tom: string; badge?: React.ReactNode };

export default async function DashboardPage() {
  const [admin, tickets, projetos, chamados, clientes] = await Promise.all([requireAdmin(), getTickets(), getProjetosAdmin(), getChamados(), getClientes()]);
  const ativos = projetos.filter((p) => p.status === 'EM_ANDAMENTO');
  const detalhes = (await Promise.all(ativos.map((p) => getProjeto(p.id)))).filter((d) => d !== null);

  const novas = tickets.filter((t) => t.status === 'NOVO');
  const negociacao = tickets.filter((t) => NEGOCIACAO.includes(t.status));
  const abertos = chamados.filter((c) => CHAMADO_ABERTO.includes(c.status));
  const urgentes = abertos.filter((c) => c.prioridade === 'CRITICA' || c.prioridade === 'ALTA');
  const pagamentos = detalhes.flatMap((d) => d.projeto.pagamentos.filter((p) => p.status === 'PENDENTE').map((p) => ({ ...p, projeto: d.projeto })));
  const aReceber30 = pagamentos.filter((p) => diasAte(p.data_vencimento) <= 30);
  const duvidas = detalhes.flatMap((d) => d.projeto.duvidas.filter((x) => x.status === 'PENDENTE').map((x) => ({ ...x, projeto: d.projeto })));

  /* Métrica curta de cada aplicativo no lançador */
  const metrica: Partial<Record<AppId, string>> = {
    tickets: `${novas.length} nova${novas.length === 1 ? '' : 's'} · ${negociacao.length} em negociação`,
    clientes: `${clientes.length} clientes · ${clientes.filter((c) => c.projetos_ativos > 0).length} com projeto ativo`,
    projetos: `${ativos.length} em andamento · ${projetos.length} no total`,
    chamados: `${abertos.length} aberto${abertos.length === 1 ? '' : 's'}${urgentes.length ? ` · ${urgentes.length} urgente${urgentes.length === 1 ? '' : 's'}` : ''}`,
    config: 'Seções, serviços, FAQ e contato',
    portal: 'Prévia em /status/demo',
    seguranca: 'Passkeys e 2FA',
  };
  const contador: Partial<Record<AppId, number>> = { tickets: novas.length, chamados: urgentes.length || abertos.length };

  /* O que precisa de atenção, do mais urgente ao menos */
  const alertas: Alerta[] = [
    ...urgentes.map((c) => ({
      href: `/admin/chamados/${c.id}`,
      icon: AlertTriangle,
      titulo: c.titulo,
      detalhe: `${c.protocolo} · ${c.projeto_nome}`,
      tom: 'text-red-600 dark:text-red-400',
      badge: <PrioridadeBadge prioridade={c.prioridade} />,
    })),
    ...pagamentos
      .filter((p) => diasAte(p.data_vencimento) <= 7)
      .map((p) => {
        const d = diasAte(p.data_vencimento);
        return {
          href: `/admin/projetos/${p.projeto.id}?aba=financeiro`,
          icon: Wallet,
          titulo: `${brl(p.valor)} · ${p.descricao}`,
          detalhe: `${p.projeto.cliente_nome ?? p.projeto.nome} · ${d < 0 ? `venceu há ${-d} dia(s)` : d === 0 ? 'vence hoje' : `vence em ${d} dia(s)`}`,
          tom: 'text-amber-600 dark:text-amber-400',
        };
      }),
    ...novas.map((t) => ({
      href: `/admin/tickets?ideia=${t.id}`,
      icon: Inbox,
      titulo: `Nova ideia de ${t.cliente_nome}`,
      detalhe: t.ideia_inicial,
      tom: 'text-brand',
      badge: <StatusBadge status={t.status} />,
    })),
    ...abertos
      .filter((c) => c.status === 'ABERTO' && !urgentes.includes(c))
      .map((c) => ({ href: `/admin/chamados/${c.id}`, icon: LifeBuoy, titulo: c.titulo, detalhe: `${c.protocolo} · aguardando sua resposta`, tom: 'text-rose-600 dark:text-rose-400' })),
    ...duvidas.map((d) => ({ href: `/admin/projetos/${d.projeto.id}?aba=requisitos`, icon: HelpCircle, titulo: d.duvida, detalhe: `Dúvida pendente · ${d.projeto.nome}`, tom: 'text-muted-foreground' })),
  ];

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' })}
        title={`${saudacao()}, ${admin.nome.split(' ')[0]}`}
        description="Escolha um aplicativo ou comece pelo que precisa de atenção."
      >
        <Link href="/admin/tickets?nova=1" className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <Plus className="size-4" /> Ideia
        </Link>
        <Link href="/admin/clientes?novo=1" className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <Plus className="size-4" /> Cliente
        </Link>
        <Link href="/admin/projetos?novo=1" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/85">
          <Plus className="size-4" /> Projeto
        </Link>
      </PageHeader>

      {/* Lançador de aplicativos */}
      <section aria-label="Aplicativos" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {APPS.filter((a) => a.id !== 'inicio').map((a) => {
          const Icone = a.icon;
          const n = contador[a.id];
          return (
            <Link
              key={a.id}
              href={a.href}
              target={a.externo ? '_blank' : undefined}
              className="group relative flex flex-col rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="flex items-start justify-between">
                <span className={`grid size-11 place-items-center rounded-xl ${a.tom}`}>
                  <Icone className="size-5" />
                </span>
                {n ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{n}</span>
                ) : (
                  <ArrowUpRight className="size-4 text-subtle opacity-0 transition group-hover:opacity-100" />
                )}
              </div>
              <h2 className="mt-4 font-semibold tracking-tight">{a.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{a.descricao}</p>
              <p className="mt-auto pt-4 text-xs text-subtle">{metrica[a.id]}</p>
            </Link>
          );
        })}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Painel titulo="Precisa de atenção" descricao={alertas.length ? `${alertas.length} item(ns), do mais urgente ao menos` : undefined} semPadding>
          {alertas.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Tudo em dia por aqui. ✨</p>
          ) : (
            <ul className="divide-y">
              {alertas.slice(0, 8).map((a, i) => {
                const Icone = a.icon;
                return (
                  <li key={i}>
                    <Link href={a.href} className="flex items-start gap-3.5 px-5 py-3.5 transition hover:bg-accent/50">
                      <Icone className={`mt-0.5 size-4 shrink-0 ${a.tom}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.titulo}</p>
                        <p className="truncate text-xs text-subtle">{a.detalhe}</p>
                      </div>
                      {a.badge}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Painel>

        <div className="space-y-6">
          <Painel
            titulo="Projetos ativos"
            acao={
              <Link href="/admin/projetos" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand">
                Todos <ArrowRight className="size-3.5" />
              </Link>
            }
            semPadding
          >
            <ul className="divide-y">
              {ativos.map((p) => {
                const prazo = p.end_date ? diasAte(p.end_date) : null;
                return (
                  <li key={p.id}>
                    <Link href={`/admin/projetos/${p.id}`} className="block px-5 py-3.5 transition hover:bg-accent/50">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium">{p.nome}</p>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">{p.progresso}%</span>
                      </div>
                      <Barra valor={p.progresso} className="mt-2" />
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-subtle">
                        <CalendarClock className="size-3.5" />
                        {p.cliente_nome} · {p.end_date ? `entrega ${data(p.end_date)}${prazo !== null && prazo <= 30 ? ` (${prazo} dias)` : ''}` : 'sem prazo'} · {p.horas_gastas}h de {p.horas_estimadas}h
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Painel>

          <Painel titulo="A receber" descricao="Parcelas pendentes dos projetos ativos" semPadding>
            <div className="grid grid-cols-2 divide-x border-b">
              <div className="px-5 py-3">
                <p className="text-xs text-subtle">Próximos 30 dias</p>
                <p className="text-lg font-semibold">{brl(aReceber30.reduce((s, p) => s + p.valor, 0))}</p>
              </div>
              <div className="px-5 py-3">
                <p className="text-xs text-subtle">Total pendente</p>
                <p className="text-lg font-semibold">{brl(pagamentos.reduce((s, p) => s + p.valor, 0))}</p>
              </div>
            </div>
            <ul className="divide-y text-sm">
              {pagamentos
                .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento))
                .slice(0, 4)
                .map((p) => (
                  <li key={`${p.projeto.id}-${p.id}`} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <span className="min-w-0 truncate">
                      {p.projeto.cliente_nome} <span className="text-subtle">· {p.descricao}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      {brl(p.valor)} <span className="block text-xs text-subtle">{dataCurta(p.data_vencimento)}</span>
                    </span>
                  </li>
                ))}
            </ul>
          </Painel>
        </div>
      </div>
    </>
  );
}
