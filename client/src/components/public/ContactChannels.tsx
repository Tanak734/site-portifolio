'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import Magnet from '@/components/reactbits/Magnet';
import Icon from './Icon';

export type Channel = {
  icone: string;
  nome: string;
  detalhe: string;
  url: string;
  /** Texto copiável (ex.: e-mail) — mostra botão de copiar. */
  copiar?: string;
  primario?: boolean;
};

function CopyButton({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        } catch {
          /* clipboard indisponível — o link mailto continua funcionando */
        }
      }}
      className="relative z-10 grid size-9 place-items-center rounded-full text-subtle transition hover:bg-accent hover:text-foreground"
      aria-label={ok ? 'Copiado' : `Copiar ${value}`}
      title={ok ? 'Copiado!' : 'Copiar'}
    >
      {ok ? <Check className="size-4 text-brand" /> : <Copy className="size-4" />}
    </button>
  );
}

export default function ContactChannels({ channels }: { channels: Channel[] }) {
  return (
    <ul className="grid gap-3">
      {channels.map((c) => (
        <li key={c.nome}>
          <Magnet padding={40} magnetStrength={8} maxOffset={6} wrapperClassName="block w-full" innerClassName="w-full">
            <a
              href={c.url}
              target={c.url.startsWith('http') ? '_blank' : undefined}
              rel="noopener"
              className={`group flex items-center gap-4 rounded-2xl border p-4 transition ${
                c.primario
                  ? 'border-primary/50 bg-primary/10 hover:bg-primary/15'
                  : 'bg-card hover:border-brand/40'
              }`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                  c.primario ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                }`}
              >
                <Icon name={c.icone} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">{c.nome}</span>
                <span className="block truncate text-sm text-muted-foreground">{c.detalhe}</span>
              </span>
              {c.copiar && <CopyButton value={c.copiar} />}
              <ArrowUpRight className="size-5 shrink-0 text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </a>
          </Magnet>
        </li>
      ))}
    </ul>
  );
}
