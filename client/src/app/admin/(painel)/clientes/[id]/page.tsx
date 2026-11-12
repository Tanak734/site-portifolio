import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, Mail, MessageCircle, Plus } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import AreaClientePainel from '@/components/admin/clientes/AreaClientePainel';
import StatusBadge, { PrioridadeBadge } from '@/components/admin/StatusBadge';
import { Avatar, Barra, Dado, Kpi, Painel, Vazio, Voltar, btnPrimario, btnSecundario } from '@/components/admin/ui';
import { getCliente } from '@/lib/admin-api';
import { data, dataCurta } from '@/lib/admin-format';
import { CHAMADO_ABERTO } from '@/lib/admin-types';

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const ficha = await getCliente(Number((await params).id));
  if (!ficha) notFound();
  const { cliente: c, projetos, chamados, ideias } = ficha;
  const abertos = chamados.filter((ch) => CHAMADO_ABERTO.includes(ch.status));

  return (
    <>
      <Voltar href="/admin/clientes">Clientes</Voltar>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Avatar nome={c.nome} className="size-11 text-sm" />
            <span>
              {c.nome}
              {c.empresa && <span className="block text-sm font-normal text-muted-foreground">{c.empresa}</span>}
            </span>
          </span>
        }
      >
        <a href={`/cliente/${c.token_portal}`} target="_blank" rel="noopener" className={btnSecundario}>
          Ver como o cliente
        </a>
        <a href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className={btnSecundario}>
          <MessageCircle className="size-4" /> WhatsApp
        </a>
        {c.email && (
          <a href={`mailto:${c.email}`} className={btnSecundario}>
            <Mail className="size-4" /> E-mail
          </a>
        )}
        <Link href="/admin/projetos?novo=1" className={btnPrimario}>
          <Plus className="size-4" /> Novo projeto
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Projetos" valor={projetos.length} detalhe={`${projetos.filter((p) => p.status === 'EM_ANDAMENTO').length} em andamento`} />
        <Kpi label="Chamados abertos" valor={abertos.length} detalhe={`${chamados.length} no total`} destaque={abertos.length > 0} />
        <Kpi label="Cliente desde" valor={data(c.created_at)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-6">
          <Painel titulo="Dados">
            <dl className="divide-y">
              <Dado rotulo="Telefone">{c.telefone}</Dado>
              <Dado rotulo="E-mail">{c.email}</Dado>
              <Dado rotulo="CPF / CNPJ">{c.documento}</Dado>
              <Dado rotulo="Empresa">{c.empresa}</Dado>
            </dl>
          </Painel>
          <AreaClientePainel token={c.token_portal} ativo={c.portal_ativo} />
          <Painel titulo="Notas">
            {c.notas ? <p className="text-sm whitespace-pre-line text-muted-foreground">{c.notas}</p> : <p className="text-sm text-subtle">Sem notas.</p>}
          </Painel>
          {ideias.length > 0 && (
            <Painel titulo="Ideias de origem" semPadding>
              <ul className="divide-y">
                {ideias.map((i) => (
                  <li key={i.id}>
                    <Link href={`/admin/tickets?ideia=${i.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-accent/50">
                      <FileText className="size-4 shrink-0 text-subtle" />
                      <span className="min-w-0 flex-1 truncate">{i.ideia_inicial}</span>
                      <StatusBadge status={i.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Painel>
          )}
        </div>

        <div className="space-y-6">
          <Painel titulo="Projetos" semPadding>
            {projetos.length === 0 ? (
              <div className="p-5"><Vazio titulo="Nenhum projeto ainda" /></div>
            ) : (
              <ul className="divide-y">
                {projetos.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/projetos/${p.id}`} className="block px-5 py-4 hover:bg-accent/50">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-medium">{p.nome}</p>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="mt-2.5 flex items-center gap-3">
                        <Barra valor={p.progresso} className="flex-1" />
                        <span className="w-9 text-right font-mono text-xs text-muted-foreground">{p.progresso}%</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Painel>

          <Painel titulo="Chamados" semPadding>
            {chamados.length === 0 ? (
              <div className="p-5"><Vazio titulo="Nenhum chamado" /></div>
            ) : (
              <ul className="divide-y">
                {chamados.map((ch) => (
                  <li key={ch.id}>
                    <Link href={`/admin/chamados/${ch.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-accent/50">
                      <span className="w-28 shrink-0 font-mono text-xs text-subtle">{ch.protocolo}</span>
                      <span className="min-w-0 flex-1 truncate">{ch.titulo}</span>
                      <PrioridadeBadge prioridade={ch.prioridade} />
                      <StatusBadge status={ch.status} />
                      <span className="hidden w-14 text-right text-xs text-subtle sm:block">{dataCurta(ch.created_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Painel>
        </div>
      </div>
    </>
  );
}
