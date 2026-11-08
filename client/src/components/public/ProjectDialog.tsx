'use client';

import { ArrowUpRight, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import Icon from './Icon';
import ProjectMedia from './ProjectMedia';
import { parseStacks } from '@/lib/tickets';
import type { ProjetoPublico } from '@/lib/types';

/** Modal com fundo desfocado: vídeo/imagem, descrição, stack e links do projeto. */
export default function ProjectDialog({
  projeto: p,
  onClose,
}: {
  projeto: ProjetoPublico | null;
  onClose: () => void;
}) {
  const stacks = parseStacks(p?.stacks_utilizadas ?? null);
  const confidencial = p?.is_confidencial ?? false;
  // Em modo NDA nenhum link privado é exibido (docs/front §4.1.5)
  const links = p && !confidencial
    ? [
        p.live_url && { href: p.live_url, label: 'Ver projeto ao vivo', icon: <ArrowUpRight className="size-4" />, primary: true },
        p.github_url && { href: p.github_url, label: 'Código', icon: <Icon name="github" className="size-4" />, primary: false },
        p.figma_url && { href: p.figma_url, label: 'Design', icon: <ArrowUpRight className="size-4" />, primary: false },
      ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; primary: boolean }[]
    : [];

  return (
    <Dialog open={!!p} onOpenChange={(open) => !open && onClose()}>
      {p && (
        <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto rounded-2xl border bg-card p-0 ring-0 sm:max-w-2xl">
          <div className="aspect-video overflow-hidden rounded-t-2xl border-b bg-secondary">
            <ProjectMedia projeto={p} video />
          </div>

          <div className="p-6 sm:p-8">
            {p.categoria_projeto && (
              <p className="mb-2 font-mono text-xs tracking-wide text-brand uppercase">{p.categoria_projeto}</p>
            )}
            <DialogTitle className="text-2xl font-semibold tracking-tight">{p.nome}</DialogTitle>
            {p.resumo_nome && <p className="mt-1 text-muted-foreground">{p.resumo_nome}</p>}

            {p.descricao && (
              <DialogDescription className="mt-5 text-base leading-relaxed text-foreground/85">
                {p.descricao}
              </DialogDescription>
            )}

            {stacks.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-2 text-xs font-medium tracking-wide text-subtle uppercase">Stack utilizada</h4>
                <ul className="flex flex-wrap gap-1.5">
                  {stacks.map((s) => (
                    <li key={s} className="rounded-full border px-2.5 py-1 font-mono text-xs text-muted-foreground">{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {confidencial ? (
              <p className="mt-8 flex items-start gap-3 rounded-xl border bg-secondary p-4 text-sm text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Sistema interno desenvolvido sob acordo de confidencialidade (NDA). Links e telas não podem ser exibidos
                publicamente, mas posso detalhar a arquitetura em uma conversa.
              </p>
            ) : (
              links.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener"
                      className={
                        l.primary
                          ? 'inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/85'
                          : 'inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm text-foreground transition hover:bg-accent'
                      }
                    >
                      {l.label} {l.icon}
                    </a>
                  ))}
                </div>
              )
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
