'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export type TestimonialCard = {
  id: number;
  nome: string;
  detalhe: string | null;
  depoimento: string;
  meta: string;
  imagem: string; // data URI da ilustração
};

// Tons planos alternados (sem degradê)
const TONS = ['bg-tone-1', 'bg-tone-2', 'bg-tone-3'];
const VELOCIDADE = 45; // px por segundo — rolagem automática
const RETOMAR_APOS = 2500; // ms parado depois de uma interação

/**
 * Faixa de depoimentos em loop infinito:
 * - rola sozinha devagar;
 * - arrastável (mouse) e com rolagem nativa (touch/trackpad);
 * - setas para avançar/voltar um card;
 * - pausa no hover, durante o arraste e quando está fora da tela;
 * - anima mesmo com prefers-reduced-motion (decisão de design; pausa no hover e tem setas).
 */
export default function TestimonialsCarousel({ cards }: { cards: TestimonialCard[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const moverRef = useRef<(dir: 1 | -1) => void>(() => {});

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    let pos = el.scrollLeft;
    let ultimo = performance.now();
    let raf = 0;
    let hover = false;
    let visivel = true;
    let pausadoAte = 0;
    let arraste: { x: number; pos: number; id: number } | null = null;
    let tween: { de: number; para: number; t0: number } | null = null;

    // Largura de uma "cópia" da lista (os cards são renderizados 2x para o loop).
    const periodo = () => {
      const segundo = el.querySelector<HTMLElement>('[data-copia="1"]');
      const primeiro = el.querySelector<HTMLElement>('[data-copia="0"]');
      return segundo && primeiro ? segundo.offsetLeft - primeiro.offsetLeft : el.scrollWidth / 2;
    };
    const embrulhar = (v: number) => {
      const p = periodo();
      if (p <= 0) return v;
      return ((v % p) + p) % p;
    };
    const aplicar = () => {
      el.scrollLeft = pos;
    };
    const pausar = (ms = RETOMAR_APOS) => {
      pausadoAte = performance.now() + ms;
    };

    const tick = (agora: number) => {
      const dt = Math.min(agora - ultimo, 64) / 1000;
      ultimo = agora;

      if (tween) {
        const k = Math.min((agora - tween.t0) / 550, 1);
        const ease = 1 - Math.pow(1 - k, 3);
        pos = embrulhar(tween.de + (tween.para - tween.de) * ease);
        aplicar();
        if (k === 1) tween = null;
      } else if (!hover && !arraste && visivel && agora > pausadoAte) {
        pos = embrulhar(pos + VELOCIDADE * dt);
        aplicar();
      }
      raf = requestAnimationFrame(tick);
    };

    // Rolagem nativa (touch, trackpad): sincroniza a posição e pausa o automático.
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - pos) > 1 && !tween) {
        pos = embrulhar(el.scrollLeft);
        if (pos !== el.scrollLeft) aplicar();
        pausar();
      }
    };

    // Arraste com mouse
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      tween = null;
      arraste = { x: e.clientX, pos, id: e.pointerId };
      el.setPointerCapture(e.pointerId);
      el.dataset.arrastando = '';
    };
    const onMove = (e: PointerEvent) => {
      if (!arraste || e.pointerId !== arraste.id) return;
      pos = embrulhar(arraste.pos - (e.clientX - arraste.x));
      aplicar();
    };
    const onUp = (e: PointerEvent) => {
      if (!arraste || e.pointerId !== arraste.id) return;
      arraste = null;
      delete el.dataset.arrastando;
      pausar();
    };

    const onEnter = () => (hover = true);
    const onLeave = () => (hover = false);
    const io = new IntersectionObserver(([entry]) => (visivel = entry.isIntersecting));
    io.observe(el);

    moverRef.current = (dir) => {
      const card = el.querySelector<HTMLElement>('li');
      const passo = (card?.offsetWidth ?? 400) + 12;
      tween = { de: pos, para: pos + dir * passo, t0: performance.now() };
      pausar(RETOMAR_APOS + 550);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const lista = (copia: 0 | 1) =>
    cards.map((c, i) => (
      <li
        key={`${copia}-${c.id}`}
        data-copia={i === 0 ? copia : undefined}
        aria-hidden={copia === 1 || undefined}
        className={`flex min-h-[26rem] w-[85vw] shrink-0 flex-col rounded-2xl p-6 select-none sm:w-[30rem] sm:p-8 ${TONS[i % TONS.length]}`}
      >
        <p className="text-xs text-subtle">{c.meta}</p>
        <blockquote className="mt-4 text-lg leading-relaxed text-pretty text-foreground/90 sm:text-xl">“{c.depoimento}”</blockquote>
        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <div className="min-w-0">
            <p className="text-3xl font-medium tracking-tight sm:text-4xl">{c.nome}</p>
            {c.detalhe && <p className="mt-1 truncate text-sm text-muted-foreground">{c.detalhe}</p>}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.imagem}
            alt=""
            width={128}
            height={160}
            draggable={false}
            className="h-40 w-32 shrink-0 rounded-xl object-cover object-top"
          />
        </div>
      </li>
    ));

  // Setas de vidro sobre as pontas da faixa
  const seta =
    'absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-background/35 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_8px_24px_-8px_rgb(0_0_0/0.5)] backdrop-blur-md backdrop-saturate-150 transition hover:scale-105 hover:bg-background/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-12';

  return (
    <div>
      <div className="relative">
        <div
          ref={trilho}
          className="cursor-grab overflow-x-auto px-4 pb-2 [scrollbar-width:none] data-[arrastando]:cursor-grabbing sm:px-6 [&::-webkit-scrollbar]:hidden"
          aria-label="Depoimentos de clientes (rolagem automática; arraste ou use as setas)"
          role="region"
        >
          <ul className="flex w-max gap-3">
            {lista(0)}
            {lista(1)}
          </ul>
        </div>
        <button type="button" onClick={() => moverRef.current(-1)} aria-label="Depoimento anterior" className={`${seta} left-3 sm:left-6`}>
          <ArrowLeft className="size-5" />
        </button>
        <button type="button" onClick={() => moverRef.current(1)} aria-label="Próximo depoimento" className={`${seta} right-3 sm:right-6`}>
          <ArrowRight className="size-5" />
        </button>
      </div>

      <div className="mt-10 flex justify-center px-4">
        <a
          href="#contato"
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-[0_10px_30px_-10px_var(--primary)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Quero ser o próximo
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </div>
    </div>
  );
}
