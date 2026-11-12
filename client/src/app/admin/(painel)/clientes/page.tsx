import PageHeader from '@/components/admin/PageHeader';
import ClientesLista from '@/components/admin/clientes/ClientesLista';
import { getClientes } from '@/lib/admin-api';

export default async function ClientesPage() {
  const clientes = await getClientes();
  return (
    <>
      <PageHeader title="Clientes" description="Quem você atende: contatos, notas e o histórico de projetos e chamados de cada um." />
      <ClientesLista inicial={clientes} />
    </>
  );
}
