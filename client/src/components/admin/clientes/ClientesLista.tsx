'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, LifeBuoy, Mail, Phone, Plus, Search } from 'lucide-react';
import Modal from '../Modal';
import { Avatar, btnPrimario, btnSecundario, inputCls, labelCls, textareaCls } from '../ui';
import type { ClienteResumo } from '@/lib/admin-types';

type Filtro = 'todos' | 'ativos' | 'chamados';

export default function ClientesLista({ inicial }: { inicial: ClienteResumo[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [clientes, setClientes] = useState(inicial);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const novoAberto = params.get('novo') === '1';

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return clientes
      .filter((c) => (filtro === 'ativos' ? c.projetos_ativos > 0 : filtro === 'chamados' ? c.chamados_abertos > 0 : true))
      .filter((c) => !q || [c.nome, c.empresa, c.email, c.telefone].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [clientes, busca, filtro]);

  const FILTROS: { id: Filtro; label: string; n: number }[] = [
    { id: 'todos', label: 'Todos', n: clientes.length },
    { id: 'ativos', label: 'Com projeto ativo', n: clientes.filter((c) => c.projetos_ativos > 0).length },
    { id: 'chamados', label: 'Com chamado aberto', n: clientes.filter((c) => c.chamados_abertos > 0).length },
  ];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <span className="sr-only">Buscar</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, empresa, e-mail ou telefone" className={`${inputCls} pl-9`} />
        </label>
        <div className="flex flex-wrap gap-1 rounded-full border p-1">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
              className={`rounded-full px-3 py-1 text-sm transition ${filtro === f.id ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f.label} <span className="text-subtle">{f.n}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => router.replace('/admin/clientes?novo=1', { scroll: false })} className={`${btnPrimario} ml-auto`}>
          <Plus className="size-4" /> Novo cliente
        </button>
      </div>

      <ul className="divide-y rounded-2xl border bg-card">
        {lista.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/clientes/${c.id}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-accent/50">
              <Avatar nome={c.nome} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {c.nome} {c.empresa && <span className="font-normal text-muted-foreground">· {c.empresa}</span>}
                </p>
                <p className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-subtle">
                  <span className="inline-flex items-center gap-1"><Phone className="size-3" /> {c.telefone}</span>
                  {c.email && <span className="inline-flex items-center gap-1"><Mail className="size-3" /> {c.email}</span>}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-6 text-right text-xs sm:flex">
                <span>
                  <span className="block text-base font-semibold text-foreground">{c.total_projetos}</span>
                  <span className="text-subtle">{c.projetos_ativos ? `${c.projetos_ativos} ativo(s)` : 'projetos'}</span>
                </span>
                <span className={c.chamados_abertos ? 'text-rose-600 dark:text-rose-400' : 'text-subtle'}>
                  <LifeBuoy className="mx-auto size-4" />
                  {c.chamados_abertos} aberto(s)
                </span>
              </div>
              <ChevronRight className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
        {lista.length === 0 && <li className="px-5 py-10 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</li>}
      </ul>

      <Modal
        aberto={novoAberto}
        onFechar={() => router.replace('/admin/clientes', { scroll: false })}
        titulo="Novo cliente"
        descricao="Cadastro direto, sem precisar de uma ideia antes."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            const s = (k: string) => String(d.get(k) ?? '').trim() || null;
            const novo: ClienteResumo = {
              id: Math.max(0, ...clientes.map((c) => c.id)) + 1,
              nome: s('nome')!,
              empresa: s('empresa'),
              telefone: s('telefone')!,
              email: s('email'),
              documento: s('documento'),
              notas: s('notas'),
              token_portal: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
              portal_ativo: true,
              created_at: new Date().toISOString(),
              total_projetos: 0,
              projetos_ativos: 0,
              chamados_abertos: 0,
            };
            setClientes((l) => [...l, novo]);
            router.replace('/admin/clientes', { scroll: false });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="c-nome">Nome *</label>
              <input id="c-nome" name="nome" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="c-empresa">Empresa</label>
              <input id="c-empresa" name="empresa" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="c-tel">Telefone *</label>
              <input id="c-tel" name="telefone" required type="tel" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="c-email">E-mail</label>
              <input id="c-email" name="email" type="email" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="c-doc">CPF / CNPJ</label>
              <input id="c-doc" name="documento" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="c-notas">Notas</label>
            <textarea id="c-notas" name="notas" rows={3} className={textareaCls} placeholder="Como prefere ser contatado, quem decide, observações…" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecundario} onClick={() => router.replace('/admin/clientes', { scroll: false })}>Cancelar</button>
            <button type="submit" className={btnPrimario}><Plus className="size-4" /> Cadastrar</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
