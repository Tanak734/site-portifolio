import SectionHeading from './SectionHeading';
import TestimonialsCarousel, { type TestimonialCard } from './TestimonialsCarousel';
import { getContent } from '@/lib/content';
import { ilustracaoCliente } from '@/lib/illustrations';
import { getAvaliacoesPublicas } from '@/lib/public-api';

const mesAno = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('.', '') : null;

export default async function Testimonials() {
  const avaliacoes = await getAvaliacoesPublicas();
  if (avaliacoes.length === 0) return null;
  const t = (await getContent()).textos_secoes.depoimentos;

  const cards: TestimonialCard[] = avaliacoes.map((a) => ({
    id: a.id,
    nome: a.cliente_nome,
    detalhe: [a.cliente_cargo, a.empresa_nome].filter(Boolean).join(' · ') || null,
    depoimento: a.depoimento,
    meta: [
      a.projeto_nome && `${a.projeto_nome}${a.projeto_entrega ? `: ${mesAno(a.projeto_entrega)}` : ''}`,
      `Avaliação: ${mesAno(a.created_at)}`,
    ]
      .filter(Boolean)
      .join(' · '),
    imagem: ilustracaoCliente(a.cliente_nome),
  }));

  return (
    <section id="depoimentos" className="py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading eyebrow="Depoimentos" title={t.titulo} description={t.descricao} />
      </div>
      <TestimonialsCarousel cards={cards} />
    </section>
  );
}
