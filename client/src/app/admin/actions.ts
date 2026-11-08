'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DEV_COOKIE, IS_DEV, MOCK_COOKIE } from '@/lib/auth';
import { USE_MOCKS } from '@/lib/flags';

const cookieOpts = { httpOnly: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 8 };

/** Botão "Entrar sem login" — só funciona em desenvolvimento. */
export async function entrarModoDev() {
  if (!IS_DEV) throw new Error('Acesso direto desativado em produção.');
  (await cookies()).set(DEV_COOKIE, '1', cookieOpts);
  redirect('/admin');
}

export type LoginState = { erro?: string };

/** Login local usado quando NEXT_PUBLIC_USE_MOCKS="true" (sem backend). Só em desenvolvimento. */
export async function loginMock(email: string, senha: string): Promise<LoginState> {
  if (!IS_DEV || !USE_MOCKS) return { erro: 'Login mock indisponível.' };
  const okEmail = process.env.ADMIN_DEV_EMAIL || 'admin@tanaka.dev';
  const okSenha = process.env.ADMIN_DEV_PASSWORD || 'admin123';
  if (email.trim().toLowerCase() !== okEmail.toLowerCase() || senha !== okSenha) {
    return { erro: 'E-mail ou senha inválidos.' };
  }
  (await cookies()).set(MOCK_COOKIE, '1', cookieOpts);
  return {};
}

/** Limpa as sessões locais (mock e acesso direto). O logout real é feito no navegador via API. */
export async function sairLocal() {
  const jar = await cookies();
  jar.delete(DEV_COOKIE);
  jar.delete(MOCK_COOKIE);
}
