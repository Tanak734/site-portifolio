// Schema do site-content.json — usado no editor (cliente) e na gravação (servidor).
import { z } from 'zod';

const texto = (max = 300) => z.string().trim().min(1, 'Obrigatório').max(max, `Máximo de ${max} caracteres`);
const textoLongo = texto(2000);
const opcional = z.string().trim().max(500);
const lista = (max = 200) => z.array(texto(max));
const secao = z.object({ titulo: texto(120), descricao: texto(400) });

export const ICONES_SOCIAIS = ['github', 'linkedin', 'mail', 'file-text', 'whatsapp', 'chat'] as const;

/** Ícones disponíveis para os cartões de serviço (nomes do lucide). */
export const ICONES_SERVICO = ['layout', 'server', 'rocket', 'workflow', 'database', 'smartphone', 'plug', 'shopping-cart', 'bot', 'search', 'shield', 'code'] as const;

/** Seções do meio da página (Hero no topo e Contato no fim são fixos). */
export const SECOES = {
  projetos: 'Projetos',
  servicos: 'Serviços',
  processo: 'Como trabalho',
  depoimentos: 'Depoimentos',
  sobre: 'Sobre',
  faq: 'FAQ',
} as const;
export type SecaoId = keyof typeof SECOES;
const SECAO_IDS = Object.keys(SECOES) as [SecaoId, ...SecaoId[]];

export const SECOES_PADRAO: { id: SecaoId; visivel: boolean; no_menu: boolean }[] = [
  { id: 'projetos', visivel: true, no_menu: true },
  { id: 'servicos', visivel: true, no_menu: true },
  { id: 'processo', visivel: true, no_menu: false },
  { id: 'depoimentos', visivel: true, no_menu: true },
  { id: 'sobre', visivel: true, no_menu: true },
  { id: 'faq', visivel: true, no_menu: false },
];

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
    exibir_foto: z.boolean().default(false),
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
    numeros: z.array(z.object({ valor: texto(20), rotulo: texto(60) })).max(4, 'No máximo 4 números').default([]),
  }),
  objetivos_profissionais: z.object({
    missao: texto(400),
    interesses_tecnicos: lista(120),
  }),
  servicos: z
    .array(
      z.object({
        icone: z.enum(ICONES_SERVICO),
        titulo: texto(80),
        descricao: texto(400),
        entregas: lista(120).default([]),
        tecnologias: z.array(z.string().trim().max(80)).default([]),
      }),
    )
    .default([]),
  processo: z.array(z.object({ titulo: texto(80), descricao: texto(300), duracao: z.string().trim().max(40).default('') })).default([]),
  faq: z.array(z.object({ pergunta: texto(200), resposta: textoLongo })).default([]),
  formulario_contato: z
    .object({
      faixas_investimento: lista(80).default([]),
      texto_botao: texto(60),
      nota_rodape: z.string().trim().max(160).default(''),
      sucesso_titulo: texto(80),
      sucesso_texto: texto(300),
    })
    .default({
      faixas_investimento: ['Ainda não sei', 'Até R$ 2.000', 'R$ 2.000 – R$ 5.000', 'R$ 5.000 – R$ 15.000', 'Acima de R$ 15.000'],
      texto_botao: 'Enviar minha ideia',
      nota_rodape: 'Sem compromisso. Resposta em até 24 horas.',
      sucesso_titulo: 'Recebi sua ideia!',
      sucesso_texto: 'Vou analisar os detalhes e te chamo em até 24 horas pelo contato informado.',
    }),
  secoes: z
    .array(z.object({ id: z.enum(SECAO_IDS), visivel: z.boolean(), no_menu: z.boolean() }))
    .default(SECOES_PADRAO),
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
    servicos: secao.default({ titulo: 'Como posso ajudar', descricao: 'Do site institucional ao sistema completo: escolha o ponto de partida.' }),
    processo: secao.default({ titulo: 'Como trabalho', descricao: 'Um processo simples e transparente, do primeiro contato à entrega.' }),
    faq: secao.default({ titulo: 'Perguntas frequentes', descricao: 'O que costumam me perguntar antes de começar um projeto.' }),
    depoimentos: secao,
    ticket_form: secao,
    contato: secao,
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
