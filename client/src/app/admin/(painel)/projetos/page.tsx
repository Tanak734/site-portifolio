import PageHeader from '@/components/admin/PageHeader';
import ProjetosLista from '@/components/admin/projetos/ProjetosLista';
import { getClientes, getProjetosAdmin } from '@/lib/admin-api';

export default async function ProjetosPage() {
  const [projetos, clientes] = await Promise.all([getProjetosAdmin(), getClientes()]);
  return (
    <>
      <PageHeader title="Projetos" description="Cada projeto tem um Hub com requisitos, arquitetura, calculadora, tarefas, chamados e a publicação no portfólio." />
      <ProjetosLista inicial={projetos} clientes={clientes} />
    </>
  );
}
