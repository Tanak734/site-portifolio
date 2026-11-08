import PageHeader from '@/components/admin/PageHeader';
import ContentEditor from '@/components/admin/content-editor/ContentEditor';
import { requireAdmin } from '@/lib/auth';
import { getContent } from '@/lib/content';
import { categoriasIcones, techIconsFor } from '@/lib/tech-icons';

export default async function ConfigPage() {
  await requireAdmin(); // autoriza junto do dado (o layout sozinho não protege a página)
  const conteudo = await getContent();

  return (
    <>
      <PageHeader
        title="Conteúdo do site"
        description="Edite os textos da página inicial. Ao salvar, o site é atualizado na hora."
      />
      <ContentEditor
        inicial={conteudo}
        icones={techIconsFor(conteudo.categorias_skills.flatMap((c) => c.items.map((i) => i.slug_icone)))}
        categoriasIcones={categoriasIcones()}
      />
    </>
  );
}
