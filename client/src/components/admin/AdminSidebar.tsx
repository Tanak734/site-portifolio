'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ExternalLink, FolderKanban, Inbox, LayoutDashboard, Loader2, LogOut, Settings, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { sairLocal } from '@/app/admin/actions';
import type { Admin } from '@/lib/auth';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tickets', label: 'Tickets', icon: Inbox },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/projetos', label: 'Projetos', icon: FolderKanban },
  { href: '/admin/config', label: 'Conteúdo do site', icon: Settings },
];

export default function AdminSidebar({ admin, marca, bypassEnv }: { admin: Admin; marca: string; bypassEnv: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, startSair] = useTransition();
  const [nome, dominio] = marca.split('.');

  const ativo = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  function sair() {
    startSair(async () => {
      if (admin.modo === 'api') await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      await sairLocal();
      router.replace('/admin/login');
      router.refresh();
    });
  }

  return (
    <aside className="border-b bg-card lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
        <Link href="/admin" className="font-semibold tracking-tight">
          {nome}
          {dominio && <span className="text-brand">.{dominio}</span>}
          <span className="ml-2 rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">admin</span>
        </Link>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {NAV.map(({ href, label, icon: IconCmp }) => (
          <Link
            key={href}
            href={href}
            aria-current={ativo(href) ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              ativo(href) ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <IconCmp className={`size-4 ${ativo(href) ? 'text-brand' : ''}`} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="hidden space-y-3 border-t p-4 lg:block">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{admin.nome}</p>
          <p className="truncate text-xs text-subtle">{admin.email}</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noopener" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground">
            <ExternalLink className="size-3.5" /> Ver site
          </a>
          <button
            type="button"
            onClick={sair}
            disabled={saindo || bypassEnv}
            title={bypassEnv ? 'Acesso direto via ADMIN_DEV_BYPASS — desative no .env.local para sair' : 'Sair'}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            {saindo ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />} Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
