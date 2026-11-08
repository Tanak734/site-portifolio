'use client';

import { Moon, Sun } from 'lucide-react';

/** Alterna claro/escuro. A classe no <html> é a fonte da verdade (definida pelo script do layout). */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const alternar = () => {
    const root = document.documentElement;
    const proximo = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.remove('light', 'dark');
    root.classList.add(proximo);
    try {
      localStorage.setItem('tema', proximo);
    } catch {
      /* armazenamento bloqueado — vale só nesta visita */
    }
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Alternar tema claro/escuro"
      title="Alternar tema"
      className={`grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground ${className}`}
    >
      {/* Ícone decidido só por CSS → sem divergência de hidratação */}
      <Sun className="hidden size-[17px] dark:block" />
      <Moon className="size-[17px] dark:hidden" />
    </button>
  );
}
