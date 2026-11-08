import { FileText } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { getContent, curriculoLink } from '@/lib/content';

export default async function CareerSection() {
  const content = await getContent();
  const { carreira, objetivos_profissionais: obj } = content;
  const cv = curriculoLink(content);

  return (
    <section id="sobre" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Sobre" title={carreira.titulo} />

        <div className="grid gap-12 md:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="text-lg text-pretty text-muted-foreground">{carreira.resumo}</p>
            <blockquote className="mt-8 border-l-2 border-primary pl-5 text-lg text-foreground/90">{obj.missao}</blockquote>
            {cv && (
              <a
                href={cv.url}
                target="_blank"
                rel="noopener"
                className="mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition hover:border-brand/40 hover:bg-accent"
              >
                <FileText className="size-4" /> Ver currículo completo
              </a>
            )}
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="mb-5 text-sm font-medium text-subtle">Experiência</h3>
              <ol className="relative space-y-7 border-l pl-6">
                {carreira.experiencias.map((e) => (
                  <li key={e.cargo + e.periodo} className="relative">
                    <span
                      className={`absolute top-1.5 -left-[29px] size-2.5 rounded-full ring-4 ring-background ${e.atual ? 'bg-brand' : 'bg-subtle'}`}
                    />
                    <p className="font-mono text-xs text-subtle">{e.periodo}</p>
                    <h4 className="mt-1 font-medium">
                      {e.cargo} <span className="font-normal text-muted-foreground">· {e.empresa}</span>
                    </h4>
                    <p className="mt-1.5 text-sm text-muted-foreground">{e.descricao}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="mb-5 text-sm font-medium text-subtle">Formação</h3>
              <ul className="space-y-4">
                {carreira.formacao.map((f) => (
                  <li key={f.curso} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <span>
                      <span className="font-medium">{f.curso}</span> <span className="text-muted-foreground">· {f.instituicao}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-subtle">{f.periodo}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
