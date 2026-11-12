'use client';

import { useState, useSyncExternalStore } from 'react';
import { Bug, Check, ChevronDown, CircleDashed, ExternalLink, HelpCircle, Lock, Mail, MessageSquare, PenLine, Send, Sparkles } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { Barra, btnPrimario, btnSecundario, inputCls, labelCls, textareaCls } from '@/components/admin/ui';
import { brl, data, dataHora } from '@/lib/admin-format';
import { CATEGORIA_CUSTO_LABEL, CHAMADO_ABERTO, RECORRENCIA_LABEL, STATUS_CHAMADO_LABEL, TIPO_CHAMADO_LABEL, type TipoChamado } from '@/lib/admin-types';
import type { PortalDados } from '@/lib/portal-api';
import AreaTopo from './AreaTopo';

const TIPOS: { tipo: TipoChamado; icon: typeof Bug; dica: string }[] = [
  { tipo: 'MANUTENCAO', icon: Bug, dica: 'Algo parou de funcionar' },
  { tipo: 'ALTERACAO', icon: PenLine, dica: 'Ajustar uma tela ou regra' },
  { tipo: 'MELHORIA', icon: Sparkles, dica: 'Algo novo no sistema' },
  { tipo: 'SUPORTE', icon: HelpCircle, dica: 'Dúvida de uso' },
];

type Aba = 'andamento' | 'chamados' | 'financeiro' | 'recados';

/** A aba vem do #hash da URL — assim o link "…#chamados" abre direto nos chamados. */
const assinarHash = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

