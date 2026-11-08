'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';
import { entrarModoDev, loginMock } from '@/app/admin/actions';

export default function LoginForm({ mock, dev }: { mock: boolean; dev: boolean }) {
  const router = useRouter();
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [entrandoDev, startDev] = useTransition();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const email = String(d.get('email') ?? '');
    const senha = String(d.get('senha') ?? '');
    setErro('');
    setEnviando(true);
    try {
      if (mock) {
        const r = await loginMock(email, senha);
        if (r.erro) throw new Error(r.erro);
      } else {
        // O Fastify valida (argon2) e grava o cookie HTTP-only com o JWT.
        await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
      }
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="username" required className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" name="senha" type="password" autoComplete="current-password" required className="h-11" />
        </div>

        {erro && (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {erro}
          </p>
        )}

        <Button type="submit" disabled={enviando} className="h-11 w-full rounded-full">
          {enviando ? <Loader2 className="animate-spin" /> : <LogIn />}
          {enviando ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      {dev && (
        <div className="space-y-3 rounded-xl border border-dashed p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-brand">Modo desenvolvimento.</span> Este atalho não existe em produção.
            {mock && ' Login mock: credenciais em ADMIN_DEV_EMAIL / ADMIN_DEV_PASSWORD (.env.local).'}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-full"
            disabled={entrandoDev}
            onClick={() => startDev(() => entrarModoDev())}
          >
            {entrandoDev ? <Loader2 className="animate-spin" /> : <Zap />}
            Entrar sem login
          </Button>
        </div>
      )}
    </div>
  );
}
