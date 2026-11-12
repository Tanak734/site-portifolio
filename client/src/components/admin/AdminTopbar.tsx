'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { ExternalLink, Grip, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { sairLocal } from '@/app/admin/actions';
import { iniciais } from '@/lib/admin-format';
import type { Admin } from '@/lib/auth';
import { APPS, appAtivo } from './apps';

/** Fecha um popover ao clicar fora ou apertar Esc. */
function usePopover() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setAberto(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [aberto]);
  return [aberto, setAberto, ref] as const;
}

/**
 * Barra superior do painel: marca, lançador de aplicativos (grade), atalhos dos apps principais
 * e menu da conta. Substitui a antiga barra lateral.
 */
export default function AdminTopbar({ admin, marca, bypassEnv, previa }: { admin: Admin; marca: string; bypassEnv: boolean; previa: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, startSair] = useTransition();
  const [nome, dominio] = marca.split('.');
  const atual = appAtivo(pathname);
  const [lancAberto, setLancAberto, lancRef] = usePopover();
  const [contaAberta, setContaAberta, contaRef] = usePopover();

  // Fecha os menus ao navegar.
  useEffect(() => {
    setLancAberto(false);
    setContaAberta(false);
  }, [pathname, setLancAberto, setContaAberta]);

  function sair() {
    startSair(async () => {
      if (admin.modo === 'api') await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      await sairLocal();
      router.replace('/admin/login');
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-10">
        <Link href="/admin" className="mr-1 shrink-0 font-semibold tracking-tight">
          {nome}
          {dominio && <span className="text-brand">.{dominio}</span>}
        </Link>

        {/* Lançador de aplicativos */}
        <div ref={lancRef} className="relative">
          <button
            type="button"
            onClick={() => setLancAberto((v) => !v)}
            aria-expanded={lancAberto}
            aria-haspopup="true"
            title="Aplicativos"
            className={`grid size-9 place-items-center rounded-full transition ${lancAberto ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
          >
            <Grip className="size-[18px]" />
            <span className="sr-only">Aplicativos</span>
          </button>
          {lancAberto && (
            <div className="absolute top-11 left-0 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border bg-card p-2 shadow-xl shadow-black/10">
              <p className="px-2 pt-1 pb-2 text-[11px] font-medium tracking-wider text-subtle uppercase">Aplicativos</p>
              <ul className="grid grid-cols-3 gap-1">
                {APPS.map((a) => {
                  const Icone = a.icon;
                  const ativo = atual?.id === a.id;
                  return (
                    <li key={a.id}>
                      <Link
                        href={a.href}
                        target={a.externo ? '_blank' : undefined}
                        className={`flex flex-col items-center gap-2 rounded-xl px-1 py-3 text-center text-xs transition ${ativo ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                      >
                        <span className={`grid size-10 place-items-center rounded-xl ${a.tom}`}>
                          <Icone className="size-5" />
                        </span>
                        <span className="leading-tight">{a.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* App atual (telas pequenas) */}
        {atual && atual.id !== 'inicio' && (
          <span className="truncate text-sm font-medium lg:hidden">
            <span className="mr-1.5 text-subtle">/</span>
            {atual.label}
          </span>
        )}

        {/* Atalhos (telas grandes) */}
        <nav aria-label="Aplicativos principais" className="ml-2 hidden items-center gap-0.5 lg:flex">
          {APPS.filter((a) => a.naBarra).map((a) => {
            const ativo = atual?.id === a.id;
            return (
              <Link
                key={a.id}
                href={a.href}
                aria-current={ativo ? 'page' : undefined}
                className={`relative rounded-full px-3 py-1.5 text-sm transition ${ativo ? 'bg-primary/12 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
              >
                {a.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {previa && (
            <span className="hidden rounded-full border border-dashed border-primary/50 px-2.5 py-1 text-[11px] text-brand sm:inline" title="NEXT_PUBLIC_USE_MOCKS=true — nada é salvo no servidor">
              Prévia · dados de exemplo
            </span>
          )}
          <a href="/" target="_blank" rel="noopener" title="Ver site" className="hidden size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground sm:grid">
            <ExternalLink className="size-4" />
            <span className="sr-only">Ver site</span>
          </a>

          {/* Conta */}
          <div ref={contaRef} className="relative">
            <button
              type="button"
              onClick={() => setContaAberta((v) => !v)}
              aria-expanded={contaAberta}
              aria-haspopup="true"
              className="grid size-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-brand ring-1 ring-primary/30 transition hover:bg-primary/25"
            >
              {iniciais(admin.nome)}
              <span className="sr-only">Conta</span>
            </button>
            {contaAberta && (
              <div className="absolute top-11 right-0 z-50 w-64 rounded-2xl border bg-card p-2 shadow-xl shadow-black/10">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">{admin.nome}</p>
                  <p className="truncate text-xs text-subtle">{admin.email}</p>
                </div>
                <div className="my-1 border-t" />
                <Link href="/admin/seguranca" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                  <ShieldCheck className="size-4" /> Segurança e dispositivos
                </Link>
                <a href="/" target="_blank" rel="noopener" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                  <ExternalLink className="size-4" /> Ver site
                </a>
                <button
                  type="button"
                  onClick={sair}
                  disabled={saindo || bypassEnv}
                  title={bypassEnv ? 'Acesso direto via ADMIN_DEV_BYPASS — desative no .env.local para sair' : undefined}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                >
                  {saindo ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />} Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