/** Portal de um projeto: o que o cliente vê. Nada de horas, valor-hora, seus custos ou notas internas. */
export default function PortalCliente({ dados, marca, contatoEmail }: { dados: PortalDados; marca: string; contatoEmail: string | null }) {
  const { projeto: p } = dados;
  const [chamados, setChamados] = useState(dados.chamados);
  const [comentarios, setComentarios] = useState(dados.comentarios);
  const hash = useSyncExternalStore(assinarHash, () => window.location.hash.slice(1), () => '');

  const ABAS: { id: Aba; label: string; contagem?: number; mostrar: boolean }[] = [
    { id: 'andamento', label: 'Andamento', mostrar: true },
    { id: 'chamados', label: 'Chamados', contagem: chamados.filter((c) => CHAMADO_ABERTO.includes(c.status)).length, mostrar: true },
    { id: 'financeiro', label: 'Financeiro', mostrar: dados.pagamentos.length + dados.custos.length > 0 },
    { id: 'recados', label: 'Recados', mostrar: p.cliente_pode_comentar },
  ];
  const visiveis = ABAS.filter((a) => a.mostrar);
  const aba: Aba = visiveis.some((a) => a.id === hash) ? (hash as Aba) : 'andamento';
  const irPara = (id: Aba) => {
    window.history.replaceState(null, '', id === 'andamento' ? window.location.pathname : `#${id}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  return (
    <div className="min-h-dvh">
      <AreaTopo marca={marca} voltar={{ href: '/cliente', label: 'Área do cliente' }} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Cabeçalho do projeto */}
        <section className="rounded-3xl border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{p.cliente_nome}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{p.nome}</h1>
            </div>
            <StatusBadge status={p.status} />
          </div>
          <div className="mt-6 flex items-end justify-between gap-4">
            <p className="text-4xl font-semibold tracking-tight text-brand sm:text-5xl">{p.progresso}%</p>
            <p className="text-right text-sm text-muted-foreground">
              {p.start_date && <>Início {data(p.start_date)}<br /></>}
              {p.end_date && <>{p.status === 'CONCLUIDO' ? 'Entregue em' : 'Entrega prevista'} <span className="text-foreground">{data(p.end_date)}</span></>}
            </p>
          </div>
          <Barra valor={p.progresso} className="mt-4 h-2.5" />
        </section>

        {/* Abas */}
        <nav role="tablist" aria-label="Seções do projeto" className="my-6 flex flex-wrap gap-1 border-b">
          {visiveis.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={aba === a.id}
              onClick={() => irPara(a.id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition ${aba === a.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {a.label}
              {!!a.contagem && <span className="rounded-full bg-primary/15 px-1.5 text-[11px] font-medium text-brand">{a.contagem}</span>}
            </button>
          ))}
        </nav>

        {aba === 'andamento' && <Andamento dados={dados} />}
        {aba === 'chamados' && <Chamados aceita={p.aceita_chamados} chamados={chamados} setChamados={setChamados} contatoEmail={contatoEmail} />}
        {aba === 'financeiro' && <Financeiro dados={dados} />}
        {aba === 'recados' && <Recados comentarios={comentarios} setComentarios={setComentarios} />}

        <p className="pt-10 text-center text-xs text-subtle">Este link é exclusivo deste projeto. Não compartilhe publicamente.</p>
      </main>
    </div>
  );
}

/* ───────────── Andamento ───────────── */
function Andamento({ dados }: { dados: PortalDados }) {
  return (
    <ol className="relative space-y-4 border-l pl-6">
      {dados.tarefas.map((t) => {
        const total = t.checklist.length;
        const feitos = t.checklist.filter((c) => c.concluido).length;
        const andamento = !t.concluida && feitos > 0;
        return (
          <li key={t.id} className="relative">
            <span
              className={`absolute top-1 -left-[33px] grid size-4 place-items-center rounded-full ring-4 ring-background ${
                t.concluida ? 'bg-primary text-primary-foreground' : andamento ? 'bg-amber-500' : 'border bg-background'
              }`}
            >
              {t.concluida && <Check className="size-2.5" />}
            </span>
            <p className={`text-sm font-medium ${t.concluida ? 'text-muted-foreground' : ''}`}>{t.titulo}</p>
            <p className="text-xs text-subtle">{t.concluida ? 'Concluída' : andamento ? `Em andamento · ${feitos} de ${total}` : 'A fazer'}</p>
          </li>
        );
      })}
      {dados.tarefas.length === 0 && <li className="text-sm text-subtle">As etapas aparecem aqui assim que o projeto começar.</li>}
    </ol>
  );
}

/* ───────────── Chamados ───────────── */
function Chamados({
  aceita,
  chamados,
  setChamados,
  contatoEmail,
}: {
  aceita: boolean;
  chamados: PortalDados['chamados'];
  setChamados: React.Dispatch<React.SetStateAction<PortalDados['chamados']>>;
  contatoEmail: string | null;
}) {
  const [tipo, setTipo] = useState<TipoChamado>('MANUTENCAO');
  const [abrindo, setAbrindo] = useState(false);
  const [aberto, setAberto] = useState<number | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {aceita ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Problema, ajuste, ideia nova ou dúvida? Abra um chamado e acompanhe a resposta aqui.</p>
          <button type="button" onClick={() => setAbrindo((v) => !v)} className={abrindo ? btnSecundario : btnPrimario}>
            {abrindo ? 'Cancelar' : 'Abrir chamado'}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-4 rounded-2xl border border-dashed p-5">
          <Lock className="mt-0.5 size-5 shrink-0 text-subtle" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">O período de suporte deste projeto terminou</p>
            <p className="mt-1 text-sm text-muted-foreground">Você ainda pode ver o histórico abaixo. Para um ajuste ou um plano de manutenção, fale comigo.</p>
          </div>
          {contatoEmail && (
            <a href={`mailto:${contatoEmail}?subject=${encodeURIComponent('Suporte para o meu projeto')}`} className={btnSecundario}>
              <Mail className="size-4" /> Falar comigo
            </a>
          )}
        </div>
      )}

      {enviado && (
        <p className="rounded-xl border border-primary/40 bg-primary/8 px-4 py-3 text-sm" role="status">
          Chamado <span className="font-mono font-medium">{enviado}</span> aberto! A resposta aparece aqui e também chega pelo seu contato.
        </p>
      )}

      {aceita && abrindo && (
        <form
          className="space-y-4 rounded-2xl border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            const n = Math.max(0, ...chamados.map((c) => Number(c.protocolo.slice(-4)))) + 1;
            const protocolo = `CHM-${new Date().getFullYear()}-${String(n + 10).padStart(4, '0')}`;
            const agora = new Date().toISOString();
            setChamados((l) => [
              { id: Date.now(), protocolo, tipo, status: 'ABERTO', titulo: String(d.get('titulo')).trim(), created_at: agora, updated_at: agora, interacoes: [{ id: 1, autor: 'CLIENTE', mensagem: String(d.get('descricao')).trim(), visivel_cliente: true, created_at: agora }] },
              ...l,
            ]);
            setEnviado(protocolo);
            setAbrindo(false);
          }}
        >
          <fieldset>
            <legend className={labelCls}>O que você precisa?</legend>
            <div className="grid gap-2 sm:grid-cols-4">
              {TIPOS.map(({ tipo: t, icon: Icone, dica }) => (
                <label key={t} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${tipo === t ? 'border-primary/60 bg-primary/8' : 'hover:bg-accent'}`}>
                  <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={() => setTipo(t)} className="sr-only" />
                  <Icone className={`mb-2 size-5 ${tipo === t ? 'text-brand' : 'text-subtle'}`} />
                  <span className="block font-medium">{TIPO_CHAMADO_LABEL[t]}</span>
                  <span className="block text-xs text-subtle">{dica}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label className={labelCls} htmlFor="pc-titulo">Resumo *</label>
            <input id="pc-titulo" name="titulo" required className={inputCls} placeholder="Ex.: botão de salvar não responde no celular" />
          </div>
          <div>
            <label className={labelCls} htmlFor="pc-desc">Detalhes *</label>
            <textarea id="pc-desc" name="descricao" required rows={4} className={textareaCls} placeholder="O que aconteceu, em qual tela e desde quando." />
          </div>
          <div className="flex justify-end">
            <button type="submit" className={btnPrimario}><Send className="size-4" /> Enviar chamado</button>
          </div>
        </form>
      )}

      <ul className="divide-y rounded-2xl border bg-card">
        {chamados.map((c) => {
          const exp = aberto === c.id;
          return (
            <li key={c.id}>
              <button type="button" onClick={() => setAberto(exp ? null : c.id)} aria-expanded={exp} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3.5 text-left hover:bg-accent/50">
                <span className="font-mono text-xs text-subtle">{c.protocolo}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.titulo}</span>
                <StatusBadge status={c.status} />
                <ChevronDown className={`size-4 text-subtle transition ${exp ? 'rotate-180' : ''}`} />
              </button>
              {exp && (
                <div className="space-y-3 px-5 pb-5">
                  <p className="text-xs text-subtle">{TIPO_CHAMADO_LABEL[c.tipo]} · aberto {dataHora(c.created_at)} · {STATUS_CHAMADO_LABEL[c.status]}</p>
                  {c.interacoes.map((i) => (
                    <div key={i.id} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${i.autor === 'CLIENTE' ? 'ml-auto bg-primary/12' : 'border bg-background'}`}>
                      <p>{i.mensagem}</p>
                      <p className="mt-1 text-[11px] text-subtle">{i.autor === 'CLIENTE' ? 'Você' : 'Desenvolvedor'} · {dataHora(i.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
        {chamados.length === 0 && (
          <li className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-subtle">
            <CircleDashed className="size-4" /> Nenhum chamado até agora.
          </li>
        )}
      </ul>
    </div>
  );
}

/* ───────────── Financeiro ───────────── */
function Financeiro({ dados }: { dados: PortalDados }) {
  const mensal = dados.custos.reduce((s, c) => s + (c.tipo_recorrencia === 'MENSAL' ? c.valor : c.tipo_recorrencia === 'ANUAL' ? c.valor / 12 : 0), 0);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section>
        <h2 className="mb-1 font-semibold tracking-tight">Parcelas</h2>
        <p className="mb-3 text-xs text-subtle">Combinadas para o desenvolvimento.</p>
        <ul className="divide-y rounded-2xl border bg-card text-sm">
          {dados.pagamentos.map((x) => (
            <li key={x.id} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                {x.descricao}
                <span className="block text-xs text-subtle">vence {data(x.data_vencimento)}</span>
              </span>
              <span className="font-medium tabular-nums">{brl(x.valor)}</span>
              <StatusBadge status={x.status} />
            </li>
          ))}
          {dados.pagamentos.length === 0 && <li className="px-4 py-6 text-center text-subtle">Sem parcelas.</li>}
        </ul>
      </section>
      <section>
        <h2 className="mb-1 font-semibold tracking-tight">Custos do sistema</h2>
        <p className="mb-3 text-xs text-subtle">Pagos por você, com o link de onde vem cada preço. Cerca de {brl(mensal)}/mês.</p>
        <ul className="divide-y rounded-2xl border bg-card text-sm">
          {dados.custos.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                {c.descricao}
                <span className="block text-xs text-subtle">{CATEGORIA_CUSTO_LABEL[c.categoria_custo]} · {RECORRENCIA_LABEL[c.tipo_recorrencia].toLowerCase()}</span>
              </span>
              <span className="font-medium tabular-nums">{brl(c.valor)}</span>
              {c.link_fonte && (
                <a href={c.link_fonte} target="_blank" rel="noopener" className="text-subtle hover:text-brand" aria-label={`Fonte do preço de ${c.descricao}`}>
                  <ExternalLink className="size-4" />
                </a>
              )}
            </li>
          ))}
          {dados.custos.length === 0 && <li className="px-4 py-6 text-center text-subtle">Sem custos de infraestrutura.</li>}
        </ul>
      </section>
    </div>
  );
}

/* ───────────── Recados ───────────── */
function Recados({ comentarios, setComentarios }: { comentarios: PortalDados['comentarios']; setComentarios: React.Dispatch<React.SetStateAction<PortalDados['comentarios']>> }) {
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare className="size-4" /> Para comentários rápidos. Problemas e pedidos vão melhor como chamado.
      </p>
      {comentarios.map((c) => (
        <div key={c.id} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${c.autor === 'CLIENTE' ? 'ml-auto bg-primary/12' : 'border bg-background'}`}>
          <p>{c.mensagem}</p>
          <p className="mt-1 text-[11px] text-subtle">{c.autor === 'CLIENTE' ? 'Você' : 'Desenvolvedor'} · {dataHora(c.created_at)}</p>
        </div>
      ))}
      <form
        className="flex gap-2 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          const mensagem = String(new FormData(e.currentTarget).get('msg')).trim();
          if (!mensagem) return;
          setComentarios((l) => [...l, { id: Date.now(), autor: 'CLIENTE', mensagem, created_at: new Date().toISOString() }]);
          e.currentTarget.reset();
        }}
      >
        <input name="msg" placeholder="Deixe um recado sobre o andamento…" className={inputCls} aria-label="Recado" />
        <button type="submit" className={btnPrimario} aria-label="Enviar recado"><Send className="size-4" /></button>
      </form>
    </section>
  );
}
