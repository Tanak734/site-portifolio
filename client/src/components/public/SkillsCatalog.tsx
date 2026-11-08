import SectionHeading from './SectionHeading';
import TechIcon from './TechIcon';
import { getContent } from '@/lib/content';
import { techIcon } from '@/lib/tech-icons';

export default async function SkillsCatalog() {
  const { categorias_skills, textos_secoes } = await getContent();
  return (
    <section id="stack" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Stack" title={textos_secoes.skills.titulo} description={textos_secoes.skills.descricao} />
        <dl className="divide-y border-y">
          {categorias_skills.map((cat) => (
            <div key={cat.categoria} className="grid gap-4 py-6 md:grid-cols-[14rem_1fr] md:items-center">
              <dt>
                <span className="block font-medium">{cat.categoria}</span>
                <span className="block text-sm text-subtle">{cat.descricao}</span>
              </dt>
              <dd className="flex flex-wrap gap-2">
                {cat.items.map((it) => (
                  <span key={it.nome} className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                    <TechIcon path={techIcon(it.slug_icone)?.path ?? null} slug={it.slug_icone} className="size-4" />
                    {it.nome}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
