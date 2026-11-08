import Navbar from '@/components/public/Navbar';
import HeroSection from '@/components/public/HeroSection';
import SkillMarquee, { type MarqueeSkill } from '@/components/public/SkillMarquee';
import ProjectsSection from '@/components/public/ProjectsSection';
import CareerSection from '@/components/public/CareerSection';
import ObjectivesSection from '@/components/public/ObjectivesSection';
import SkillsCatalog from '@/components/public/SkillsCatalog';
import Testimonials from '@/components/public/Testimonials';
import ContactSection from '@/components/public/ContactSection';
import Footer from '@/components/public/Footer';
import FloatingContact from '@/components/public/FloatingContact';
import { getContent } from '@/lib/content';
import { techIcon } from '@/lib/tech-icons';

type Skill = { nome: string; slug_icone: string | null; marquee: boolean };

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
        <ProjectsSection />
        <Testimonials />
        <CareerSection />
        <ObjectivesSection />
        <SkillsCatalog />
        <ContactSection />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
