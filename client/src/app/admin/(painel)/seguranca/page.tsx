import PageHeader from '@/components/admin/PageHeader';
import SegurancaPainel from '@/components/admin/SegurancaPainel';
import { getDispositivos } from '@/lib/admin-api';

export default async function SegurancaPage() {
  const dispositivos = await getDispositivos();
  return (
    <>
      <PageHeader title="Segurança" description="Aparelhos que podem entrar no painel e a verificação em duas etapas." />
      <SegurancaPainel inicial={dispositivos} />
    </>
  );
}
