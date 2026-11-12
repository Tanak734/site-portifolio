'use client';

import ProjectCard from '@/components/public/ProjectCard';
import { Switch } from '../../content-editor/fields';
import { Aviso, Painel, inputCls, labelCls, textareaCls } from '../../ui';
import type { ProjetoDetalhe } from '@/lib/admin-types';
import type { ProjetoPublico } from '@/lib/types';
import type { AbaProps } from '../calculos';

const publico = (p: ProjetoDetalhe): ProjetoPublico => ({
  id: p.id,
  nome: p.resumo_nome || p.nome,
  resumo_nome: p.resumo_nome,
  categoria_projeto: p.categoria_projeto,
  descricao: p.descricao,
  stacks_utilizadas: p.stacks_utilizadas,
  imagem_url: p.imagem_url,
  live_url: p.is_confidencial ? null : p.live_url,
  github_url: p.is_confidencial ? null : p.github_url,
  figma_url: null,
  video_url: p.is_confidencial ? null : p.video_url,
  is_confidencial: p.is_confidencial,
  is_destaque: p.is_destaque,
  ordem: 0,
});

/** Publicação no portfólio: o card à direita é o mesmo componente da página inicial. */
export default function AbaVitrine({ p, set }: AbaProps) {
  const campo = (k: 'resumo_nome' | 'stacks_utilizadas' | 'imagem_url' | 'live_url' | 'github_url' | 'video_url', rotulo: string, ph?: string) => (
    <div>
      <label className={labelCls} htmlFor={`v-${k}`}>{rotulo}</label>
      <input id={`v-${k}`} value={p[k] ?? ''} placeholder={ph} onChange={(e) => set({ [k]: e.target.value || null })} className={inputCls} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <Painel titulo="Publicação">
          <div className="grid gap-3 sm:grid-cols-3">
            <Switch label="Público" hint="Aparece na seção Projetos." checked={p.is_publico} onChange={(v) => set({ is_publico: v })} />
            <Switch label="Sob NDA" hint="Oculta links e vídeo." checked={p.is_confidencial} onChange={(v) => set({ is_confidencial: v })} />
            <Switch label="Destaque" hint="Vai para o topo." checked={p.is_destaque} onChange={(v) => set({ is_destaque: v })} />
          </div>
        </Painel>
        <Painel titulo="Conteúdo do card">
          <div className="grid gap-4 sm:grid-cols-2">
            {campo('resumo_nome', 'Nome público', p.nome)}
            {campo('stacks_utilizadas', 'Tecnologias', 'Next.js, PostgreSQL')}
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="v-desc">Descrição</label>
              <textarea id="v-desc" rows={3} value={p.descricao ?? ''} onChange={(e) => set({ descricao: e.target.value || null })} className={textareaCls} />
            </div>
            {campo('imagem_url', 'Imagem de capa (URL)')}
            {campo('video_url', 'Vídeo (MP4 ou YouTube)')}
            {campo('live_url', 'Link ao vivo', 'https://')}
            {campo('github_url', 'GitHub', 'https://github.com/…')}
          </div>
        </Painel>
      </div>

      <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <p className="text-sm font-medium">Como aparece no site</p>
        <div className={p.is_publico ? '' : 'opacity-50'}>
          <ProjectCard projeto={publico(p)} onOpen={() => {}} />
        </div>
        {!p.is_publico && <Aviso>Este projeto não está público — o card acima é só uma prévia.</Aviso>}
        {p.is_confidencial && <Aviso>Sob NDA: o site mostra o selo e esconde link ao vivo, GitHub e vídeo.</Aviso>}
      </div>
    </div>
  );
}
