import { notFound } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import { rotuloTipo } from '@/components/admin/StatusBadge';
import ChamadoDetalhe from '@/components/admin/chamados/ChamadoDetalhe';
import { Voltar } from '@/components/admin/ui';
import { getChamado, getProjeto } from '@/lib/admin-api';

export default async function ChamadoPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await getChamado(Number((await params).id));
  if (!c) notFound();
  const projeto = await getProjeto(c.projeto_id);

  return (
    <>
      <Voltar href="/admin/chamados">Chamados</Voltar>
      <PageHeader
        eyebrow={
          <>
            <span className="font-mono">{c.protocolo}</span>
            <span>· {rotuloTipo(c.tipo)}</span>
            <span>· {c.cliente_nome}</span>
          </>
        }
        title={c.titulo}
      />
      <ChamadoDetalhe inicial={c} valorHora={projeto?.projeto.valor_hora_base ?? 60} />
    </>
  );
}
