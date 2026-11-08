'use client';

import type { TechIconData } from '@/lib/tech-icon-color';
import type { CategoriaIconeInfo } from './IconPicker';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { BriefcaseBusiness, Check, ExternalLink, Layers, Link2, Loader2, RotateCcw, Save, Target, Type, UserRound } from 'lucide-react';
import { siteContentSchema, type SiteContent } from '@/lib/content-schema';
import { salvarConteudo } from '@/app/admin/(painel)/config/actions';
import { ErrosContext } from './fields';
import { CarreiraTab, ObjetivosTab, PerfilTab, RedesTab, TecnologiasTab, TextosTab, type TabProps } from './tabs';

const ABAS = [
  { id: 'perfil', label: 'Perfil & Hero', icon: UserRound, chave: 'perfil', Comp: PerfilTab },
  { id: 'carreira', label: 'Carreira', icon: BriefcaseBusiness, chave: 'carreira', Comp: CarreiraTab },
  { id: 'objetivos', label: 'Objetivos', icon: Target, chave: 'objetivos_profissionais', Comp: ObjetivosTab },
  { id: 'redes', label: 'Redes & contato', icon: Link2, chave: 'links_sociais', Comp: RedesTab },
  { id: 'tecnologias', label: 'Tecnologias', icon: Layers, chave: 'categorias_skills', Comp: TecnologiasTab },
  { id: 'textos', label: 'Textos das seções', icon: Type, chave: 'textos_secoes', Comp: TextosTab },
] as const;

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
  const [aba, setAba] = useState<(typeof ABAS)[number]['id']>('perfil');
  const [erros, setErros] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>(null);
  const [salvando, startSalvar] = useTransition();

  const sujo = useMemo(() => JSON.stringify(c) !== JSON.stringify(salvo), [c, salvo]);

  const set: TabProps['set'] = useCallback((key, value) => {
    setC((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
  }, []);

  // Erros por aba (primeiro segmento do caminho)
  const errosPorAba = useMemo(() => {
    const n: Record<string, number> = {};
    for (const path of Object.keys(erros)) {
      const raiz = path.split('.')[0];
      n[raiz] = (n[raiz] ?? 0) + 1;
    }
    return n;
  }, [erros]);

  const salvar = useCallback(() => {
    if (salvando) return;
    // Validação no navegador para feedback imediato (o servidor valida de novo).
    const local = siteContentSchema.safeParse(c);
    if (!local.success) {
      const campos: Record<string, string> = {};
      for (const issue of local.error.issues) campos[issue.path.join('.')] ??= issue.message;
      setErros(campos);
      setStatus({ tipo: 'erro', msg: `${Object.keys(campos).length} campo(s) precisam de atenção.` });
      const primeira = ABAS.find((a) => Object.keys(campos).some((p) => p.startsWith(a.chave)));
      if (primeira) setAba(primeira.id);
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
  }, [c, salvando]);

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

  const Atual = ABAS.find((a) => a.id === aba)!.Comp;

  return (
    <ErrosContext value={erros}>
      {/* Barra superior fixa: abas + salvar */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b bg-background/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2 text-sm">
            {salvando ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Salvando…</span>
            ) : status ? (
              <span className={`inline-flex items-center gap-1.5 ${status.tipo === 'ok' ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`} role="status">
                {status.tipo === 'ok' && <Check className="size-3.5" />} {status.msg}
              </span>
            ) : sujo ? (
              <span className="inline-flex items-center gap-1.5 text-brand"><span className="size-1.5 rounded-full bg-brand" /> Alterações não salvas</span>
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

        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Seções do conteúdo">
          {ABAS.map(({ id, label, icon: IconCmp, chave }) => {
            const ativo = aba === id;
            const nErros = errosPorAba[chave] ?? 0;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => setAba(id)}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition ${
                  ativo ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconCmp className={`size-4 ${ativo ? 'text-brand' : ''}`} />
                {label}
                {nErros > 0 && (
                  <span className="rounded-full bg-destructive/15 px-1.5 text-[11px] font-medium text-destructive">{nErros}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div role="tabpanel" className="space-y-6 pb-16">
        <Atual c={c} set={set} icones={icones} categoriasIcones={categoriasIcones} />
      </div>
    </ErrosContext>
  );
}
