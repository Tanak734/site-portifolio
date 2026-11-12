import { Plus } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { getContent } from '@/lib/content';

/** Acordeão nativo (<details>) — funciona sem JavaScript. Inclui dados estruturados FAQPage para SEO. */
export default async function FaqSection() {
  const { faq, textos_secoes } = await getContent();
  if (faq.length === 0) return null;
  const t = textos_secoes.faq;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.pergunta, acceptedAnswer: { '@type': 'Answer', text: f.resposta } })),
  };

  return (
    <section id="faq" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.6fr]">
        <SectionHeading eyebrow="FAQ" title={t.titulo} description={t.descricao} />

        <div className="divide-y border-y">
          {faq.map((f) => (
            <details key={f.pergunta} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium transition hover:text-brand [&::-webkit-details-marker]:hidden">
                {f.pergunta}
                <Plus className="size-4 shrink-0 text-subtle transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="-mt-1 pr-8 pb-5 text-pretty text-muted-foreground">{f.resposta}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </section>
  );
}
