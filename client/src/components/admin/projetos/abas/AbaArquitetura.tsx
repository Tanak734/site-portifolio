'use client';

import { useState } from 'react';
import { ChevronDown, Trophy } from 'lucide-react';
import StatusBadge from '../../StatusBadge';
import { Painel, Vazio, textareaCls } from '../../ui';
import type { AbaProps } from '../calculos';
import { pontuacoes } from '../calculos';

const nota = 'h-8 w-12 rounded-md border bg-background text-center text-sm outline-none focus:border-primary/70';

export default function AbaArquitetura({ p, set }: AbaProps) {
  const [aberto, setAberto] = useState<number | null>(p.adrs[0]?.id ?? null);
  const a = p.avaliacao;

  if (!a) return <Vazio titulo="Avaliação arquitetural ainda não feita">Compare alternativas de stack com pesos e registre a decisão.</Vazio>;

  const criterios = Object.keys(a.criterios_pesos);
  const pts = pontuacoes(p);
  const melhor = pts.reduce((m, x) => (x.total > m.total ? x : m), { nome: "", total: -1 });
  const setAval = (patch: Partial<typeof a>) => set({ avaliacao: { ...a, ...patch } });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Padrão', a.padrao_arquitetural],
          ['Linguagem', a.linguagem_escolhida],
          ['Framework', a.framework_escolhido],
          ['Banco', a.banco_escolhido],
        ].map(([r, v]) => (
          <div key={r} className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-subtle">{r}</p>
            <p className="mt-1 font-medium">{v ?? '—'}</p>
          </div>
        ))}
      </div>

      <Painel titulo="Matriz de decisão (BI)" descricao="Peso de 1 a 5 por critério e nota de 1 a 5 por alternativa. A pontuação é a média ponderada." semPadding>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-subtle">
                <th className="px-5 py-3 font-medium">Critério</th>
                <th className="px-3 py-3 text-center font-medium">Peso</th>
                {a.alternativas_comparadas.map((alt) => (
                  <th key={alt.nome} className={`px-3 py-3 text-center font-medium ${alt.nome === melhor.nome ? 'text-brand' : ''}`}>{alt.nome}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {criterios.map((c) => (
                <tr key={c}>
                  <td className="px-5 py-2.5">{c}</td>
                  <td className="px-3 py-2.5 text-center">
                    <input
                      type="number" min={1} max={5} value={a.criterios_pesos[c]} aria-label={`Peso de ${c}`} className={nota}
                      onChange={(e) => setAval({ criterios_pesos: { ...a.criterios_pesos, [c]: Number(e.target.value) } })}
                    />
                  </td>
                  {a.alternativas_comparadas.map((alt, i) => (
                    <td key={alt.nome} className={`px-3 py-2.5 text-center ${alt.nome === melhor.nome ? 'bg-primary/5' : ''}`}>
                      <input
                        type="number" min={1} max={5} value={alt.notas[c] ?? 0} aria-label={`Nota de ${alt.nome} em ${c}`} className={nota}
                        onChange={(e) =>
                          setAval({
                            alternativas_comparadas: a.alternativas_comparadas.map((x, j) => (j === i ? { ...x, notas: { ...x.notas, [c]: Number(e.target.value) } } : x)),
                          })
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-medium">
                <td className="px-5 py-3" colSpan={2}>Pontuação</td>
                {pts.map((x) => (
                  <td key={x.nome} className={`px-3 py-3 text-center ${x.nome === melhor.nome ? 'bg-primary/10 text-brand' : 'text-muted-foreground'}`}>
                    <span className="inline-flex items-center gap-1">
                      {x.nome === melhor.nome && <Trophy className="size-3.5" />}
                      {x.total.toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </Painel>

      <Painel titulo="Justificativa">
        <textarea rows={3} value={a.justificativa_escolha} onChange={(e) => setAval({ justificativa_escolha: e.target.value })} className={textareaCls} aria-label="Justificativa da escolha" />
      </Painel>

      <Painel titulo="Decisões registradas (ADRs)" semPadding>
        <ul className="divide-y">
          {p.adrs.map((adr) => {
            const exp = aberto === adr.id;
            return (
              <li key={adr.id}>
                <button type="button" onClick={() => setAberto(exp ? null : adr.id)} aria-expanded={exp} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-accent/50">
                  <span className="font-mono text-xs text-subtle">ADR-{String(adr.numero).padStart(3, '0')}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{adr.titulo}</span>
                  <StatusBadge status={adr.status} />
                  <ChevronDown className={`size-4 text-subtle transition ${exp ? 'rotate-180' : ''}`} />
                </button>
                {exp && (
                  <dl className="grid gap-4 px-5 pb-5 text-sm sm:grid-cols-3">
                    {[
                      ['Contexto', adr.contexto],
                      ['Decisão', adr.decisao],
                      ['Consequências', adr.consequencias],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl border bg-background p-3">
                        <dt className="text-xs text-subtle">{k}</dt>
                        <dd className="mt-1 text-muted-foreground">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      </Painel>
    </div>
  );
}
