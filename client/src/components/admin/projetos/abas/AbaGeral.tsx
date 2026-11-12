'use client';

import CopiarLink from '../../CopiarLink';
import { Switch } from '../../content-editor/fields';
import { Painel, VisivelCliente, inputCls, labelCls, textareaCls } from '../../ui';
import { Lock } from 'lucide-react';
import { dataHora } from '@/lib/admin-format';
import { COMPLEXIDADE_LABEL, STATUS_PROJETO_LABEL, type Complexidade, type StatusProjeto } from '@/lib/admin-types';
import type { AbaProps } from '../calculos';

export default function AbaGeral({ p, set }: AbaProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <Painel titulo="Dados do projeto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="g-nome">Nome</label>
              <input id="g-nome" value={p.nome} onChange={(e) => set({ nome: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="g-status">Status</label>
              <select id="g-status" value={p.status} onChange={(e) => set({ status: e.target.value as StatusProjeto })} className={inputCls}>
                {Object.entries(STATUS_PROJETO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="g-comp">Complexidade geral</label>
              <select id="g-comp" value={p.complexidade_geral} onChange={(e) => set({ complexidade_geral: e.target.value as Complexidade })} className={inputCls}>
                {Object.entries(COMPLEXIDADE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="g-ini">Início</label>
              <input id="g-ini" type="date" value={p.start_date ?? ''} onChange={(e) => set({ start_date: e.target.value || null })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="g-fim">Entrega</label>
              <input id="g-fim" type="date" value={p.end_date ?? ''} onChange={(e) => set({ end_date: e.target.value || null })} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="g-cat">Categoria</label>
              <input id="g-cat" value={p.categoria_projeto ?? ''} onChange={(e) => set({ categoria_projeto: e.target.value || null })} className={inputCls} />
            </div>
          </div>
        </Painel>
        <Painel titulo="Notas internas" acao={<span className="inline-flex items-center gap-1 text-xs text-subtle"><Lock className="size-3" /> Só você</span>}>
          <textarea rows={4} value={p.notas_internas ?? ''} onChange={(e) => set({ notas_internas: e.target.value || null })} className={textareaCls} aria-label="Notas internas" />
        </Painel>
      </div>

      <div className="space-y-6">
        <Painel titulo="Portal do cliente" descricao="Link único deste projeto, sem login. Também aparece na área do cliente." acao={<VisivelCliente texto="Do cliente" />}>
          <div className="space-y-4">
            <CopiarLink rotulo="Acompanhamento" caminho={`/status/${p.codigo_rastreio}`} />
            <CopiarLink rotulo="Abrir chamado" caminho={`/status/${p.codigo_rastreio}#chamados`} />
            <Switch label="Aceita chamados" hint="Mostra a área de chamados no portal." checked={p.aceita_chamados} onChange={(v) => set({ aceita_chamados: v })} />
            <Switch label="Cliente pode comentar" hint="Caixa de comentários no portal." checked={p.cliente_pode_comentar} onChange={(v) => set({ cliente_pode_comentar: v })} />
          </div>
        </Painel>

        <Painel titulo="Recados do portal" acao={<VisivelCliente />} semPadding>
          {p.comentarios.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-subtle">Nenhum comentário ainda.</p>
          ) : (
            <ul className="space-y-3 p-5">
              {p.comentarios.map((c) => (
                <li key={c.id} className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm ${c.autor === 'ADMIN' ? 'ml-auto bg-primary/12' : 'border bg-background'}`}>
                  <p>{c.mensagem}</p>
                  <p className="mt-1 text-[11px] text-subtle">{c.autor === 'ADMIN' ? 'Você' : 'Cliente'} · {dataHora(c.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Painel>
      </div>
    </div>
  );
}
