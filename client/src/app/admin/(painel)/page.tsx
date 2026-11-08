import Link from 'next/link';
import { ArrowRight, Clock, FolderKanban, Inbox, MessagesSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import { requireAdmin } from '@/lib/auth';
import { getProjetosAdmin, getTickets } from '@/lib/admin-api';

const EM_NEGOCIACAO = ['EM_CONVERSA', 'MVP_EM_ELABORACAO', 'MVP_APRESENTADO'];
const dataCurta = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

export default async function DashboardPage() {
  const [admin, tickets, projetos] = await Promise.all([requireAdmin(), getTickets(), getProjetosAdmin()]);

  const novos = tickets.filter((t) => t.status === 'NOVO').length;
  const negociacao = tickets.filter((t) => EM_NEGOCIACAO.includes(t.status)).length;
  const andamento = projetos.filter((p) => p.status === 'EM_ANDAMENTO');
  const horasGastas = andamento.reduce((s, p) => s + p.horas_gastas, 0);
  const horasEstimadas = andamento.reduce((s, p) => s + p.horas_estimadas, 0);

  const kpis = [
    { label: 'Tickets novos', valor: novos, detalhe: 'aguardando primeiro contato', icon: Inbox, destaque: novos > 0 },
    { label: 'Em negociação', valor: negociacao, detalhe: 'conversa ou MVP', icon: MessagesSquare },
    { label: 'Projetos em andamento', valor: andamento.length, detalhe: `${projetos.length} no total`, icon: FolderKanban },
    { label: 'Horas (em andamento)', valor: `${horasGastas}h`, detalhe: `de ${horasEstimadas}h estimadas`, icon: Clock },
  ];

  return (
    <>
      <PageHeader title={`Olá, ${admin.nome.split(' ')[0]}`} description="Visão geral do funil comercial e dos projetos ativos." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, valor, detalhe, icon: IconCmp, destaque }) => (
          <div key={label} className={`rounded-2xl border p-5 ${destaque ? 'border-primary/50 bg-primary/10' : 'bg-card'}`}>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {label}
              <IconCmp className={`size-4 ${destaque ? 'text-brand' : 'text-subtle'}`} />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{valor}</p>
            <p className="mt-1 text-xs text-subtle">{detalhe}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border bg-card">
          <header className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-medium">Tickets recentes</h2>
            <Link href="/admin/tickets" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand">
              Ver funil <ArrowRight className="size-3.5" />
            </Link>
          </header>
          <ul className="divide-y">
            {tickets.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {t.cliente_nome}
                    {t.empresa_nome && <span className="font-normal text-muted-foreground"> · {t.empresa_nome}</span>}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{t.ideia_inicial}</p>
                  <p className="mt-1 text-xs text-subtle">
                    #{t.id} · {dataCurta(t.created_at)}
                    {t.orcamento_previo_cliente && ` · ${t.orcamento_previo_cliente}`}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card">
          <header className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-medium">Projetos</h2>
            <Link href="/admin/projetos" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand">
              Ver todos <ArrowRight className="size-3.5" />
            </Link>
          </header>
          <ul className="divide-y">
            {projetos.map((p) => (
              <li key={p.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.nome}</p>
                    <p className="text-xs text-subtle">
                      {p.cliente_nome ?? 'Projeto pessoal'}
                      {p.end_date && ` · entrega ${new Date(p.end_date).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={p.progresso} className="flex-1" />
                  <span className="w-10 text-right font-mono text-xs text-muted-foreground">{p.progresso}%</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
