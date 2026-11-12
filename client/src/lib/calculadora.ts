// Calculadora de preço e indicadores do projeto — funções puras, sem React.
// É a mesma regra que o CalculadoraService do backend vai aplicar (docs/back/docs-backend.md §6);
// quando o monorepo tiver um pacote compartilhado, este arquivo vai para lá.
import { MULTIPLICADOR_COMPLEXIDADE, type Complexidade, type ProjetoDetalhe, type Requisito } from './admin-types';

type P = ProjetoDetalhe;

/* ───────────── Esforço ───────────── */

/** Requisitos que entram na conta ("Won't have" fica de fora do escopo). */
export const requisitosNoEscopo = (reqs: Requisito[]) => reqs.filter((r) => r.prioridade !== 'WONT_HAVE');

/** Horas "cruas" dos requisitos no escopo (ou o valor manual, se não houver requisitos). */
export function horasEstimadas(p: Pick<P, 'requisitos' | 'horas_estimadas'>) {
  const reqs = requisitosNoEscopo(p.requisitos);
  return p.requisitos.length ? reqs.reduce((s, r) => s + r.horas_estimadas, 0) : p.horas_estimadas;
}

/** Horas realizadas: soma das tarefas (se alguma tiver horas lançadas) ou o valor manual do projeto. */
export function horasGastas(p: Pick<P, 'tarefas' | 'horas_gastas'>) {
  const lancadas = p.tarefas.reduce((s, t) => s + (t.horas_gastas || 0), 0);
  return lancadas > 0 ? lancadas : p.horas_gastas;
}

export function progresso(p: Pick<P, 'tarefas' | 'progresso'>) {
  const itens = p.tarefas.flatMap((t) => (t.checklist.length ? t.checklist.map((c) => c.concluido) : [t.concluida]));
  return itens.length ? Math.round((itens.filter(Boolean).length / itens.length) * 100) : p.progresso;
}

/* ───────────── Preço ───────────── */

export type LinhaEsforco = { codigo: string | null; titulo: string; horas: number; complexidade: Complexidade; multiplicador: number; ajustadas: number; fora: boolean };

export type Orcamento = {
  linhas: LinhaEsforco[];
  /** Σ horas × multiplicador de complexidade de cada requisito */
  horasAjustadas: number;
  /** horasAjustadas × fator de segurança Jr */
  horasComMargem: number;
  /** Valor de mercado da mão de obra (horasComMargem × valor-hora) */
  maoDeObraMercado: number;
  /** Quanto você deixa de cobrar (desconto ou doação total) */
  abatimento: number;
  maoDeObraCobrada: number;
  impostos: number;
  /** Mão de obra cobrada já com impostos ("por dentro": o líquido fica igual à mão de obra cobrada) */
  precoMaoDeObra: number;
  /** Custos pagos pelo cliente: implantação (únicos) e recorrentes por mês (anuais ÷ 12) */
  custosUnicosCliente: number;
  custosMensaisCliente: number;
  /** O que o cliente paga para começar: preço da mão de obra + custos únicos dele */
  totalInicial: number;
};

export function orcamento(p: P): Orcamento {
  const linhas: LinhaEsforco[] = p.requisitos.length
    ? p.requisitos.map((r) => {
        const mult = MULTIPLICADOR_COMPLEXIDADE[r.complexidade];
        const fora = r.prioridade === 'WONT_HAVE';
        return { codigo: r.codigo, titulo: r.titulo, horas: r.horas_estimadas, complexidade: r.complexidade, multiplicador: mult, ajustadas: fora ? 0 : r.horas_estimadas * mult, fora };
      })
    : [
        {
          codigo: null,
          titulo: 'Estimativa geral do projeto',
          horas: p.horas_estimadas,
          complexidade: p.complexidade_geral,
          multiplicador: MULTIPLICADOR_COMPLEXIDADE[p.complexidade_geral],
          ajustadas: p.horas_estimadas * MULTIPLICADOR_COMPLEXIDADE[p.complexidade_geral],
          fora: false,
        },
      ];

  const horasAjustadas = linhas.reduce((s, l) => s + l.ajustadas, 0);
  const horasComMargem = horasAjustadas * p.fator_seguranca_jr;
  const maoDeObraMercado = horasComMargem * p.valor_hora_base;

  const fracaoCobrada = p.modalidade_cobranca === 'GRATUITO' ? 0 : p.modalidade_cobranca === 'DESCONTO' ? 1 - clamp(p.desconto_percentual) / 100 : 1;
  const maoDeObraCobrada = maoDeObraMercado * fracaoCobrada;
  const aliquota = clamp(p.impostos_percentual, 0, 99) / 100;
  const precoMaoDeObra = maoDeObraCobrada > 0 ? maoDeObraCobrada / (1 - aliquota) : 0;

  const doCliente = p.custos.filter((c) => c.pago_por === 'CLIENTE');
  const custosUnicosCliente = doCliente.filter((c) => c.tipo_recorrencia === 'UNICO').reduce((s, c) => s + c.valor, 0);
  const custosMensaisCliente = doCliente.reduce((s, c) => s + (c.tipo_recorrencia === 'MENSAL' ? c.valor : c.tipo_recorrencia === 'ANUAL' ? c.valor / 12 : 0), 0);

  return {
    linhas,
    horasAjustadas,
    horasComMargem,
    maoDeObraMercado,
    abatimento: maoDeObraMercado - maoDeObraCobrada,
    maoDeObraCobrada,
    impostos: precoMaoDeObra - maoDeObraCobrada,
    precoMaoDeObra,
    custosUnicosCliente,
    custosMensaisCliente,
    totalInicial: precoMaoDeObra + custosUnicosCliente,
  };
}

/* ───────────── Resultado ───────────── */

export function resultado(p: P) {
  const h = horasGastas(p);
  const custosDev = p.custos.filter((c) => c.pago_por === 'DESENVOLVEDOR').reduce((s, c) => s + c.valor, 0);
  const receitaLiquida = (p.orcamento_cobrado ?? 0) * (1 - clamp(p.impostos_percentual, 0, 99) / 100);
  const lucro = receitaLiquida - custosDev;
  return {
    horasGastas: h,
    custosDev,
    receitaLiquida,
    lucro,
    valorHoraReal: h > 0 ? lucro / h : null,
    /** Trabalho que você doou até agora, a preço de mercado (gratuito ou desconto). */
    valorDoadoAteAgora: p.modalidade_cobranca === 'PAGO' ? 0 : Math.max(0, h * p.valor_hora_base - receitaLiquida),
  };
}

/* ───────────── Arquitetura ───────────── */

/** Pontuação ponderada de cada alternativa na matriz de BI. */
export function pontuacoes(p: P) {
  const a = p.avaliacao;
  if (!a) return [];
  const pesoTotal = Object.values(a.criterios_pesos).reduce((s, v) => s + v, 0) || 1;
  return a.alternativas_comparadas.map((alt) => ({
    nome: alt.nome,
    total: Object.entries(a.criterios_pesos).reduce((s, [crit, peso]) => s + (alt.notas[crit] ?? 0) * peso, 0) / pesoTotal,
  }));
}

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number.isFinite(v) ? v : 0));
}
