'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ExternalLink, Gift, HandCoins, Lock, Percent, Plus, Wand2 } from 'lucide-react';
import StatusBadge from '../../StatusBadge';
import { Aviso, Barra, VisivelCliente, btnPrimario, btnSecundario, inputCls, labelCls, textareaCls } from '../../ui';
import { brl, data, horas } from '@/lib/admin-format';
import {
  CATEGORIA_CUSTO_LABEL,
  COMPLEXIDADE_LABEL,
  RECORRENCIA_LABEL,
  type CategoriaCusto,
  type Custo,
  type ModalidadeCobranca,
  type Recorrencia,
  type Responsavel,
} from '@/lib/admin-types';
import { orcamento, resultado, type AbaProps } from '../calculos';

const num = (v: string) => (v === '' ? 0 : Number(v));
const pct = (v: number) => `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

type Visao = 'orcamento' | 'acompanhamento' | 'pagamentos';

const MODALIDADES: { id: ModalidadeCobranca; titulo: string; dica: string; icon: typeof HandCoins }[] = [
  { id: 'PAGO', titulo: 'Pago', dica: 'Cobra o valor calculado.', icon: HandCoins },
  { id: 'DESCONTO', titulo: 'Com desconto', dica: 'Parceria ou indicação.', icon: Percent },
  { id: 'GRATUITO', titulo: 'Gratuito', dica: 'Pro bono: o cliente paga só os custos dele.', icon: Gift },
];

/** Calculadora e financeiro: resumo fixo no topo + três visões, para não misturar tudo numa tela só. */
export default function AbaFinanceiro({ p, set }: AbaProps) {
  const [visao, setVisao] = useState<Visao>('orcamento');
  const o = orcamento(p);
  const r = resultado(p);
  const gratuito = p.modalidade_cobranca === 'GRATUITO';

  return (
    <div className="space-y-6">
      {/* Resumo: os 4 números que importam */}
      <div className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {gratuito ? (
          <>
            <Numero rotulo="Valor doado (estimado)" valor={brl(o.maoDeObraMercado)} detalhe={`${horas(o.horasComMargem)} a ${brl(p.valor_hora_base)}/h`} destaque />
            <Numero rotulo="Horas doadas até agora" valor={horas(r.horasGastas)} detalhe={`${brl(r.valorDoadoAteAgora)} em trabalho`} />
            <Numero rotulo="O cliente paga" valor={brl(o.custosUnicosCliente)} detalhe={`+ ${brl(o.custosMensaisCliente)}/mês de custos dele`} />
            <Numero rotulo="Seu investimento" valor={brl(r.custosDev)} detalhe="custos pagos por você" />
          </>
        ) : (
          <>
            <Numero rotulo="Preço calculado" valor={brl(o.precoMaoDeObra)} detalhe={`mão de obra · ${horas(o.horasComMargem)}`} destaque />
            <Numero
              rotulo="Fechado com o cliente"
              valor={p.orcamento_cobrado != null ? brl(p.orcamento_cobrado) : '—'}
              detalhe={p.orcamento_cobrado == null ? 'ainda não definido' : diferenca(p.orcamento_cobrado, o.precoMaoDeObra)}
              alerta={p.orcamento_cobrado != null && p.orcamento_cobrado < o.precoMaoDeObra - 1}
            />
            <Numero rotulo="Custos do cliente" valor={brl(o.custosUnicosCliente)} detalhe={`implantação + ${brl(o.custosMensaisCliente)}/mês`} />
            <Numero
              rotulo="Valor-hora real"
              valor={r.valorHoraReal !== null ? brl(r.valorHoraReal) : '—'}
              detalhe={`meta ${brl(p.valor_hora_base)} · ${horas(r.horasGastas)} gastas`}
              alerta={r.valorHoraReal !== null && r.valorHoraReal < p.valor_hora_base * (1 - (p.modalidade_cobranca === 'DESCONTO' ? p.desconto_percentual : 0) / 100)}
            />
          </>
        )}
      </div>

      {/* Sub-visões */}
      <div role="tablist" aria-label="Calculadora e financeiro" className="mx-auto flex w-fit flex-wrap justify-center gap-1 rounded-full border bg-card p-1">
        {(
          [
            ['orcamento', 'Orçamento'],
            ['acompanhamento', 'Acompanhamento'],
            ['pagamentos', 'Pagamentos e custos'],
          ] as [Visao, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={visao === id}
            onClick={() => setVisao(id)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${visao === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {visao === 'orcamento' && <Orcamento p={p} set={set} />}
      {visao === 'acompanhamento' && <Acompanhamento p={p} />}
      {visao === 'pagamentos' && <PagamentosCustos p={p} set={set} />}
    </div>
  );
}

const diferenca = (fechado: number, calculado: number) => {
  const d = fechado - calculado;
  if (Math.abs(d) < 1) return 'igual ao calculado';
  return `${brl(Math.abs(d))} ${d < 0 ? 'abaixo' : 'acima'} do calculado`;
};

/* ═════════════ 1. Orçamento: passos numerados numa coluna ═════════════ */

function Orcamento({ p, set }: AbaProps) {
  const o = orcamento(p);
  const [detalhes, setDetalhes] = useState(false);
  const margem = Math.round((p.fator_seguranca_jr - 1) * 100);
  const gratuito = p.modalidade_cobranca === 'GRATUITO';
  const sugerido = Math.round(o.precoMaoDeObra / 10) * 10;
  const noEscopo = o.linhas.filter((l) => !l.fora);
  const horasCruas = noEscopo.reduce((s, l) => s + l.horas, 0);

  return (
    <ol className="mx-auto max-w-3xl space-y-4">
      <Passo n={1} titulo="Escopo" subtitulo="Quanto trabalho o projeto tem">
        <p className="text-sm">
          <span className="text-2xl font-semibold tabular-nums">{horas(o.horasAjustadas)}</span>{' '}
          <span className="text-muted-foreground">
            ajustadas · {horas(horasCruas)} estimadas em {noEscopo.length} {noEscopo.length === 1 ? 'item' : 'itens'}, cada um × a própria complexidade
          </span>
        </p>
        <button type="button" onClick={() => setDetalhes((v) => !v)} aria-expanded={detalhes} className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronDown className={`size-4 transition ${detalhes ? 'rotate-180' : ''}`} /> {detalhes ? 'Esconder' : 'Ver'} horas por requisito
        </button>
        {detalhes && (
          <ul className="mt-3 divide-y rounded-xl border text-sm">
            {o.linhas.map((l, i) => (
              <li key={i} className={`flex items-center gap-3 px-4 py-2 ${l.fora ? 'text-subtle' : ''}`}>
                <span className="w-14 shrink-0 font-mono text-xs text-subtle">{l.codigo}</span>
                <span className={`min-w-0 flex-1 truncate ${l.fora ? 'line-through' : ''}`}>{l.titulo}</span>
                <span className="hidden text-xs text-subtle sm:block">{l.fora ? "won't have" : `${horas(l.horas)} × ${l.multiplicador} (${COMPLEXIDADE_LABEL[l.complexidade].toLowerCase()})`}</span>
                <span className="w-14 text-right font-medium tabular-nums">{l.fora ? '—' : horas(l.ajustadas)}</span>
              </li>
            ))}
          </ul>
        )}
      </Passo>

      <Passo n={2} titulo="Parâmetros" subtitulo="Seu valor-hora, a folga para imprevistos e os impostos">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo id="f-vh" rotulo="Valor-hora" sufixo="R$" valor={p.valor_hora_base} passo={5} onChange={(v) => set({ valor_hora_base: v })} dica="Também mede o valor doado." />
          <Campo id="f-margem" rotulo="Margem p/ imprevistos" sufixo="%" valor={margem} passo={5} onChange={(v) => set({ fator_seguranca_jr: 1 + v / 100 })} dica={`Horas × ${p.fator_seguranca_jr.toFixed(2)}`} />
          <Campo id="f-imp" rotulo="Impostos" sufixo="%" valor={p.impostos_percentual} passo={0.5} onChange={(v) => set({ impostos_percentual: v })} dica="Sobre a nota. MEI → 0." />
        </div>
      </Passo>

      <Passo n={3} titulo="Cobrança" subtitulo="Como a mão de obra vai ser cobrada">
        <div role="radiogroup" aria-label="Modalidade de cobrança" className="grid gap-2 sm:grid-cols-3">
          {MODALIDADES.map(({ id, titulo, dica, icon: Icone }) => {
            const ativo = p.modalidade_cobranca === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => set({ modalidade_cobranca: id, ...(id === 'GRATUITO' && { orcamento_cobrado: 0 }) })}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${ativo ? 'border-primary/60 bg-primary/8 ring-1 ring-primary/30' : 'hover:bg-accent'}`}
              >
                <Icone className={`mt-0.5 size-5 shrink-0 ${ativo ? 'text-brand' : 'text-subtle'}`} />
                <span>
                  <span className="block text-sm font-medium">{titulo}</span>
                  <span className="block text-xs text-subtle">{dica}</span>
                </span>
              </button>
            );
          })}
        </div>
        {p.modalidade_cobranca !== 'PAGO' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-[9rem_1fr]">
            {p.modalidade_cobranca === 'DESCONTO' && (
              <Campo id="f-desc" rotulo="Desconto" sufixo="%" valor={p.desconto_percentual} passo={5} onChange={(v) => set({ desconto_percentual: v })} />
            )}
            <div className={gratuito ? 'sm:col-span-2' : ''}>
              <label className={labelCls} htmlFor="f-contra">O que você recebe em troca</label>
              <textarea id="f-contra" rows={2} value={p.contrapartida ?? ''} onChange={(e) => set({ contrapartida: e.target.value || null })} className={textareaCls} placeholder="Depoimento, case no portfólio, indicações…" />
            </div>
          </div>
        )}
      </Passo>

      <Passo n={4} titulo="Preço" subtitulo="O cálculo completo, de cima para baixo">
        <dl className="rounded-xl border bg-background px-4 py-2">
          <Linha rotulo={`${horas(o.horasAjustadas)} + ${margem}% de margem = ${horas(o.horasComMargem)} × ${brl(p.valor_hora_base)}`} valor="" sutil />
          <Linha rotulo="Mão de obra (valor de mercado)" valor={brl(o.maoDeObraMercado)} />
          {o.abatimento > 0 && <Linha sinal="−" rotulo={gratuito ? 'Doação (pro bono)' : `Desconto de ${pct(p.desconto_percentual)}`} valor={brl(o.abatimento)} />}
          {o.impostos > 0 && <Linha sinal="+" rotulo={`Impostos (${pct(p.impostos_percentual)})`} valor={brl(o.impostos)} />}
          <Linha total rotulo="Preço da mão de obra" valor={brl(o.precoMaoDeObra)} />
          <Linha sinal="+" rotulo={<>Custos de implantação <span className="text-subtle">(pagos pelo cliente)</span></>} valor={brl(o.custosUnicosCliente)} />
          <Linha total rotulo="Total para começar" valor={brl(o.totalInicial)} />
          <Linha rotulo="Depois, todo mês (custos do cliente)" valor={`${brl(o.custosMensaisCliente)}/mês`} sutil />
        </dl>

        {gratuito ? (
          <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-primary/8 px-4 py-3 text-sm ring-1 ring-primary/25">
            <Gift className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>
              Você está doando <strong>{brl(o.maoDeObraMercado)}</strong> em trabalho. Guarde esse número: ele ajuda a precificar o próximo projeto parecido.
            </span>
          </p>
        ) : (
          <div className="mt-4">
            <label className={labelCls} htmlFor="f-cobrado">Valor fechado com o cliente (mão de obra)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-subtle">R$</span>
                <input id="f-cobrado" type="number" min={0} step={100} value={p.orcamento_cobrado ?? ''} onChange={(e) => set({ orcamento_cobrado: e.target.value === '' ? null : num(e.target.value) })} className={`${inputCls} pl-9`} />
              </div>
              <button type="button" className={`${btnSecundario} h-10 shrink-0`} onClick={() => set({ orcamento_cobrado: sugerido })}>
                <Wand2 className="size-4" /> Usar {brl(sugerido)}
              </button>
            </div>
          </div>
        )}
      </Passo>
    </ol>
  );
}

