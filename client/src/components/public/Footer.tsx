import Icon from './Icon';
import { getContent, opensNewTab } from '@/lib/content';

export default async function Footer() {
  'use cache'; // permite usar a data atual com Cache Components
  const { perfil, links_sociais } = await getContent();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <p className="text-sm text-subtle">© {year} {perfil.marca}</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {links_sociais.map((l) => (
            <li key={l.nome}>
              <a href={l.url} target={opensNewTab(l.url) ? '_blank' : undefined} rel="noopener" className="inline-flex items-center gap-2 transition hover:text-foreground">
                <Icon name={l.icone} className="size-4" />
                {l.nome}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
