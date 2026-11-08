// Ilustrações cartoon para os depoimentos (DiceBear · "Notionists", licença CC0).
// Geradas no servidor a partir do nome: mesmo cliente → mesmo desenho. Sem fotos reais.
import 'server-only';
import { createAvatar } from '@dicebear/core';
import { notionists } from '@dicebear/collection';

export function ilustracaoCliente(seed: string): string {
  return createAvatar(notionists, {
    seed,
    backgroundColor: ['e0844f', 'c76a3a', 'd99a6c', 'b4501c'],
    backgroundType: ['solid'],
  }).toDataUri();
}
