import Navbar from '@/components/public/Navbar';
import HeroSection from '@/components/public/HeroSection';
import SkillMarquee, { type MarqueeSkill } from '@/components/public/SkillMarquee';
import ProjectsSection from '@/components/public/ProjectsSection';
import ServicesSection from '@/components/public/ServicesSection';
import ProcessSection from '@/components/public/ProcessSection';
import CareerSection from '@/components/public/CareerSection';
import FaqSection from '@/components/public/FaqSection';
import Testimonials from '@/components/public/Testimonials';
import ContactSection from '@/components/public/ContactSection';
import Footer from '@/components/public/Footer';
import FloatingContact from '@/components/public/FloatingContact';
import { getContent, secoesOrdenadas } from '@/lib/content';
import type { SecaoId } from '@/lib/content-schema';
import { techIcon } from '@/lib/tech-icons';

type Skill = { nome: string; slug_icone: string | null; marquee: boolean };

// Seções do meio da página: ordem e visibilidade vêm do admin (aba "Seções").
const SECOES: Record<SecaoId, () => Promise<React.ReactNode>> = {
  projetos: ProjectsSection,
  servicos: ServicesSection,
  processo: ProcessSection,
  depoimentos: Testimonials,
  sobre: CareerSection,
  faq: FaqSection,
};

// Landing page pública — Server Component (SEO). Interatividade fica nas ilhas "use client".
export default async function Home() {
  const content = await getContent();
  const marquee: MarqueeSkill[] = content.categorias_skills
    .flatMap<Skill>((c) => c.items)
    .filter((s) => s.marquee && s.slug_icone)
    .map((s) => {
      const icon = techIcon(s.slug_icone);
      return { nome: s.nome, slug: s.slug_icone, path: icon?.path ?? null, hex: icon?.hex ?? null };
    });

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <div className="border-y py-6">
          <SkillMarquee skills={marquee} />
        </div>
        {secoesOrdenadas(content)
          .filter((s) => s.visivel)
          .map((s) => {
            const Secao = SECOES[s.id];
            return <Secao key={s.id} />;
          })}
        <ContactSection />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
