// Ilustrações cartoon para os depoimentos (DiceBear · "Notionists", licença CC0).
// Geradas no servidor a partir do nome: mesmo cliente → mesmo desenho. Sem fotos reais.
import 'server-only';
import { createAvatar } from '@dicebear/core';
import { notionists } from '@dicebear/collection';

// Duotone na paleta Sálvia: só duas cores no desenho inteiro.
const TINTA = '#23493a'; // traço (no lugar do preto)
const FUNDO = '#d4ecdb'; // fundo e preenchimentos (no lugar do branco)

export function ilustracaoCliente(seed: string): string {
  const svg = createAvatar(notionists, {
    seed,
    backgroundColor: [FUNDO.slice(1)],
    backgroundType: ['solid'],
  })
    .toString()
    .replace(/"#000"/g, `"${TINTA}"`)
    .replace(/"#fff"/g, `"${FUNDO}"`);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
