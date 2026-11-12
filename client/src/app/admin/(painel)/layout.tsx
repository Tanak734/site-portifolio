import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { devBypassPorEnv, requireAdmin } from '@/lib/auth';
import { getContent } from '@/lib/content';
import { USE_MOCKS } from '@/lib/flags';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

/** Lê a sessão (dentro do Suspense, como pede o Cache Components) e monta a barra superior. */
async function Topbar() {
  const admin = await requireAdmin();
  return <AdminTopbar admin={admin} marca={(await getContent()).perfil.marca} bypassEnv={devBypassPorEnv()} previa={USE_MOCKS} />;
}

/** Só libera o conteúdo com sessão válida. Mostra aviso quando é um modo de desenvolvimento. */
async function Gate({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <>
      {admin.modo !== 'api' && (
        <div className="border-b border-dashed bg-primary/10 px-6 py-2 text-xs text-brand">
          Modo desenvolvimento · {admin.modo === 'dev' ? 'acesso direto sem login' : 'login mock (sem backend)'} — indisponível em produção.
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
    </>
  );
}

function Carregando() {
  return <div className="p-10 text-sm text-muted-foreground">Carregando…</div>;
}

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Suspense fallback={<div className="h-14 border-b" />}>
        <Topbar />
      </Suspense>
      <main className="min-w-0">
        <Suspense fallback={<Carregando />}>
          <Gate>{children}</Gate>
        </Suspense>
      </main>
    </div>
  );
}
