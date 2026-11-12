import {
  ORIGEM_LABEL,
  PRIORIDADE_LABEL,
  STATUS_CHAMADO_LABEL,
  STATUS_PAGAMENTO_LABEL,
  STATUS_PROJETO_LABEL,
  STATUS_TICKET_LABEL,
  TIPO_CHAMADO_LABEL,
  STATUS_ADR_LABEL,
} from '@/lib/admin-types';

const VERDE = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
const MARCA = 'border-primary/50 bg-primary/15 text-brand';
const NEUTRO = 'border-border bg-secondary text-foreground';
const APAGADO = 'border-border bg-transparent text-subtle';
const AMBAR = 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400';
const VERMELHO = 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400';

/** Rótulo + cor de cada status/enum do sistema (as chaves não colidem entre enums com sentidos diferentes). */
const MAPAS: { rotulos: Record<string, string>; tons: Record<string, string> }[] = [
  {
    rotulos: STATUS_TICKET_LABEL,
    tons: { NOVO: MARCA, EM_CONVERSA: NEUTRO, MVP_EM_ELABORACAO: NEUTRO, MVP_APRESENTADO: NEUTRO, ACEITO_CONVERTIDO: VERDE, DESISTENCIA: APAGADO },
  },
  { rotulos: STATUS_PROJETO_LABEL, tons: { EM_ANDAMENTO: MARCA, INATIVO: APAGADO, CONCLUIDO: VERDE } },
  {
    rotulos: STATUS_CHAMADO_LABEL,
    tons: { ABERTO: MARCA, EM_ANALISE: NEUTRO, EM_EXECUCAO: NEUTRO, AGUARDANDO_CLIENTE: AMBAR, RESOLVIDO: VERDE, FECHADO: APAGADO },
  },
  { rotulos: STATUS_PAGAMENTO_LABEL, tons: { PENDENTE: AMBAR, PAGO: VERDE, CANCELADO: APAGADO } },
  { rotulos: STATUS_ADR_LABEL, tons: { PROPOSTO: AMBAR, ACEITO: VERDE, REJEITADO: APAGADO, SUBSTITUIDO: APAGADO } },
];

export default function StatusBadge({ status }: { status: string }) {
  const m = MAPAS.find((x) => status in x.rotulos);
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${m?.tons[status] ?? NEUTRO}`}>
      {m?.rotulos[status] ?? status}
    </span>
  );
}

const TOM_PRIORIDADE: Record<string, string> = { BAIXA: APAGADO, MEDIA: NEUTRO, ALTA: AMBAR, CRITICA: VERMELHO };
export function PrioridadeBadge({ prioridade }: { prioridade: keyof typeof PRIORIDADE_LABEL }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${TOM_PRIORIDADE[prioridade]}`}>
      {prioridade === 'CRITICA' && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
      {PRIORIDADE_LABEL[prioridade]}
    </span>
  );
}

export function Etiqueta({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex shrink-0 items-center rounded-md border bg-background px-1.5 py-0.5 text-[11px] whitespace-nowrap text-muted-foreground">{children}</span>;
}

export const rotuloTipo = (t: keyof typeof TIPO_CHAMADO_LABEL) => TIPO_CHAMADO_LABEL[t];
export const rotuloOrigem = (o: keyof typeof ORIGEM_LABEL) => ORIGEM_LABEL[o];
