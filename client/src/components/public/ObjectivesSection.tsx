import { getContent } from '@/lib/content';

export default async function ObjectivesSection() {
  const obj = (await getContent()).objetivos_profissionais;
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-2xl border bg-card p-6 sm:p-10">
        <p className="mb-3 font-mono text-xs tracking-[0.2em] text-brand uppercase">Foco atual</p>
        <h3 className="text-2xl font-semibold tracking-tight">{obj.titulo}</h3>
        <p className="mt-2 max-w-2xl text-muted-foreground">{obj.subtitulo}</p>
        <div className="mt-8 grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <ol className="space-y-3">
            {obj.metas_atuais.map((m, i) => (
              <li key={m} className="flex gap-4 text-muted-foreground">
                <span className="font-mono text-sm text-brand">0{i + 1}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
          <div>
            <h4 className="mb-3 text-sm font-medium text-subtle">Interesses técnicos</h4>
            <ul className="flex flex-wrap gap-2">
              {obj.interesses_tecnicos.map((i) => (
                <li key={i} className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground">{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
