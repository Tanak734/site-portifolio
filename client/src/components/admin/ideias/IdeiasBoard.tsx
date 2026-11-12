'use client';

import { useMemo, useState, type DragEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRightLeft, ExternalLink, Mail, MessageCircle, Plus, Search, Sparkles, UserPlus } from 'lucide-react';
import Modal from '../Modal';
import StatusBadge, { Etiqueta } from '../StatusBadge';
import { Aviso, btnPrimario, btnSecundario, inputCls, labelCls, textareaCls } from '../ui';
import { dataCurta } from '@/lib/admin-format';
import { ORIGEM_LABEL, STATUS_TICKET_LABEL, type OrigemIdeia, type StatusTicket, type Ticket } from '@/lib/admin-types';

const COLUNAS: { status: StatusTicket; dica: string }[] = [
  { status: 'NOVO', dica: 'Chegaram e ainda não tiveram contato' },
  { status: 'EM_CONVERSA', dica: 'Entendendo o problema' },
  { status: 'MVP_EM_ELABORACAO', dica: 'Montando a proposta / protótipo' },
  { status: 'MVP_APRESENTADO', dica: 'Aguardando decisão do cliente' },
];
const ENCERRADAS: StatusTicket[] = ['ACEITO_CONVERTIDO', 'DESISTENCIA'];
const FAIXAS = ['Ainda não sei', 'Até R$ 2.000', 'R$ 2.000 – R$ 5.000', 'R$ 5.000 – R$ 15.000', 'Acima de R$ 15.000'];

const whatsapp = (tel: string) => `https://wa.me/55${tel.replace(/\D/g, '')}`;

