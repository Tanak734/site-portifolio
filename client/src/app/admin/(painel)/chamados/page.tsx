import PageHeader from '@/components/admin/PageHeader';
import ChamadosCentral from '@/components/admin/chamados/ChamadosCentral';
import { getChamados, getProjetosAdmin } from '@/lib/admin-api';

export default async function ChamadosPage() {
  const [chamados, projetos] = await Promise.all([getChamados(), getProjetosAdmin()]);
  return (
    <>
      <PageHeader
        title="Chamados"
        description="Suporte, manutenção, alterações e melhorias dos projetos já estruturados. Os mais urgentes aparecem primeiro."
      />
      <ChamadosCentral inicial={chamados} projetos={projetos} />
    </>
  );
}
