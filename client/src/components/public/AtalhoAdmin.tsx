import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { getAdmin } from '@/lib/auth';

/**
 * Atalho "Painel" ao lado da marca — só aparece para o admin logado (visitantes não veem nada).
 * Lê o cookie de sessão: renderize dentro de <Suspense> para a página continuar pré-renderizada.
 * O site estático do GitHub Pages não tem admin, então lá não renderiza.
 */
export default async function AtalhoAdmin() {
  if (process.env.NEXT_PUBLIC_BASE_PATH) return null;
  const admin = await getAdmin();
  if (!admin) return null;
  return (
    <Link
      href="/admin"
      title={`Painel · ${admin.nome}`}
      className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/50 px-2.5 py-1 text-xs text-brand transition hover:bg-primary/10"
    >
      <LayoutGrid className="size-3.5" /> Painel
    </Link>
  );
}
