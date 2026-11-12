import type { Metadata } from 'next';
import Link from 'next/link';
import { FolderKanban, LifeBuoy, Receipt } from 'lucide-react';
import AreaTopo from '@/components/portal/AreaTopo';
import EntrarForm from '@/components/portal/EntrarForm';
import { getContent } from '@/lib/content';

export const metadata: Metadata = { title: 'Área do cliente', robots: { index: false, follow: false } };

/** Entrada da área do cliente: pede o link de acesso por e-mail (sem senha). */
export default async function ClienteEntrarPage() {
  const { perfil } = await getContent();
  return (
    <div className="min-h-dvh">
      <AreaTopo marca={perfil.marca} voltar={{ href: '/', label: 'Voltar ao site' }} />
      <main className="mx-auto grid max-w-4xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_22rem] md:items-start">
        <div>
          <p className="mb-3 font-mono text-xs tracking-[0.2em] text-brand uppercase">Área do cliente</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Acompanhe seus projetos e peça ajuda quando precisar</h1>
          <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3"><FolderKanban className="mt-0.5 size-5 shrink-0 text-brand" /> Progresso e etapas de cada projeto, atualizados por mim.</li>
            <li className="flex gap-3"><LifeBuoy className="mt-0.5 size-5 shrink-0 text-brand" /> Abra chamados de suporte, ajustes ou melhorias e acompanhe as respostas.</li>
            <li className="flex gap-3"><Receipt className="mt-0.5 size-5 shrink-0 text-brand" /> Parcelas e custos do sistema, com o link de onde vem cada preço.</li>
          </ul>
          <p className="mt-8 text-sm text-subtle">
            Ainda não é cliente? <Link href="/#contato" className="text-foreground underline underline-offset-4 hover:text-brand">Envie sua ideia</Link>.
          </p>
        </div>
        <EntrarForm />
      </main>
    </div>
  );
}
