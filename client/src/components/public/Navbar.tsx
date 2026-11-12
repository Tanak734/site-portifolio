import { Suspense } from 'react';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import AtalhoAdmin from './AtalhoAdmin';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';
import { getContent, opensNewTab, secoesOrdenadas } from '@/lib/content';

/** Barra superior: marca à esquerda, seções centralizadas, redes + CTA à direita. */
export default async function Navbar() {
  const content = await getContent();
  const { perfil, links_sociais } = content;
  // Menu = seções visíveis marcadas "no menu" (editável no admin, aba Seções), na ordem da página.
  const LINKS = [
    ...secoesOrdenadas(content)
      .filter((s) => s.visivel && s.no_menu)
      .map((s) => ({ href: `#${s.id}`, label: s.label })),
    { href: '#contato', label: 'Contato' },
  ];
  const [nome, dominio] = perfil.marca.split('.');

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-4">
      <nav className="mx-auto mt-3 grid max-w-6xl grid-cols-[1fr_auto] items-center gap-3 rounded-full border bg-background/85 py-1.5 pr-1.5 pl-5 backdrop-blur-md lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center justify-self-start">
          <a href="#top" className="font-semibold tracking-tight">
            {nome}
            {dominio && <span className="text-brand">.{dominio}</span>}
          </a>
          <Suspense fallback={null}>
            <AtalhoAdmin />
          </Suspense>
        </div>

        <ul className="hidden items-center gap-1 text-sm lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-self-end gap-1">
          <ul className="hidden items-center sm:flex">
            {links_sociais.map((l) => (
              <li key={l.nome}>
                <a
                  href={l.url}
                  target={opensNewTab(l.url) ? '_blank' : undefined}
                  rel="noopener"
                  aria-label={l.nome}
                  title={l.nome}
                  className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <Icon name={l.icone} className="size-[17px]" />
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          {/* Área do cliente: não existe no site estático (GitHub Pages) */}
          {!process.env.NEXT_PUBLIC_BASE_PATH && (
            <Link
              href="/cliente"
              title="Área do cliente"
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground xl:px-3"
            >
              <UserRound className="size-[17px]" />
              <span className="hidden xl:inline">Área do cliente</span>
              <span className="sr-only xl:hidden">Área do cliente</span>
            </Link>
          )}
          <a
            href="#contato"
            className="ml-1 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/85"
          >
            Orçamento
          </a>
        </div>
      </nav>
    </header>
  );
}
