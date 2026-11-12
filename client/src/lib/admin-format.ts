// Formatação usada no painel (Server e Client Components). Datas sempre em America/Sao_Paulo
// para o HTML do servidor e do navegador baterem na hidratação.
const TZ = 'America/Sao_Paulo';

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const horas = (v: number) => `${Number.isInteger(v) ? v : v.toFixed(1)}h`;

/** Datas só com dia (AAAA-MM-DD) viram meio-dia UTC para não "voltar" um dia no fuso de SP. */
const parse = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);

export const dataCurta = (iso: string) => parse(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: TZ }).replace('.', '');
export const data = (iso: string) => parse(iso).toLocaleDateString('pt-BR', { timeZone: TZ });
export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ }).replace('.', '');

/** Dias entre hoje e uma data (negativo = já passou). */
export function diasAte(iso: string, hoje = new Date()): number {
  const alvo = parse(iso);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
}

export const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
