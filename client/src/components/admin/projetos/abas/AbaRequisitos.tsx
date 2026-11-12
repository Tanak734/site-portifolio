'use client';

import { useState } from 'react';
import { Check, HelpCircle, Plus } from 'lucide-react';
import { Painel, btnPrimario, btnSecundario, inputCls, labelCls, textareaCls } from '../../ui';
import { horas } from '@/lib/admin-format';
import {
  COMPLEXIDADE_LABEL,
  MOSCOW_LABEL,
  TIPO_REQUISITO_LABEL,
  type Complexidade,
  type PrioridadeMoscow,
  type Requisito,
  type TipoRequisito,
} from '@/lib/admin-types';
import { horasEstimadas, type AbaProps } from '../calculos';

const TOM_MOSCOW: Record<PrioridadeMoscow, string> = {
  MUST_HAVE: 'bg-primary/15 text-brand',
  SHOULD_HAVE: 'bg-sky-500/12 text-sky-700 dark:text-sky-400',
  COULD_HAVE: 'bg-secondary text-muted-foreground',
  WONT_HAVE: 'bg-transparent text-subtle line-through',
};
const PREFIXO: Record<TipoRequisito, string> = { FUNCIONAL: 'RF', NAO_FUNCIONAL: 'RNF', REGRA_NEGOCIO: 'RN', RESTRICAO_TECNICA: 'RT' };

