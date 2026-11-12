// Data Access Layer de autenticação do admin — só roda no servidor.
//
// Três formas de entrar:
//  1. API (produção):   POST /api/auth/login no NestJS grava o cookie HTTP-only com o JWT.
//                       Aqui validamos repassando os cookies para GET /api/auth/me.
//  2. Mock (dev):       NEXT_PUBLIC_USE_MOCKS="true" → login local com ADMIN_DEV_EMAIL/ADMIN_DEV_PASSWORD.
//  3. Acesso direto (dev): ADMIN_DEV_BYPASS="true" OU botão "Entrar sem login" na tela de login.
//
// Os modos 2 e 3 só existem quando NODE_ENV === 'development' (next dev).
// Em `next build` / `next start` (produção) eles são ignorados, mesmo com as variáveis setadas.
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { USE_MOCKS } from './flags';

export type ModoAuth = 'api' | 'mock' | 'dev';
export type Admin = { id: string; nome: string; email: string; modo: ModoAuth };

export const IS_DEV = process.env.NODE_ENV === 'development';
export const DEV_COOKIE = 'tanaka_dev_access';
export const MOCK_COOKIE = 'tanaka_mock_session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

/** Acesso direto sem login — nunca em produção. */
export const devBypassPorEnv = () => IS_DEV && process.env.ADMIN_DEV_BYPASS === 'true';

/** Retorna o admin logado ou null. Lê cookies → chamar dentro de <Suspense>. Deduplicado por requisição. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  const jar = await cookies();

  if (IS_DEV && (devBypassPorEnv() || jar.get(DEV_COOKIE)?.value === '1')) {
    return { id: 'dev', nome: 'Desenvolvedor', email: 'dev@localhost', modo: 'dev' };
  }

  if (USE_MOCKS) {
    // Sessão mock é forjável por design: por isso só vale em desenvolvimento.
    if (!IS_DEV) return null;
    return jar.get(MOCK_COOKIE)?.value === '1'
      ? { id: 'mock', nome: 'Admin (mock)', email: process.env.ADMIN_DEV_EMAIL || 'admin@tanaka.dev', modo: 'mock' }
      : null;
  }

  // Modo real: o backend é a fonte da verdade sobre o JWT.
  const cookieHeader = jar.toString();
  if (!cookieHeader) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string; nome: string; email: string };
    return { id: data.id, nome: data.nome, email: data.email, modo: 'api' };
  } catch (e) {
    console.error('[auth] /api/auth/me falhou:', e);
    return null;
  }
});

/** Garante sessão; senão manda para o login. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
