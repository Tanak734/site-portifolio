'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRightLeft, Clock, EyeOff, ListTodo, Lock, Mail, Send, User } from 'lucide-react';
import StatusBadge, { PrioridadeBadge } from '../StatusBadge';
import { Painel, btnPrimario, btnSecundario, inputCls, labelCls, textareaCls } from '../ui';
import { brl, dataHora } from '@/lib/admin-format';
import {
  PRIORIDADE_LABEL,
  STATUS_CHAMADO_LABEL,
  TIPO_CHAMADO_LABEL,
  type Chamado,
  type PrioridadeChamado,
  type StatusChamado,
  type TipoChamado,
} from '@/lib/admin-types';

const RESPOSTAS_RAPIDAS = [
  'Recebi! Já estou analisando e te retorno ainda hoje.',
  'Corrigido e publicado. Pode testar e me avisar se ficou certo?',
  'Isso fica fora do escopo original — preparei um orçamento à parte.',
];

/** Conversa do chamado + painel de gestão (status, orçamento extra e conversão em tarefa). */
export default function ChamadoDetalhe({ inicial, valorHora }: { inicial: Chamado; valorHora: number }) {
  const [c, setC] = useState(inicial);
  const [texto, setTexto] = useState('');
  const [interna, setInterna] = useState(false);
  const set = (patch: Partial<Chamado>) => setC((x) => ({ ...x, ...patch, updated_at: new Date().toISOString() }));

  const enviar = (proximo?: StatusChamado) => {
    const msg = texto.trim();
    if (!msg) return;
    set({
      interacoes: [...c.interacoes, { id: Math.max(0, ...c.interacoes.map((i) => i.id)) + 1, autor: 'ADMIN', mensagem: msg, visivel_cliente: !interna, created_at: new Date().toISOString() }],
      ...(proximo && { status: proximo }),
    });
    setTexto('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Conversa */}
      <div className="min-w-0 space-y-4">
        <ol className="space-y-4">
          {c.interacoes.map((i) => {
            const meu = i.autor === 'ADMIN';
            return (
              <li key={i.id} className={`flex gap-3 ${meu ? 'flex-row-reverse' : ''}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${meu ? 'bg-primary/15 text-brand' : 'bg-secondary text-muted-foreground'}`}>
                  {meu ? 'Eu' : <User className="size-4" />}
                </span>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${!i.visivel_cliente ? 'border border-dashed border-amber-500/40 bg-amber-500/5' : meu ? 'bg-primary/12' : 'border bg-card'}`}>
                  {!i.visivel_cliente && (
                    <p className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                      <Lock className="size-3" /> Nota interna — o cliente não vê
                    </p>
                  )}
                  <p className="whitespace-pre-line">{i.mensagem}</p>
                  <p className="mt-1.5 text-[11px] text-subtle">
                    {meu ? 'Você' : c.solicitante_nome ?? 'Cliente'} · {dataHora(i.created_at)}
                  </p>
                </div>
              </li>
            );
          })}
          {c.interacoes.length === 0 && <li className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-subtle">{c.descricao}</li>}
        </ol>

        {/* Resposta */}
        <div className={`rounded-2xl border bg-card p-3 ${interna ? 'border-dashed border-amber-500/50' : ''}`}>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {RESPOSTAS_RAPIDAS.map((r) => (
              <button key={r} type="button" onClick={() => setTexto(r)} className="truncate rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground sm:max-w-60">
                {r}
              </button>
            ))}
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') enviar();
            }}
            rows={3}
            placeholder={interna ? 'Nota interna (só você vê)…' : 'Responder ao cliente… (Ctrl+Enter envia)'}
            className={`${textareaCls} border-0 px-1 focus:ring-0`}
            aria-label="Mensagem"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t pt-3">
            <label className="mr-auto inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={interna} onChange={(e) => setInterna(e.target.checked)} className="size-4 accent-[var(--primary)]" />
              <EyeOff className="size-3.5" /> Nota interna
            </label>
            {!interna && (
              <button type="button" disabled={!texto.trim()} onClick={() => enviar('AGUARDANDO_CLIENTE')} className={btnSecundario}>
                Enviar e aguardar cliente
              </button>
            )}
            <button type="button" disabled={!texto.trim()} onClick={() => enviar()} className={btnPrimario}>
              <Send className="size-4" /> {interna ? 'Salvar nota' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>

      {/* Gestão */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Painel>
          <div className="space-y-4">
            <div>
              <label className={labelCls} htmlFor="ch-status">Status</label>
              <select id="ch-status" value={c.status} onChange={(e) => set({ status: e.target.value as StatusChamado })} className={inputCls}>
                {Object.entries(STATUS_CHAMADO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="ch-prio">Prioridade</label>
                <select id="ch-prio" value={c.prioridade} onChange={(e) => set({ prioridade: e.target.value as PrioridadeChamado })} className={inputCls}>
                  {Object.entries(PRIORIDADE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="ch-tipo">Tipo</label>
                <select id="ch-tipo" value={c.tipo} onChange={(e) => set({ tipo: e.target.value as TipoChamado })} className={inputCls}>
                  {Object.entries(TIPO_CHAMADO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Painel>

        <Painel titulo="Orçamento adicional" descricao={`Valor-hora do projeto: ${brl(valorHora)}`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="ch-h">Horas</label>
              <input
                id="ch-h" type="number" min={0} step={0.5} value={c.horas_estimadas_chamado} className={inputCls}
                onChange={(e) => {
                  const h = Number(e.target.value) || 0;
                  set({ horas_estimadas_chamado: h, valor_adicional_orcado: c.tipo === 'MANUTENCAO' ? 0 : h * valorHora });
                }}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ch-v">Valor (R$)</label>
              <input id="ch-v" type="number" min={0} step={10} value={c.valor_adicional_orcado} onChange={(e) => set({ valor_adicional_orcado: Number(e.target.value) || 0 })} className={inputCls} />
            </div>
          </div>
          <p className="mt-2 text-xs text-subtle">Bugs (manutenção) normalmente ficam em R$ 0 durante a garantia.</p>
        </Painel>

        <Painel>
          {c.tarefa_gerada_id ? (
            <Link href={`/admin/projetos/${c.projeto_id}?aba=tarefas`} className={`${btnSecundario} w-full`}>
              <ListTodo className="size-4" /> Ver tarefa gerada no projeto
            </Link>
          ) : (
            <button type="button" className={`${btnPrimario} w-full`} onClick={() => set({ tarefa_gerada_id: -1, status: c.status === 'ABERTO' || c.status === 'EM_ANALISE' ? 'EM_EXECUCAO' : c.status })}>
              <ArrowRightLeft className="size-4" /> Converter em tarefa do projeto
            </button>
          )}
          <p className="mt-2 text-xs text-subtle">Cria uma tarefa no Hub do projeto, ligada a este chamado.</p>
        </Painel>

        <Painel titulo="Detalhes">
          <dl className="space-y-2.5 text-sm">
            <div>
              <dt className="text-xs text-subtle">Projeto</dt>
              <dd><Link href={`/admin/projetos/${c.projeto_id}?aba=chamados`} className="hover:text-brand">{c.projeto_nome}</Link></dd>
            </div>
            <div>
              <dt className="text-xs text-subtle">Solicitante</dt>
              <dd>{c.solicitante_nome ?? (c.aberto_por === 'ADMIN' ? 'Registrado por você' : '—')}</dd>
              {c.solicitante_contato && (
                <dd className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="size-3" /> {c.solicitante_contato}</dd>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-subtle">
              <Clock className="size-3.5" /> aberto {dataHora(c.created_at)} · atualizado {dataHora(c.updated_at)}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <StatusBadge status={c.status} />
              <PrioridadeBadge prioridade={c.prioridade} />
            </div>
          </dl>
        </Painel>
        <div>
          <label className={labelCls} htmlFor="ch-notas">Notas internas</label>
          <textarea id="ch-notas" rows={3} value={c.notas_internas_admin ?? ''} onChange={(e) => set({ notas_internas_admin: e.target.value || null })} className={textareaCls} />
        </div>
      </aside>
    </div>
  );
}
