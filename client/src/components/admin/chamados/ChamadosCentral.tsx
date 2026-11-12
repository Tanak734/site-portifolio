'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Plus, Search } from 'lucide-react';
import Modal from '../Modal';
import StatusBadge, { PrioridadeBadge } from '../StatusBadge';
import { btnPrimario, btnSecundario, inputCls, labelCls, textareaCls } from '../ui';
import { dataCurta } from '@/lib/admin-format';
import {
  CHAMADO_ABERTO,
  PRIORIDADE_LABEL,
  STATUS_CHAMADO_LABEL,
  TIPO_CHAMADO_LABEL,
  type ChamadoResumo,
  type PrioridadeChamado,
  type ProjetoResumo,
  type StatusChamado,
  type TipoChamado,
} from '@/lib/admin-types';

const PESO: Record<PrioridadeChamado, number> = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };
type Visao = 'abertos' | StatusChamado | 'todos';

export default function ChamadosCentral({ inicial, projetos }: { inicial: ChamadoResumo[]; projetos: ProjetoResumo[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [chamados, setChamados] = useState(inicial);
  const [visao, setVisao] = useState<Visao>('abertos');
  const [tipo, setTipo] = useState<TipoChamado | ''>('');
  const [projeto, setProjeto] = useState<number | ''>('');
  const [busca, setBusca] = useState('');
  const novoAberto = params.get('novo') === '1';
  const fechar = () => router.replace('/admin/chamados', { scroll: false });

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return chamados
      .filter((c) => (visao === 'todos' ? true : visao === 'abertos' ? CHAMADO_ABERTO.includes(c.status) : c.status === visao))
      .filter((c) => (!tipo || c.tipo === tipo) && (!projeto || c.projeto_id === projeto))
      .filter((c) => !q || [c.titulo, c.protocolo, c.projeto_nome, c.cliente_nome].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => PESO[a.prioridade] - PESO[b.prioridade] || b.updated_at.localeCompare(a.updated_at));
  }, [chamados, visao, tipo, projeto, busca]);

  const contar = (s: StatusChamado) => chamados.filter((c) => c.status === s).length;
  const VISOES: { id: Visao; label: string; n: number }[] = [
    { id: 'abertos', label: 'Em aberto', n: chamados.filter((c) => CHAMADO_ABERTO.includes(c.status)).length },
    ...(['ABERTO', 'EM_ANALISE', 'EM_EXECUCAO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO'] as StatusChamado[]).map((s) => ({ id: s, label: STATUS_CHAMADO_LABEL[s], n: contar(s) })),
    { id: 'todos', label: 'Todos', n: chamados.length },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {VISOES.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setVisao(v.id)}
            aria-pressed={visao === v.id}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${visao === v.id ? 'border-primary/50 bg-primary/12 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
          >
            {v.label} <span className="ml-0.5 text-subtle">{v.n}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <span className="sr-only">Buscar</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Protocolo, título ou cliente" className={`${inputCls} pl-9`} />
        </label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoChamado | '')} className={`${inputCls} w-auto`} aria-label="Tipo">
          <option value="">Todos os tipos</option>
          {Object.entries(TIPO_CHAMADO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={projeto} onChange={(e) => setProjeto(Number(e.target.value) || '')} className={`${inputCls} w-auto`} aria-label="Projeto">
          <option value="">Todos os projetos</option>
          {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <button type="button" onClick={() => router.replace('/admin/chamados?novo=1', { scroll: false })} className={`${btnPrimario} ml-auto`}>
          <Plus className="size-4" /> Registrar chamado
        </button>
      </div>

      <ul className="divide-y rounded-2xl border bg-card">
        {lista.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/chamados/${c.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 px-5 py-4 transition hover:bg-accent/50 md:grid-cols-[7.5rem_1fr_auto_auto_4rem_auto]">
              <span className="font-mono text-xs text-subtle md:order-none">{c.protocolo}</span>
              <span className="col-span-2 min-w-0 md:col-span-1">
                <span className="block truncate text-sm font-medium">{c.titulo}</span>
                <span className="block truncate text-xs text-subtle">
                  {c.projeto_nome} · {c.cliente_nome} · {TIPO_CHAMADO_LABEL[c.tipo]}
                </span>
              </span>
              <PrioridadeBadge prioridade={c.prioridade} />
              <StatusBadge status={c.status} />
              <span className="hidden text-right text-xs text-subtle md:block">{dataCurta(c.updated_at)}</span>
              <ChevronRight className="hidden size-4 text-subtle transition group-hover:translate-x-0.5 md:block" />
            </Link>
          </li>
        ))}
        {lista.length === 0 && <li className="px-5 py-10 text-center text-sm text-muted-foreground">Nenhum chamado nesta visão. 🎉</li>}
      </ul>

      <Modal aberto={novoAberto} onFechar={fechar} titulo="Registrar chamado" descricao="Para pedidos que chegaram por WhatsApp, e-mail ou telefone.">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            const proj = projetos.find((p) => p.id === Number(d.get('projeto')))!;
            const n = Math.max(0, ...chamados.map((c) => Number(c.protocolo.slice(-4)))) + 1;
            const agora = new Date().toISOString();
            setChamados((l) => [
              {
                id: Math.max(0, ...l.map((c) => c.id)) + 1,
                protocolo: `CHM-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`,
                projeto_id: proj.id,
                projeto_nome: proj.nome,
                cliente_nome: proj.cliente_nome,
                tipo: d.get('tipo') as TipoChamado,
                prioridade: d.get('prioridade') as PrioridadeChamado,
                status: 'ABERTO',
                titulo: String(d.get('titulo')).trim(),
                created_at: agora,
                updated_at: agora,
              },
              ...l,
            ]);
            setVisao('abertos');
            fechar();
          }}
        >
          <div>
            <label className={labelCls} htmlFor="ch-proj">Projeto *</label>
            <select id="ch-proj" name="projeto" required className={inputCls}>
              {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome} · {p.cliente_nome ?? 'pessoal'}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="ch-tipo">Tipo</label>
              <select id="ch-tipo" name="tipo" className={inputCls}>
                {Object.entries(TIPO_CHAMADO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="ch-prio">Prioridade</label>
              <select id="ch-prio" name="prioridade" className={inputCls} defaultValue="MEDIA">
                {Object.entries(PRIORIDADE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="ch-titulo">Título *</label>
            <input id="ch-titulo" name="titulo" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="ch-desc">Descrição</label>
            <textarea id="ch-desc" name="descricao" rows={3} className={textareaCls} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecundario} onClick={fechar}>Cancelar</button>
            <button type="submit" className={btnPrimario}><Plus className="size-4" /> Registrar</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
