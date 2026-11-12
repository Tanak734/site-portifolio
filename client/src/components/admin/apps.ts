// Aplicativos do painel — fonte única para a barra superior, o lançador e o dashboard.
import { FolderKanban, LayoutGrid, LifeBuoy, Lightbulb, MonitorSmartphone, PanelsTopLeft, ShieldCheck, Users, type LucideIcon } from 'lucide-react';

export type AppId = 'inicio' | 'tickets' | 'clientes' | 'projetos' | 'chamados' | 'config' | 'portal' | 'seguranca';

export type AdminApp = {
  id: AppId;
  href: string;
  label: string;
  descricao: string;
  icon: LucideIcon;
  /** Cor do ícone no lançador (fundo suave + traço). */
  tom: string;
  /** Abre fora do painel (ex.: portal público do cliente). */
  externo?: boolean;
  /** Aparece como atalho direto na barra superior (telas grandes). */
  naBarra?: boolean;
};

export const APPS: AdminApp[] = [
  { id: 'inicio', href: '/admin', label: 'Início', descricao: 'Visão geral e o que precisa de atenção.', icon: LayoutGrid, tom: 'bg-primary/12 text-brand', naBarra: true },
  { id: 'tickets', href: '/admin/tickets', label: 'Ideias', descricao: 'Funil de pré-venda: triagem, conversa e MVP.', icon: Lightbulb, tom: 'bg-amber-500/12 text-amber-600 dark:text-amber-400', naBarra: true },
  { id: 'clientes', href: '/admin/clientes', label: 'Clientes', descricao: 'Contatos, notas e histórico de cada cliente.', icon: Users, tom: 'bg-sky-500/12 text-sky-600 dark:text-sky-400', naBarra: true },
  { id: 'projetos', href: '/admin/projetos', label: 'Projetos', descricao: 'Requisitos, arquitetura, calculadora e tarefas.', icon: FolderKanban, tom: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400', naBarra: true },
  { id: 'chamados', href: '/admin/chamados', label: 'Chamados', descricao: 'Suporte e manutenção dos projetos entregues.', icon: LifeBuoy, tom: 'bg-rose-500/12 text-rose-600 dark:text-rose-400', naBarra: true },
  { id: 'config', href: '/admin/config', label: 'Conteúdo do site', descricao: 'Textos, seções e serviços da página inicial.', icon: PanelsTopLeft, tom: 'bg-violet-500/12 text-violet-600 dark:text-violet-400', naBarra: true },
  { id: 'portal', href: '/status/demo', label: 'Portal do cliente', descricao: 'Como o cliente acompanha o projeto e abre chamados.', icon: MonitorSmartphone, tom: 'bg-teal-500/12 text-teal-600 dark:text-teal-400', externo: true },
  { id: 'seguranca', href: '/admin/seguranca', label: 'Segurança', descricao: 'Passkeys, 2FA e dispositivos confiáveis.', icon: ShieldCheck, tom: 'bg-slate-500/12 text-slate-600 dark:text-slate-300' },
];

export const appAtivo = (pathname: string) =>
  [...APPS].filter((a) => !a.externo).sort((a, b) => b.href.length - a.href.length).find((a) => (a.href === '/admin' ? pathname === '/admin' : pathname.startsWith(a.href)));
