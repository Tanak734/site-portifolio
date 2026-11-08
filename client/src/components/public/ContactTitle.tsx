'use client';

import BlurText from '@/components/reactbits/BlurText';

/** Título que aparece palavra por palavra ao rolar até ele (React Bits · BlurText). */
export default function ContactTitle({ text }: { text: string }) {
  return <BlurText text={text} animateBy="words" direction="bottom" delay={80} className="text-balance" />;
}
