// Re-exporta as regras puras de lib/calculadora.ts e define o contrato das abas do Hub.
import type { ProjetoDetalhe } from '@/lib/admin-types';

export { horasEstimadas, horasGastas, orcamento, pontuacoes, progresso, resultado } from '@/lib/calculadora';

export type AbaProps = { p: ProjetoDetalhe; set: (patch: Partial<ProjetoDetalhe>) => void };