/** Funil de Ideias de Projeto: kanban com arrastar entre colunas, ficha lateral e criação manual. */
export default function IdeiasBoard({ inicial }: { inicial: Ticket[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [ideias, setIdeias] = useState(inicial);
  const [busca, setBusca] = useState('');
  const [origem, setOrigem] = useState<OrigemIdeia | ''>('');
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [sobre, setSobre] = useState<StatusTicket | null>(null);
  const [verEncerradas, setVerEncerradas] = useState(false);
  const [convertendo, setConvertendo] = useState<Ticket | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // ?ideia=ID abre a ficha; ?nova=1 abre o formulário (links do dashboard).
  const abertaId = Number(params.get('ideia')) || null;
  const novaAberta = params.get('nova') === '1';
  const aberta = ideias.find((i) => i.id === abertaId) ?? null;
  const navegar = (q: string) => router.replace(`/admin/tickets${q}`, { scroll: false });

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return ideias.filter(
      (i) =>
        (!origem || i.origem === origem) &&
        (!q || [i.cliente_nome, i.empresa_nome, i.ideia_inicial].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [ideias, busca, origem]);

  const atualizar = (id: number, patch: Partial<Ticket>) =>
    setIdeias((lista) => lista.map((i) => (i.id === id ? { ...i, ...patch, updated_at: new Date().toISOString() } : i)));

  const soltar = (e: DragEvent, status: StatusTicket) => {
    e.preventDefault();
    if (arrastando !== null) atualizar(arrastando, { status });
    setArrastando(null);
    setSobre(null);
  };

  const encerradas = filtradas.filter((i) => ENCERRADAS.includes(i.status));

  return (
    <>
      {/* Filtros */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="relative min-w-56 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <span className="sr-only">Buscar</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, empresa ou ideia" className={`${inputCls} pl-9`} />
        </label>
        <select value={origem} onChange={(e) => setOrigem(e.target.value as OrigemIdeia | '')} className={`${inputCls} w-auto`} aria-label="Origem">
          <option value="">Todas as origens</option>
          {Object.entries(ORIGEM_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button type="button" onClick={() => navegar('?nova=1')} className={`${btnPrimario} ml-auto`}>
          <Plus className="size-4" /> Nova ideia
        </button>
      </div>

      {aviso && (
        <div className="mb-5">
          <Aviso>{aviso}</Aviso>
        </div>
      )}

      {/* Kanban */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUNAS.map(({ status, dica }) => {
          const cards = filtradas.filter((i) => i.status === status);
          return (
            <section
              key={status}
              aria-label={STATUS_TICKET_LABEL[status]}
              onDragOver={(e) => {
                e.preventDefault();
                setSobre(status);
              }}
              onDragLeave={() => setSobre((s) => (s === status ? null : s))}
              onDrop={(e) => soltar(e, status)}
              className={`flex min-h-48 flex-col rounded-2xl border bg-tone-1/60 p-2 transition ${sobre === status ? 'border-primary/60 bg-primary/5' : ''}`}
            >
              <header className="flex items-center justify-between px-2 pt-1.5 pb-2.5">
                <div>
                  <h2 className="text-sm font-medium">{STATUS_TICKET_LABEL[status]}</h2>
                  <p className="text-[11px] text-subtle">{dica}</p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{cards.length}</span>
              </header>
              <ul className="flex-1 space-y-2">
                {cards.map((i) => (
                  <li
                    key={i.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(i.id));
                      setArrastando(i.id);
                    }}
                    onDragEnd={() => {
                      setArrastando(null);
                      setSobre(null);
                    }}
                    className={arrastando === i.id ? 'opacity-40' : ''}
                  >
                    <button
                      type="button"
                      onClick={() => navegar(`?ideia=${i.id}`)}
                      className="w-full cursor-grab rounded-xl border bg-card p-3.5 text-left transition hover:border-brand/40 active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {i.cliente_nome}
                          {i.empresa_nome && <span className="block text-xs font-normal text-subtle">{i.empresa_nome}</span>}
                        </p>
                        <span className="shrink-0 font-mono text-[11px] text-subtle">#{i.id}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{i.ideia_inicial}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {i.orcamento_previo_cliente && <Etiqueta>{i.orcamento_previo_cliente}</Etiqueta>}
                        <Etiqueta>{ORIGEM_LABEL[i.origem]}</Etiqueta>
                        <span className="ml-auto text-[11px] text-subtle">{dataCurta(i.created_at)}</span>
                      </div>
                    </button>
                  </li>
                ))}
                {cards.length === 0 && <li className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-subtle">Arraste uma ideia para cá</li>}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Encerradas */}
      <div className="mt-6">
        <button type="button" onClick={() => setVerEncerradas((v) => !v)} className="text-sm text-muted-foreground hover:text-foreground">
          {verEncerradas ? 'Esconder' : 'Mostrar'} encerradas ({encerradas.length})
        </button>
        {verEncerradas && (
          <ul className="mt-3 divide-y rounded-2xl border bg-card">
            {encerradas.map((i) => (
              <li key={i.id}>
                <button type="button" onClick={() => navegar(`?ideia=${i.id}`)} className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-accent/50">
                  <span className="min-w-0 flex-1 truncate">
                    {i.cliente_nome} <span className="text-subtle">· {i.ideia_inicial}</span>
                  </span>
                  <StatusBadge status={i.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ficha da ideia */}
      <Modal
        aberto={!!aberta}
        onFechar={() => navegar('')}
        lado="direita"
        titulo={aberta ? `${aberta.cliente_nome}${aberta.empresa_nome ? ` · ${aberta.empresa_nome}` : ''}` : ''}
        descricao={aberta ? `Ideia #${aberta.id} · via ${ORIGEM_LABEL[aberta.origem].toLowerCase()} · ${dataCurta(aberta.created_at)}` : undefined}
        rodape={
          aberta &&
          !ENCERRADAS.includes(aberta.status) && (
            <>
              <button type="button" className={`${btnSecundario} mr-auto`} onClick={() => atualizar(aberta.id, { status: 'DESISTENCIA' })}>
                Marcar desistência
              </button>
              <button type="button" className={btnPrimario} onClick={() => setConvertendo(aberta)}>
                <ArrowRightLeft className="size-4" /> Converter em cliente + projeto
              </button>
            </>
          )
        }
      >
        {aberta && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <a href={whatsapp(aberta.cliente_telefone)} target="_blank" rel="noopener" className={btnSecundario}>
                <MessageCircle className="size-4" /> {aberta.cliente_telefone}
              </a>
              {aberta.cliente_email && (
                <a href={`mailto:${aberta.cliente_email}`} className={btnSecundario}>
                  <Mail className="size-4" /> {aberta.cliente_email}
                </a>
              )}
            </div>

            <div>
              <p className={labelCls}>Ideia enviada</p>
              <blockquote className="rounded-xl border-l-2 border-primary bg-background px-4 py-3 text-foreground/90">{aberta.ideia_inicial}</blockquote>
              {aberta.orcamento_previo_cliente && <p className="mt-2 text-xs text-subtle">Faixa de investimento: {aberta.orcamento_previo_cliente}</p>}
            </div>

            <div>
              <label className={labelCls} htmlFor="ideia-status">Etapa do funil</label>
              <select id="ideia-status" value={aberta.status} onChange={(e) => atualizar(aberta.id, { status: e.target.value as StatusTicket })} className={inputCls}>
                {Object.entries(STATUS_TICKET_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls} htmlFor="ideia-notas">Notas da conversa</label>
              <textarea id="ideia-notas" rows={5} value={aberta.notas_conversa ?? ''} onChange={(e) => atualizar(aberta.id, { notas_conversa: e.target.value })} className={textareaCls} placeholder="O que foi conversado, dores, prazos, decisores…" />
            </div>

            <div className="rounded-xl border p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-brand" /> MVP
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} htmlFor="ideia-mvp">Resumo do MVP</label>
                  <textarea id="ideia-mvp" rows={3} value={aberta.resumo_mvp ?? ''} onChange={(e) => atualizar(aberta.id, { resumo_mvp: e.target.value })} className={textareaCls} placeholder="O mínimo que resolve o problema principal" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="ideia-proto">Link do protótipo</label>
                  <div className="flex gap-2">
                    <input id="ideia-proto" value={aberta.link_prototipo_mvp ?? ''} onChange={(e) => atualizar(aberta.id, { link_prototipo_mvp: e.target.value })} className={inputCls} placeholder="https://figma.com/…" />
                    {aberta.link_prototipo_mvp && (
                      <a href={aberta.link_prototipo_mvp} target="_blank" rel="noopener" className={`${btnSecundario} shrink-0`} aria-label="Abrir protótipo">
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-subtle">Na prévia, as alterações ficam só nesta aba do navegador.</p>
          </div>
        )}
      </Modal>

      {/* Conversão */}
      <Modal
        aberto={!!convertendo}
        onFechar={() => setConvertendo(null)}
        titulo="Converter em cliente + projeto"
        descricao="Tudo acontece numa única transação: ou cria os dois, ou nada."
        rodape={
          <>
            <button type="button" className={btnSecundario} onClick={() => setConvertendo(null)}>Cancelar</button>
            <button
              type="button"
              className={btnPrimario}
              onClick={() => {
                if (!convertendo) return;
                atualizar(convertendo.id, { status: 'ACEITO_CONVERTIDO' });
                setAviso(`Prévia: a ideia #${convertendo.id} foi marcada como convertida. Com o backend, isso cria o cliente e o projeto e abre o Hub do novo projeto.`);
                setConvertendo(null);
                navegar('');
              }}
            >
              <UserPlus className="size-4" /> Converter
            </button>
          </>
        }
      >
        {convertendo && (
          <ul className="space-y-3">
            <li className="rounded-xl border p-3.5">
              <p className="text-xs text-subtle">Cliente</p>
              <p className="font-medium">{convertendo.cliente_nome}{convertendo.empresa_nome && ` · ${convertendo.empresa_nome}`}</p>
              <p className="text-xs text-muted-foreground">{convertendo.cliente_id ? 'Já cadastrado — será vinculado' : 'Novo cadastro com telefone e e-mail da ideia'}</p>
            </li>
            <li className="rounded-xl border p-3.5">
              <p className="text-xs text-subtle">Projeto</p>
              <p className="font-medium">{convertendo.empresa_nome ?? convertendo.cliente_nome} — novo projeto</p>
              <p className="text-xs text-muted-foreground">Começa “em andamento”, com o resumo do MVP nas notas internas e link do portal gerado.</p>
            </li>
            <li className="text-xs text-subtle">A ideia passa para “Convertido”.</li>
          </ul>
        )}
      </Modal>

      <NovaIdeia
        aberto={novaAberta}
        onFechar={() => navegar('')}
        onCriar={(nova) => {
          setIdeias((l) => [nova, ...l]);
          navegar(`?ideia=${nova.id}`);
        }}
        proximoId={Math.max(0, ...ideias.map((i) => i.id)) + 1}
      />
    </>
  );
}

function NovaIdeia({ aberto, onFechar, onCriar, proximoId }: { aberto: boolean; onFechar: () => void; onCriar: (t: Ticket) => void; proximoId: number }) {
  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Nova ideia de projeto" descricao="Para anotar conversas informais, indicações ou ideias próprias.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          const s = (k: string) => String(d.get(k) ?? '').trim() || null;
          const agora = new Date().toISOString();
          onCriar({
            id: proximoId,
            origem: 'MANUAL_ADMIN',
            cliente_id: null,
            cliente_nome: s('nome')!,
            empresa_nome: s('empresa'),
            cliente_telefone: s('telefone')!,
            cliente_email: s('email'),
            ideia_inicial: s('ideia')!,
            orcamento_previo_cliente: s('orcamento'),
            status: 'NOVO',
            notas_conversa: null,
            resumo_mvp: null,
            link_prototipo_mvp: null,
            created_at: agora,
            updated_at: agora,
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="n-nome">Nome *</label>
            <input id="n-nome" name="nome" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="n-empresa">Empresa</label>
            <input id="n-empresa" name="empresa" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="n-tel">Telefone *</label>
            <input id="n-tel" name="telefone" required type="tel" className={inputCls} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label className={labelCls} htmlFor="n-email">E-mail</label>
            <input id="n-email" name="email" type="email" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="n-ideia">Ideia *</label>
          <textarea id="n-ideia" name="ideia" required rows={3} className={textareaCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="n-orc">Faixa de investimento</label>
          <select id="n-orc" name="orcamento" className={inputCls} defaultValue="">
            <option value="">Não informado</option>
            {FAIXAS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className={btnSecundario} onClick={onFechar}>Cancelar</button>
          <button type="submit" className={btnPrimario}><Plus className="size-4" /> Criar ideia</button>
        </div>
      </form>
    </Modal>
  );
}
