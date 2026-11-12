'use client';

import type { TechIconData } from '@/lib/tech-icon-color';
import type { CategoriaIconeInfo } from './IconPicker';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, useTransition, type ComponentType } from 'react';
import {
  BriefcaseBusiness,
  Check,
  CircleHelp,
  ExternalLink,
  FolderKanban,
  Layers,
  Link2,
  ListOrdered,
  Loader2,
  MessageSquareQuote,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { siteContentSchema, type SecaoId, type SiteContent } from '@/lib/content-schema';
import { secoesOrdenadas } from '@/lib/content-utils';
import { salvarConteudo } from '@/app/admin/(painel)/config/actions';
import { ErrosContext, Switch } from './fields';
import EditorNav, { type NavItem } from './EditorNav';
import {
  CarreiraTab,
  ContatoPanel,
  DepoimentosPanel,
  FaqPanel,
  PerfilTab,
  ProcessoPanel,
  ProjetosPanel,
  RedesTab,
  ServicosPanel,
  TecnologiasTab,
  type TabProps,
} from './tabs';

type Painel = {
  label: string;
  descricao: string;
  icon: ComponentType<{ className?: string }>;
  /** Caminhos do conteúdo editados neste painel (para contar erros e alterações). */
  caminhos: string[];
  Comp: ComponentType<TabProps>;
};

const SECOES: Record<SecaoId, Painel> = {
  projetos: { label: 'Projetos', descricao: 'Vitrine de projetos públicos.', icon: FolderKanban, caminhos: ['textos_secoes.projetos'], Comp: ProjetosPanel },
  servicos: { label: 'Serviços', descricao: 'Cartões com o que você oferece.', icon: Sparkles, caminhos: ['servicos', 'textos_secoes.servicos'], Comp: ServicosPanel },
  processo: { label: 'Como trabalho', descricao: 'Etapas do seu processo.', icon: ListOrdered, caminhos: ['processo', 'textos_secoes.processo'], Comp: ProcessoPanel },
  depoimentos: { label: 'Depoimentos', descricao: 'Carrossel de avaliações de clientes.', icon: MessageSquareQuote, caminhos: ['textos_secoes.depoimentos'], Comp: DepoimentosPanel },
  sobre: { label: 'Sobre', descricao: 'Resumo, missão, números e trajetória.', icon: BriefcaseBusiness, caminhos: ['carreira', 'objetivos_profissionais'], Comp: CarreiraTab },
  faq: { label: 'FAQ', descricao: 'Perguntas frequentes.', icon: CircleHelp, caminhos: ['faq', 'textos_secoes.faq'], Comp: FaqPanel },
};

const FIXOS = {
  perfil: { label: 'Perfil & Hero', descricao: 'Identidade, disponibilidade e a chamada principal.', icon: UserRound, caminhos: ['perfil'], Comp: PerfilTab },
  contato: { label: 'Contato', descricao: 'Título e formulário de envio de ideias — sempre no fim da página.', icon: Send, caminhos: ['textos_secoes.ticket_form', 'formulario_contato'], Comp: ContatoPanel },
  redes: { label: 'Redes & links', descricao: 'Ícones da barra superior, rodapé, botão flutuante e currículo.', icon: Link2, caminhos: ['links_sociais'], Comp: RedesTab },
  tecnologias: { label: 'Tecnologias', descricao: 'Catálogo usado na faixa animada e nos cartões de serviço.', icon: Layers, caminhos: ['categorias_skills'], Comp: TecnologiasTab },
} satisfies Record<string, Painel>;

type PainelId = SecaoId | keyof typeof FIXOS;
const painelDe = (id: PainelId): Painel => (id in SECOES ? SECOES[id as SecaoId] : FIXOS[id as keyof typeof FIXOS]);

const CHAVE_ABA = 'conteudo-site:painel';
const semAssinatura = () => () => {};
/** Último painel aberto neste navegador (null no servidor e se o storage estiver bloqueado). */
function painelLembrado(): PainelId | null {
  try {
    const v = localStorage.getItem(CHAVE_ABA);
    return v && (v in SECOES || v in FIXOS) ? (v as PainelId) : null;
  } catch {
    return null;
  }
}

/** Valor em um caminho "a.b.c" do conteúdo (para comparar com a versão salva). */
const valorEm = (obj: unknown, caminho: string) =>
  caminho.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
const dentro = (path: string, caminhos: string[]) => caminhos.some((c) => path === c || path.startsWith(`${c}.`));

type Status = { tipo: 'ok' | 'erro'; msg: string } | null;

export default function ContentEditor({
  inicial,
  icones,
  categoriasIcones,
}: {
  inicial: SiteContent;
  icones: Record<string, TechIconData>;
  categoriasIcones: CategoriaIconeInfo[];
}) {
  const [salvo, setSalvo] = useState(inicial); // última versão persistida
  const [c, setC] = useState(inicial);
  const [escolhido, setEscolhido] = useState<PainelId | null>(null);
  const lembrado = useSyncExternalStore(semAssinatura, painelLembrado, () => null);
  const aba: PainelId = escolhido ?? lembrado ?? 'perfil';
  const [erros, setErros] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>(null);
  const [salvando, startSalvar] = useTransition();

  const sujo = useMemo(() => JSON.stringify(c) !== JSON.stringify(salvo), [c, salvo]);
  const secoes = useMemo(() => secoesOrdenadas(c), [c]);

  // Lembra o último painel aberto (conveniência por navegador).
  const setAba = useCallback((id: PainelId) => {
    setEscolhido(id);
    try {
      localStorage.setItem(CHAVE_ABA, id);
    } catch {}
  }, []);

  const set: TabProps['set'] = useCallback((key, value) => {
    setC((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
  }, []);

  /* ── Seções: ordem e visibilidade ── */
  const salvarSecoes = (lista: typeof secoes) => set('secoes', lista.map(({ id, visivel, no_menu }) => ({ id, visivel, no_menu })));
  const mover = (de: number, para: number) => {
    const n = [...secoes];
    const [x] = n.splice(de, 1);
    n.splice(para, 0, x);
    salvarSecoes(n);
  };
  const patchSecao = (id: string, p: Partial<{ visivel: boolean; no_menu: boolean }>) =>
    salvarSecoes(secoes.map((s) => (s.id === id ? { ...s, ...p } : s)));

  /* ── Estado de cada item da navegação ── */
  const item = (id: PainelId, extra?: Partial<NavItem>): NavItem => {
    const p = painelDe(id);
    return {
      id,
      label: p.label,
      icon: p.icon,
      erros: Object.keys(erros).filter((path) => dentro(path, p.caminhos)).length,
      alterado: p.caminhos.some((k) => JSON.stringify(valorEm(c, k)) !== JSON.stringify(valorEm(salvo, k))),
      ...extra,
    };
  };

  const salvar = useCallback(() => {
    if (salvando) return;
    // Validação no navegador para feedback imediato (o servidor valida de novo).
    const local = siteContentSchema.safeParse(c);
    if (!local.success) {
      const campos: Record<string, string> = {};
      for (const issue of local.error.issues) campos[issue.path.join('.')] ??= issue.message;
      setErros(campos);
      setStatus({ tipo: 'erro', msg: `${Object.keys(campos).length} campo(s) precisam de atenção.` });
      const ids = [...Object.keys(FIXOS), ...Object.keys(SECOES)] as PainelId[];
      const primeiro = ids.find((id) => Object.keys(campos).some((p) => dentro(p, painelDe(id).caminhos)));
      if (primeiro) setAba(primeiro);
      return;
    }
    startSalvar(async () => {
      const r = await salvarConteudo(local.data);
      if (r.ok) {
        setSalvo(local.data);
        setC(local.data);
        setErros({});
        setStatus({ tipo: 'ok', msg: `Salvo às ${new Date(r.salvoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. O site já foi atualizado.` });
      } else {
        setErros(r.campos ?? {});
        setStatus({ tipo: 'erro', msg: r.erro });
      }
    });
  }, [c, salvando, setAba]);

  // Ctrl/Cmd + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        salvar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [salvar]);

  // Aviso ao sair com alterações não salvas
  useEffect(() => {
    if (!sujo) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [sujo]);

  const painel = painelDe(aba);
  const Atual = painel.Comp;
  const secaoAtual = secoes.find((s) => s.id === aba);
  const posicao = secaoAtual ? secoes.indexOf(secaoAtual) + 1 : 0;
  const Icone = painel.icon;
  const ordemAlterada = JSON.stringify(c.secoes) !== JSON.stringify(salvo.secoes);

  return (
    <ErrosContext value={erros}>
      {/* Barra superior fixa: status + salvar */}
      <div className="sticky top-14 z-20 -mx-4 mb-6 border-b bg-background/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2 text-sm">
            {salvando ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Salvando…</span>
            ) : status ? (
              <span className={`inline-flex items-center gap-1.5 ${status.tipo === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`} role="status">
                {status.tipo === 'ok' && <Check className="size-3.5" />} {status.msg}
              </span>
            ) : sujo ? (
              <span className="inline-flex items-center gap-1.5 text-brand">
                <span className="size-1.5 rounded-full bg-brand" /> Alterações não salvas{ordemAlterada && ' · ordem das seções mudou'}
              </span>
            ) : (
              <span className="text-subtle">Tudo salvo</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground">
              <ExternalLink className="size-4" /> Ver site
            </a>
            <button
              type="button"
              disabled={!sujo || salvando}
              onClick={() => { setC(salvo); setErros({}); setStatus(null); }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <RotateCcw className="size-4" /> Descartar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={!sujo || salvando}
              title="Salvar (Ctrl+S)"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/85 disabled:opacity-50"
            >
              {salvando ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Salvar alterações
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 pb-16 xl:grid-cols-[15rem_minmax(0,1fr)] xl:items-start">
        <EditorNav
          ativo={aba}
          onSelect={(id) => setAba(id as PainelId)}
          topo={[item('perfil')]}
          secoes={secoes.map((s) => item(s.id, { visivel: s.visivel }))}
          fim={[item('contato')]}
          geral={[item('redes'), item('tecnologias')]}
          onMover={mover}
          onToggleVisivel={(id) => patchSecao(id, { visivel: !secoes.find((s) => s.id === id)?.visivel })}
        />

        <div role="region" aria-labelledby="painel-titulo" className="min-w-0 space-y-6">
          {/* Cabeçalho do painel: onde isso fica no site + controles da seção */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-brand ring-1 ring-primary/20">
                <Icone className="size-5" />
              </span>
              <div>
                <h2 id="painel-titulo" className="text-lg font-semibold tracking-tight">{painel.label}</h2>
                <p className="text-sm text-muted-foreground">
                  {secaoAtual
                    ? `${posicao}ª seção de ${secoes.length} no meio da página${secaoAtual.visivel ? '' : ' · oculta no site'}.`
                    : aba === 'perfil'
                      ? 'Fixo no topo da página.'
                      : aba === 'contato'
                        ? 'Fixo no fim da página.'
                        : 'Configuração geral, usada em várias partes do site.'}{' '}
                  {painel.descricao}
                </p>
              </div>
            </div>
            {(secaoAtual || aba === 'contato') && (
              <a
                href={`/#${secaoAtual ? secaoAtual.id : 'contato'}`}
                target="_blank"
                rel="noopener"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <ExternalLink className="size-3.5" /> Ver no site
              </a>
            )}
          </header>

          {secaoAtual && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Switch
                label="Visível no site"
                hint="Oculta, a seção continua salva — só não aparece."
                checked={secaoAtual.visivel}
                onChange={(v) => patchSecao(secaoAtual.id, { visivel: v })}
              />
              <Switch
                label="Link no menu superior"
                hint={secaoAtual.visivel ? 'Atalho na barra de navegação do site.' : 'Disponível quando a seção estiver visível.'}
                checked={secaoAtual.visivel && secaoAtual.no_menu}
                onChange={(v) => secaoAtual.visivel && patchSecao(secaoAtual.id, { no_menu: v })}
              />
            </div>
          )}

          <Atual c={c} set={set} icones={icones} categoriasIcones={categoriasIcones} />
        </div>
      </div>
    </ErrosContext>
  );
}
