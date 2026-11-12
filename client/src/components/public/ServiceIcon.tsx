// Ícones dos cartões de serviço (Server e Client Components).
import {
  Bot,
  Code2,
  Database,
  LayoutTemplate,
  Plug,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { ICONES_SERVICO } from '@/lib/content-schema';

export const SERVICE_ICONS: Record<(typeof ICONES_SERVICO)[number], { Icon: LucideIcon; label: string }> = {
  layout: { Icon: LayoutTemplate, label: 'Site / layout' },
  server: { Icon: Server, label: 'Servidor / API' },
  rocket: { Icon: Rocket, label: 'Lançamento / MVP' },
  workflow: { Icon: Workflow, label: 'Sistema / fluxo' },
  database: { Icon: Database, label: 'Banco de dados' },
  smartphone: { Icon: Smartphone, label: 'Mobile' },
  plug: { Icon: Plug, label: 'Integração' },
  'shopping-cart': { Icon: ShoppingCart, label: 'E-commerce' },
  bot: { Icon: Bot, label: 'Automação / IA' },
  search: { Icon: Search, label: 'SEO / busca' },
  shield: { Icon: ShieldCheck, label: 'Segurança' },
  code: { Icon: Code2, label: 'Código' },
};

export default function ServiceIcon({ name, className = 'size-5' }: { name: string; className?: string }) {
  const Cmp = SERVICE_ICONS[name as keyof typeof SERVICE_ICONS]?.Icon ?? Code2;
  return <Cmp className={className} aria-hidden="true" />;
}
