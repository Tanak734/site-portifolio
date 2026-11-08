'use client';

import Icon from '@/components/public/Icon';
import { ICONES_SOCIAIS, type SiteContent } from '@/lib/content-schema';
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
        <TextField label="Foto / avatar (URL)" hint="Opcional. Ainda não é exibido no site." path="perfil.avatar_url" value={p.avatar_url} onChange={(v) => up({ avatar_url: v })} />
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

export function CarreiraTab({ c, set }: TabProps) {
  const k = c.carreira;
  const up = (patch: Partial<SiteContent['carreira']>) => set('carreira', { ...k, ...patch });
  return (
    <>
      <Bloco titulo="Apresentação" descricao="Seção “Sobre” da página inicial.">
        <TextField label="Título da seção" path="carreira.titulo" value={k.titulo} onChange={(v) => up({ titulo: v })} />
        <TextArea label="Resumo da carreira" rows={5} path="carreira.resumo" value={k.resumo} onChange={(v) => up({ resumo: v })} />
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
    </>
  );
}

/* ───────────── Objetivos ───────────── */
export function ObjetivosTab({ c, set }: TabProps) {
  const o = c.objetivos_profissionais;
  const up = (patch: Partial<SiteContent['objetivos_profissionais']>) => set('objetivos_profissionais', { ...o, ...patch });
  return (
    <>
      <Bloco titulo="Missão" descricao="Frase em destaque na seção “Sobre”.">
        <TextArea label="Missão" rows={2} path="objetivos_profissionais.missao" value={o.missao} onChange={(v) => up({ missao: v })} />
      </Bloco>
      <Bloco titulo="Foco atual" descricao="Cartão “Foco atual” logo abaixo da trajetória.">
        <TextField label="Título" path="objetivos_profissionais.titulo" value={o.titulo} onChange={(v) => up({ titulo: v })} />
        <TextArea label="Subtítulo" rows={2} path="objetivos_profissionais.subtitulo" value={o.subtitulo} onChange={(v) => up({ subtitulo: v })} />
        <StringList label="Metas atuais" hint="Numeradas na ordem da lista." path="objetivos_profissionais.metas_atuais" value={o.metas_atuais} onChange={(v) => up({ metas_atuais: v })} addLabel="Adicionar meta" />
        <StringList label="Interesses técnicos" path="objetivos_profissionais.interesses_tecnicos" value={o.interesses_tecnicos} onChange={(v) => up({ interesses_tecnicos: v })} addLabel="Adicionar interesse" />
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
      descricao="Seção “Stack”. Itens com “Na faixa animada” também aparecem na faixa de ícones abaixo do Hero."
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
        na seção Stack, em tom neutro.
      </p>
    </Bloco>
  );
}

/* ───────────── Textos das seções ───────────── */
const SECOES: { key: keyof SiteContent['textos_secoes']; nome: string; onde: string }[] = [
  { key: 'projetos', nome: 'Portfólio', onde: 'Título acima dos cards de projetos' },
  { key: 'skills', nome: 'Tecnologias', onde: 'Seção “Stack”' },
  { key: 'depoimentos', nome: 'Depoimentos', onde: 'Acima do carrossel de depoimentos' },
  { key: 'ticket_form', nome: 'Contato · formulário', onde: 'Título grande da seção de contato' },
  { key: 'contato', nome: 'Contato · outros canais', onde: 'Acima dos cartões de e-mail/LinkedIn/GitHub' },
];

export function TextosTab({ c, set }: TabProps) {
  const t = c.textos_secoes;
  return (
    <>
      {SECOES.map(({ key, nome, onde }) => (
        <Bloco key={key} titulo={nome} descricao={onde}>
          <TextField label="Título" path={`textos_secoes.${key}.titulo`} value={t[key].titulo} onChange={(v) => set('textos_secoes', { ...t, [key]: { ...t[key], titulo: v } })} />
          <TextArea label="Descrição" rows={2} path={`textos_secoes.${key}.descricao`} value={t[key].descricao} onChange={(v) => set('textos_secoes', { ...t, [key]: { ...t[key], descricao: v } })} />
        </Bloco>
      ))}
    </>
  );
}
