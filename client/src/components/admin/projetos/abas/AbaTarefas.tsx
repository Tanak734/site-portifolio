'use client';

import { useState } from 'react';
import { Check, ChevronDown, Eye, EyeOff, Plus } from 'lucide-react';
import { Barra, VisivelCliente, btnPrimario, inputCls } from '../../ui';
import { horas } from '@/lib/admin-format';
import type { Tarefa } from '@/lib/admin-types';
import { horasEstimadas, horasGastas, progresso, type AbaProps } from '../calculos';

function Caixa({ marcado, onClick, rotulo }: { marcado: boolean; onClick: () => void; rotulo: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={marcado}
      aria-label={rotulo}
      className={`grid size-5 shrink-0 place-items-center rounded-md border transition ${marcado ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-brand'}`}
    >
      {marcado && <Check className="size-3.5" />}
    </button>
  );
}

/** Tarefas (nível 1) com checklists (nível 2). O progresso do projeto sai daqui. */
export default function AbaTarefas({ p, set }: AbaProps) {
  const [abertas, setAbertas] = useState<number[]>(p.tarefas.filter((t) => !t.concluida).map((t) => t.id));
  const patch = (id: number, f: (t: Tarefa) => Tarefa) => set({ tarefas: p.tarefas.map((t) => (t.id === id ? f(t) : t)) });
  const proxId = (xs: { id: number }[]) => Math.max(0, ...xs.map((x) => x.id)) + 1;
  const previstas = p.tarefas.reduce((s, t) => s + t.horas_estimadas, 0);
  const gastas = horasGastas(p);
  const hora = 'h-7 w-14 rounded-md border bg-background px-1.5 text-right text-xs tabular-nums outline-none focus:border-primary/70';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4">
        <div className="min-w-48 flex-1">
          <p className="text-sm font-medium">Progresso do projeto: {progresso(p)}%</p>
          <Barra valor={progresso(p)} className="mt-2" />
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-subtle">
            Sai dos itens marcados. Tarefas com <Eye className="inline size-3.5" /> aparecem no portal como etapas <VisivelCliente />; com <EyeOff className="inline size-3.5" /> são só suas.
          </p>
        </div>
        <div className="text-sm">
          <p className={`font-medium tabular-nums ${gastas > previstas && previstas > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
            {horas(gastas)} <span className="font-normal text-subtle">gastas de {horas(previstas)} previstas</span>
          </p>
          <p className="text-xs text-subtle">Requisitos somam {horas(horasEstimadas(p))} · as horas gastas alimentam a calculadora</p>
        </div>
        <form
          className="flex w-full gap-2 sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            const titulo = String(new FormData(e.currentTarget).get('titulo')).trim();
            if (!titulo) return;
            const id = proxId(p.tarefas);
            set({ tarefas: [...p.tarefas, { id, titulo, descricao: null, horas_estimadas: 0, horas_gastas: 0, concluida: false, visivel_cliente: true, requisito_codigo: null, checklist: [] }] });
            setAbertas((a) => [...a, id]);
            e.currentTarget.reset();
          }}
        >
          <input name="titulo" placeholder="Nova tarefa" className={`${inputCls} sm:w-56`} aria-label="Nova tarefa" />
          <button type="submit" className={btnPrimario}><Plus className="size-4" /></button>
        </form>
      </div>

      <ul className="space-y-2">
        {p.tarefas.map((t) => {
          const aberta = abertas.includes(t.id);
          const feitos = t.checklist.filter((c) => c.concluido).length;
          return (
            <li key={t.id} className="rounded-2xl border bg-card">
              <div className="flex items-center gap-3 px-4 py-3">
                <Caixa
                  marcado={t.concluida}
                  rotulo={`Concluir ${t.titulo}`}
                  onClick={() => patch(t.id, (x) => ({ ...x, concluida: !x.concluida, checklist: x.checklist.map((c) => ({ ...c, concluido: !x.concluida })) }))}
                />
                <button type="button" onClick={() => setAbertas((a) => (aberta ? a.filter((i) => i !== t.id) : [...a, t.id]))} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className={`truncate text-sm font-medium ${t.concluida ? 'text-muted-foreground line-through decoration-subtle/50' : ''}`}>{t.titulo}</span>
                  {t.requisito_codigo && <span className="font-mono text-[11px] text-subtle">{t.requisito_codigo}</span>}
                  {t.checklist.length > 0 && <span className="ml-auto shrink-0 text-xs text-subtle">{feitos}/{t.checklist.length}</span>}
                  <ChevronDown className={`size-4 shrink-0 text-subtle transition ${aberta ? 'rotate-180' : ''} ${t.checklist.length ? '' : 'ml-auto'}`} />
                </button>
                <span className="hidden items-center gap-1 text-xs text-subtle sm:flex" title="Horas gastas / previstas">
                  <input
                    type="number" min={0} step={0.5} value={t.horas_gastas} aria-label={`Horas gastas em ${t.titulo}`} className={`${hora} ${t.horas_estimadas > 0 && t.horas_gastas > t.horas_estimadas ? 'text-amber-600 dark:text-amber-400' : ''}`}
                    onChange={(e) => patch(t.id, (x) => ({ ...x, horas_gastas: Number(e.target.value) || 0 }))}
                  />
                  /
                  <input
                    type="number" min={0} step={0.5} value={t.horas_estimadas} aria-label={`Horas previstas para ${t.titulo}`} className={hora}
                    onChange={(e) => patch(t.id, (x) => ({ ...x, horas_estimadas: Number(e.target.value) || 0 }))}
                  />
                  h
                </span>
                <button
                  type="button"
                  onClick={() => patch(t.id, (x) => ({ ...x, visivel_cliente: !x.visivel_cliente }))}
                  title={t.visivel_cliente ? 'Visível no portal do cliente' : 'Só para você'}
                  aria-pressed={t.visivel_cliente}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {t.visivel_cliente ? <Eye className="size-4" /> : <EyeOff className="size-4 text-subtle" />}
                  <span className="sr-only">{t.visivel_cliente ? 'Visível ao cliente' : 'Oculta do cliente'}</span>
                </button>
              </div>
              {aberta && (
                <div className="border-t px-4 py-3 pl-12">
                  {t.descricao && <p className="mb-2 text-sm text-muted-foreground">{t.descricao}</p>}
                  <ul className="space-y-2">
                    {t.checklist.map((c) => (
                      <li key={c.id} className="flex items-center gap-3 text-sm">
                        <Caixa
                          marcado={c.concluido}
                          rotulo={c.item}
                          onClick={() =>
                            patch(t.id, (x) => {
                              const checklist = x.checklist.map((y) => (y.id === c.id ? { ...y, concluido: !y.concluido } : y));
                              return { ...x, checklist, concluida: checklist.every((y) => y.concluido) };
                            })
                          }
                        />
                        <span className={c.concluido ? 'text-muted-foreground line-through decoration-subtle/50' : ''}>{c.item}</span>
                      </li>
                    ))}
                  </ul>
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const item = String(new FormData(e.currentTarget).get('item')).trim();
                      if (!item) return;
                      patch(t.id, (x) => ({ ...x, concluida: false, checklist: [...x.checklist, { id: proxId(p.tarefas.flatMap((y) => y.checklist)), item, concluido: false }] }));
                      e.currentTarget.reset();
                    }}
                  >
                    <input name="item" placeholder="Adicionar item ao checklist" className={`${inputCls} h-8`} aria-label="Novo item" />
                  </form>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
