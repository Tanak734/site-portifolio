'use client';

import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';

/** Atalho flutuante para o formulário: aparece após o hero e some quando o contato está visível. */
export default function FloatingContact() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const contato = document.getElementById('contato');
    let pastHero = false;
    let inContact = false;
    const update = () => setShow(pastHero && !inContact);

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.7;
      update();
    };
    const io = contato
      ? new IntersectionObserver(([e]) => { inContact = e.isIntersecting; update(); }, { threshold: 0.1 })
      : null;
    if (contato && io) io.observe(contato);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, []);

  return (
    <a
      href="#contato"
      aria-label="Ir para o formulário de contato"
      className={`fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full bg-primary py-3 pr-5 pl-4 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/85 sm:right-6 sm:bottom-6 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <Send className="size-4" />
      <span className="text-sm">Iniciar projeto</span>
    </a>
  );
}
