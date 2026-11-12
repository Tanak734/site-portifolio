// Helpers puros sobre o conteúdo (servem para Server e Client Components).
import { SECOES, SECOES_PADRAO, type SecaoId, type SiteContent } from './content-schema';

const byIcon = (c: SiteContent, icone: string) => c.links_sociais.find((l) => l.icone === icone) ?? null;

export const emailLink = (c: SiteContent) => byIcon(c, 'mail');
export const emailAddress = (c: SiteContent) => emailLink(c)?.url.replace(/^mailto:/, '') ?? null;
export const curriculoLink = (c: SiteContent) => byIcon(c, 'file-text');

export const isExternal = (url: string) => /^https?:\/\//.test(url);
/** PDF e links externos abrem em nova aba. */
export const opensNewTab = (url: string) => isExternal(url) || url.endsWith('.pdf');

/** Ordem/visibilidade das seções, completando ids que faltarem (conteúdo antigo ou seção nova). */
export function secoesOrdenadas(c: SiteContent) {
  const vistos = new Set<SecaoId>();
  const lista = c.secoes.filter((s) => !vistos.has(s.id) && vistos.add(s.id));
  for (const s of SECOES_PADRAO) if (!vistos.has(s.id)) lista.push(s);
  return lista.map((s) => ({ ...s, label: SECOES[s.id] }));
}
