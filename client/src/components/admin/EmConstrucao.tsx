import { Construction } from 'lucide-react';
import PageHeader from './PageHeader';

export default function EmConstrucao({ title, description, itens }: { title: string; description: string; itens: string[] }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="rounded-2xl border border-dashed p-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-brand">
          <Construction className="size-4" /> Em construção — próximas etapas
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {itens.map((i) => (
            <li key={i} className="flex gap-2"><span className="text-subtle">—</span>{i}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
