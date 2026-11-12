import { FileText, GraduationCap, MapPin } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { getContent, curriculoLink } from '@/lib/content';

export default async function CareerSection() {
  const content = await getContent();
  const { carreira, objetivos_profissionais: obj, perfil } = content;
  const cv = curriculoLink(content);
  const foto = perfil.exibir_foto && perfil.avatar_url ? perfil.avatar_url : null;

  return (
    <section id="sobre" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Sobre" title={carreira.titulo} />

        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
          {/* Coluna pessoal */}
          <div>
            <div className="mb-8 flex items-center gap-4">
              {foto && (
                // eslint-disable-next-line @next/next/no-img-element -- export estático (GitHub Pages)
                <img src={foto} alt={perfil.nome} width={64} height={64} className="size-16 rounded-2xl border object-cover" />
              )}
              <div>
                <p className="font-semibold">{perfil.nome}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  {perfil.cargo}
                  <span className="inline-flex items-center gap-1 text-subtle">
                    <MapPin className="size-3.5" aria-hidden="true" /> {perfil.localizacao}
                  </span>
                </p>
              </div>
            </div>

            <p className="text-lg text-pretty text-muted-foreground">{carreira.resumo}</p>
            <blockquote className="mt-8 border-l-2 border-primary pl-5 text-lg text-foreground/90">{obj.missao}</blockquote>

            {carreira.numeros.length > 0 && (
              <dl
                className="mt-10 grid divide-x rounded-2xl border bg-card"
                style={{ gridTemplateColumns: `repeat(${carreira.numeros.length}, minmax(0, 1fr))` }}
              >
                {carreira.numeros.map((n) => (
                  <div key={n.rotulo} className="flex flex-col-reverse gap-1 px-4 py-5 text-center">
                    <dt className="text-xs text-subtle">{n.rotulo}</dt>
                    <dd className="text-2xl font-semibold tracking-tight text-brand">{n.valor}</dd>
                  </div>
                ))}
              </dl>
            )}

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

          {/* Trajetória */}
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

            {carreira.formacao.length > 0 && (
              <div>
                <h3 className="mb-5 text-sm font-medium text-subtle">Formação</h3>
                <ul className="space-y-3">
                  {carreira.formacao.map((f) => (
                    <li key={f.curso} className="flex gap-4 rounded-xl border bg-card p-4">
                      <GraduationCap className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="font-medium">{f.curso}</p>
                        <p className="text-sm text-muted-foreground">
                          {f.instituicao} <span className="font-mono text-xs text-subtle">· {f.periodo}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {obj.interesses_tecnicos.length > 0 && (
              <div>
                <h3 className="mb-4 text-sm font-medium text-subtle">Estudando agora</h3>
                <ul className="flex flex-wrap gap-2">
                  {obj.interesses_tecnicos.map((i) => (
                    <li key={i} className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground">{i}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
