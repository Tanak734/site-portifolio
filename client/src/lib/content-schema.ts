// Schema do site-content.json — usado no editor (cliente) e na gravação (servidor).
import { z } from 'zod';

const texto = (max = 300) => z.string().trim().min(1, 'Obrigatório').max(max, `Máximo de ${max} caracteres`);
const textoLongo = texto(2000);
const opcional = z.string().trim().max(500);
const lista = (max = 200) => z.array(texto(max));
const secao = z.object({ titulo: texto(120), descricao: texto(400) });

export const ICONES_SOCIAIS = ['github', 'linkedin', 'mail', 'file-text', 'whatsapp', 'chat'] as const;

export const siteContentSchema = z.object({
  perfil: z.object({
    marca: texto(60),
    nome: texto(120),
    cargo: texto(160),
    headline: texto(120),
    palavras_rotativas: lista(80).min(1, 'Adicione pelo menos uma frase'),
    subheadline: texto(400),
    disponivel_para_novos_projetos: z.boolean(),
    texto_disponibilidade: texto(120),
    texto_indisponibilidade: texto(120).default('Agenda cheia no momento · Entrar na fila de espera'),
    link_fila_espera: texto(300).default('#contato'),
    avatar_url: opcional,
    localizacao: texto(120),
    cta_principal: z.object({ texto: texto(80), url: texto(300) }),
    navbar_rotativo: z.array(z.string().trim().max(80)).default([]),
  }),
  carreira: z.object({
    titulo: texto(120),
    resumo: textoLongo,
    experiencias: z.array(
      z.object({
        periodo: texto(60),
        cargo: texto(120),
        empresa: texto(120),
        descricao: textoLongo,
        atual: z.boolean(),
      }),
    ),
    formacao: z.array(z.object({ periodo: texto(60), curso: texto(160), instituicao: texto(160) })),
  }),
  objetivos_profissionais: z.object({
    titulo: texto(120),
    subtitulo: texto(400),
    missao: texto(400),
    metas_atuais: lista(300),
    interesses_tecnicos: lista(120),
  }),
  links_sociais: z.array(
    z.object({
      nome: texto(60),
      url: texto(500).refine((v) => /^(https?:\/\/|mailto:|\/|#)/.test(v), 'Use http(s)://, mailto:, / ou #'),
      icone: z.enum(ICONES_SOCIAIS),
    }),
  ),
  categorias_skills: z.array(
    z.object({
      categoria: texto(80),
      descricao: texto(200),
      items: z.array(
        z.object({
          nome: texto(80),
          slug_icone: z.string().trim().max(40).nullable(),
          marquee: z.boolean(),
        }),
      ),
    }),
  ),
  textos_secoes: z.object({
    skills: secao,
    projetos: secao,
    depoimentos: secao,
    ticket_form: secao,
    contato: secao,
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
