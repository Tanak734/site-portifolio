'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarClock, LifeBuoy, Plus, Search } from 'lucide-react';
import Modal from '../Modal';
import StatusBadge from '../StatusBadge';
import { Barra, btnPrimario, btnSecundario, inputCls, labelCls } from '../ui';
import { data, diasAte } from '@/lib/admin-format';
import { COMPLEXIDADE_LABEL, STATUS_PROJETO_LABEL, type ClienteResumo, type ProjetoResumo, type StatusProjeto } from '@/lib/admin-types';

type Filtro = StatusProjeto | 'TODOS';

export default function ProjetosLista({ inicial, clientes }: { inicial: ProjetoResumo[]; clientes: ClienteResumo[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [projetos, setProjetos] = useState(inicial);
  const [filtro, setFiltro] = useState<Filtro>('EM_ANDAMENTO');
  const [busca, setBusca] = useState('');
  const novoAberto = params.get('novo') === '1';
  const fechar = () => router.replace('/admin/projetos', { scroll: false });

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return projetos
      .filter((p) => filtro === 'TODOS' || p.status === filtro)
      .filter((p) => !q || [p.nome, p.cliente_nome, p.categoria_projeto].some((v) => v?.toLowerCase().includes(q)));
  }, [projetos, filtro, busca]);

  const FILTROS: Filtro[] = ['EM_ANDAMENTO', 'INATIVO', 'CONCLUIDO', 'TODOS'];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-full border p-1">
          {FILTROS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
              className={`rounded-full px-3 py-1 text-sm transition ${filtro === f ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f === 'TODOS' ? 'Todos' : STATUS_PROJETO_LABEL[f]}{' '}
              <span className="text-subtle">{f === 'TODOS' ? projetos.length : projetos.filter((p) => p.status === f).length}</span>
            </button>
          ))}
        </div>
        <label className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <span className="sr-only">Buscar</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Projeto, cliente ou categoria" className={`${inputCls} pl-9`} />
        </label>
        <button type="button" onClick={() => router.replace('/admin/projetos?novo=1', { scroll: false })} className={`${btnPrimario} ml-auto`}>
          <Plus className="size-4" /> Novo projeto
        </button>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((p) => {
          const prazo = p.end_date ? diasAte(p.end_date) : null;
          const estourou = p.horas_estimadas > 0 && p.horas_gastas > p.horas_estimadas;
          return (
            <li key={p.id}>
              <Link href={`/admin/projetos/${p.id}`} className="flex h-full flex-col rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold tracking-tight">{p.nome}</h2>
                    <p className="truncate text-sm text-muted-foreground">
                      {p.cliente_nome ?? 'Projeto pessoal'}
                      {p.categoria_projeto && <span className="text-subtle"> · {p.categoria_projeto}</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={p.status} />
                    {p.modalidade_cobranca === 'GRATUITO' && <span className="rounded-full border border-dashed border-primary/50 px-2 py-0.5 text-[11px] text-brand">Pro bono</span>}
                    {p.modalidade_cobranca === 'DESCONTO' && <span className="rounded-full border border-dashed px-2 py-0.5 text-[11px] text-muted-foreground">Com desconto</span>}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Barra valor={p.progresso} className="flex-1" />
                  <span className="w-9 text-right font-mono text-xs text-muted-foreground">{p.progresso}%</span>
                </div>

                <dl className="mt-4 mb-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-subtle">Horas</dt>
                    <dd className={estourou ? 'font-medium text-amber-600 dark:text-amber-400' : ''}>
                      {p.horas_gastas}h / {p.horas_estimadas}h{estourou && ' · acima'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Entrega</dt>
                    <dd className={prazo !== null && prazo <= 14 && p.status === 'EM_ANDAMENTO' ? 'font-medium text-amber-600 dark:text-amber-400' : ''}>
                      {p.end_date ? data(p.end_date) : '—'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto flex min-h-8 items-center gap-3 border-t pt-3 text-xs text-subtle">
                  {prazo !== null && p.status === 'EM_ANDAMENTO' && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="size-3.5" /> {prazo >= 0 ? `faltam ${prazo} dias` : `atrasado ${-prazo} dias`}
                    </span>
                  )}
                  {!!p.chamados_abertos && (
                    <span className="ml-auto inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <LifeBuoy className="size-3.5" /> {p.chamados_abertos} chamado(s)
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
        {lista.length === 0 && <li className="col-span-full rounded-2xl border border-dashed px-5 py-10 text-center text-sm text-muted-foreground">Nenhum projeto aqui.</li>}
      </ul>

      <Modal aberto={novoAberto} onFechar={fechar} titulo="Novo projeto" descricao="Crie direto, sem precisar de uma ideia antes. Requisitos e calculadora ficam no Hub.">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            const clienteId = Number(d.get('cliente')) || null;
            const novo: ProjetoResumo = {
              id: Math.max(0, ...projetos.map((p) => p.id)) + 1,
              nome: String(d.get('nome')).trim(),
              cliente_id: clienteId,
              cliente_nome: clientes.find((c) => c.id === clienteId)?.empresa ?? clientes.find((c) => c.id === clienteId)?.nome ?? null,
              categoria_projeto: String(d.get('categoria') ?? '').trim() || null,
              status: 'EM_ANDAMENTO',
              progresso: 0,
              end_date: String(d.get('prazo') ?? '') || null,
              horas_estimadas: 0,
              horas_gastas: 0,
              chamados_abertos: 0,
            };
            setProjetos((l) => [novo, ...l]);
            setFiltro('EM_ANDAMENTO');
            fechar();
          }}
        >
          <div>
            <label className={labelCls} htmlFor="p-nome">Nome do projeto *</label>
            <input id="p-nome" name="nome" required className={inputCls} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="p-cliente">Cliente</label>
              <select id="p-cliente" name="cliente" className={inputCls} defaultValue="">
                <option value="">Projeto pessoal / autoral</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` · ${c.empresa}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="p-cat">Categoria</label>
              <input id="p-cat" name="categoria" className={inputCls} placeholder="Sistema web, landing page…" />
            </div>
            <div>
              <label className={labelCls} htmlFor="p-comp">Complexidade</label>
              <select id="p-comp" name="complexidade" className={inputCls} defaultValue="MEDIA">
                {Object.entries(COMPLEXIDADE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="p-prazo">Prazo de entrega</label>
              <input id="p-prazo" name="prazo" type="date" className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecundario} onClick={fechar}>Cancelar</button>
            <button type="submit" className={btnPrimario}><Plus className="size-4" /> Criar projeto</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
