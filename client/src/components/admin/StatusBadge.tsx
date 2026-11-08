import { STATUS_PROJETO_LABEL, STATUS_TICKET_LABEL, type StatusProjeto, type StatusTicket } from '@/lib/admin-types';

const TONS: Record<string, string> = {
  NOVO: 'border-primary/50 bg-primary/15 text-brand',
  EM_CONVERSA: 'border-border bg-secondary text-foreground',
  MVP_EM_ELABORACAO: 'border-border bg-secondary text-foreground',
  MVP_APRESENTADO: 'border-border bg-secondary text-foreground',
  ACEITO_CONVERTIDO: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  DESISTENCIA: 'border-border bg-transparent text-subtle',
  EM_ANDAMENTO: 'border-primary/50 bg-primary/15 text-brand',
  INATIVO: 'border-border bg-transparent text-subtle',
  CONCLUIDO: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
};

export default function StatusBadge({ status }: { status: StatusTicket | StatusProjeto }) {
  const label = (STATUS_TICKET_LABEL as Record<string, string>)[status] ?? (STATUS_PROJETO_LABEL as Record<string, string>)[status];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${TONS[status] ?? ''}`}>
      {label}
    </span>
  );
}
