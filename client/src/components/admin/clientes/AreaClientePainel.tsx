'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import CopiarLink from '../CopiarLink';
import { Switch } from '../content-editor/fields';
import { Aviso, Painel, VisivelCliente, btnSecundario } from '../ui';

/** Acesso do cliente à área dele (/cliente/:token): todos os projetos, chamados e financeiro num lugar. */
export default function AreaClientePainel({ token, ativo: ativoInicial }: { token: string; ativo: boolean }) {
  const [ativo, setAtivo] = useState(ativoInicial);
  const [atual, setAtual] = useState(token);
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <Painel titulo="Área do cliente" descricao="Todos os projetos dele num link só, sem senha." acao={<VisivelCliente texto="Do cliente" />}>
      <div className="space-y-4">
        {ativo ? <CopiarLink rotulo="Link de acesso" caminho={`/cliente/${atual}`} /> : <Aviso>Acesso desativado: o link não abre e o “receber link por e-mail” não envia nada.</Aviso>}
        <Switch label="Acesso ativo" hint="Desligue quando a relação terminar." checked={ativo} onChange={setAtivo} />
        <button
          type="button"
          className={`${btnSecundario} w-full`}
          onClick={() => {
            setAtual(crypto.randomUUID().replace(/-/g, '').slice(0, 16));
            setAviso('Link novo gerado — o anterior parou de funcionar. Com o backend, isso também pode enviar o link novo por e-mail.');
          }}
        >
          <RefreshCw className="size-4" /> Gerar novo link
        </button>
        {aviso && <p className="text-xs text-subtle">{aviso}</p>}
      </div>
    </Painel>
  );
}
