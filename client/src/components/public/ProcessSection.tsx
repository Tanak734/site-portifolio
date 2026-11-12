import SectionHeading from './SectionHeading';
import { getContent } from '@/lib/content';

/** Etapas numeradas, ligadas por uma linha (horizontal no desktop, vertical no celular). */
export default async function ProcessSection() {
  const { processo, textos_secoes } = await getContent();
  if (processo.length === 0) return null;
  const t = textos_secoes.processo;

  return (
    <section id="processo" className="scroll-mt-24 border-y bg-card/40 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Processo" title={t.titulo} description={t.descricao} />

        <ol
          className="relative grid gap-8 md:grid-cols-[repeat(var(--n),minmax(0,1fr))] md:gap-6"
          style={{ '--n': processo.length } as React.CSSProperties}
        >
          {processo.map((p, i) => (
            <li key={p.titulo + i} className="relative pl-14 md:pt-14 md:pl-0">
              {/* Linha que liga ao próximo passo */}
              {i < processo.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-11 bottom-[-2rem] left-[1.3rem] w-px bg-border md:top-[1.3rem] md:right-[-1.5rem] md:bottom-auto md:left-11 md:h-px md:w-auto"
                />
              )}
              <span className="absolute top-0 left-0 grid size-11 place-items-center rounded-full border bg-background font-mono text-sm text-brand">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-semibold tracking-tight">{p.titulo}</h3>
              <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{p.descricao}</p>
              {p.duracao && (
                <span className="mt-3 inline-block rounded-full border px-2.5 py-0.5 font-mono text-[11px] text-subtle">{p.duracao}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
