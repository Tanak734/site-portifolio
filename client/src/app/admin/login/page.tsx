import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { getAdmin, IS_DEMO, IS_DEV } from '@/lib/auth';
import { USE_MOCKS } from '@/lib/flags';
import { getContent } from '@/lib/content';

export const metadata: Metadata = { title: 'Entrar · Admin', robots: { index: false, follow: false } };

/** Já logado? Vai direto para o painel. */
async function RedirectSeLogado() {
  if (await getAdmin()) redirect('/admin');
  return null;
}

export default async function LoginPage() {
  const [nome, dominio] = (await getContent()).perfil.marca.split('.');
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <Suspense fallback={null}>
        <RedirectSeLogado />
      </Suspense>
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 block text-center text-xl font-semibold tracking-tight">
          {nome}
          {dominio && <span className="text-brand">.{dominio}</span>}
        </Link>
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <h1 className="text-xl font-semibold">Painel administrativo</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Entre com a sua conta de administrador.</p>
          <LoginForm
            mock={USE_MOCKS}
            dev={IS_DEV}
            demo={IS_DEMO ? { email: process.env.ADMIN_DEV_EMAIL || 'admin@tanaka.dev', senha: process.env.ADMIN_DEV_PASSWORD || 'admin123' } : null}
          />
        </div>
      </div>
    </main>
  );
}
