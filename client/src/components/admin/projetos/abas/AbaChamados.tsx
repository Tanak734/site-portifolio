import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import StatusBadge, { PrioridadeBadge, rotuloTipo } from '../../StatusBadge';
import { Aviso, Vazio } from '../../ui';
import { dataCurta } from '@/lib/admin-format';
import type { ChamadoResumo } from '@/lib/admin-types';
import type { AbaProps } from '../calculos';

export default function AbaChamados({ p, chamados }: AbaProps & { chamados: ChamadoResumo[] }) {
  return (
    <div className="space-y-4">
      {!p.aceita_chamados && <Aviso>Este projeto não aceita chamados pelo portal (Visão geral → “Aceita chamados”). Você ainda pode registrar chamados internamente.</Aviso>}
      {chamados.length === 0 ? (
        <Vazio titulo="Nenhum chamado neste projeto">Quando o cliente abrir pelo portal, eles aparecem aqui e na central de Chamados.</Vazio>
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {chamados.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/chamados/${c.id}`} className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 hover:bg-accent/50">
                <span className="w-28 font-mono text-xs text-subtle">{c.protocolo}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.titulo}</span>
                <span className="text-xs text-subtle">{rotuloTipo(c.tipo)}</span>
                <PrioridadeBadge prioridade={c.prioridade} />
                <StatusBadge status={c.status} />
                <span className="w-14 text-right text-xs text-subtle">{dataCurta(c.created_at)}</span>
                <ChevronRight className="size-4 text-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
