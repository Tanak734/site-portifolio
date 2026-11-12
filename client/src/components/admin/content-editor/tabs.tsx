'use client';

import Link from 'next/link';
import Icon from '@/components/public/Icon';
import ServiceIcon, { SERVICE_ICONS } from '@/components/public/ServiceIcon';
import { ICONES_SERVICO, ICONES_SOCIAIS, type SiteContent } from '@/lib/content-schema';
import { Info } from 'lucide-react';
import { useState } from 'react';
import type { TechIconData } from '@/lib/tech-icon-color';
import { Bloco, ObjectList, StringList, Switch, TextArea, TextField } from './fields';
import IconPicker, { type CategoriaIconeInfo } from './IconPicker';

export type TabProps = {
  c: SiteContent;
  set: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
  icones: Record<string, TechIconData>;
  categoriasIcones: CategoriaIconeInfo[];
};

/* ───────────── Perfil & Hero ───────────── */
export function PerfilTab({ c, set }: TabProps) {
  const p = c.perfil;
  const up = (patch: Partial<SiteContent['perfil']>) => set('perfil', { ...p, ...patch });
  return (
    <>
      <Bloco titulo="Identidade" descricao="Aparece na barra superior, no título da aba do navegador e no rodapé.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Marca" hint="Ex.: tanaka.dev — o trecho depois do ponto fica laranja." path="perfil.marca" value={p.marca} onChange={(v) => up({ marca: v })} />
          <TextField label="Nome completo" path="perfil.nome" value={p.nome} onChange={(v) => up({ nome: v })} />
          <TextField label="Cargo" path="perfil.cargo" value={p.cargo} onChange={(v) => up({ cargo: v })} />
          <TextField label="Localização" path="perfil.localizacao" value={p.localizacao} onChange={(v) => up({ localizacao: v })} />
        </div>
        <TextField label="Foto / avatar (URL)" hint="Ex.: /images/avatar.jpg (coloque o arquivo em client/public/images) ou um link https://." path="perfil.avatar_url" value={p.avatar_url} onChange={(v) => up({ avatar_url: v })} />
        <Switch label="Exibir foto na seção “Sobre”" hint="Desligado, a seção mostra só nome, cargo e localização." checked={p.exibir_foto} onChange={(v) => up({ exibir_foto: v })} />
      </Bloco>

      <Bloco titulo="Disponibilidade" descricao="Selo no topo da página inicial: verde quando disponível, âmbar (fila de espera) quando não.">
        <Switch
          label="Disponível para novos projetos"
          hint="Desligado, o selo vira o botão âmbar de entrar na fila de espera."
          checked={p.disponivel_para_novos_projetos}
          onChange={(v) => up({ disponivel_para_novos_projetos: v })}
        />
        <TextField label="Texto do selo (disponível)" path="perfil.texto_disponibilidade" value={p.texto_disponibilidade} onChange={(v) => up({ texto_disponibilidade: v })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Texto do selo (fila de espera)" path="perfil.texto_indisponibilidade" value={p.texto_indisponibilidade} onChange={(v) => up({ texto_indisponibilidade: v })} />
          <TextField label="Link da fila de espera" hint="Ex.: #contato — troque quando a fila “Avise-me” existir." path="perfil.link_fila_espera" value={p.link_fila_espera} onChange={(v) => up({ link_fila_espera: v })} />
        </div>
      </Bloco>

      <Bloco titulo="Chamada principal (Hero)" descricao="O primeiro texto que o visitante lê.">
        <TextField label="Início do título" hint="Fica antes dos cartões que giram." path="perfil.headline" value={p.headline} onChange={(v) => up({ headline: v })} />
        <StringList
          label="Frases dos cartões"
          hint="Trocam em sequência, como um baralho. A ordem aqui é a ordem no site."
          path="perfil.palavras_rotativas"
          value={p.palavras_rotativas}
          onChange={(v) => up({ palavras_rotativas: v })}
          addLabel="Adicionar frase"
        />
        <TextArea label="Subtítulo" path="perfil.subheadline" value={p.subheadline} onChange={(v) => up({ subheadline: v })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Texto do botão" path="perfil.cta_principal.texto" value={p.cta_principal.texto} onChange={(v) => up({ cta_principal: { ...p.cta_principal, texto: v } })} />
          <TextField label="Link do botão" hint="Ex.: #contato" path="perfil.cta_principal.url" value={p.cta_principal.url} onChange={(v) => up({ cta_principal: { ...p.cta_principal, url: v } })} />
        </div>
      </Bloco>
    </>
  );
}

/* ───────────── Carreira ───────────── */
type Experiencia = SiteContent['carreira']['experiencias'][number];
type Formacao = SiteContent['carreira']['formacao'][number];

type Numero = SiteContent['carreira']['numeros'][number];

export function CarreiraTab({ c, set }: TabProps) {
  const k = c.carreira;
  const o = c.objetivos_profissionais;
  const up = (patch: Partial<SiteContent['carreira']>) => set('carreira', { ...k, ...patch });
  const upObj = (patch: Partial<SiteContent['objetivos_profissionais']>) => set('objetivos_profissionais', { ...o, ...patch });
  return (
    <>
      <Bloco titulo="Apresentação" descricao="Seção “Sobre” da página inicial. Nome, cargo, localização e foto vêm da aba Perfil.">
        <TextField label="Título da seção" path="carreira.titulo" value={k.titulo} onChange={(v) => up({ titulo: v })} />
        <TextArea label="Resumo da carreira" rows={5} path="carreira.resumo" value={k.resumo} onChange={(v) => up({ resumo: v })} />
        <TextArea label="Missão" hint="Frase em destaque, com a barra verde ao lado." rows={2} path="objetivos_profissionais.missao" value={o.missao} onChange={(v) => upObj({ missao: v })} />
      </Bloco>

      <Bloco titulo="Números" descricao="Até 4 destaques curtos abaixo da missão. Deixe vazio para esconder.">
        <ObjectList<Numero>
          items={k.numeros}
          onChange={(v) => up({ numeros: v })}
          novo={() => ({ valor: '', rotulo: '' })}
          titulo={(n) => [n.valor, n.rotulo].filter(Boolean).join(' ')}
          addLabel="Adicionar número"
          render={(n, i, patch) => (
            <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
              <TextField label="Valor" placeholder="10+" path={`carreira.numeros.${i}.valor`} value={n.valor} onChange={(v) => patch({ valor: v })} />
              <TextField label="Rótulo" placeholder="projetos entregues" path={`carreira.numeros.${i}.rotulo`} value={n.rotulo} onChange={(v) => patch({ rotulo: v })} />
            </div>
          )}
        />
      </Bloco>

      <Bloco titulo="Experiência" descricao="Linha do tempo, na ordem em que aparece aqui.">
        <ObjectList<Experiencia>
          items={k.experiencias}
          onChange={(v) => up({ experiencias: v })}
          novo={() => ({ periodo: '', cargo: '', empresa: '', descricao: '', atual: false })}
          titulo={(e) => [e.cargo, e.empresa].filter(Boolean).join(' · ')}
          addLabel="Adicionar experiência"
          render={(e, i, patch) => (
            <>
              <div className="grid gap-5 sm:grid-cols-3">
                <TextField label="Cargo" path={`carreira.experiencias.${i}.cargo`} value={e.cargo} onChange={(v) => patch({ cargo: v })} />
                <TextField label="Empresa" path={`carreira.experiencias.${i}.empresa`} value={e.empresa} onChange={(v) => patch({ empresa: v })} />
                <TextField label="Período" placeholder="2024 — Atual" path={`carreira.experiencias.${i}.periodo`} value={e.periodo} onChange={(v) => patch({ periodo: v })} />
              </div>
              <TextArea label="Descrição" path={`carreira.experiencias.${i}.descricao`} value={e.descricao} onChange={(v) => patch({ descricao: v })} />
              <Switch label="Posição atual" hint="Destaca o ponto da linha do tempo em laranja." checked={e.atual} onChange={(v) => patch({ atual: v })} />
            </>
          )}
        />
      </Bloco>

      <Bloco titulo="Formação">
        <ObjectList<Formacao>
          items={k.formacao}
          onChange={(v) => up({ formacao: v })}
          novo={() => ({ periodo: '', curso: '', instituicao: '' })}
          titulo={(f) => f.curso}
          addLabel="Adicionar formação"
          render={(f, i, patch) => (
            <div className="grid gap-5 sm:grid-cols-3">
              <TextField label="Curso" path={`carreira.formacao.${i}.curso`} value={f.curso} onChange={(v) => patch({ curso: v })} />
              <TextField label="Instituição" path={`carreira.formacao.${i}.instituicao`} value={f.instituicao} onChange={(v) => patch({ instituicao: v })} />
              <TextField label="Período" placeholder="2021 — 2025" path={`carreira.formacao.${i}.periodo`} value={f.periodo} onChange={(v) => patch({ periodo: v })} />
            </div>
          )}
        />
      </Bloco>

      <Bloco titulo="Estudando agora" descricao="Etiquetas no fim da coluna de trajetória. Deixe vazio para esconder.">
        <StringList label="Temas" path="objetivos_profissionais.interesses_tecnicos" value={o.interesses_tecnicos} onChange={(v) => upObj({ interesses_tecnicos: v })} addLabel="Adicionar tema" />
      </Bloco>
    </>
  );
}

/* ───────────── Redes & contato ───────────── */
type Link = SiteContent['links_sociais'][number];
const ICONE_LABEL: Record<(typeof ICONES_SOCIAIS)[number], string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  mail: 'E-mail',
  'file-text': 'Documento / Currículo',
  whatsapp: 'WhatsApp',
  chat: 'Chat / mensagem',
};

export function RedesTab({ c, set }: TabProps) {
  return (
    <Bloco
      titulo="Redes sociais e contato"
      descricao="Ícones da barra superior, botões do Hero, rodapé e cartões de contato. O ícone “E-mail” vira o canal principal da seção Contato; “Documento” vira o botão do currículo."
    >
      <ObjectList<Link>
        items={c.links_sociais}
        onChange={(v) => set('links_sociais', v)}
        novo={() => ({ nome: '', url: 'https://', icone: 'github' })}
        titulo={(l) => l.nome}
        addLabel="Adicionar link"
        render={(l, i, patch) => (
          <div className="grid gap-5 sm:grid-cols-[1fr_2fr_1fr] sm:items-start">
            <TextField label="Nome" path={`links_sociais.${i}.nome`} value={l.nome} onChange={(v) => patch({ nome: v })} />
            <TextField label="Link" hint="https://…, mailto:… ou /arquivo.pdf" path={`links_sociais.${i}.url`} value={l.url} onChange={(v) => patch({ url: v })} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" htmlFor={`icone-${i}`}>Ícone</label>
              <div className="flex items-center gap-2">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border text-muted-foreground">
                  <Icon name={l.icone} className="size-4" />
                </span>
                <select
                  id={`icone-${i}`}
                  value={l.icone}
                  onChange={(e) => patch({ icone: e.target.value as Link['icone'] })}
                  className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/70"
                >
                  {ICONES_SOCIAIS.map((ic) => (
                    <option key={ic} value={ic}>{ICONE_LABEL[ic]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      />
    </Bloco>
  );
}

/* ───────────── Tecnologias ───────────── */
type Categoria = SiteContent['categorias_skills'][number];
type Skill = Categoria['items'][number];

export function TecnologiasTab({ c, set, icones: inicial, categoriasIcones }: TabProps) {
  // Cache local: ícones escolhidos no seletor entram aqui para a prévia, sem nova ida ao servidor.
  const [icones, setIcones] = useState(inicial);
  return (
    <Bloco
      titulo="Tecnologias por categoria"
      descricao="Seu catálogo de tecnologias. Itens com “Na faixa animada” aparecem na faixa de ícones abaixo do Hero; qualquer item pode ser marcado nos cartões da aba Serviços."
    >
      <ObjectList<Categoria>
        items={c.categorias_skills}
        onChange={(v) => set('categorias_skills', v)}
        novo={() => ({ categoria: '', descricao: '', items: [] })}
        titulo={(cat) => cat.categoria}
        addLabel="Adicionar categoria"
        render={(cat, i, patch) => (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Categoria" path={`categorias_skills.${i}.categoria`} value={cat.categoria} onChange={(v) => patch({ categoria: v })} />
              <TextField label="Descrição" path={`categorias_skills.${i}.descricao`} value={cat.descricao} onChange={(v) => patch({ descricao: v })} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Itens</p>
              <ObjectList<Skill>
                items={cat.items}
                onChange={(v) => patch({ items: v })}
                novo={() => ({ nome: '', slug_icone: null, marquee: false })}
                titulo={(s) => s.nome}
                addLabel="Adicionar tecnologia"
                render={(s, j, patchItem) => (
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <TextField label="Nome" path={`categorias_skills.${i}.items.${j}.nome`} value={s.nome} onChange={(v) => patchItem({ nome: v })} />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium" htmlFor={`slug-${i}-${j}`}>Ícone</label>
                      <IconPicker
                        id={`slug-${i}-${j}`}
                        slug={s.slug_icone}
                        icone={s.slug_icone ? icones[s.slug_icone] ?? null : null}
                        sugestao={s.nome}
                        categorias={categoriasIcones}
                        onSelect={(slug, icone) => {
                          if (slug && icone) setIcones((m) => ({ ...m, [slug]: icone }));
                          patchItem({ slug_icone: slug });
                        }}
                      />
                    </div>
                    <label className="flex h-10 items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
                      <input type="checkbox" checked={s.marquee} onChange={(e) => patchItem({ marquee: e.target.checked })} className="size-4 accent-[var(--primary)]" />
                      Na faixa animada
                    </label>
                  </div>
                )}
              />
            </div>
          </>
        )}
      />
      <p className="text-xs text-subtle">
        Clique no campo “Ícone” para buscar no catálogo de ~700 logos de tecnologia (Simple Icons). Na faixa animada eles aparecem na cor oficial da marca;
        nos cartões de serviço, em tom neutro.
      </p>
    </Bloco>
  );
}

/* ───────────── Serviços & processo ───────────── */
type Servico = SiteContent['servicos'][number];
type Etapa = SiteContent['processo'][number];

export function ServicosPanel({ c, set }: TabProps) {
  const tecnologias = [...new Set(c.categorias_skills.flatMap((cat) => cat.items.map((s) => s.nome)).filter(Boolean))];
  return (
    <>
      <SecaoTextos c={c} set={set} chave="servicos" />
      <Bloco titulo="Cartões de serviço" descricao="Funcionam melhor em número par (2, 4 ou 6).">
        <ObjectList<Servico>
          items={c.servicos}
          onChange={(v) => set('servicos', v)}
          novo={() => ({ icone: 'code', titulo: '', descricao: '', entregas: [], tecnologias: [] })}
          titulo={(s) => s.titulo}
          addLabel="Adicionar serviço"
          render={(s, i, patch) => (
            <>
              <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                <TextField label="Título" path={`servicos.${i}.titulo`} value={s.titulo} onChange={(v) => patch({ titulo: v })} />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" htmlFor={`servico-icone-${i}`}>Ícone</label>
                  <div className="flex items-center gap-2">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg border text-brand">
                      <ServiceIcon name={s.icone} className="size-4" />
                    </span>
                    <select
                      id={`servico-icone-${i}`}
                      value={s.icone}
                      onChange={(e) => patch({ icone: e.target.value as Servico['icone'] })}
                      className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/70"
                    >
                      {ICONES_SERVICO.map((ic) => (
                        <option key={ic} value={ic}>{SERVICE_ICONS[ic].label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <TextArea label="Descrição" rows={2} path={`servicos.${i}.descricao`} value={s.descricao} onChange={(v) => patch({ descricao: v })} />
              <StringList label="O que está incluso" hint="Itens com ✓ no cartão. Curtos, até 3 ou 4." path={`servicos.${i}.entregas`} value={s.entregas} onChange={(v) => patch({ entregas: v })} addLabel="Adicionar item" />
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Tecnologias</legend>
                <p className="text-xs text-subtle">Vêm da aba Tecnologias. Aparecem no rodapé do cartão, na ordem em que você marcar.</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tecnologias.map((nome) => {
                    const ativo = s.tecnologias.includes(nome);
                    return (
                      <button
                        key={nome}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => patch({ tecnologias: ativo ? s.tecnologias.filter((t) => t !== nome) : [...s.tecnologias, nome] })}
                        className={`rounded-md border px-2.5 py-1 text-xs transition ${
                          ativo ? 'border-primary/60 bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {nome}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}
        />
      </Bloco>
    </>
  );
}

export function ProcessoPanel({ c, set }: TabProps) {
  return (
    <>
      <SecaoTextos c={c} set={set} chave="processo" />
      <Bloco titulo="Etapas" descricao="Numeradas na ordem da lista. Ideal: 3 a 5 etapas.">
        <ObjectList<Etapa>
          items={c.processo}
          onChange={(v) => set('processo', v)}
          novo={() => ({ titulo: '', descricao: '', duracao: '' })}
          titulo={(e, i) => `${String(i + 1).padStart(2, '0')} · ${e.titulo}`}
          addLabel="Adicionar etapa"
          render={(e, i, patch) => (
            <>
              <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                <TextField label="Título" path={`processo.${i}.titulo`} value={e.titulo} onChange={(v) => patch({ titulo: v })} />
                <TextField label="Duração / etiqueta" hint="Opcional. Ex.: até 3 dias" path={`processo.${i}.duracao`} value={e.duracao} onChange={(v) => patch({ duracao: v })} />
              </div>
              <TextArea label="Descrição" rows={2} path={`processo.${i}.descricao`} value={e.descricao} onChange={(v) => patch({ descricao: v })} />
            </>
          )}
        />
      </Bloco>
    </>
  );
}

/* ───────────── FAQ ───────────── */
type Pergunta = SiteContent['faq'][number];

export function FaqPanel({ c, set }: TabProps) {
  return (
    <>
    <SecaoTextos c={c} set={set} chave="faq" />
    <Bloco titulo="Perguntas" descricao="Também viram dados estruturados para o Google (podem aparecer direto nos resultados de busca).">
      <ObjectList<Pergunta>
        items={c.faq}
        onChange={(v) => set('faq', v)}
        novo={() => ({ pergunta: '', resposta: '' })}
        titulo={(f) => f.pergunta}
        addLabel="Adicionar pergunta"
        render={(f, i, patch) => (
          <>
            <TextField label="Pergunta" path={`faq.${i}.pergunta`} value={f.pergunta} onChange={(v) => patch({ pergunta: v })} />
            <TextArea label="Resposta" rows={3} path={`faq.${i}.resposta`} value={f.resposta} onChange={(v) => patch({ resposta: v })} />
          </>
        )}
      />
    </Bloco>
    </>
  );
}

/* ───────────── Cabeçalho (título + descrição) de cada seção ───────────── */
type ChaveTexto = keyof SiteContent['textos_secoes'];

export function SecaoTextos({ c, set, chave, descricao }: Pick<TabProps, 'c' | 'set'> & { chave: ChaveTexto; descricao?: string }) {
  const t = c.textos_secoes;
  const up = (patch: Partial<SiteContent['textos_secoes'][ChaveTexto]>) => set('textos_secoes', { ...t, [chave]: { ...t[chave], ...patch } });
  return (
    <Bloco titulo="Cabeçalho da seção" descricao={descricao ?? 'Título grande e frase de apoio acima do conteúdo.'}>
      <TextField label="Título" path={`textos_secoes.${chave}.titulo`} value={t[chave].titulo} onChange={(v) => up({ titulo: v })} />
      <TextArea label="Descrição" rows={2} path={`textos_secoes.${chave}.descricao`} value={t[chave].descricao} onChange={(v) => up({ descricao: v })} />
    </Bloco>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 rounded-xl border border-dashed bg-background px-4 py-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/* ───────────── Projetos ───────────── */
export function ProjetosPanel({ c, set }: TabProps) {
  return (
    <>
      <SecaoTextos c={c} set={set} chave="projetos" />
      <Aviso>
        Os cards vêm dos projetos marcados como públicos em{' '}
        <Link href="/admin/projetos" className="text-foreground underline underline-offset-4 hover:text-brand">Projetos</Link> — a ordem e o destaque são definidos lá.
      </Aviso>
    </>
  );
}

/* ───────────── Depoimentos ───────────── */
export function DepoimentosPanel({ c, set }: TabProps) {
  return (
    <>
      <SecaoTextos c={c} set={set} chave="depoimentos" />
      <Aviso>Os depoimentos vêm das avaliações publicadas dos clientes. Sem nenhuma publicada, a seção não aparece no site.</Aviso>
    </>
  );
}

/* ───────────── Contato (fixo no fim da página) ───────────── */
export function ContatoPanel({ c, set }: TabProps) {
  const f = c.formulario_contato;
  const up = (patch: Partial<SiteContent['formulario_contato']>) => set('formulario_contato', { ...f, ...patch });
  return (
    <>
      <SecaoTextos c={c} set={set} chave="ticket_form" descricao="Título centralizado acima do formulário. As palavras do título aparecem uma a uma ao rolar." />
      <Bloco titulo="Formulário" descricao="Os campos (nome, empresa, telefone, e-mail e ideia) são fixos porque alimentam o funil de Ideias de Projeto.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Texto do botão" path="formulario_contato.texto_botao" value={f.texto_botao} onChange={(v) => up({ texto_botao: v })} />
          <TextField label="Nota abaixo do botão" hint="Opcional." path="formulario_contato.nota_rodape" value={f.nota_rodape} onChange={(v) => up({ nota_rodape: v })} />
        </div>
        <StringList
          label="Faixas de investimento"
          hint="Opções do campo “Faixa de investimento”. Deixe vazio para esconder o campo."
          path="formulario_contato.faixas_investimento"
          value={f.faixas_investimento}
          onChange={(v) => up({ faixas_investimento: v })}
          addLabel="Adicionar faixa"
        />
      </Bloco>
      <Bloco titulo="Depois do envio" descricao="Mensagem que substitui o formulário quando a ideia é enviada.">
        <TextField label="Título" path="formulario_contato.sucesso_titulo" value={f.sucesso_titulo} onChange={(v) => up({ sucesso_titulo: v })} />
        <TextArea label="Texto" rows={2} path="formulario_contato.sucesso_texto" value={f.sucesso_texto} onChange={(v) => up({ sucesso_texto: v })} />
      </Bloco>
    </>
  );
}