/* ═════════════ 2. Acompanhamento: previsto × realizado ═════════════ */

function Acompanhamento({ p }: { p: AbaProps['p'] }) {
  const o = orcamento(p);
  const r = resultado(p);
  const gratuito = p.modalidade_cobranca === 'GRATUITO';
  const recebido = p.pagamentos.filter((x) => x.status === 'PAGO').reduce((s, x) => s + x.valor, 0);
  const total = p.pagamentos.filter((x) => x.status !== 'CANCELADO').reduce((s, x) => s + x.valor, 0);
  const pctHoras = o.horasComMargem ? (r.horasGastas / o.horasComMargem) * 100 : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Bloco titulo="Horas" dica="Lançadas nas tarefas">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-2xl font-semibold tabular-nums">
            {horas(r.horasGastas)} <span className="text-base font-normal text-subtle">de {horas(o.horasComMargem)} previstas</span>
          </p>
          <span className={`text-sm tabular-nums ${pctHoras > 100 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>{Math.round(pctHoras)}%</span>
        </div>
        <Barra valor={pctHoras} className="mt-3 h-2" />
        {pctHoras > 100 && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Passou da previsão (com margem). Vale revisar o escopo ou combinar um aditivo.</p>}
      </Bloco>

      {!gratuito && (
        <Bloco titulo="Recebimento" dica="Parcelas pagas × total combinado">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-2xl font-semibold tabular-nums">
              {brl(recebido)} <span className="text-base font-normal text-subtle">de {brl(total)}</span>
            </p>
            <span className="text-sm text-muted-foreground tabular-nums">{total ? Math.round((recebido / total) * 100) : 0}%</span>
          </div>
          <Barra valor={total ? (recebido / total) * 100 : 0} className="mt-3 h-2" />
        </Bloco>
      )}

      <Bloco titulo="Resultado" dica={gratuito ? 'Projeto gratuito: o que você está investindo' : 'Depois de impostos e dos custos que você pagou'}>
        <dl>
          {gratuito ? (
            <>
              <Linha rotulo="Valor doado até agora" valor={brl(r.valorDoadoAteAgora)} />
              <Linha rotulo="Custos pagos por você" valor={brl(r.custosDev)} />
              <Linha total rotulo="Contrapartida" valor={p.contrapartida ? 'definida' : '—'} />
              {p.contrapartida && <p className="pb-1 text-sm text-muted-foreground">{p.contrapartida}</p>}
            </>
          ) : (
            <>
              <Linha rotulo="Fechado com o cliente" valor={brl(p.orcamento_cobrado ?? 0)} />
              <Linha sinal="−" rotulo={`Impostos (${pct(p.impostos_percentual)})`} valor={brl((p.orcamento_cobrado ?? 0) - r.receitaLiquida)} />
              <Linha sinal="−" rotulo="Custos pagos por você" valor={brl(r.custosDev)} />
              <Linha total rotulo="Resultado" valor={brl(r.lucro)} />
              <Linha rotulo={`÷ ${horas(r.horasGastas)} gastas = valor-hora real`} valor={r.valorHoraReal !== null ? brl(r.valorHoraReal) : '—'} />
              {p.modalidade_cobranca === 'DESCONTO' && <Linha rotulo="Trabalho doado (desconto)" valor={brl(r.valorDoadoAteAgora)} sutil />}
            </>
          )}
        </dl>
      </Bloco>
    </div>
  );
}

/* ═════════════ 3. Pagamentos e custos — separando o que é do cliente e o que é seu ═════════════ */

function PagamentosCustos({ p, set }: AbaProps) {
  const [novoCusto, setNovoCusto] = useState(false);
  const gratuito = p.modalidade_cobranca === 'GRATUITO';
  const doCliente = p.custos.filter((c) => c.pago_por === 'CLIENTE');
  const meus = p.custos.filter((c) => c.pago_por === 'DESENVOLVEDOR');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Bloco titulo="Parcelas" dica="Combinadas com o cliente" acao={<VisivelCliente />}>
        {gratuito && p.pagamentos.length === 0 ? (
          <Aviso>Projeto gratuito: não há parcelas de mão de obra. Use só se o cliente for te reembolsar algum custo.</Aviso>
        ) : (
          <ul className="-mx-5 divide-y text-sm">
            {p.pagamentos.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <span className="min-w-0 flex-1">
                  {x.descricao}
                  <span className="block text-xs text-subtle">
                    vence {data(x.data_vencimento)}
                    {x.data_pagamento && ` · pago ${data(x.data_pagamento)}`}
                  </span>
                </span>
                <span className="font-medium tabular-nums">{brl(x.valor)}</span>
                {x.status === 'PENDENTE' ? (
                  <button
                    type="button"
                    className={`${btnSecundario} h-7 px-3 text-xs`}
                    onClick={() => set({ pagamentos: p.pagamentos.map((y) => (y.id === x.id ? { ...y, status: 'PAGO', data_pagamento: new Date().toISOString().slice(0, 10) } : y)) })}
                  >
                    Marcar pago
                  </button>
                ) : (
                  <StatusBadge status={x.status} />
                )}
              </li>
            ))}
            {p.pagamentos.length === 0 && <li className="px-5 py-6 text-center text-subtle">Nenhuma parcela cadastrada.</li>}
          </ul>
        )}
      </Bloco>

      <div className="space-y-6">
        <Bloco
          titulo="Custos do cliente"
          dica="No portal, com o link de onde vem o preço"
          acao={
            <span className="flex items-center gap-2">
              <VisivelCliente />
              <button type="button" className={`${btnSecundario} h-7 px-2.5 text-xs`} onClick={() => setNovoCusto((v) => !v)}>
                <Plus className="size-3.5" /> Custo
              </button>
            </span>
          }
        >
          {novoCusto && <NovoCusto p={p} set={set} onFechar={() => setNovoCusto(false)} />}
          <ListaCustos custos={doCliente} vazio="Nenhum custo para o cliente." />
        </Bloco>
        <Bloco
          titulo="Seus custos"
          dica="Entram no resultado do projeto"
          acao={
            <span className="inline-flex items-center gap-1 text-xs text-subtle">
              <Lock className="size-3" /> Só você
            </span>
          }
        >
          <ListaCustos custos={meus} vazio="Você não pagou nada deste projeto." />
        </Bloco>
      </div>
    </div>
  );
}

function ListaCustos({ custos, vazio }: { custos: Custo[]; vazio: string }) {
  if (custos.length === 0) return <p className="text-sm text-subtle">{vazio}</p>;
  return (
    <ul className="-mx-5 divide-y text-sm">
      {custos.map((c) => (
        <li key={c.id} className="flex items-center gap-3 px-5 py-2.5">
          <span className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5">
              {c.descricao}
              {c.link_fonte && (
                <a href={c.link_fonte} target="_blank" rel="noopener" className="text-subtle hover:text-brand" aria-label="Fonte do preço">
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </span>
            <span className="block text-xs text-subtle">
              {CATEGORIA_CUSTO_LABEL[c.categoria_custo]} · {RECORRENCIA_LABEL[c.tipo_recorrencia].toLowerCase()}
            </span>
          </span>
          <span className="font-medium tabular-nums">{brl(c.valor)}</span>
        </li>
      ))}
    </ul>
  );
}

function NovoCusto({ p, set, onFechar }: AbaProps & { onFechar: () => void }) {
  return (
    <form
      className="mb-4 grid gap-3 rounded-xl border p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        set({
          custos: [
            ...p.custos,
            {
              id: Math.max(0, ...p.custos.map((c) => c.id)) + 1,
              descricao: String(d.get('descricao')).trim(),
              categoria_custo: d.get('categoria') as CategoriaCusto,
              tipo_recorrencia: d.get('recorrencia') as Recorrencia,
              pago_por: d.get('pago_por') as Responsavel,
              valor: num(String(d.get('valor'))),
              link_fonte: String(d.get('link') ?? '').trim() || null,
              data_custo: new Date().toISOString().slice(0, 10),
            },
          ],
        });
        onFechar();
      }}
    >
      <input name="descricao" required placeholder="Descrição *" className={`${inputCls} sm:col-span-2`} aria-label="Descrição" />
      <select name="categoria" className={inputCls} aria-label="Categoria">
        {Object.entries(CATEGORIA_CUSTO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select name="recorrencia" className={inputCls} aria-label="Recorrência">
        {Object.entries(RECORRENCIA_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <select name="pago_por" className={inputCls} aria-label="Quem paga">
        <option value="CLIENTE">Pago pelo cliente</option>
        <option value="DESENVOLVEDOR">Pago por você</option>
      </select>
      <input name="valor" type="number" min={0} step={0.01} required placeholder="Valor (R$) *" className={inputCls} aria-label="Valor" />
      <input name="link" placeholder="Link da fonte do preço" className={`${inputCls} sm:col-span-2`} aria-label="Link da fonte" />
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button type="button" className={btnSecundario} onClick={onFechar}>Cancelar</button>
        <button type="submit" className={btnPrimario}>Adicionar</button>
      </div>
    </form>
  );
}

/* ═════════════ Peças ═════════════ */

function Numero({ rotulo, valor, detalhe, destaque, alerta }: { rotulo: string; valor: string; detalhe?: string; destaque?: boolean; alerta?: boolean }) {
  return (
    <div className={`p-4 ${destaque ? 'bg-primary/8' : 'bg-card'}`}>
      <p className="text-xs text-subtle">{rotulo}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${alerta ? 'text-amber-600 dark:text-amber-400' : destaque ? 'text-brand' : ''}`}>{valor}</p>
      {detalhe && (
        <p className="mt-0.5 truncate text-xs text-subtle" title={detalhe}>
          {detalhe}
        </p>
      )}
    </div>
  );
}

