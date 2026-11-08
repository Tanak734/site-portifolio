'use client';

import { Fragment, useEffect, useState } from 'react';

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz<>/{}[]=+*#01';
const FRAMES = 30; // quadros da decodificação
const FRAME_MS = 40; // ~1,2 s para resolver a frase inteira

type Cell = { ch: string; glyph: boolean };
const plain = (s: string): Cell[] => [...s].map((ch) => ({ ch, glyph: false }));

/**
 * Frases que se "decodificam": a cada troca, as letras embaralham como código e se
 * resolvem da esquerda para a direita na frase nova. Repete em loop.
 * Só troca caracteres (nada se desloca), então roda mesmo com prefers-reduced-motion.
 * A aleatoriedade fica só nos timers do efeito → o render inicial é determinístico
 * e compatível com o prerender do Cache Components.
 */
export default function Rotator({
  words,
  className,
  interval = 3800,
}: {
  words: string[];
  className?: string;
  interval?: number;
}) {
  const [i, setI] = useState(0);
  const [cells, setCells] = useState<Cell[]>(() => plain(words[0] ?? ''));

  useEffect(() => {
    if (words.length < 2) return;
    let idx = 0;
    let decoding: ReturnType<typeof setInterval> | undefined;

    const troca = setInterval(() => {
      idx = (idx + 1) % words.length;
      const alvo = words[idx];
      const chars = [...alvo];
      let frame = 0;
      setI(idx);
      clearInterval(decoding);
      decoding = setInterval(() => {
        frame++;
        if (frame >= FRAMES) {
          clearInterval(decoding);
          setCells(plain(alvo));
          return;
        }
        // as 4 primeiras posições ficam embaralhadas um pouco antes de começar a revelar
        const revelado = Math.floor((frame / FRAMES) * (chars.length + 4)) - 4;
        setCells(
          chars.map((ch, k) =>
            ch === ' ' || k <= revelado ? { ch, glyph: false } : { ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], glyph: true }
          )
        );
      }, FRAME_MS);
    }, interval);

    return () => {
      clearInterval(troca);
      clearInterval(decoding);
    };
  }, [words, interval]);

  return (
    <span className={`relative inline-block max-w-full align-top ${className ?? ''}`}>
      <span className="sr-only">{words[i]}</span>
      <span
        aria-hidden="true"
        className="inline-block rounded-[0.35em] border border-primary/40 bg-tone-3 px-[0.32em] pb-[0.08em] text-brand"
      >
        {cells.map((c, k) =>
          c.glyph ? (
            <span key={k} className="text-brand/45">
              {c.ch}
            </span>
          ) : (
            <Fragment key={k}>{c.ch}</Fragment>
          )
        )}
      </span>
    </span>
  );
}
