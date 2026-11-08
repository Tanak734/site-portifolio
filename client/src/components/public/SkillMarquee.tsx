'use client';

import LogoLoop, { type LogoItem } from '@/components/reactbits/LogoLoop';
import TechIcon from './TechIcon';

export type MarqueeSkill = { nome: string; slug: string | null; path: string | null; hex: string | null };

/** Faixa decorativa: logos coloridos (cor oficial da marca) rolando sozinhos, sem interação. */
export default function SkillMarquee({ skills }: { skills: MarqueeSkill[] }) {
  const logos: LogoItem[] = skills.map((s) => ({
    title: s.nome,
    node: (
      <span className="grid size-16 place-items-center rounded-2xl border bg-card text-muted-foreground">
        <TechIcon path={s.path} hex={s.hex} slug={s.slug} colorido className="size-7" />
      </span>
    ),
  }));

  return (
    <div className="pointer-events-none select-none" aria-hidden="true">
      <LogoLoop
        logos={logos}
        speed={75}
        logoHeight={64}
        gap={20}
        pauseOnHover={false}
        scaleOnHover={false}
        draggable={false}
        labels="none"
        fadeOut={false}
        ignoreReducedMotion
        ariaLabel="Tecnologias que utilizo"
      />
    </div>
  );
}
