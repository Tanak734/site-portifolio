import Icon from './Icon';
import ThemeToggle from './ThemeToggle';
import { getContent, opensNewTab } from '@/lib/content';

const LINKS = [
  { href: '#projetos', label: 'Projetos' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#stack', label: 'Stack' },
  { href: '#contato', label: 'Contato' },
];

/** Barra superior: marca à esquerda, seções centralizadas, redes + CTA à direita. */
export default async function Navbar() {
  const { perfil, links_sociais } = await getContent();
  const [nome, dominio] = perfil.marca.split('.');

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-4">
      <nav className="mx-auto mt-3 grid max-w-6xl grid-cols-[1fr_auto] items-center gap-3 rounded-full border bg-background/85 py-1.5 pr-1.5 pl-5 backdrop-blur-md lg:grid-cols-[1fr_auto_1fr]">
        <a href="#top" className="justify-self-start font-semibold tracking-tight">
          {nome}
          {dominio && <span className="text-brand">.{dominio}</span>}
        </a>

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
