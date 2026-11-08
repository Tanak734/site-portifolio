'use client';

import { useState, type FormEvent } from 'react';
import { Check, Loader2, Send } from 'lucide-react';
import { enviarTicket } from '@/lib/tickets';
import type { NovoTicket } from '@/lib/types';

type Status = 'idle' | 'sending' | 'ok' | 'error';

const ORCAMENTOS = ['Ainda não sei', 'Até R$ 2.000', 'R$ 2.000 – R$ 5.000', 'R$ 5.000 – R$ 15.000', 'Acima de R$ 15.000'];

const field =
  'w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-subtle outline-none transition focus:border-primary/70 focus:ring-4 focus:ring-primary/15';
const label = 'mb-1.5 block text-sm text-muted-foreground';

export default function TicketForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [erro, setErro] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const s = (k: string) => String(d.get(k) ?? '').trim();

    const ticket: NovoTicket = {
      cliente_nome: s('cliente_nome'),
      empresa_nome: s('empresa_nome') || undefined,
      cliente_telefone: s('cliente_telefone'),
      cliente_email: s('cliente_email') || undefined,
      ideia_inicial: s('ideia_inicial'),
      orcamento_previo_cliente: s('orcamento_previo_cliente') || undefined,
      website: s('website'), // honeypot
    };

    // Bot preencheu o honeypot: finge sucesso sem enviar nada.
    if (ticket.website) {
      setStatus('ok');
      return;
    }

    setStatus('sending');
    setErro('');
    try {
      await enviarTicket(ticket);
      setStatus('ok');
      form.reset();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar agora.');
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-primary/40 bg-primary/5 p-10 text-center" role="status">
        <span className="mb-5 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-7" />
        </span>
        <h3 className="text-xl font-semibold">Recebi sua ideia!</h3>
        <p className="mt-2 max-w-sm text-muted-foreground">Vou analisar os detalhes e te chamo em até 24 horas pelo contato informado.</p>
        <button type="button" onClick={() => setStatus('idle')} className="mt-6 text-sm text-subtle underline-offset-4 hover:text-foreground hover:underline">
          Enviar outra demanda
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 sm:p-8" noValidate={false}>
      {/* Honeypot: invisível para pessoas, atrativo para bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cliente_nome" className={label}>Seu nome *</label>
          <input id="cliente_nome" name="cliente_nome" required autoComplete="name" className={field} placeholder="Como posso te chamar?" />
        </div>
        <div>
          <label htmlFor="empresa_nome" className={label}>Empresa</label>
          <input id="empresa_nome" name="empresa_nome" autoComplete="organization" className={field} placeholder="Opcional" />
        </div>
        <div>
          <label htmlFor="cliente_telefone" className={label}>WhatsApp / Telefone *</label>
          <input id="cliente_telefone" name="cliente_telefone" type="tel" required autoComplete="tel" inputMode="tel" className={field} placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label htmlFor="cliente_email" className={label}>E-mail</label>
          <input id="cliente_email" name="cliente_email" type="email" autoComplete="email" className={field} placeholder="voce@empresa.com" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ideia_inicial" className={label}>Qual é a sua ideia? *</label>
          <textarea id="ideia_inicial" name="ideia_inicial" required rows={4} minLength={10} className={`${field} resize-y`}
            placeholder="Conte o problema que quer resolver, quem vai usar e se já existe algo pronto." />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="orcamento_previo_cliente" className={label}>Faixa de investimento</label>
          <select id="orcamento_previo_cliente" name="orcamento_previo_cliente" defaultValue="" className={`${field} appearance-none`}>
            <option value="" disabled>Selecione (opcional)</option>
            {ORCAMENTOS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {status === 'error' && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300" role="alert">
          {erro} Se preferir, me envie um e-mail.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-medium text-primary-foreground transition hover:bg-primary/85 disabled:cursor-wait disabled:opacity-70"
      >
        {status === 'sending' ? <><Loader2 className="size-4 animate-spin" /> Enviando…</> : <><Send className="size-4" /> Enviar minha ideia</>}
      </button>
      <p className="mt-3 text-center text-xs text-subtle">Sem compromisso. Resposta em até 24 horas.</p>
    </form>
  );
}
