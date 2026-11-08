// Utilitário puro (cliente e servidor): decide se a cor da marca precisa de ajuste para ler bem em cada tema.
export type TechIconData = { path: string; hex: string };

/** 'escuro' = some no tema escuro; 'claro' = some no tema claro; null = funciona nos dois. */
export function tomDaCor(hex: string): 'escuro' | 'claro' | null {
  const n = parseInt(hex.replace('#', ''), 16);
  const l = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
  if (l < 0.1) return 'escuro';
  if (l > 0.4) return 'claro';
  return null;
}
