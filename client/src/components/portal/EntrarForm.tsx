'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Loader2, Mail, MailCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { USE_MOCKS } from '@/lib/flags';
import { btnPrimario, inputCls, labelCls } from '@/components/admin/ui';

/**
 * Pede o link de acesso por e-mail. A resposta é sempre a mesma, exista o e-mail ou não,
 * para ninguém descobrir quem é cliente testando endereços.
 */
export default function EntrarForm() {
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok'>('idle');

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email')).trim();
    setEstado('enviando');
    if (USE_MOCKS) await new Promise((r) => setTimeout(r, 700));
    else await apiFetch('/api/public/cliente/acesso', { method: 'POST', body: JSON.stringify({ email }) }).catch(() => {});
    setEstado('ok');
  }

  if (estado === 'ok') {
    return (
      <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 text-center" role="status">
        <MailCheck className="mx-auto mb-3 size-8 text-brand" />
        <p className="font-medium">Confira seu e-mail</p>
        <p className="mt-1 text-sm text-muted-foreground">Se esse endereço estiver cadastrado, você vai receber o link da sua área em instantes.</p>
        {USE_MOCKS && (
          <Link href="/cliente/demo" className="mt-4 inline-block text-sm text-brand underline underline-offset-4">
            Prévia: abrir a área de exemplo
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4 rounded-2xl border bg-card p-6">
      <div>
        <label className={labelCls} htmlFor="area-email">E-mail cadastrado no projeto</label>
        <input id="area-email" name="email" type="email" required autoComplete="email" className={inputCls} placeholder="voce@empresa.com" />
      </div>
      <button type="submit" disabled={estado === 'enviando'} className={`${btnPrimario} w-full`}>
        {estado === 'enviando' ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} Receber link de acesso
      </button>
      <p className="text-center text-xs text-subtle">Sem senha: o link chega no seu e-mail.</p>
    </form>
  );
}