export default function AbaRequisitos({ p, set }: AbaProps) {
  const [novo, setNovo] = useState(false);
  const [filtro, setFiltro] = useState<TipoRequisito | ''>('');
  const reqs = p.requisitos.filter((r) => !filtro || r.tipo === filtro);
  const patchReq = (id: number, patch: Partial<Requisito>) => set({ requisitos: p.requisitos.map((r) => (r.id === id ? { ...r, ...patch } : r)) });

  const porMoscow = (Object.keys(MOSCOW_LABEL) as PrioridadeMoscow[]).map((m) => ({
    m,
    h: p.requisitos.filter((r) => r.prioridade === m).reduce((s, r) => s + r.horas_estimadas, 0),
  }));
  const total = horasEstimadas(p);
  const feitas = p.requisitos.filter((r) => r.implementado).reduce((s, r) => s + r.horas_estimadas, 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-full border p-1">
            {(['', ...Object.keys(TIPO_REQUISITO_LABEL)] as (TipoRequisito | '')[]).map((t) => (
              <button
                key={t || 'todos'}
                type="button"
                onClick={() => setFiltro(t)}
                aria-pressed={filtro === t}
                className={`rounded-full px-3 py-1 text-sm transition ${filtro === t ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t ? TIPO_REQUISITO_LABEL[t] : 'Todos'}
              </button>
            ))}
          </div>
          <button type="button" className={`${btnPrimario} ml-auto`} onClick={() => setNovo((v) => !v)}>
            <Plus className="size-4" /> Requisito
          </button>
        </div>

        {novo && (
          <form
            className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const tipo = d.get('tipo') as TipoRequisito;
              const n = p.requisitos.filter((r) => r.tipo === tipo).length + 1;
              set({
                requisitos: [
                  ...p.requisitos,
                  {
                    id: Math.max(0, ...p.requisitos.map((r) => r.id)) + 1,
                    codigo: `${PREFIXO[tipo]}-${String(n).padStart(2, '0')}`,
                    tipo,
                    titulo: String(d.get('titulo')).trim(),
                    descricao: String(d.get('descricao')).trim(),
                    prioridade: d.get('prioridade') as PrioridadeMoscow,
                    complexidade: d.get('complexidade') as Complexidade,
                    horas_estimadas: Number(d.get('horas')) || 0,
                    implementado: false,
                  },
                ],
              });
              setNovo(false);
            }}
          >
            <div className="sm:col-span-3">
              <label className={labelCls} htmlFor="r-titulo">Título *</label>
              <input id="r-titulo" name="titulo" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="r-horas">Horas</label>
              <input id="r-horas" name="horas" type="number" min={0} step={0.5} defaultValue={4} className={inputCls} />
            </div>
            <div className="sm:col-span-4">
              <label className={labelCls} htmlFor="r-desc">Descrição *</label>
              <textarea id="r-desc" name="descricao" required rows={2} className={textareaCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="r-tipo">Tipo</label>
              <select id="r-tipo" name="tipo" className={inputCls}>
                {Object.entries(TIPO_REQUISITO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="r-moscow">Prioridade</label>
              <select id="r-moscow" name="prioridade" className={inputCls}>
                {Object.entries(MOSCOW_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="r-comp">Complexidade</label>
              <select id="r-comp" name="complexidade" className={inputCls} defaultValue="MEDIA">
                {Object.entries(COMPLEXIDADE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="flex items-end justify-end gap-2">
              <button type="button" className={btnSecundario} onClick={() => setNovo(false)}>Cancelar</button>
              <button type="submit" className={btnPrimario}>Adicionar</button>
            </div>
          </form>
        )}

        <ul className="divide-y rounded-2xl border bg-card">
          {reqs.map((r) => (
            <li key={r.id} className="flex gap-4 px-5 py-4">
              <button
                type="button"
                onClick={() => patchReq(r.id, { implementado: !r.implementado })}
                aria-pressed={r.implementado}
                title={r.implementado ? 'Implementado' : 'Marcar como implementado'}
                className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition ${r.implementado ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-brand'}`}
              >
                {r.implementado && <Check className="size-3.5" />}
                <span className="sr-only">{r.implementado ? 'Implementado' : 'Pendente'}</span>
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${r.implementado ? 'text-muted-foreground line-through decoration-subtle/50' : ''}`}>
                  <span className="mr-2 font-mono text-xs text-subtle">{r.codigo}</span>
                  {r.titulo}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{r.descricao}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs">
                <span className={`rounded-md px-1.5 py-0.5 font-medium ${TOM_MOSCOW[r.prioridade]}`}>{MOSCOW_LABEL[r.prioridade]}</span>
                <span className="text-subtle">{COMPLEXIDADE_LABEL[r.complexidade]} · {horas(r.horas_estimadas)}</span>
              </div>
            </li>
          ))}
          {reqs.length === 0 && <li className="px-5 py-8 text-center text-sm text-subtle">Nenhum requisito cadastrado.</li>}
        </ul>
      </div>

      <aside className="space-y-6">
        <Painel titulo="Esforço">
          <p className="text-2xl font-semibold">{horas(total)}</p>
          <p className="text-xs text-subtle">no escopo · {horas(feitas)} já implementadas · alimenta a calculadora</p>
          <ul className="mt-4 space-y-2 text-sm">
            {porMoscow.map(({ m, h }) => (
              <li key={m} className="flex items-center gap-3">
                <span className={`w-14 rounded-md px-1.5 py-0.5 text-center text-xs font-medium ${TOM_MOSCOW[m]}`}>{MOSCOW_LABEL[m]}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary/70" style={{ width: `${total ? (h / total) * 100 : 0}%` }} />
                </span>
                <span className="w-10 text-right text-xs text-muted-foreground">{horas(h)}</span>
              </li>
            ))}
          </ul>
        </Painel>

        <Painel titulo="Dúvidas" descricao="Perguntas de escopo para alinhar com o cliente — separadas das notas internas">
          <form
            className="mb-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const duvida = String(d.get('duvida')).trim();
              if (!duvida) return;
              set({ duvidas: [{ id: Math.max(0, ...p.duvidas.map((x) => x.id)) + 1, duvida, resposta: null, status: 'PENDENTE' }, ...p.duvidas] });
              e.currentTarget.reset();
            }}
          >
            <textarea name="duvida" rows={2} placeholder="Nova dúvida para o cliente…" className={textareaCls} aria-label="Nova dúvida" />
            <button type="submit" className={`${btnSecundario} h-8 w-full text-xs`}>
              <Plus className="size-3.5" /> Registrar dúvida
            </button>
          </form>
          <ul className="space-y-3">
            {p.duvidas.map((d) => (
              <li key={d.id} className="rounded-xl border p-3 text-sm">
                <p className="flex gap-2">
                  <HelpCircle className={`mt-0.5 size-4 shrink-0 ${d.status === 'PENDENTE' ? 'text-amber-600 dark:text-amber-400' : 'text-subtle'}`} />
                  {d.duvida}
                </p>
                {d.status === 'RESPONDIDA' ? (
                  <p className="mt-2 border-l-2 border-primary/50 pl-3 text-muted-foreground">{d.resposta}</p>
                ) : (
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const resposta = String(new FormData(e.currentTarget).get('resposta')).trim();
                      if (resposta) set({ duvidas: p.duvidas.map((x) => (x.id === d.id ? { ...x, resposta, status: 'RESPONDIDA' } : x)) });
                    }}
                  >
                    <input name="resposta" placeholder="Registrar resposta…" className={`${inputCls} h-8`} aria-label="Resposta" />
                    <button type="submit" className={`${btnSecundario} h-8 shrink-0`}>Salvar</button>
                  </form>
                )}
              </li>
            ))}
            {p.duvidas.length === 0 && <li className="text-sm text-subtle">Nenhuma dúvida registrada.</li>}
          </ul>
        </Painel>
      </aside>
    </div>
  );
}
