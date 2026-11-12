import PageHeader from '@/components/admin/PageHeader';
import IdeiasBoard from '@/components/admin/ideias/IdeiasBoard';
import { getTickets } from '@/lib/admin-api';

export default async function TicketsPage() {
  const tickets = await getTickets();
  return (
    <>
      <PageHeader title="Ideias de projeto" description="Funil de pré-venda. Arraste os cartões entre as etapas ou abra uma ideia para registrar a conversa e o MVP." />
      <IdeiasBoard inicial={tickets} />
    </>
  );
}
