import { Check } from 'lucide-react';
import SectionHeading from './SectionHeading';
import ServiceIcon from './ServiceIcon';
import TechIcon from './TechIcon';
import { getContent } from '@/lib/content';
import { techIcon } from '@/lib/tech-icons';

/** Cartões “o que eu faço” — cada serviço mostra as tecnologias que usa (vindas do catálogo de Tecnologias). */
export default async function ServicesSection() {
  const { servicos, categorias_skills, textos_secoes } = await getContent();
  if (servicos.length === 0) return null;
  const t = textos_secoes.servicos;

  const slugPorNome = new Map(categorias_skills.flatMap((c) => c.items).map((s) => [s.nome, s.slug_icone]));

  return (
    <section id="servicos" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Serviços" title={t.titulo} description={t.descricao} />

        <ul className="grid gap-5 sm:grid-cols-2">
          {servicos.map((s) => (
            <li
              key={s.titulo}
              className="group flex flex-col rounded-2xl border bg-card p-6 transition hover:border-brand/40 sm:p-7"
            >
              <span className="mb-5 grid size-11 place-items-center rounded-xl bg-primary/10 text-brand ring-1 ring-primary/20 transition group-hover:bg-primary/15">
                <ServiceIcon name={s.icone} className="size-5" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{s.titulo}</h3>
              <p className="mt-2 text-pretty text-muted-foreground">{s.descricao}</p>

              {s.entregas.length > 0 && (
                <ul className="mt-5 space-y-2 text-sm">
                  {s.entregas.map((e) => (
                    <li key={e} className="flex items-start gap-2.5 text-foreground/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                      {e}
                    </li>
                  ))}
                </ul>
              )}

              {s.tecnologias.length > 0 && (
                <div className="mt-auto pt-6">
                <ul className="flex flex-wrap gap-1.5 border-t pt-5" aria-label="Tecnologias">
                  {s.tecnologias.map((nome) => {
                    const slug = slugPorNome.get(nome) ?? null;
                    return (
                      <li key={nome} className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground">
                        {slug && <TechIcon path={techIcon(slug)?.path ?? null} slug={slug} className="size-3.5" />}
                        {nome}
                      </li>
                    );
                  })}
                </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
