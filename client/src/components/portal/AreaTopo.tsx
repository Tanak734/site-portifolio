import Link from 'next/link';

/** Topo das páginas do cliente (área e portal do projeto). */
export default function AreaTopo({ marca, voltar }: { marca: string; voltar?: { href: string; label: string } }) {
  const [nome, dominio] = marca.split('.');
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          {nome}
          {dominio && <span className="text-brand">.{dominio}</span>}
        </Link>
        {voltar ? (
          <Link href={voltar.href} className="text-sm text-muted-foreground hover:text-foreground">{voltar.label}</Link>
        ) : (
          <span className="text-xs text-subtle">Área do cliente</span>
        )}
      </div>
    </header>
  );
}
