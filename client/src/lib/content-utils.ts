// Helpers puros sobre o conteúdo (servem para Server e Client Components).
import type { SiteContent } from './content-schema';

const byIcon = (c: SiteContent, icone: string) => c.links_sociais.find((l) => l.icone === icone) ?? null;

export const emailLink = (c: SiteContent) => byIcon(c, 'mail');
export const emailAddress = (c: SiteContent) => emailLink(c)?.url.replace(/^mailto:/, '') ?? null;
export const curriculoLink = (c: SiteContent) => byIcon(c, 'file-text');

export const isExternal = (url: string) => /^https?:\/\//.test(url);
/** PDF e links externos abrem em nova aba. */
export const opensNewTab = (url: string) => isExternal(url) || url.endsWith('.pdf');
