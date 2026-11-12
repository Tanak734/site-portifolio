'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Calculator, Compass, Globe, LayoutDashboard, LifeBuoy, ListChecks, ListTodo } from 'lucide-react';
import Abas, { type Aba } from '../Abas';
import StatusBadge from '../StatusBadge';
import { Barra } from '../ui';
import { brl, data, diasAte } from '@/lib/admin-format';
import { CHAMADO_ABERTO, MODALIDADE_LABEL, type ChamadoResumo, type ProjetoDetalhe } from '@/lib/admin-types';
import { horasGastas, orcamento, progresso } from './calculos';
import AbaGeral from './abas/AbaGeral';
import AbaRequisitos from './abas/AbaRequisitos';
import AbaArquitetura from './abas/AbaArquitetura';
import AbaFinanceiro from './abas/AbaFinanceiro';
import AbaTarefas from './abas/AbaTarefas';
import AbaChamados from './abas/AbaChamados';
import AbaVitrine from './abas/AbaVitrine';

type AbaId = 'geral' | 'requisitos' | 'arquitetura' | 'financeiro' | 'tarefas' | 'chamados' | 'vitrine';

/** Hub 360º do projeto: 7 abas sobre o mesmo estado (na prévia, nada é salvo no servidor). */
export default function ProjetoHub({ inicial, chamados }: { inicial: ProjetoDetalhe; chamados: ChamadoResumo[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [p, setP] = useState(inicial);
  const set = (patch: Partial<ProjetoDetalhe>) => setP((x) => ({ ...x, ...patch }));

  const ABAS: Aba<AbaId>[] = [
    { id: 'geral', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'requisitos', label: 'Requisitos', icon: ListChecks, contagem: p.duvidas.filter((d) => d.status === 'PENDENTE').length },
    { id: 'arquitetura', label: 'Arquitetura', icon: Compass },
    { id: 'financeiro', label: 'Calculadora & financeiro', icon: Calculator },
    { id: 'tarefas', label: 'Tarefas', icon: ListTodo },
    { id: 'chamados', label: 'Chamados', icon: LifeBuoy, contagem: chamados.filter((c) => CHAMADO_ABERTO.includes(c.status)).length },
    { id: 'vitrine', label: 'Vitrine', icon: Globe },
  ];
  const pedida = params.get('aba') as AbaId | null;
  const aba: AbaId = pedida && ABAS.some((a) => a.id === pedida) ? pedida : 'geral';
  const irPara = (id: AbaId) => router.replace(`${pathname}${id === 'geral' ? '' : `?aba=${id}`}`, { scroll: false });

  const prog = progresso(p);
  const orc = orcamento(p);
  const hEst = Math.round(orc.horasComMargem);
  const hGastas = horasGastas(p);
  const prazo = p.end_date ? diasAte(p.end_date) : null;

  return (
    <>
      {/* Indicadores fixos do projeto */}
      <div className="mb-6 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card p-4">
          <p className="text-xs text-subtle">Progresso</p>
          <p className="mt-1 text-xl font-semibold">{prog}%</p>
          <Barra valor={prog} className="mt-2" />
        </div>
        <div className="bg-card p-4">
          <p className="text-xs text-subtle">Horas gastas / previstas (com margem)</p>
          <p className={`mt-1 text-xl font-semibold ${hGastas > hEst && hEst > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
            {hGastas}h <span className="text-sm font-normal text-subtle">/ {hEst}h</span>
          </p>
          <Barra valor={hEst ? (hGastas / hEst) * 100 : 0} className="mt-2" />
        </div>
        <div className="bg-card p-4">
          <p className="text-xs text-subtle">Mão de obra · {MODALIDADE_LABEL[p.modalidade_cobranca].toLowerCase()}</p>
          {p.modalidade_cobranca === 'GRATUITO' ? (
            <>
              <p className="mt-1 text-xl font-semibold text-brand">Pro bono</p>
              <p className="mt-1 text-xs text-subtle">doando {brl(orc.maoDeObraMercado)} em trabalho</p>
            </>
          ) : (
            <>
              <p className="mt-1 text-xl font-semibold">{p.orcamento_cobrado ? brl(p.orcamento_cobrado) : '—'}</p>
              <p className="mt-1 text-xs text-subtle">calculadora sugere {brl(orc.precoMaoDeObra)}</p>
            </>
          )}
        </div>
        <div className="bg-card p-4">
          <p className="text-xs text-subtle">Entrega</p>
          <p className="mt-1 text-xl font-semibold">{p.end_date ? data(p.end_date) : '—'}</p>
          <p className={`mt-1 text-xs ${prazo !== null && prazo < 14 && p.status === 'EM_ANDAMENTO' ? 'text-amber-600 dark:text-amber-400' : 'text-subtle'}`}>
            {prazo === null ? 'sem prazo definido' : p.status !== 'EM_ANDAMENTO' ? <StatusBadge status={p.status} /> : prazo >= 0 ? `faltam ${prazo} dias` : `atrasado ${-prazo} dias`}
          </p>
        </div>
      </div>

      <Abas abas={ABAS} valor={aba} onChange={irPara} rotulo="Áreas do projeto" />

      <div className="pt-6">
        {aba === 'geral' && <AbaGeral p={p} set={set} />}
        {aba === 'requisitos' && <AbaRequisitos p={p} set={set} />}
        {aba === 'arquitetura' && <AbaArquitetura p={p} set={set} />}
        {aba === 'financeiro' && <AbaFinanceiro p={p} set={set} />}
        {aba === 'tarefas' && <AbaTarefas p={p} set={set} />}
        {aba === 'chamados' && <AbaChamados p={p} set={set} chamados={chamados} />}
        {aba === 'vitrine' && <AbaVitrine p={p} set={set} />}
      </div>

      <p className="mt-10 text-center text-xs text-subtle">
        Prévia com dados de exemplo — as alterações ficam só nesta aba. <Link href="/admin/projetos" className="underline underline-offset-4 hover:text-foreground">Voltar aos projetos</Link>
      </p>
    </>
  );
}
