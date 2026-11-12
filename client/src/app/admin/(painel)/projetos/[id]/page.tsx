import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import ProjetoHub from '@/components/admin/projetos/ProjetoHub';
import { Voltar, btnSecundario } from '@/components/admin/ui';
import { getProjeto } from '@/lib/admin-api';

export default async function ProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const r = await getProjeto(Number((await params).id));
  if (!r) notFound();
  const { projeto: p, chamados } = r;

  return (
    <>
      <Voltar href="/admin/projetos">Projetos</Voltar>
      <PageHeader
        eyebrow={
          <>
            <StatusBadge status={p.status} />
            {p.categoria_projeto && <span>{p.categoria_projeto}</span>}
            {p.ticket_id && (
              <Link href={`/admin/tickets?ideia=${p.ticket_id}`} className="hover:text-foreground">
                · veio da ideia #{p.ticket_id}
              </Link>
            )}
          </>
        }
        title={p.nome}
        description={
          p.cliente_id ? (
            <Link href={`/admin/clientes/${p.cliente_id}`} className="hover:text-brand">{p.cliente_nome}</Link>
          ) : (
            'Projeto pessoal'
          )
        }
      >
        <a href={`/status/${p.codigo_rastreio}`} target="_blank" rel="noopener" className={btnSecundario}>
          <ExternalLink className="size-4" /> Ver como o cliente
        </a>
      </PageHeader>
      <ProjetoHub inicial={p} chamados={chamados} />
    </>
  );
}
