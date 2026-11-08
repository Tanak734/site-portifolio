'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

/**
 * Frases em formato de baralho: o cartão da frente sobe e vai para o fim do monte,
 * e o próximo sobe da pilha para a frente. Repete em loop.
 * Sem aleatoriedade no render → compatível com o prerender do Cache Components.
 */
export default function Rotator({
  words,
  className,
  interval = 2800,
}: {
  words: string[];
  className?: string;
  interval?: number;
}) {
  const [i, setI] = useState(0);
  const reduzir = useReducedMotion();

  useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const card = 'rounded-[0.35em] border px-[0.32em] pb-[0.08em]';

  return (
    <span className={`relative inline-grid max-w-full align-top [perspective:900px] ${className ?? ''}`}>
      {/* Pilha atrás (2 cartões) */}
      <span aria-hidden="true" className={`${card} absolute inset-0 translate-y-[0.22em] scale-x-[0.94] border-border bg-tone-1`} />
      <span aria-hidden="true" className={`${card} absolute inset-0 translate-y-[0.11em] scale-x-[0.97] border-border bg-tone-2`} />

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          layout
          className={`${card} relative border-primary/40 bg-tone-3 text-brand [transform-origin:50%_100%]`}
          initial={reduzir ? { opacity: 0 } : { y: '0.22em', scale: 0.94, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1, rotateX: 0 }}
          exit={reduzir ? { opacity: 0 } : { y: '-55%', rotateX: 35, scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28, opacity: { duration: 0.25 } }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