function Passo({ n, titulo, subtitulo, children }: { n: number; titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <li className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/12 font-mono text-xs text-brand ring-1 ring-primary/25">{n}</span>
        <div>
          <h3 className="leading-tight font-medium">{titulo}</h3>
          <p className="text-xs text-subtle">{subtitulo}</p>
        </div>
      </div>
      {children}
    </li>
  );
}

function Bloco({ titulo, dica, acao, children }: { titulo: string; dica?: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{titulo}</h3>
          {dica && <p className="text-xs text-subtle">{dica}</p>}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

function Campo({ id, rotulo, sufixo, valor, passo, onChange, dica }: { id: string; rotulo: string; sufixo: string; valor: number; passo: number; onChange: (v: number) => void; dica?: string }) {
  const prefixo = sufixo === 'R$';
  return (
    <div>
      <label className={labelCls} htmlFor={id}>{rotulo}</label>
      <div className="relative">
        {prefixo && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-subtle">R$</span>}
        <input id={id} type="number" min={0} step={passo} value={valor} onChange={(e) => onChange(num(e.target.value))} className={`${inputCls} tabular-nums ${prefixo ? 'pl-9' : 'pr-8'}`} />
        {!prefixo && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-subtle">{sufixo}</span>}
      </div>
      {dica && <p className="mt-1 text-xs text-subtle">{dica}</p>}
    </div>
  );
}

function Linha({ rotulo, valor, sinal, total, sutil }: { rotulo: ReactNode; valor: string; sinal?: '+' | '−'; total?: boolean; sutil?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${total ? 'border-t font-semibold' : ''} ${sutil ? 'text-xs text-subtle' : 'text-sm'}`}>
      <dt className={total || sutil ? '' : 'text-muted-foreground'}>
        {sinal && <span className="mr-1.5 inline-block w-3 font-mono text-subtle">{sinal}</span>}
        {rotulo}
      </dt>
      <dd className="shrink-0 tabular-nums">{valor}</dd>
    </div>
  );
}
