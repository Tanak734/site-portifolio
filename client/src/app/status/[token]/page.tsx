import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PortalCliente from '@/components/portal/PortalCliente';
import { emailAddress, getContent } from '@/lib/content';
import { getPortal } from '@/lib/portal-api';

export const metadata: Metadata = { title: 'Acompanhamento do projeto', robots: { index: false, follow: false } };

async function Portal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [dados, content] = await Promise.all([getPortal(token), getContent()]);
  if (!dados) notFound();
  return <PortalCliente dados={dados} marca={content.perfil.marca} contatoEmail={emailAddress(content)} />;
}

/** Portal público do cliente: acompanha o projeto e abre chamados pelo link único (sem login). */
export default function StatusPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Carregando…</div>}>
      <Portal params={params} />
    </Suspense>
  );
}
