import Icon from './Icon';
import Rotator from './Rotator';
import StarBorder from '@/components/reactbits/StarBorder';
import { getContent, opensNewTab } from '@/lib/content';

export default async function HeroSection() {
  const { perfil, links_sociais } = await getContent();
  const ok = perfil.disponivel_para_novos_projetos;

  return (
    <section id="top" className="flex min-h-[80dvh] items-center overflow-x-clip px-4 pt-28 pb-16 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Selo de status: verde quando disponível; âmbar chamando para a fila quando a agenda está cheia */}
        <a
          href={ok ? '#contato' : perfil.link_fila_espera}
          className={`group mb-8 inline-flex items-center gap-3 rounded-full border py-2 pr-5 pl-4 text-sm font-medium text-foreground transition sm:text-base ${
            ok ? 'border-ok/35 bg-ok/10 hover:border-ok/60 hover:bg-ok/15' : 'border-wait/35 bg-wait/10 hover:border-wait/60 hover:bg-wait/15'
          }`}
        >
          <span className="relative flex size-2.5">
            <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-70 ${ok ? 'bg-ok' : 'bg-wait'}`} />
            <span className={`relative inline-flex size-2.5 rounded-full ${ok ? 'bg-ok' : 'bg-wait'}`} />
          </span>
          {ok ? perfil.texto_disponibilidade : perfil.texto_indisponibilidade}
          {!ok && <span className="text-wait transition-transform group-hover:translate-x-0.5">→</span>}
        </a>

        <h1 className="max-w-4xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {perfil.headline}
          <span className="mt-[0.18em] block pb-[0.3em]">
            <Rotator words={perfil.palavras_rotativas} />
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">{perfil.subheadline}</p>

        <div className="mt-9 flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* CTA principal com borda animada (React Bits · StarBorder) */}
          <StarBorder
            as="a"
            href={perfil.cta_principal.url}
            color="#f0a070"
            trailColor="#e0844f"
            backgroundColor="#b4501c"
            textColor="#fff4ec"
            borderColor="rgba(255, 244, 236, 0.18)"
            radius={999}
            duration={4}
            hover="lap"
            className="group justify-center"
          >
            {perfil.cta_principal.texto}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </StarBorder>
          <ul className="flex flex-wrap items-center gap-2">
            {links_sociais.map((l) => (
              <li key={l.nome}>
                <a
                  href={l.url}
                  target={opensNewTab(l.url) ? '_blank' : undefined}
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm text-muted-foreground transition hover:border-brand/40 hover:text-foreground"
                >
                  <Icon name={l.icone} className="size-4" />
                  {l.nome}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-sm text-subtle">
          {perfil.cargo} · {perfil.localizacao}
        </p>
      </div>
    </section>
  );
}
