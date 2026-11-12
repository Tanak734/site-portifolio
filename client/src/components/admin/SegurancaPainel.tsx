'use client';

import { useState } from 'react';
import { Fingerprint, KeyRound, Laptop, Plus, ShieldCheck, Smartphone, Trash2, Usb } from 'lucide-react';
import { Switch } from './content-editor/fields';
import { Aviso, Painel, btnPrimario, btnSecundario } from './ui';
import { dataHora } from '@/lib/admin-format';
import type { Dispositivo } from '@/lib/admin-types';

const icone = (d: Dispositivo) => (d.transports?.includes('usb') ? Usb : d.user_agent?.includes('Android') || d.user_agent?.includes('iPhone') ? Smartphone : Laptop);

export default function SegurancaPainel({ inicial }: { inicial: Dispositivo[] }) {
  const [dispositivos, setDispositivos] = useState(inicial);
  const [totp, setTotp] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Painel
        titulo="Passkeys e dispositivos confiáveis"
        descricao="Entre sem senha usando a biometria ou a chave física de um destes aparelhos."
        acao={
          <button type="button" className={btnPrimario} onClick={() => setAviso('Prévia: com o backend, o navegador pede a biometria/chave (WebAuthn) e o aparelho entra nesta lista.')}>
            <Plus className="size-4" /> Adicionar este aparelho
          </button>
        }
        semPadding
      >
        {aviso && <div className="border-b p-4"><Aviso>{aviso}</Aviso></div>}
        <ul className="divide-y">
          {dispositivos.map((d) => {
            const Icone = icone(d);
            return (
              <li key={d.id} className={`flex items-center gap-4 px-5 py-4 ${d.ativo ? '' : 'opacity-55'}`}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground"><Icone className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.nome_dispositivo}</p>
                  <p className="truncate text-xs text-subtle">
                    {d.user_agent ?? 'Chave de segurança'} · {d.ativo ? (d.ultimo_uso_em ? `último uso ${dataHora(d.ultimo_uso_em)}` : 'nunca usado') : 'revogado'}
                  </p>
                </div>
                {d.ativo && (
                  <button
                    type="button"
                    onClick={() => setDispositivos((l) => l.map((x) => (x.id === d.id ? { ...x, ativo: false } : x)))}
                    className={`${btnSecundario} h-8 px-3 text-xs hover:text-destructive`}
                  >
                    <Trash2 className="size-3.5" /> Revogar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Painel>

      <div className="space-y-6">
        <Painel titulo="Verificação em duas etapas">
          <div className="space-y-4">
            <Switch label="Código do app autenticador (TOTP)" hint="Pedido ao entrar com e-mail e senha." checked={totp} onChange={setTotp} />
            <button type="button" className={`${btnSecundario} w-full`}>
              <KeyRound className="size-4" /> Gerar novo QR code
            </button>
          </div>
        </Painel>
        <Painel titulo="Como o login funciona">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><Fingerprint className="mt-0.5 size-4 shrink-0 text-brand" /> Passkey: biometria ou PIN do aparelho, sem digitar senha.</li>
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" /> Senha + código de 6 dígitos quando o 2FA está ativo.</li>
            <li className="flex gap-3"><KeyRound className="mt-0.5 size-4 shrink-0 text-brand" /> A sessão fica num cookie HTTP-only, que o JavaScript da página não consegue ler.</li>
          </ul>
        </Painel>
      </div>
    </div>
  );
}
