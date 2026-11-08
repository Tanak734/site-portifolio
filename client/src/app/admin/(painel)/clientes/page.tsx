import EmConstrucao from '@/components/admin/EmConstrucao';

export default function ClientesPage() {
  return (
    <EmConstrucao
      title="Clientes"
      description="Base de clientes (CRM) e histórico de projetos."
      itens={['Lista de clientes com contato e empresa', 'Histórico de projetos por cliente', 'Cadastro manual de cliente']}
    />
  );
}
