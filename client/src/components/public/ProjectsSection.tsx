import ProjectsGrid from './ProjectsGrid';
import SectionHeading from './SectionHeading';
import { getContent } from '@/lib/content';
import { getProjetosPublicos } from '@/lib/public-api';

export default async function ProjectsSection() {
  const projetos = await getProjetosPublicos();
  if (projetos.length === 0) return null;
  const t = (await getContent()).textos_secoes.projetos;

  return (
    <section id="projetos" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Portfólio" title={t.titulo} description={t.descricao} />
        <ProjectsGrid projetos={projetos} />
      </div>
    </section>
  );
}
